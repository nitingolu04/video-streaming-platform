"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"
import { sampleVideos, fallbackVideos, sampleComments } from "@/lib/sample-videos"
import { useAuth } from "@/hooks/useAuth"

interface Video {
  id: string
  title: string
  description: string
  videoUrl: string
  thumbnailUrl?: string
  authorId: string
  authorName: string
  authorAvatar?: string
  duration: string
  category: string
  tags: string[]
  viewCount: number
  likeCount: number
  dislikeCount: number
  commentCount: number
  createdAt: any
  status: "processing" | "published" | "private"
  visibility: "public" | "unlisted" | "private"
}

interface Comment {
  id: string
  videoId: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  parentId?: string
  likeCount: number
  createdAt: any
  replies?: Comment[]
}

interface VideosContextType {
  videos: Video[]
  loading: boolean
  uploadVideo: (videoData: any, videoFile: File, thumbnailFile?: File) => Promise<string>
  getVideoById: (id: string) => Video | null
  likeVideo: (videoId: string) => Promise<void>
  dislikeVideo: (videoId: string) => Promise<void>
  addComment: (videoId: string, content: string, parentId?: string) => Promise<void>
  getComments: (videoId: string) => Comment[]
  incrementViewCount: (videoId: string) => Promise<void>
  getUserVideos: (userId: string) => Video[]
}

const VideosContext = createContext<VideosContextType>({} as VideosContextType)

export const useVideos = () => useContext(VideosContext)

