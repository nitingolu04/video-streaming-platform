"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2, AlertCircle } from "lucide-react"

interface VideoPlayerProps {
  videoUrl: string
  thumbnailUrl?: string
  title: string
  onTimeUpdate?: (currentTime: number, duration: number) => void
  onPlay?: () => void
  onPause?: () => void
  className?: string
}

export function VideoPlayer({
  videoUrl,
  thumbnailUrl,
  title,
  onTimeUpdate,
  onPlay,
  onPause,
  className = "",
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [canPlay, setCanPlay] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadStart = () => {
      setIsLoading(true)
      setHasError(false)
      setCanPlay(false)
    }

    const handleCanPlay = () => {
      setIsLoading(false)
      setCanPlay(true)
      setHasError(false)
    }

    const handleError = (e: any) => {
      console.error("Video error:", e)
      setHasError(true)
      setIsLoading(false)
      setCanPlay(false)
    }

    const handleLoadedMetadata = () => {
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration)
      }
    }

    video.addEventListener("loadstart", handleLoadStart)
    video.addEventListener("canplay", handleCanPlay)
    video.addEventListener("error", handleError)
    video.addEventListener("loadedmetadata", handleLoadedMetadata)

    // Force load the video
    video.load()

    return () => {
      video.removeEventListener("loadstart", handleLoadStart)
      video.removeEventListener("canplay", handleCanPlay)
      video.removeEventListener("error", handleError)
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
    }
  }, [videoUrl])

  const togglePlay = async () => {
    if (!videoRef.current || !canPlay) return

    try {
      if (isPlaying) {
        videoRef.current.pause()
        onPause?.()
      } else {
        await videoRef.current.play()
        onPlay?.()
      }
      setIsPlaying(!isPlaying)
    } catch (error) {
      console.error("Play error:", error)
      setHasError(true)
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || duration === 0) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newTime = (clickX / rect.width) * duration
    videoRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    const current = videoRef.current.currentTime
    const total = videoRef.current.duration
    setCurrentTime(current)
    if (total && !isNaN(total)) {
      setDuration(total)
    }
    onTimeUpdate?.(current, total)
  }

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === 0) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const toggleFullscreen = () => {
    if (!videoRef.current) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      videoRef.current.requestFullscreen()
    }
  }

  if (hasError) {
    return (
      <Card className={`overflow-hidden bg-gray-900 ${className}`}>
        <div className="aspect-video flex items-center justify-center text-white">
          <div className="text-center p-8">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-400" />
            <p className="text-lg mb-2">Video Error</p>
            <p className="text-sm opacity-75 mb-4">Unable to load this video</p>
            <Button
              onClick={() => {
                setHasError(false)
                setIsLoading(true)
                videoRef.current?.load()
              }}
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-black"
            >
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`overflow-hidden bg-black relative group ${className}`}>
      <div
        className="relative aspect-video"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          poster={thumbnailUrl}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleTimeUpdate}
          preload="metadata"
          crossOrigin="anonymous"
          playsInline
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center text-white">
              <Loader2 className="h-12 w-12 mx-auto animate-spin mb-4" />
              <p>Loading video...</p>
            </div>
          </div>
        )}

        {/* Play Button Overlay */}
        {!isPlaying && !isLoading && canPlay && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              size="lg"
              onClick={togglePlay}
              className="rounded-full w-20 h-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 border-2 border-white/50 transition-all duration-300"
            >
              <Play className="h-8 w-8 text-white ml-1" />
            </Button>
          </div>
        )}

        {/* Video Controls */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
            showControls || !isPlaying ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Progress Bar */}
          <div className="mb-4">
            <div
              className="w-full bg-white/30 rounded-full h-1 cursor-pointer hover:h-2 transition-all duration-200"
              onClick={handleSeek}
            >
              <div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full transition-all duration-300"
                style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%" }}
              />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlay}
                disabled={!canPlay}
                className="text-white hover:bg-white/20 p-2"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>

              <Button variant="ghost" size="sm" onClick={toggleMute} className="text-white hover:bg-white/20 p-2">
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>

              <div className="text-sm font-medium">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="text-white hover:bg-white/20 p-2">
                <Maximize className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Video Title Overlay */}
        <div className="absolute top-4 left-4 right-4">
          <Badge className="bg-black/60 text-white backdrop-blur-sm">{title}</Badge>
        </div>
      </div>
    </Card>
  )
}
