"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Upload, X, Video, ImageIcon, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useVideos } from "@/hooks/useVideos"

export default function UploadPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    tags: "",
    visibility: "public",
  })
  const [dragActive, setDragActive] = useState(false)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  const { uploadVideo } = useVideos()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      const file = files[0]
      if (file.type.startsWith("video/")) {
        setVideoFile(file)
      }
    }
  }

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setVideoFile(file)
    }
  }

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setThumbnailFile(file)
    }
  }

  const removeVideoFile = () => {
    setVideoFile(null)
    if (videoInputRef.current) {
      videoInputRef.current.value = ""
    }
  }

  const removeThumbnailFile = () => {
    setThumbnailFile(null)
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!videoFile) {
      alert("Please select a video file")
      return
    }

    try {
      setIsUploading(true)
      setUploadProgress(0)

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 10
        })
      }, 500)

      const videoId = await uploadVideo(formData, videoFile, thumbnailFile || undefined)

      clearInterval(progressInterval)
      setUploadProgress(100)
      setIsUploading(false)
      setUploadComplete(true)

      console.log("Video uploaded successfully:", videoId)
    } catch (error) {
      console.error("Upload error:", error)
      alert("Upload failed. Please try again.")
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  if (uploadComplete) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="text-center">
              <CardContent className="pt-6">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Upload Complete!</h2>
                <p className="text-muted-foreground mb-6">
                  Your video has been successfully uploaded and is being processed.
                </p>
                <div className="space-x-4">
                  <Link href="/">
                    <Button>Go to Home</Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setUploadComplete(false)
                      setVideoFile(null)
                      setThumbnailFile(null)
                      setFormData({
                        title: "",
                        description: "",
                        category: "",
                        tags: "",
                        visibility: "public",
                      })
                    }}
                  >
                    Upload Another
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary">
              StreamCloud
            </Link>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Upload Video</h1>
            <p className="text-muted-foreground">Share your content with the world. Supported formats: MP4, WebM</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Video Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Video File</CardTitle>
                <CardDescription>Upload your video file (Max size: 2GB)</CardDescription>
              </CardHeader>
              <CardContent>
                {!videoFile ? (
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">Drag and drop your video here</p>
                    <p className="text-muted-foreground mb-4">or click to browse files</p>
                    <Button type="button" variant="outline" onClick={() => videoInputRef.current?.click()}>
                      Choose File
                    </Button>
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/mp4,video/webm"
                      onChange={handleVideoFileChange}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Video className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium">{videoFile.name}</p>
                        <p className="text-sm text-muted-foreground">{formatFileSize(videoFile.size)}</p>
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={removeVideoFile}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Video Details */}
            <Card>
              <CardHeader>
                <CardTitle>Video Details</CardTitle>
                <CardDescription>Add information about your video</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter video title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your video..."
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select onValueChange={(value) => handleSelectChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="entertainment">Entertainment</SelectItem>
                        <SelectItem value="music">Music</SelectItem>
                        <SelectItem value="gaming">Gaming</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="visibility">Visibility</Label>
                    <Select defaultValue="public" onValueChange={(value) => handleSelectChange("visibility", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="unlisted">Unlisted</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    name="tags"
                    placeholder="Enter tags separated by commas"
                    value={formData.tags}
                    onChange={handleInputChange}
                  />
                  <p className="text-sm text-muted-foreground">Add tags to help people discover your video</p>
                </div>
              </CardContent>
            </Card>

            {/* Thumbnail Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Thumbnail (Optional)</CardTitle>
                <CardDescription>Upload a custom thumbnail for your video</CardDescription>
              </CardHeader>
              <CardContent>
                {!thumbnailFile ? (
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">Upload a custom thumbnail (JPG, PNG)</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => thumbnailInputRef.current?.click()}
                    >
                      Choose Image
                    </Button>
                    <input
                      ref={thumbnailInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      onChange={handleThumbnailFileChange}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center space-x-3">
                      <ImageIcon className="h-6 w-6 text-primary" />
                      <div>
                        <p className="font-medium">{thumbnailFile.name}</p>
                        <p className="text-sm text-muted-foreground">{formatFileSize(thumbnailFile.size)}</p>
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={removeThumbnailFile}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upload Progress */}
            {isUploading && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline">
                Save as Draft
              </Button>
              <Button type="submit" disabled={!videoFile || isUploading}>
                {isUploading ? "Uploading..." : "Upload Video"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
