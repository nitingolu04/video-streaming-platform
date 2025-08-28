import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest, { params }: { params: { filename: string } }) {
  const { filename } = params;
  const videoPath = path.join(process.cwd(), "videos", filename);

  if (!fs.existsSync(videoPath)) {
    return new NextResponse("Video not found", { status: 404 });
  }

  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = request.headers.get("range");

  if (!range) {
    // No range header, send the whole file
    const file = fs.readFileSync(videoPath);
    return new NextResponse(file, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": fileSize.toString(),
      },
    });
  }

  // Parse Range header for partial content
  const parts = range.replace(/bytes=/, "").split("-");
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
  const chunkSize = end - start + 1;
  const file = fs.createReadStream(videoPath, { start, end });

  const headers = {
    "Content-Range": `bytes ${start}-${end}/${fileSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": chunkSize.toString(),
    "Content-Type": "video/mp4",
  };

  // @ts-ignore
  return new NextResponse(file as any, {
    status: 206,
    headers,
  });
} 