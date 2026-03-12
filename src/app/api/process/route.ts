import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { spawn } from "child_process";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("video") as File;
    const title = formData.get("title") as string || "untitled";

    if (!file) {
      return NextResponse.json({ error: "No video provided" }, { status: 400 });
    }

    const validExtensions = [".mp4", ".mov", ".avi", ".mkv", ".webm"];
    const ext = path.extname(file.name).toLowerCase();
    if (!validExtensions.includes(ext)) {
      return NextResponse.json(
        { error: "Invalid file type. Supported: MP4, MOV, AVI, MKV, WEBM" },
        { status: 400 }
      );
    }

    // Create project directory
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const projectId = `${slug}-${Date.now()}`;
    const projectDir = path.join(process.cwd(), "processing", "jobs", projectId);
    await mkdir(projectDir, { recursive: true });

    // Save video file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const videoPath = path.join(projectDir, `input${ext}`);
    await writeFile(videoPath, buffer);

    // Start processing in background
    const pythonScript = path.join(process.cwd(), "processing", "video_to_splat.py");
    const outputDir = path.join(projectDir, "output");

    const child = spawn("python", [
      pythonScript,
      videoPath,
      "--output", outputDir,
      "--fps", "2",
      "--iterations", "7000",
    ], {
      detached: true,
      stdio: "ignore",
    });
    child.unref();

    // Save job metadata
    const metaPath = path.join(projectDir, "meta.json");
    await writeFile(metaPath, JSON.stringify({
      id: projectId,
      title,
      videoFile: file.name,
      status: "processing",
      startedAt: new Date().toISOString(),
      pid: child.pid,
    }, null, 2));

    return NextResponse.json({
      success: true,
      jobId: projectId,
      message: "Processing started. This may take 10-30 minutes depending on video length.",
    });
  } catch (error) {
    console.error("Process error:", error);
    return NextResponse.json(
      { error: "Failed to start processing" },
      { status: 500 }
    );
  }
}
