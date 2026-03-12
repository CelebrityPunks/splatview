import { NextRequest, NextResponse } from "next/server";
import { readFile, access, copyFile, mkdir } from "fs/promises";
import path from "path";

export async function GET(request: NextRequest) {
  const jobId = request.nextUrl.searchParams.get("id");

  if (!jobId) {
    return NextResponse.json({ error: "Missing job ID" }, { status: 400 });
  }

  const projectDir = path.join(process.cwd(), "processing", "jobs", jobId);
  const metaPath = path.join(projectDir, "meta.json");
  const plyPath = path.join(projectDir, "output", "point_cloud.ply");

  try {
    const meta = JSON.parse(await readFile(metaPath, "utf-8"));

    // Check if PLY file exists (processing complete)
    try {
      await access(plyPath);

      // Copy PLY to public/splats for serving
      const publicSplatsDir = path.join(process.cwd(), "public", "splats");
      await mkdir(publicSplatsDir, { recursive: true });
      const publicPlyPath = path.join(publicSplatsDir, `${jobId}.ply`);

      try {
        await access(publicPlyPath);
      } catch {
        await copyFile(plyPath, publicPlyPath);
      }

      return NextResponse.json({
        ...meta,
        status: "complete",
        splatUrl: `/splats/${jobId}.ply`,
      });
    } catch {
      // PLY not ready yet
      return NextResponse.json({
        ...meta,
        status: "processing",
      });
    }
  } catch {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
}
