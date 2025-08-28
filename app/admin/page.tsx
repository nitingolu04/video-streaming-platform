"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Users,
  Video,
  Eye,
  ThumbsUp,
  MessageSquare,
  TrendingUp,
  Search,
  Download,
  BarChart3,
  Activity,
} from "lucide-react"
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"

interface UserData {
  uid: string
  name: string
  email: string
  photoURL?: string
  createdAt: any
  lastSeen: any
  isOnline: boolean
  subscriberCount: number
  videoCount: number
  totalViews: number
  location?: string
  isVerified: boolean
}

interface VideoData {
  id: string
  title: string
  description: string
  authorId: string
  authorName: string
  viewCount: number
  likeCount: number
  commentCount: number
  createdAt: any
  status: string
  category: string
}

interface AnalyticsData {
  totalUsers: number
  totalVideos: number
  totalViews: number
  totalLikes: number
  totalComments: number
  activeUsers: number
  newUsersToday: number
  newVideosToday: number
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [users, setUsers] = useState<UserData[]>([])
  const [videos, setVideos] = useState<VideoData[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    totalVideos: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    activeUsers: 0,
    newUsersToday: 0,
    newVideosToday: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTab, setSelectedTab] = useState("overview")

  useEffect(() => {
    if (!user) return

    // Check if user is admin (you can implement your own admin check logic)
    const isAdmin = user.email === "admin@streamcloud.com" // Replace with your admin email

    if (!isAdmin) {
      // Redirect non-admin users
      window.location.href = "/"
      return
    }

    loadDashboardData()
  }, [user])

