// Node.js + Express Backend Setup Script
// This script demonstrates the backend structure for the video streaming platform

const express = require("express")
const cors = require("cors")
const multer = require("multer")
const path = require("path")

// Initialize Express app
const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024, // 2GB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true)
    } else {
      cb(new Error("Only video files are allowed!"), false)
    }
  },
})

// Routes

// Authentication Routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body

    // In real implementation:
    // 1. Validate input
    // 2. Check if user exists
    // 3. Hash password with bcrypt
    // 4. Save to database (MongoDB/Firebase)
    // 5. Generate JWT token

    console.log("User registration:", { name, email })

    res.json({
      success: true,
      message: "User registered successfully",
      token: "mock-jwt-token",
      user: { id: Date.now(), name, email },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // In real implementation:
    // 1. Find user by email
    // 2. Compare password hash
    // 3. Generate JWT token

    console.log("User login:", { email })

    res.json({
      success: true,
      message: "Login successful",
      token: "mock-jwt-token",
      user: { id: 1, name: "John Doe", email },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Video Upload Route
app.post("/api/videos/upload", upload.single("video"), async (req, res) => {
  try {
    const { title, description, category, tags, visibility } = req.body
    const videoFile = req.file

    if (!videoFile) {
      return res.status(400).json({ success: false, message: "No video file uploaded" })
    }

    // In real implementation:
    // 1. Upload to cloud storage (AWS S3, Firebase Storage)
    // 2. Process video with FFmpeg for different qualities
    // 3. Generate thumbnail
    // 4. Save metadata to database
    // 5. Queue for CDN distribution

    console.log("Video upload:", {
      filename: videoFile.filename,
      title,
      description,
      category,
    })

    const videoId = "video-" + Date.now()

    res.json({
      success: true,
      message: "Video uploaded successfully",
      videoId,
      video: {
        id: videoId,
        title,
        description,
        category,
        tags: tags ? tags.split(",") : [],
        visibility,
        filename: videoFile.filename,
        status: "processing",
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Get Videos Route
app.get("/api/videos", async (req, res) => {
  try {
    // In real implementation:
    // 1. Query database for videos
    // 2. Apply filters (category, search, etc.)
    // 3. Implement pagination
    // 4. Return video metadata

    const mockVideos = [
      {
        id: "1",
        title: "Introduction to Cloud Computing",
        description: "Learn the basics of cloud computing",
        thumbnail: "https://example.com/thumb1.jpg",
        videoUrl: "https://example.com/video1.mp4",
        duration: "15:30",
        views: 125847,
        likes: 3420,
        author: {
          id: "tech-academy",
          name: "Tech Academy",
          avatar: "https://example.com/avatar1.jpg",
        },
        uploadDate: "2024-01-15T10:00:00Z",
        category: "Technology",
        tags: ["cloud", "computing", "tutorial"],
      },
    ]

    res.json({
      success: true,
      videos: mockVideos,
      total: mockVideos.length,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Get Single Video Route
app.get("/api/videos/:id", async (req, res) => {
  try {
    const { id } = req.params

    // In real implementation:
    // 1. Query database for video by ID
    // 2. Increment view count
    // 3. Return video details with streaming URL

    console.log("Fetching video:", id)

    const mockVideo = {
      id,
      title: "Introduction to Cloud Computing",
      description: "Learn the basics of cloud computing...",
      videoUrl: "https://example.com/video.mp4",
      thumbnail: "https://example.com/thumb.jpg",
      duration: "15:30",
      views: 125847,
      likes: 3420,
      dislikes: 89,
      author: {
        id: "tech-academy",
        name: "Tech Academy",
        avatar: "https://example.com/avatar.jpg",
        subscribers: 245000,
      },
      uploadDate: "2024-01-15T10:00:00Z",
      category: "Technology",
      tags: ["cloud", "computing", "tutorial"],
    }

    res.json({
      success: true,
      video: mockVideo,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Comments Routes
app.get("/api/videos/:id/comments", async (req, res) => {
  try {
    const { id } = req.params

    // Mock comments data
    const mockComments = [
      {
        id: "1",
        author: "John Developer",
        avatar: "https://example.com/avatar1.jpg",
        content: "Great explanation! This really helped me understand cloud computing.",
        timestamp: "2024-01-20T14:30:00Z",
        likes: 12,
        replies: [],
      },
    ]

    res.json({
      success: true,
      comments: mockComments,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

app.post("/api/videos/:id/comments", async (req, res) => {
  try {
    const { id } = req.params
    const { content } = req.body

    // In real implementation:
    // 1. Validate user authentication
    // 2. Save comment to database
    // 3. Send notification to video owner

    console.log("New comment on video", id, ":", content)

    res.json({
      success: true,
      message: "Comment added successfully",
      comment: {
        id: Date.now(),
        content,
        timestamp: new Date().toISOString(),
        likes: 0,
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Like/Dislike Routes
app.post("/api/videos/:id/like", async (req, res) => {
  try {
    const { id } = req.params

    // In real implementation:
    // 1. Check user authentication
    // 2. Toggle like status in database
    // 3. Update like count

    console.log("Video liked:", id)

    res.json({
      success: true,
      message: "Video liked successfully",
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Search Route
app.get("/api/search", async (req, res) => {
  try {
    const { q, category, sort } = req.query

    // In real implementation:
    // 1. Use search engine (Elasticsearch, Algolia)
    // 2. Apply filters and sorting
    // 3. Return paginated results

    console.log("Search query:", { q, category, sort })

    res.json({
      success: true,
      results: [],
      total: 0,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 2GB.",
      })
    }
  }

  res.status(500).json({
    success: false,
    message: error.message || "Internal server error",
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log("Backend setup complete!")
  console.log("Available endpoints:")
  console.log("- POST /api/auth/register")
  console.log("- POST /api/auth/login")
  console.log("- POST /api/videos/upload")
  console.log("- GET /api/videos")
  console.log("- GET /api/videos/:id")
  console.log("- GET /api/videos/:id/comments")
  console.log("- POST /api/videos/:id/comments")
  console.log("- POST /api/videos/:id/like")
  console.log("- GET /api/search")
})

// Export for testing
module.exports = app
