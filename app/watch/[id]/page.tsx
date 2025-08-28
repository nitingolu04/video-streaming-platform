"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ThumbsUp, ThumbsDown, Share, Download, Flag, Bell, Video } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { CommentSystem } from "@/components/comment-system"
import { VideoPlayer } from "@/components/video-player"
import { useVideos } from "@/hooks/useVideos"
import { useAuth } from "@/hooks/useAuth"

export default function WatchPage() {
  const params = useParams()
  const { user } = useAuth()
  const [isLiked, setIsLiked] = useState(false)
  const [isDisliked, setIsDisliked] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [showDescription, setShowDescription] = useState(false)

  const { getVideoById, likeVideo, dislikeVideo, getComments, incrementViewCount, videos } = useVideos()
  const [video, setVideo] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])

  useEffect(() => {
    if (params.id) {
      const videoData = getVideoById(params.id as string)
      if (videoData) {
        setVideo(videoData)
        setComments(getComments(params.id as string))

        // Increment view count
        incrementViewCount(params.id as string)

        // Add to watch history
        const watchHistory = JSON.parse(localStorage.getItem("watchHistory") || "[]")
        const videoEntry = {
          id: videoData.id,
          title: videoData.title,
          thumbnail: videoData.thumbnailUrl,
          author: videoData.authorName,
          watchedAt: new Date().toISOString(),
        }

        const filteredHistory = watchHistory.filter((item: any) => item.id !== videoData.id)
        const updatedHistory = [videoEntry, ...filteredHistory].slice(0, 50)

        localStorage.setItem("watchHistory", JSON.stringify(updatedHistory))
      }
    }
  }, [params.id, videos])

  const handleLike = async () => {
    if (!video || !user) return
    try {
      await likeVideo(video.id)
      setIsLiked(!isLiked)
      if (isDisliked) setIsDisliked(false)
    } catch (error) {
      console.error("Error liking video:", error)
    }
  }

  const handleDislike = async () => {
    if (!video || !user) return
    try {
      await dislikeVideo(video.id)
      setIsDisliked(!isDisliked)
      if (isLiked) setIsLiked(false)
    } catch (error) {
      console.error("Error disliking video:", error)
    }
  }

  const handleSubscribe = () => {
    setIsSubscribed(!isSubscribed)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: video?.title || "StreamCloud Video",
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <header className="border-b bg-white/80 backdrop-blur-md shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
            >
              StreamCloud
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-4 py-20 text-center">
          <Video className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Video Not Found</h1>
          <p className="text-gray-600 mb-6">The video you're looking for doesn't exist or has been removed.</p>
          <Link href="/">
            <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Get related videos (exclude current video)
  const relatedVideos = videos.filter((v) => v.id !== video.id).slice(0, 5)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
          >
            StreamCloud
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Video Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <VideoPlayer
              videoUrl={video.videoUrl}
              thumbnailUrl={video.thumbnailUrl}
              title={video.title}
              className="shadow-2xl"
            />

            {/* Video Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-3 text-gray-800">{video.title}</h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <span className="font-medium">{video.viewCount.toLocaleString()} views</span>
                  <span>•</span>
                  <span>
                    {video.createdAt?.toDate
                      ? video.createdAt.toDate().toLocaleDateString()
                      : new Date(video.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2 ml-4">
                    {video.tags.map((tag: string) => (
                      <Badge
                        key={tag}
                        className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-0"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button
                    variant={isLiked ? "default" : "outline"}
                    size="sm"
                    onClick={handleLike}
                    disabled={!user}
                    className={`flex items-center space-x-2 ${
                      isLiked
                        ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                        : "border-purple-200 text-purple-600 hover:bg-purple-50"
                    }`}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>{video.likeCount + (isLiked ? 1 : 0)}</span>
                  </Button>

                  <Button
                    variant={isDisliked ? "default" : "outline"}
                    size="sm"
                    onClick={handleDislike}
                    disabled={!user}
                    className={`flex items-center space-x-2 ${
                      isDisliked
                        ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                        : "border-red-200 text-red-600 hover:bg-red-50"
                    }`}
                  >
                    <ThumbsDown className="h-4 w-4" />
                    <span>{video.dislikeCount + (isDisliked ? 1 : 0)}</span>
                  </Button>
                </div>

                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="border-green-200 text-green-600 hover:bg-green-50"
                  >
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>

                  <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>

                  <Button variant="outline" size="sm" className="border-orange-200 text-orange-600 hover:bg-orange-50">
                    <Flag className="h-4 w-4 mr-2" />
                    Report
                  </Button>
                </div>
              </div>

              {/* Channel Info */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-14 w-14 ring-4 ring-purple-100">
                        <AvatarImage src={video.authorAvatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-lg">
                          {video.authorName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-lg text-gray-800">{video.authorName}</h3>
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs">
                            ✓ Creator
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 font-medium">Content Creator</p>
                      </div>
                    </div>

                    <Button
                      onClick={handleSubscribe}
                      disabled={!user}
                      className={`flex items-center space-x-2 px-6 ${
                        isSubscribed
                          ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          : "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
                      }`}
                    >
                      <Bell className="h-4 w-4" />
                      <span>{isSubscribed ? "Subscribed" : "Subscribe"}</span>
                    </Button>
                  </div>

                  <div className="mt-6">
                    <p className={`text-gray-700 leading-relaxed ${showDescription ? "" : "line-clamp-3"}`}>
                      {video.description || "No description available."}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDescription(!showDescription)}
                      className="mt-3 p-0 h-auto text-purple-600 hover:text-purple-700 font-medium"
                    >
                      {showDescription ? "Show less" : "Show more"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Comments Section */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <CommentSystem videoId={video.id} initialComments={comments} />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar - Related Videos */}
          <div className="space-y-6">
            <h3 className="font-bold text-xl text-gray-800">Related Videos</h3>
            <div className="space-y-4">
              {relatedVideos.length > 0 ? (
                relatedVideos.map((relatedVideo) => (
                  <Card
                    key={relatedVideo.id}
                    className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm"
                  >
                    <Link href={`/watch/${relatedVideo.id}`}>
                      <div className="flex">
                        <div className="relative w-40 flex-shrink-0">
                          {relatedVideo.thumbnailUrl ? (
                            <img
                              src={relatedVideo.thumbnailUrl || "/placeholder.svg"}
                              alt={relatedVideo.title}
                              className="w-full h-24 object-cover"
                            />
                          ) : (
                            <div className="w-full h-24 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                              <Video className="h-8 w-8 text-purple-400" />
                            </div>
                          )}
                          <Badge className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium">
                            {relatedVideo.duration}
                          </Badge>
                        </div>
                        <CardContent className="flex-1 p-4">
                          <h4 className="font-semibold text-sm line-clamp-2 mb-2 text-gray-800">
                            {relatedVideo.title}
                          </h4>
                          <p className="text-xs text-gray-600 mb-1 font-medium">{relatedVideo.authorName}</p>
                          <p className="text-xs text-gray-500">{relatedVideo.viewCount.toLocaleString()} views</p>
                        </CardContent>
                      </div>
                    </Link>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <Video className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No related videos available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
