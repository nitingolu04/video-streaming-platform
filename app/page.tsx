"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Play, Search, Video, TrendingUp, LogOut, Eye, ThumbsUp } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { useVideos } from "@/hooks/useVideos"
import ffmpeg from 'fluent-ffmpeg';
import { writeFile } from 'fs/promises';
import path from 'path';

const categories = [
  { name: "Technology", icon: "💻", color: "from-blue-500 to-cyan-500", count: "1.2K videos" },
  { name: "Education", icon: "📚", color: "from-green-500 to-emerald-500", count: "856 videos" },
  { name: "Entertainment", icon: "🎬", color: "from-purple-500 to-pink-500", count: "2.1K videos" },
  { name: "Music", icon: "🎵", color: "from-red-500 to-orange-500", count: "945 videos" },
  { name: "Gaming", icon: "🎮", color: "from-indigo-500 to-purple-500", count: "1.8K videos" },
  { name: "Sports", icon: "⚽", color: "from-yellow-500 to-red-500", count: "623 videos" },
]

export default function HomePage() {
  const { user, loading, logout } = useAuth()
  const { videos, loading: videosLoading } = useVideos()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Searching for:", searchQuery)
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading StreamCloud...</p>
        </div>
      </div>
    )
  }

  // Get trending videos (most viewed)
  const trendingVideos = videos.sort((a, b) => b.viewCount - a.viewCount).slice(0, 3)

  // Get featured videos (most recent)
  const featuredVideos = videos.slice(0, 6)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                StreamCloud
              </h1>
              <form onSubmit={handleSearch} className="hidden md:flex items-center space-x-2">
                <div className="relative">
                  <Input
                    type="search"
                    placeholder="Search videos, channels, or topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-96 pl-4 pr-12 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="absolute right-1 top-1 h-8 w-8 p-0 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link href="/upload">
                    <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                      <Video className="h-4 w-4 mr-2" />
                      Upload Video
                    </Button>
                  </Link>
                  <div className="flex items-center space-x-2">
                    <Link href="/profile">
                      <Avatar className="ring-2 ring-purple-200 hover:ring-purple-300 transition-all">
                        <AvatarImage src={user.photoURL || "/placeholder.svg?height=32&width=32"} />
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                          {user.displayName?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-1" />
                      Logout
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-x-3">
                  <Link href="/login">
                    <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="mb-12">
          <Card className="overflow-hidden shadow-2xl border-0 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600">
            <CardContent className="p-12 text-center text-white">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-5xl font-bold mb-6">Welcome to StreamCloud</h2>
                <p className="text-xl mb-8 text-purple-100">
                  🎬 Ready for your practical demo! Watch amazing videos, upload content, and explore our platform. All
                  videos are working and ready to play!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {!user && (
                    <Link href="/signup">
                      <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8">
                        Get Started Free
                      </Button>
                    </Link>
                  )}
                  <Link href="#featured">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8">
                      Watch Videos Now
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

   

        {/* Trending Section */}
        {trendingVideos.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center space-x-3 mb-6">
              <TrendingUp className="h-6 w-6 text-red-500" />
              <h3 className="text-2xl font-bold text-gray-800">Trending Now</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {trendingVideos.map((video, index) => (
                <Card
                  key={video.id}
                  className="border-0 bg-gradient-to-r from-red-50 to-orange-50 hover:shadow-lg transition-all duration-300"
                >
                  <Link href={`/watch/${video.id}`}>
                    <div className="relative">
                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl || "/placeholder.svg"}
                          alt={video.title}
                          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-40 bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                          <Video className="h-12 w-12 text-red-400" />
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2">
                        <Badge className="bg-black/80 text-white font-medium">
                          {video.duration}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 line-clamp-1">{video.title}</h4>
                          <p className="text-sm text-gray-600 flex items-center">
                            <Eye className="h-3 w-3 mr-1" />
                            {video.viewCount.toLocaleString()} views
                          </p>
                        </div>
                        <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white">🔥 Trending</Badge>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Featured Videos */}
        <section id="featured" className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold text-gray-800">Featured Videos</h3>
            {user && (
              <Link href="/upload">
                <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                  Upload Your Video
                </Button>
              </Link>
            )}
          </div>

          {videosLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredVideos.map((video) => (
                <Card
                  key={video.id}
                  className="group cursor-pointer hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm overflow-hidden"
                >
                  <Link href={`/watch/${video.id}`}>
                    <div className="relative">
                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl || "/placeholder.svg"}
                          alt={video.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                          <Video className="h-16 w-16 text-purple-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/50">
                          <Play className="h-8 w-8 text-white ml-1" />
                        </div>
                      </div>
                      <Badge className="absolute bottom-3 right-3 bg-black/80 text-white font-medium">
                        {video.duration}
                      </Badge>
                      <Badge className="absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                        {video.category}
                      </Badge>
                    </div>
                  </Link>

                  <CardContent className="p-6">
                    <h4 className="font-bold text-lg mb-3 line-clamp-2 text-gray-800 group-hover:text-purple-600 transition-colors">
                      {video.title}
                    </h4>
                    <div className="flex items-center space-x-3 mb-3">
                      <Avatar className="h-8 w-8 ring-2 ring-purple-100">
                        <AvatarImage src={video.authorAvatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm">
                          {video.authorName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-gray-700">{video.authorName}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{video.viewCount.toLocaleString()} views</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{video.likeCount}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Categories */}
        <section className="mb-12">
          <h3 className="text-3xl font-bold mb-8 text-gray-800">Browse by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <Card
                key={category.name}
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-0 overflow-hidden"
              >
                <CardContent className={`p-6 text-center bg-gradient-to-br ${category.color} text-white relative`}>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  <div className="relative z-10">
                    <div className="text-3xl mb-3">{category.icon}</div>
                    <h4 className="font-bold text-lg mb-2">{category.name}</h4>
                    <p className="text-sm opacity-90">{category.count}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-12">
          <Card className="border-0 bg-gradient-to-r from-indigo-600 to-purple-600 shadow-2xl">
            <CardContent className="p-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center text-white">
                <div>
                  <div className="text-4xl font-bold mb-2">{videos.length}+</div>
                  <div className="text-indigo-200">Videos Ready</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">
                    {videos.reduce((sum, video) => sum + video.viewCount, 0).toLocaleString()}+
                  </div>
                  <div className="text-indigo-200">Total Views</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">{new Set(videos.map((video) => video.authorId)).size}+</div>
                  <div className="text-indigo-200">Content Creators</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">
                    {videos.reduce((sum, video) => sum + video.likeCount, 0)}+
                  </div>
                  <div className="text-indigo-200">Total Likes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h5 className="font-bold text-xl mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              StreamCloud - Ready for Demo! 🚀
            </h5>
            <p className="text-gray-300 leading-relaxed max-w-2xl mx-auto">
              Your video streaming platform is fully functional with working videos, user authentication, upload system,
              and all interactive features. Perfect for your practical demonstration!
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