  const loadDashboardData = async () => {
    try {
      // Load users
      const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(100))
      const usersSnapshot = await getDocs(usersQuery)
      const usersData = usersSnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      })) as UserData[]
      setUsers(usersData)

      // Load videos
      const videosQuery = query(collection(db, "videos"), orderBy("createdAt", "desc"), limit(100))
      const videosSnapshot = await getDocs(videosQuery)
      const videosData = videosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as VideoData[]
      setVideos(videosData)

      // Calculate analytics
      const totalUsers = usersData.length
      const totalVideos = videosData.length
      const totalViews = videosData.reduce((sum, video) => sum + (video.viewCount || 0), 0)
      const totalLikes = videosData.reduce((sum, video) => sum + (video.likeCount || 0), 0)
      const totalComments = videosData.reduce((sum, video) => sum + (video.commentCount || 0), 0)
      const activeUsers = usersData.filter((user) => user.isOnline).length

      // Calculate today's stats
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const newUsersToday = usersData.filter((user) => user.createdAt?.toDate() >= today).length

      const newVideosToday = videosData.filter((video) => video.createdAt?.toDate() >= today).length

      setAnalytics({
        totalUsers,
        totalVideos,
        totalViews,
        totalLikes,
        totalComments,
        activeUsers,
        newUsersToday,
        newVideosToday,
      })

      setLoading(false)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredVideos = videos.filter(
    (video) =>
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.authorName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const exportData = (type: "users" | "videos") => {
    const data = type === "users" ? users : videos
    const csv = [Object.keys(data[0] || {}), ...data.map((item) => Object.values(item))]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${type}-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading dashboard...</p>
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
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-primary">
                StreamCloud Admin
              </Link>
              <Badge variant="secondary">Admin Dashboard</Badge>
            </div>
            <Link href="/">
              <Button variant="outline">Back to Site</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage your video streaming platform</p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">+{analytics.newUsersToday} today</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
                  <Video className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalVideos}</div>
                  <p className="text-xs text-muted-foreground">+{analytics.newVideosToday} today</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Across all videos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.activeUsers}</div>
                  <p className="text-xs text-muted-foreground">Currently online</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Users</CardTitle>
                  <CardDescription>Latest user registrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.slice(0, 5).map((user) => (
                      <div key={user.uid} className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.photoURL || ""} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {user.isOnline && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                          {user.isVerified && (
                            <Badge variant="secondary" className="text-xs">
                              ✓
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Videos</CardTitle>
                  <CardDescription>Latest video uploads</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {videos.slice(0, 5).map((video) => (
                      <div key={video.id} className="flex items-start space-x-3">
                        <div className="w-16 h-12 bg-muted rounded flex items-center justify-center">
                          <Video className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{video.title}</p>
                          <p className="text-xs text-muted-foreground">{video.authorName}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-muted-foreground flex items-center">
                              <Eye className="h-3 w-3 mr-1" />
                              {video.viewCount || 0}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center">
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              {video.likeCount || 0}
                            </span>
                          </div>
                        </div>
                        <Badge variant={video.status === "published" ? "default" : "secondary"}>{video.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              <Button onClick={() => exportData("users")} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Users
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Users ({filteredUsers.length})</CardTitle>
                <CardDescription>Manage and monitor user accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user.uid} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.photoURL || ""} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{user.name}</h4>
                            {user.isVerified && <Badge variant="secondary">✓ Verified</Badge>}
                            {user.isOnline && <Badge variant="default">Online</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                            <span>{user.videoCount || 0} videos</span>
                            <span>{user.subscriberCount || 0} subscribers</span>
                            <span>{(user.totalViews || 0).toLocaleString()} total views</span>
                            {user.location && <span>{user.location}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Joined {user.createdAt?.toDate().toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Last seen {user.lastSeen?.toDate().toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search videos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              <Button onClick={() => exportData("videos")} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Videos
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Videos ({filteredVideos.length})</CardTitle>
                <CardDescription>Monitor video content and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredVideos.map((video) => (
                    <div key={video.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex items-start space-x-4">
                        <div className="w-24 h-16 bg-muted rounded flex items-center justify-center">
                          <Video className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium line-clamp-2">{video.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">by {video.authorName}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <Eye className="h-3 w-3 mr-1" />
                              {(video.viewCount || 0).toLocaleString()} views
                            </span>
                            <span className="flex items-center">
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              {video.likeCount || 0} likes
                            </span>
                            <span className="flex items-center">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              {video.commentCount || 0} comments
                            </span>
                            <Badge variant="outline">{video.category}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={video.status === "published" ? "default" : "secondary"}>{video.status}</Badge>
                        <p className="text-xs text-muted-foreground mt-2">
                          {video.createdAt?.toDate().toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Likes</span>
                      <span className="font-medium">{analytics.totalLikes.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total Comments</span>
                      <span className="font-medium">{analytics.totalComments.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Avg. Likes per Video</span>
                      <span className="font-medium">
                        {analytics.totalVideos > 0 ? Math.round(analytics.totalLikes / analytics.totalVideos) : 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    User Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Active Users</span>
                      <span className="font-medium">{analytics.activeUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">New Users Today</span>
                      <span className="font-medium">{analytics.newUsersToday}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Activity Rate</span>
                      <span className="font-medium">
                        {analytics.totalUsers > 0
                          ? Math.round((analytics.activeUsers / analytics.totalUsers) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Content Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Videos Today</span>
                      <span className="font-medium">{analytics.newVideosToday}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Avg. Views per Video</span>
                      <span className="font-medium">
                        {analytics.totalVideos > 0 ? Math.round(analytics.totalViews / analytics.totalVideos) : 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Videos per User</span>
                      <span className="font-medium">
                        {analytics.totalUsers > 0 ? (analytics.totalVideos / analytics.totalUsers).toFixed(1) : 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Performers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Videos by Views</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {videos
                      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
                      .slice(0, 5)
                      .map((video, index) => (
                        <div key={video.id} className="flex items-center space-x-3">
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{video.title}</p>
                            <p className="text-xs text-muted-foreground">{video.authorName}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{(video.viewCount || 0).toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">views</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Creators by Subscribers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {users
                      .sort((a, b) => (b.subscriberCount || 0) - (a.subscriberCount || 0))
                      .slice(0, 5)
                      .map((user, index) => (
                        <div key={user.uid} className="flex items-center space-x-3">
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                            {index + 1}
                          </div>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.photoURL || ""} />
                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.videoCount || 0} videos</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{(user.subscriberCount || 0).toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">subscribers</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
