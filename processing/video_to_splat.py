"""
SplatView Processing Pipeline
Video → Frames → COLMAP → Gaussian Splat Training → .PLY output

Usage:
    python video_to_splat.py input_video.mp4 --output output_dir
"""

import argparse
import json
import math
import os
import shutil
import struct
import subprocess
import sys
import time
from pathlib import Path

import cv2
import numpy as np
import torch
from PIL import Image


# ============================================================
# Config
# ============================================================

FFMPEG_BIN = os.path.join(os.path.dirname(__file__), "..", "..", "ffmpeg", "bin", "ffmpeg.exe")
COLMAP_BIN = os.path.join(os.path.dirname(__file__), "..", "..", "colmap", "bin", "colmap.exe")

# Resolve paths
FFMPEG_BIN = str(Path(FFMPEG_BIN).resolve())
COLMAP_BIN = str(Path(COLMAP_BIN).resolve())


def log(msg: str):
    print(f"[SplatView] {msg}")


# ============================================================
# Step 1: Extract frames from video
# ============================================================

def extract_frames(video_path: str, output_dir: str, fps: int = 2, max_frames: int = 300) -> int:
    """Extract frames from video at specified FPS."""
    frames_dir = os.path.join(output_dir, "input")
    os.makedirs(frames_dir, exist_ok=True)

    log(f"Extracting frames from {video_path} at {fps} FPS...")

    cmd = [
        FFMPEG_BIN,
        "-i", video_path,
        "-vf", f"fps={fps}",
        "-qmin", "1",
        "-q:v", "1",
        os.path.join(frames_dir, "frame_%05d.jpg"),
        "-y"
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        log(f"ffmpeg error: {result.stderr}")
        raise RuntimeError("Frame extraction failed")

    frame_count = len([f for f in os.listdir(frames_dir) if f.endswith(".jpg")])

    # If too many frames, subsample
    if frame_count > max_frames:
        log(f"Got {frame_count} frames, subsampling to {max_frames}...")
        frames = sorted(os.listdir(frames_dir))
        step = frame_count / max_frames
        keep = set(int(i * step) for i in range(max_frames))
        for idx, fname in enumerate(frames):
            if idx not in keep:
                os.remove(os.path.join(frames_dir, fname))
        frame_count = len([f for f in os.listdir(frames_dir) if f.endswith(".jpg")])

    log(f"Extracted {frame_count} frames")
    return frame_count


# ============================================================
# Step 2: Run COLMAP for camera pose estimation
# ============================================================

def run_colmap(project_dir: str):
    """Run COLMAP feature extraction, matching, and sparse reconstruction."""
    images_dir = os.path.join(project_dir, "input")
    db_path = os.path.join(project_dir, "database.db")
    sparse_dir = os.path.join(project_dir, "sparse")
    os.makedirs(sparse_dir, exist_ok=True)

    # Feature extraction
    log("COLMAP: Extracting features...")
    cmd = [
        COLMAP_BIN, "feature_extractor",
        "--database_path", db_path,
        "--image_path", images_dir,
        "--ImageReader.single_camera", "1",
        "--ImageReader.camera_model", "OPENCV",
        "--SiftExtraction.use_gpu", "1",
        "--SiftExtraction.max_image_size", "1600",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        log(f"Feature extraction error: {result.stderr}")
        raise RuntimeError("COLMAP feature extraction failed")

    # Feature matching
    log("COLMAP: Matching features...")
    cmd = [
        COLMAP_BIN, "sequential_matcher",
        "--database_path", db_path,
        "--SiftMatching.use_gpu", "1",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        log(f"Matching error: {result.stderr}")
        raise RuntimeError("COLMAP matching failed")

    # Sparse reconstruction
    log("COLMAP: Reconstructing sparse model...")
    sparse_out = os.path.join(sparse_dir, "0")
    os.makedirs(sparse_out, exist_ok=True)
    cmd = [
        COLMAP_BIN, "mapper",
        "--database_path", db_path,
        "--image_path", images_dir,
        "--output_path", sparse_dir,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        log(f"Mapper error: {result.stderr}")
        raise RuntimeError("COLMAP reconstruction failed")

    # Convert to text format for easier parsing
    if os.path.exists(sparse_out):
        log("COLMAP: Converting to text format...")
        text_dir = os.path.join(project_dir, "sparse_text")
        os.makedirs(text_dir, exist_ok=True)
        cmd = [
            COLMAP_BIN, "model_converter",
            "--input_path", sparse_out,
            "--output_path", text_dir,
            "--output_type", "TXT",
        ]
        subprocess.run(cmd, capture_output=True, text=True)
    else:
        raise RuntimeError("COLMAP produced no reconstruction")

    log("COLMAP: Done")


# ============================================================
# Step 3: Parse COLMAP output
# ============================================================

def parse_colmap_cameras(project_dir: str):
    """Parse COLMAP cameras.txt and images.txt to get camera intrinsics and poses."""
    text_dir = os.path.join(project_dir, "sparse_text")

    cameras = {}
    with open(os.path.join(text_dir, "cameras.txt"), "r") as f:
        for line in f:
            line = line.strip()
            if line.startswith("#") or not line:
                continue
            parts = line.split()
            cam_id = int(parts[0])
            model = parts[1]
            width = int(parts[2])
            height = int(parts[3])
            params = [float(p) for p in parts[4:]]
            cameras[cam_id] = {
                "model": model,
                "width": width,
                "height": height,
                "params": params,
            }

    images = []
    with open(os.path.join(text_dir, "images.txt"), "r") as f:
        lines = [l.strip() for l in f if not l.startswith("#") and l.strip()]

    # images.txt has pairs of lines: image info, then 2D points
    for i in range(0, len(lines), 2):
        parts = lines[i].split()
        img_id = int(parts[0])
        qw, qx, qy, qz = float(parts[1]), float(parts[2]), float(parts[3]), float(parts[4])
        tx, ty, tz = float(parts[5]), float(parts[6]), float(parts[7])
        cam_id = int(parts[8])
        name = parts[9]

        images.append({
            "id": img_id,
            "qvec": [qw, qx, qy, qz],
            "tvec": [tx, ty, tz],
            "camera_id": cam_id,
            "name": name,
        })

    # Parse points3D
    points = []
    points_file = os.path.join(text_dir, "points3D.txt")
    if os.path.exists(points_file):
        with open(points_file, "r") as f:
            for line in f:
                line = line.strip()
                if line.startswith("#") or not line:
                    continue
                parts = line.split()
                x, y, z = float(parts[1]), float(parts[2]), float(parts[3])
                r, g, b = int(parts[4]), int(parts[5]), int(parts[6])
                points.append({"xyz": [x, y, z], "rgb": [r, g, b]})

    return cameras, images, points


def qvec_to_rotmat(qvec):
    """Convert quaternion to rotation matrix."""
    w, x, y, z = qvec
    R = np.array([
        [1 - 2*y*y - 2*z*z, 2*x*y - 2*w*z, 2*x*z + 2*w*y],
        [2*x*y + 2*w*z, 1 - 2*x*x - 2*z*z, 2*y*z - 2*w*x],
        [2*x*z - 2*w*y, 2*y*z + 2*w*x, 1 - 2*x*x - 2*y*y],
    ])
    return R


# ============================================================
# Step 4: Train Gaussian Splat with gsplat
# ============================================================

def load_training_data(project_dir: str):
    """Load images and camera data for training."""
    cameras, images_data, points = parse_colmap_cameras(project_dir)
    images_dir = os.path.join(project_dir, "input")

    # Sort images by name for consistency
    images_data.sort(key=lambda x: x["name"])

    loaded_images = []
    cam_to_worlds = []
    Ks = []

    for img_info in images_data:
        img_path = os.path.join(images_dir, img_info["name"])
        if not os.path.exists(img_path):
            continue

        img = np.array(Image.open(img_path).convert("RGB")).astype(np.float32) / 255.0
        H, W = img.shape[:2]

        # Camera intrinsics
        cam = cameras[img_info["camera_id"]]
        params = cam["params"]

        if cam["model"] == "OPENCV":
            fx, fy, cx, cy = params[0], params[1], params[2], params[3]
        elif cam["model"] == "PINHOLE":
            fx, fy, cx, cy = params[0], params[1], params[2], params[3]
        elif cam["model"] == "SIMPLE_PINHOLE":
            fx = fy = params[0]
            cx, cy = params[1], params[2]
        else:
            fx = fy = params[0]
            cx, cy = W / 2, H / 2

        K = np.array([[fx, 0, cx], [0, fy, cy], [0, 0, 1]])

        # Camera extrinsics (world-to-camera → camera-to-world)
        R = qvec_to_rotmat(img_info["qvec"])
        t = np.array(img_info["tvec"])

        # COLMAP gives world-to-camera, we need camera-to-world
        c2w = np.eye(4)
        c2w[:3, :3] = R.T
        c2w[:3, 3] = -R.T @ t

        loaded_images.append(img)
        cam_to_worlds.append(c2w)
        Ks.append(K)

    return loaded_images, cam_to_worlds, Ks, points


def train_gaussian_splat(project_dir: str, output_path: str, iterations: int = 7000):
    """Train 3D Gaussian Splatting using gsplat."""
    log("Loading training data...")
    images, cam_to_worlds, Ks, init_points = load_training_data(project_dir)

    if len(images) < 3:
        raise RuntimeError(f"Need at least 3 images, got {len(images)}")

    log(f"Training with {len(images)} images, {len(init_points)} initial points")

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    log(f"Using device: {device}")

    # Convert to tensors
    H, W = images[0].shape[:2]
    images_tensor = torch.tensor(np.stack(images), dtype=torch.float32, device=device)
    c2w_tensor = torch.tensor(np.stack(cam_to_worlds), dtype=torch.float32, device=device)
    K_tensor = torch.tensor(np.stack(Ks), dtype=torch.float32, device=device)

    # Initialize gaussians from COLMAP points
    if len(init_points) > 0:
        points_xyz = np.array([p["xyz"] for p in init_points], dtype=np.float32)
        points_rgb = np.array([p["rgb"] for p in init_points], dtype=np.float32) / 255.0
    else:
        # Fallback: random initialization
        log("Warning: No COLMAP points, using random initialization")
        points_xyz = np.random.randn(1000, 3).astype(np.float32) * 2
        points_rgb = np.random.rand(1000, 3).astype(np.float32)

    N = len(points_xyz)
    log(f"Initializing {N} gaussians")

    # Gaussian parameters
    means = torch.tensor(points_xyz, dtype=torch.float32, device=device, requires_grad=True)
    scales = torch.full((N, 3), -3.0, dtype=torch.float32, device=device, requires_grad=True)
    quats = torch.zeros((N, 4), dtype=torch.float32, device=device)
    quats[:, 0] = 1.0
    quats = quats.requires_grad_(True)
    opacities_raw = torch.full((N,), 0.5, dtype=torch.float32, device=device, requires_grad=True)

    # SH coefficients for color (degree 0 = base color)
    sh0 = torch.tensor(points_rgb, dtype=torch.float32, device=device).unsqueeze(1)
    sh0 = (sh0 - 0.5) / 0.2821  # Convert RGB to SH0
    sh0 = sh0.requires_grad_(True)

    # Optimizer
    optimizer = torch.optim.Adam([
        {"params": [means], "lr": 1.6e-4},
        {"params": [scales], "lr": 5e-3},
        {"params": [quats], "lr": 1e-3},
        {"params": [opacities_raw], "lr": 5e-2},
        {"params": [sh0], "lr": 2.5e-3},
    ])

    # Learning rate scheduler
    scheduler = torch.optim.lr_scheduler.ExponentialLR(optimizer, gamma=0.999)

    num_images = len(images)
    log(f"Starting training for {iterations} iterations...")
    start_time = time.time()

    for step in range(iterations):
        optimizer.zero_grad()

        # Pick random training image
        idx = step % num_images

        # Camera parameters
        viewmat = torch.linalg.inv(c2w_tensor[idx]).unsqueeze(0)  # [1, 4, 4]
        K = K_tensor[idx].unsqueeze(0)  # [1, 3, 3]

        # Activate opacities with sigmoid
        opacities = torch.sigmoid(opacities_raw)

        # Render using gsplat
        from gsplat import rasterization

        renders, alphas, meta = rasterization(
            means=means,
            quats=quats / (quats.norm(dim=-1, keepdim=True) + 1e-8),
            scales=torch.exp(scales),
            opacities=opacities,
            colors=sh0,
            viewmats=viewmat,
            Ks=K,
            width=W,
            height=H,
            sh_degree=0,
        )

        rendered_image = renders[0]  # [H, W, 3]

        # Convert SH output to RGB
        rendered_image = torch.clamp(rendered_image, 0.0, 1.0)

        # L1 + SSIM loss
        gt_image = images_tensor[idx]
        l1_loss = torch.abs(rendered_image - gt_image).mean()

        loss = l1_loss

        loss.backward()
        optimizer.step()
        scheduler.step()

        # Densification: clone/split gaussians periodically
        if step > 0 and step % 500 == 0 and step < iterations * 0.8:
            with torch.no_grad():
                # Remove low opacity gaussians
                mask = torch.sigmoid(opacities_raw) > 0.01
                if mask.sum() < len(means):
                    means_new = means[mask].detach().requires_grad_(True)
                    scales_new = scales[mask].detach().requires_grad_(True)
                    quats_new = quats[mask].detach().requires_grad_(True)
                    opacities_raw_new = opacities_raw[mask].detach().requires_grad_(True)
                    sh0_new = sh0[mask].detach().requires_grad_(True)

                    pruned = len(means) - mask.sum().item()

                    means = means_new
                    scales = scales_new
                    quats = quats_new
                    opacities_raw = opacities_raw_new
                    sh0 = sh0_new

                    optimizer = torch.optim.Adam([
                        {"params": [means], "lr": 1.6e-4 * (0.999 ** step)},
                        {"params": [scales], "lr": 5e-3 * (0.999 ** step)},
                        {"params": [quats], "lr": 1e-3 * (0.999 ** step)},
                        {"params": [opacities_raw], "lr": 5e-2 * (0.999 ** step)},
                        {"params": [sh0], "lr": 2.5e-3 * (0.999 ** step)},
                    ])

                    log(f"  Step {step}: pruned {pruned} gaussians, {len(means)} remaining")

        if step % 500 == 0 or step == iterations - 1:
            elapsed = time.time() - start_time
            log(f"  Step {step}/{iterations} | Loss: {loss.item():.4f} | "
                f"Gaussians: {len(means)} | Time: {elapsed:.1f}s")

    elapsed = time.time() - start_time
    log(f"Training complete in {elapsed:.1f}s")

    # Export to PLY
    export_ply(means, scales, quats, opacities_raw, sh0, output_path)
    log(f"Saved PLY to {output_path}")


# ============================================================
# Step 5: Export to PLY format
# ============================================================

def export_ply(means, scales, quats, opacities_raw, sh0, output_path: str):
    """Export trained gaussians to PLY format compatible with standard viewers."""
    N = means.shape[0]

    means_np = means.detach().cpu().numpy()
    scales_np = torch.exp(scales).detach().cpu().numpy()
    quats_np = (quats / (quats.norm(dim=-1, keepdim=True) + 1e-8)).detach().cpu().numpy()
    opacities_np = torch.sigmoid(opacities_raw).detach().cpu().numpy()
    sh0_np = sh0.detach().cpu().numpy().squeeze(1)  # [N, 3]

    # Convert SH0 back to RGB for the f_dc fields
    colors_sh = sh0_np

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)

    with open(output_path, "wb") as f:
        # PLY header
        header = f"""ply
format binary_little_endian 1.0
element vertex {N}
property float x
property float y
property float z
property float nx
property float ny
property float nz
property float f_dc_0
property float f_dc_1
property float f_dc_2
property float opacity
property float scale_0
property float scale_1
property float scale_2
property float rot_0
property float rot_1
property float rot_2
property float rot_3
end_header
"""
        f.write(header.encode())

        for i in range(N):
            # Position
            f.write(struct.pack("<fff", *means_np[i]))
            # Normals (unused)
            f.write(struct.pack("<fff", 0.0, 0.0, 0.0))
            # SH DC coefficients
            f.write(struct.pack("<fff", *colors_sh[i]))
            # Opacity (inverse sigmoid for compatibility)
            op = np.log(opacities_np[i] / (1 - opacities_np[i] + 1e-8))
            f.write(struct.pack("<f", op))
            # Scales (log for compatibility)
            log_scales = np.log(scales_np[i])
            f.write(struct.pack("<fff", *log_scales))
            # Quaternion rotation
            f.write(struct.pack("<ffff", *quats_np[i]))

    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    log(f"PLY file: {N} gaussians, {size_mb:.1f} MB")


# ============================================================
# Main pipeline
# ============================================================

def process_video(video_path: str, output_dir: str, fps: int = 2, iterations: int = 7000):
    """Full pipeline: video → frames → COLMAP → train → PLY"""
    video_path = str(Path(video_path).resolve())
    output_dir = str(Path(output_dir).resolve())
    os.makedirs(output_dir, exist_ok=True)

    log("=" * 60)
    log("SplatView Processing Pipeline")
    log("=" * 60)
    log(f"Input: {video_path}")
    log(f"Output: {output_dir}")
    log("")

    total_start = time.time()

    # Step 1: Extract frames
    frame_count = extract_frames(video_path, output_dir, fps=fps)

    # Step 2: COLMAP
    run_colmap(output_dir)

    # Step 3: Train gaussian splat
    ply_path = os.path.join(output_dir, "point_cloud.ply")
    train_gaussian_splat(output_dir, ply_path, iterations=iterations)

    total_elapsed = time.time() - total_start

    log("")
    log("=" * 60)
    log(f"DONE in {total_elapsed:.1f}s ({total_elapsed/60:.1f} min)")
    log(f"Output PLY: {ply_path}")
    log(f"Frames used: {frame_count}")
    log("=" * 60)

    return ply_path


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="SplatView: Video to Gaussian Splat")
    parser.add_argument("video", help="Path to input video file")
    parser.add_argument("--output", "-o", default="./splat_output", help="Output directory")
    parser.add_argument("--fps", type=int, default=2, help="Frames per second to extract (default: 2)")
    parser.add_argument("--iterations", "-i", type=int, default=7000, help="Training iterations (default: 7000)")

    args = parser.parse_args()

    if not os.path.exists(args.video):
        print(f"Error: Video file not found: {args.video}")
        sys.exit(1)

    process_video(args.video, args.output, fps=args.fps, iterations=args.iterations)
