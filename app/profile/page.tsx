"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Clock, Video, Heart, Edit, Save, X, Camera, Upload } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/useAuth"
import { useVideos } from "@/hooks/useVideos"

export default function ProfilePage() {
  const { user, updateUserProfile } = useAuth()
  const { getUserVideos } = useVideos()
  const [watchHistory, setWatchHistory] = useState<any[]>([])
  const [likedVideos, setLikedVideos] = useState<any[]>([])
  const [userVideos, setUserVideos] = useState<any[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    bio: "",
    location: "",
    website: "",
    twitter: "",
  })
  const [loading, setLoading] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      const videos = getUserVideos(user.uid)
      setUserVideos(videos)
      setEditForm({
        name: user.displayName || "",
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
        twitter: user.twitter || "",
      })
    }

    // Load watch history
    const history = localStorage.getItem("watchHistory")
    if (history) {
      setWatchHistory(JSON.parse(history))
    }

    // Mock data
    setLikedVideos([
      {
        id: "1",
        title: "Introduction to Cloud Computing",
        thumbnail: "/placeholder.svg?height=120&width=200",
        duration: "15:30",
        author: "Tech Academy",
        likedAt: "2024-01-20",
      },
      {
        id: "2",
        title: "Modern Web Development",
        thumbnail: "/placeholder.svg?height=120&width=200",
        duration: "22:15",
        author: "Dev Channel",
        likedAt: "2024-01-18",
      },
    ])

    // setUserVideos([
    //   {
    //     id: "user-1",
    //     title: "My First Upload",
    //     thumbnail: "/placeholder.svg?height=120&width=200",
    //     duration: "10:45",
    //     views: "1.2K",
    //     uploadDate: "2024-01-15",
    //     status: "published",
    //   },
    //   {
    //     id: "user-2",
    //     title: "Tutorial Series Part 1",
    //     thumbnail: "/placeholder.svg?height=120&width=200",
    //     duration: "18:30",
    //     views: "856",
    //     uploadDate: "2024-01-10",
    //     status: "published",
    //   },
    // ])
  }, [user])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB")
        return
      }
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async () => {
    if (!editForm.name.trim()) {
      alert("Name is required")
      return
    }

    try {
      setLoading(true)

      let photoURL = user?.photoURL
      if (avatarFile) {
        // Mock upload - in real app, upload to Firebase Storage
        photoURL = URL.createObjectURL(avatarFile)
      }

      await updateUserProfile({
        name: editForm.name,
        bio: editForm.bio,
        location: editForm.location,
        website: editForm.website,
        twitter: editForm.twitter,
        photoURL,
      })

      setIsEditing(false)
      setAvatarFile(null)
      setAvatarPreview(null)
      alert("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    })
  }

  const clearWatchHistory = () => {
    localStorage.removeItem("watchHistory")
    setWatchHistory([])
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Video className="h-8 w-8 text-white" />
            </div>
            <p className="mb-4 text-gray-600">Please log in to view your profile.</p>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                Go to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
            >
              StreamCloud
            </Link>
            <Link href="/">
              <Button variant="outline" className="border-purple-200 hover:bg-purple-50">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 ring-4 ring-purple-100">
                    <AvatarImage src={avatarPreview || user.photoURL || ""} />
                    <AvatarFallback className="text-2xl bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                      {user.displayName?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <label className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer hover:from-purple-600 hover:to-blue-600 transition-all">
                      <Camera className="h-4 w-4" />
                      <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    </label>
                  )}
                </div>

                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name" className="text-gray-700 font-medium">
                          Name
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={editForm.name}
                          onChange={handleInputChange}
                          className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                          maxLength={50}
                        />
                        <p className="text-xs text-gray-500 mt-1">{editForm.name.length}/50 characters</p>
                      </div>
                      <div>
                        <Label htmlFor="bio" className="text-gray-700 font-medium">
                          Bio
                        </Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          value={editForm.bio}
                          onChange={handleInputChange}
                          placeholder="Tell us about yourself..."
                          rows={3}
                          className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                          maxLength={500}
                        />
                        <p className="text-xs text-gray-500 mt-1">{editForm.bio.length}/500 characters</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="location" className="text-gray-700 font-medium">
                            Location
                          </Label>
                          <Input
                            id="location"
                            name="location"
                            value={editForm.location}
                            onChange={handleInputChange}
                            placeholder="Your location"
                            className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                          />
                        </div>
                        <div>
                          <Label htmlFor="website" className="text-gray-700 font-medium">
                            Website
                          </Label>
                          <Input
                            id="website"
                            name="website"
                            value={editForm.website}
                            onChange={handleInputChange}
                            placeholder="https://yourwebsite.com"
                            className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        {user.displayName}
                      </h1>
                      <p className="text-gray-600 mb-2">{user.email}</p>
                      {editForm.bio && <p className="text-sm mb-2 text-gray-700">{editForm.bio}</p>}
                      {editForm.location && <p className="text-sm text-gray-500 mb-2">📍 {editForm.location}</p>}
                      {editForm.website && (
                        <a
                          href={editForm.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-purple-600 hover:text-purple-700 mb-2 block"
                        >
                          🌐 {editForm.website}
                        </a>
                      )}
                      <div className="flex items-center space-x-4 mt-4">
                        <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                          <Video className="h-3 w-3 mr-1" />
                          {userVideos.length} Videos
                        </Badge>
                        <Badge className="bg-gradient-to-r from-pink-500 to-red-500 text-white">
                          <Heart className="h-3 w-3 mr-1" />
                          {likedVideos.length} Liked
                        </Badge>
                        <Badge className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
                          <Clock className="h-3 w-3 mr-1" />
                          {watchHistory.length} Watched
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  {isEditing ? (
                    <>
                      <Button
                        onClick={handleSaveProfile}
                        size="sm"
                        disabled={loading}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        {loading ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        onClick={() => setIsEditing(false)}
                        variant="outline"
                        size="sm"
                        className="border-gray-300 hover:bg-gray-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      size="sm"
                      className="border-purple-200 hover:bg-purple-50 text-purple-600"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Tabs */}
          <Tabs defaultValue="videos" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <TabsTrigger
                value="videos"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white"
              >
                My Videos
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white"
              >
                Watch History
              </TabsTrigger>
              <TabsTrigger
                value="liked"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white"
              >
                Liked Videos
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white"
              >
                Settings
              </TabsTrigger>
            </TabsList>

            {/* My Videos Tab */}
            <TabsContent value="videos">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-gray-800">My Videos</CardTitle>
                      <CardDescription className="text-gray-600">Videos you've uploaded to StreamCloud</CardDescription>
                    </div>
                    <Link href="/upload">
                      <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload New Video
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {userVideos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {userVideos.map((video) => (
                        <Card
                          key={video.id}
                          className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-white/90"
                        >
                          <Link href={`/watch/${video.id}`}>
                            <div className="relative group">
                              <img
                                src={video.thumbnailUrl || "/placeholder.svg"}
                                alt={video.title}
                                className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <Badge className="absolute bottom-2 right-2 bg-black/70 text-white">
                                {video.duration}
                              </Badge>
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                          </Link>
                          <CardContent className="p-4">
                            <h4 className="font-semibold text-sm line-clamp-2 mb-2 text-gray-800">{video.title}</h4>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{video.views} views</span>
                              <span>{new Date(video.uploadDate).toLocaleDateString()}</span>
                            </div>
                            <Badge
                              className={`mt-2 text-xs ${
                                video.status === "published"
                                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                                  : "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                              }`}
                            >
                              {video.status}
                            </Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Video className="h-8 w-8 text-white" />
                      </div>
                      <p className="text-gray-600 mb-4">You haven't uploaded any videos yet.</p>
                      <Link href="/upload">
                        <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                          Upload Your First Video
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Watch History Tab */}
            <TabsContent value="history">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-gray-800">Watch History</CardTitle>
                      <CardDescription className="text-gray-600">Videos you've recently watched</CardDescription>
                    </div>
                    {watchHistory.length > 0 && (
                      <Button
                        variant="outline"
                        onClick={clearWatchHistory}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        Clear History
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {watchHistory.length > 0 ? (
                    <div className="space-y-4">
                      {watchHistory.map((video, index) => (
                        <Card
                          key={`${video.id}-${index}`}
                          className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-white/90"
                        >
                          <Link href={`/watch/${video.id}`}>
                            <div className="flex">
                              <div className="relative w-32 flex-shrink-0">
                                <img
                                  src={video.thumbnail || "/placeholder.svg"}
                                  alt={video.title}
                                  className="w-full h-20 object-cover"
                                />
                              </div>
                              <CardContent className="flex-1 p-4">
                                <h4 className="font-medium text-sm line-clamp-2 mb-1 text-gray-800">{video.title}</h4>
                                <p className="text-xs text-gray-500 mb-1">{video.author}</p>
                                <p className="text-xs text-gray-400">
                                  Watched {new Date(video.watchedAt).toLocaleDateString()}
                                </p>
                              </CardContent>
                            </div>
                          </Link>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Clock className="h-8 w-8 text-white" />
                      </div>
                      <p className="text-gray-600">Your watch history is empty.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Liked Videos Tab */}
            <TabsContent value="liked">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-gray-800">Liked Videos</CardTitle>
                  <CardDescription className="text-gray-600">Videos you've liked on StreamCloud</CardDescription>
                </CardHeader>
                <CardContent>
                  {likedVideos.length > 0 ? (
                    <div className="space-y-4">
                      {likedVideos.map((video) => (
                        <Card
                          key={video.id}
                          className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-white/90"
                        >
                          <Link href={`/watch/${video.id}`}>
                            <div className="flex">
                              <div className="relative w-32 flex-shrink-0">
                                <img
                                  src={video.thumbnail || "/placeholder.svg"}
                                  alt={video.title}
                                  className="w-full h-20 object-cover"
                                />
                                <Badge className="absolute bottom-1 right-1 bg-black/70 text-white text-xs">
                                  {video.duration}
                                </Badge>
                              </div>
                              <CardContent className="flex-1 p-4">
                                <h4 className="font-medium text-sm line-clamp-2 mb-1 text-gray-800">{video.title}</h4>
                                <p className="text-xs text-gray-500 mb-1">{video.author}</p>
                                <p className="text-xs text-gray-400">
                                  Liked on {new Date(video.likedAt).toLocaleDateString()}
                                </p>
                              </CardContent>
                            </div>
                          </Link>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Heart className="h-8 w-8 text-white" />
                      </div>
                      <p className="text-gray-600">You haven't liked any videos yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-gray-800">Account Settings</CardTitle>
                  <CardDescription className="text-gray-600">
                    Manage your account preferences and privacy settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-800">Privacy Settings</h4>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3 p-3 rounded-lg bg-purple-50 border border-purple-100">
                        <input type="checkbox" defaultChecked className="text-purple-600 focus:ring-purple-500" />
                        <span className="text-sm text-gray-700">Make my profile public</span>
                      </label>
                      <label className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                        <input type="checkbox" defaultChecked className="text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm text-gray-700">Allow others to see my liked videos</span>
                      </label>
                      <label className="flex items-center space-x-3 p-3 rounded-lg bg-green-50 border border-green-100">
                        <input type="checkbox" className="text-green-600 focus:ring-green-500" />
                        <span className="text-sm text-gray-700">Keep my watch history private</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-800">Notifications</h4>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3 p-3 rounded-lg bg-yellow-50 border border-yellow-100">
                        <input type="checkbox" defaultChecked className="text-yellow-600 focus:ring-yellow-500" />
                        <span className="text-sm text-gray-700">Email notifications for new subscribers</span>
                      </label>
                      <label className="flex items-center space-x-3 p-3 rounded-lg bg-pink-50 border border-pink-100">
                        <input type="checkbox" defaultChecked className="text-pink-600 focus:ring-pink-500" />
                        <span className="text-sm text-gray-700">Email notifications for comments</span>
                      </label>
                      <label className="flex items-center space-x-3 p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                        <input type="checkbox" className="text-indigo-600 focus:ring-indigo-500" />
                        <span className="text-sm text-gray-700">Marketing emails</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-800">Account Actions</h4>
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full justify-start border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        Change Password
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start border-green-200 text-green-600 hover:bg-green-50"
                      >
                        Download My Data
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start border-red-200 text-red-600 hover:bg-red-50"
                      >
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
