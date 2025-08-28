import { type NextRequest, NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const videoFile = formData.get("video") as File
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string
    const tags = formData.get("tags") as string
    const visibility = formData.get("visibility") as string

    if (!videoFile || !title) {
      return NextResponse.json({ success: false, message: "Video file and title are required" }, { status: 400 })
    }

    // Save the uploaded video file to the 'videos' folder
    const buffer = Buffer.from(await videoFile.arrayBuffer())
    const safeTitle = title.replace(/[^a-zA-Z0-9-_]/g, "_")
    const ext = videoFile.name.split('.').pop() || 'mp4'
    const filename = `${safeTitle}_${Date.now()}.${ext}`
    const videosDir = path.join(process.cwd(), "videos")
    const filePath = path.join(videosDir, filename)
    await writeFile(filePath, buffer)

    return NextResponse.json({
      success: true,
      filename,
      message: "Video uploaded and saved successfully",
      video: {
        title,
        description,
        category,
        tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
        visibility,
        status: "saved",
        uploadedAt: new Date().toISOString(),
        filePath: `/api/videos/${filename}`,
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Upload failed" }, { status: 500 })
  }
}