export const VideosProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth()
  const [videos, setVideos] = useState<Video[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  // Initialize with sample videos immediately
  useEffect(() => {
    console.log("🎬 Loading sample videos for practical demo...")

    // Try to load from localStorage first
    const savedVideos = localStorage.getItem("streamcloud_videos")
    const savedComments = localStorage.getItem("streamcloud_comments")

    if (savedVideos && JSON.parse(savedVideos).length > 0) {
      // Patch videoUrl if needed
      const loadedVideos = JSON.parse(savedVideos).map((video: any) => {
        if (video.filePath && !video.videoUrl) {
          video.videoUrl = video.filePath
        }
        return video
      })
      setVideos(loadedVideos)
    } else {
      // Use sample videos with fallback
      const allVideos = [...sampleVideos, ...fallbackVideos]
      setVideos(allVideos)
      localStorage.setItem("streamcloud_videos", JSON.stringify(allVideos))
    }

    if (savedComments && JSON.parse(savedComments).length > 0) {
      setComments(JSON.parse(savedComments))
    } else {
      setComments(sampleComments)
      localStorage.setItem("streamcloud_comments", JSON.stringify(sampleComments))
    }

    setLoading(false)
    console.log("✅ Videos loaded successfully!")
  }, [])

  const saveVideosToLocal = (videosData: Video[]) => {
    localStorage.setItem("streamcloud_videos", JSON.stringify(videosData))
  }

  const saveCommentsToLocal = (commentsData: Comment[]) => {
    localStorage.setItem("streamcloud_comments", JSON.stringify(commentsData))
  }

  const extractThumbnailAndDuration = (videoFile: File): Promise<{ thumbnailUrl: string; duration: string }> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = URL.createObjectURL(videoFile);
      video.muted = true;
      video.playsInline = true;
      video.crossOrigin = 'anonymous';
      video.currentTime = 0.1;

      video.onloadedmetadata = () => {
        // Duration
        const duration = video.duration;
        // Format duration as mm:ss
        const mins = Math.floor(duration / 60);
        const secs = Math.floor(duration % 60);
        const formattedDuration = `${mins}:${secs.toString().padStart(2, '0')}`;

        // Seek to 0.1s for thumbnail
        video.currentTime = 0.1;
      };

      video.onseeked = () => {
        // Draw the frame to a canvas
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbnailUrl = canvas.toDataURL('image/jpeg');
          // Format duration as mm:ss
          const duration = video.duration;
          const mins = Math.floor(duration / 60);
          const secs = Math.floor(duration % 60);
          const formattedDuration = `${mins}:${secs.toString().padStart(2, '0')}`;
          resolve({ thumbnailUrl, duration: formattedDuration });
        } else {
          reject(new Error('Could not get canvas context'));
        }
        // Clean up
        URL.revokeObjectURL(video.src);
      };

      video.onerror = (e) => {
        reject(new Error('Failed to load video for thumbnail extraction'));
      };
    });
  };

  const uploadVideo = async (videoData: any, videoFile: File, thumbnailFile?: File): Promise<string> => {
    if (!user) throw new Error("Authentication required")

    // Upload video to the server
    const form = new FormData()
    form.append("video", videoFile)
    form.append("title", videoData.title)
    form.append("description", videoData.description || "")
    form.append("category", videoData.category || "Other")
    form.append("tags", videoData.tags || "")
    form.append("visibility", videoData.visibility || "public")

    // Optionally handle thumbnail upload here if needed

    const res = await fetch("/api/videos/upload", {
      method: "POST",
      body: form,
    })
    const result = await res.json()
    if (!result.success) throw new Error(result.message || "Upload failed")

    const videoUrl = result.video.filePath // Use the server-accessible URL
    let thumbnailUrl = ""
    let duration = "0:00"

    if (thumbnailFile) {
      thumbnailUrl = URL.createObjectURL(thumbnailFile)
    } else {
      // Extract thumbnail and duration from video file
      try {
        const extractResult = await extractThumbnailAndDuration(videoFile)
        thumbnailUrl = extractResult.thumbnailUrl
        duration = extractResult.duration
      } catch (err) {
        console.error('Failed to extract thumbnail/duration:', err)
      }
    }

    const videoId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const newVideo: Video = {
      id: videoId,
      title: videoData.title,
      description: videoData.description || "",
      videoUrl, // Use the server URL
      thumbnailUrl,
      authorId: user.uid,
      authorName: user.displayName || "Unknown User",
      authorAvatar: user.photoURL || "",
      duration,
      category: videoData.category || "Other",
      tags: videoData.tags ? videoData.tags.split(",").map((tag: string) => tag.trim()) : [],
      viewCount: 0,
      likeCount: 0,
      dislikeCount: 0,
      commentCount: 0,
      createdAt: new Date().toISOString(),
      status: "published" as const,
      visibility: videoData.visibility || ("public" as const),
    }

    const updatedVideos = [newVideo, ...videos]
    setVideos(updatedVideos)
    saveVideosToLocal(updatedVideos)

    return videoId
  }

  const getVideoById = (id: string): Video | null => {
    return videos.find((video) => video.id === id) || null
  }

  const likeVideo = async (videoId: string) => {
    if (!user) throw new Error("Authentication required")

    const updatedVideos = videos.map((video) =>
      video.id === videoId ? { ...video, likeCount: video.likeCount + 1 } : video,
    )
    setVideos(updatedVideos)
    saveVideosToLocal(updatedVideos)

    // Track user likes
    const userLikes = JSON.parse(localStorage.getItem("streamcloud_user_likes") || "[]")
    const likeKey = `${user.uid}_${videoId}`
    if (!userLikes.includes(likeKey)) {
      userLikes.push(likeKey)
      localStorage.setItem("streamcloud_user_likes", JSON.stringify(userLikes))
    }
  }

  const dislikeVideo = async (videoId: string) => {
    if (!user) throw new Error("Authentication required")

    const updatedVideos = videos.map((video) =>
      video.id === videoId ? { ...video, dislikeCount: video.dislikeCount + 1 } : video,
    )
    setVideos(updatedVideos)
    saveVideosToLocal(updatedVideos)
  }

  const addComment = async (videoId: string, content: string, parentId?: string) => {
    if (!user) throw new Error("Authentication required")

    const commentId = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const newComment: Comment = {
      id: commentId,
      videoId,
      userId: user.uid,
      userName: user.displayName || "Anonymous",
      userAvatar: user.photoURL || "",
      content,
      parentId: parentId || undefined,
      likeCount: 0,
      createdAt: new Date().toISOString(),
    }

    const updatedComments = [newComment, ...comments]
    setComments(updatedComments)
    saveCommentsToLocal(updatedComments)

    // Update video comment count
    const updatedVideos = videos.map((video) =>
      video.id === videoId ? { ...video, commentCount: video.commentCount + 1 } : video,
    )
    setVideos(updatedVideos)
    saveVideosToLocal(updatedVideos)
  }

  const getComments = (videoId: string): Comment[] => {
    const videoComments = comments.filter((comment) => comment.videoId === videoId && !comment.parentId)

    return videoComments.map((comment) => ({
      ...comment,
      replies: comments.filter((reply) => reply.parentId === comment.id),
    }))
  }

  const incrementViewCount = async (videoId: string) => {
    const updatedVideos = videos.map((video) =>
      video.id === videoId ? { ...video, viewCount: video.viewCount + 1 } : video,
    )
    setVideos(updatedVideos)
    saveVideosToLocal(updatedVideos)
  }

  const getUserVideos = (userId: string): Video[] => {
    return videos.filter((video) => video.authorId === userId)
  }

  const value = {
    videos,
    loading,
    uploadVideo,
    getVideoById,
    likeVideo,
    dislikeVideo,
    addComment,
    getComments,
    incrementViewCount,
    getUserVideos,
  }

  return <VideosContext.Provider value={value}>{children}</VideosContext.Provider>
}
