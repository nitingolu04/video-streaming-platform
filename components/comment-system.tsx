"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { ThumbsUp, ThumbsDown, Reply, Send, MessageCircle } from "lucide-react"
import { useVideos } from "@/hooks/useVideos"
import { useAuth } from "@/hooks/useAuth"

interface Comment {
  id: string
  author: string
  avatar: string
  content: string
  timestamp: string
  likes: number
  dislikes: number
  replies: Comment[]
  isLiked?: boolean
  isDisliked?: boolean
}

interface CommentSystemProps {
  videoId: string
  initialComments?: Comment[]
}

export function CommentSystem({ videoId, initialComments = [] }: CommentSystemProps) {
  const { user } = useAuth()
  const { addComment, getComments } = useVideos()
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Load comments from the videos context
    const videoComments = getComments(videoId)
    setComments(videoComments)
  }, [videoId])

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return

    try {
      setLoading(true)
      await addComment(videoId, newComment)
      setNewComment("")

      // Refresh comments
      const updatedComments = getComments(videoId)
      setComments(updatedComments)
    } catch (error) {
      console.error("Error adding comment:", error)
      alert("Failed to add comment. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleAddReply = async (parentId: string) => {
    if (!replyText.trim() || !user) return

    try {
      setLoading(true)
      await addComment(videoId, replyText, parentId)
      setReplyText("")
      setReplyingTo(null)

      // Refresh comments
      const updatedComments = getComments(videoId)
      setComments(updatedComments)
    } catch (error) {
      console.error("Error adding reply:", error)
      alert("Failed to add reply. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleLike = (commentId: string, isReply = false, parentId?: string) => {
    if (isReply && parentId) {
      setComments(
        comments.map((comment) =>
          comment.id === parentId
            ? {
                ...comment,
                replies: comment.replies.map((reply) =>
                  reply.id === commentId
                    ? {
                        ...reply,
                        likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                        dislikes: reply.isDisliked ? reply.dislikes - 1 : reply.dislikes,
                        isLiked: !reply.isLiked,
                        isDisliked: false,
                      }
                    : reply,
                ),
              }
            : comment,
        ),
      )
    } else {
      setComments(
        comments.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
                dislikes: comment.isDisliked ? comment.dislikes - 1 : comment.dislikes,
                isLiked: !comment.isLiked,
                isDisliked: false,
              }
            : comment,
        ),
      )
    }
  }

  const handleDislike = (commentId: string, isReply = false, parentId?: string) => {
    if (isReply && parentId) {
      setComments(
        comments.map((comment) =>
          comment.id === parentId
            ? {
                ...comment,
                replies: comment.replies.map((reply) =>
                  reply.id === commentId
                    ? {
                        ...reply,
                        dislikes: reply.isDisliked ? reply.dislikes - 1 : reply.dislikes + 1,
                        likes: reply.isLiked ? reply.likes - 1 : reply.likes,
                        isDisliked: !reply.isDisliked,
                        isLiked: false,
                      }
                    : reply,
                ),
              }
            : comment,
        ),
      )
    } else {
      setComments(
        comments.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                dislikes: comment.isDisliked ? comment.dislikes - 1 : comment.dislikes + 1,
                likes: comment.isLiked ? comment.likes - 1 : comment.likes,
                isDisliked: !comment.isDisliked,
                isLiked: false,
              }
            : comment,
        ),
      )
    }
  }

  const formatTimestamp = (timestamp: string | any) => {
    try {
      if (timestamp?.toDate) {
        return timestamp.toDate().toLocaleDateString()
      }
      return new Date(timestamp).toLocaleDateString()
    } catch {
      return "Recently"
    }
  }

  const CommentItem = ({
    comment,
    isReply = false,
    parentId,
  }: { comment: Comment; isReply?: boolean; parentId?: string }) => (
    <div className={`${isReply ? "ml-12 mt-4" : ""}`}>
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex space-x-3">
            <Avatar className="h-10 w-10 ring-2 ring-purple-100">
              <AvatarImage src={comment.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                {comment.author[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-semibold text-gray-800">{comment.author}</span>
                <span className="text-xs text-gray-500">{formatTimestamp(comment.timestamp)}</span>
              </div>
              <p className="text-gray-700 mb-3">{comment.content}</p>
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(comment.id, isReply, parentId)}
                  className={`h-8 px-3 ${
                    comment.isLiked
                      ? "text-purple-600 bg-purple-50 hover:bg-purple-100"
                      : "text-gray-500 hover:text-purple-600 hover:bg-purple-50"
                  }`}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  <span className="text-xs">{comment.likes}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDislike(comment.id, isReply, parentId)}
                  className={`h-8 px-3 ${
                    comment.isDisliked
                      ? "text-red-600 bg-red-50 hover:bg-red-100"
                      : "text-gray-500 hover:text-red-600 hover:bg-red-50"
                  }`}
                >
                  <ThumbsDown className="h-4 w-4 mr-1" />
                  <span className="text-xs">{comment.dislikes}</span>
                </Button>
                {!isReply && user && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    className="h-8 px-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                  >
                    <Reply className="h-4 w-4 mr-1" />
                    <span className="text-xs">Reply</span>
                  </Button>
                )}
              </div>

              {replyingTo === comment.id && user && (
                <div className="mt-4 space-y-3">
                  <Textarea
                    placeholder="Write a reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="min-h-[80px] border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                  />
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleAddReply(comment.id)}
                      size="sm"
                      disabled={!replyText.trim() || loading}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                    >
                      <Send className="h-4 w-4 mr-1" />
                      {loading ? "Replying..." : "Reply"}
                    </Button>
                    <Button
                      onClick={() => {
                        setReplyingTo(null)
                        setReplyText("")
                      }}
                      variant="outline"
                      size="sm"
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} isReply={true} parentId={comment.id} />
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <MessageCircle className="h-5 w-5 text-purple-600" />
        <h3 className="font-semibold text-lg text-gray-800">{comments.length} Comments</h3>
      </div>

      {/* Add Comment */}
      {user ? (
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardContent className="p-4">
            <div className="flex space-x-3">
              <Avatar className="h-10 w-10 ring-2 ring-purple-100">
                <AvatarImage src={user.photoURL || "/placeholder.svg"} />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                  {user.displayName?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[100px] border-purple-200 focus:border-purple-400 focus:ring-purple-400 bg-white/90"
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNewComment("")}
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddComment}
                    size="sm"
                    disabled={!newComment.trim() || loading}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  >
                    <Send className="h-4 w-4 mr-1" />
                    {loading ? "Commenting..." : "Comment"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">Please log in to add comments</p>
            <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
              Sign In
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length > 0 ? (
          comments.map((comment) => <CommentItem key={comment.id} comment={comment} />)
        ) : (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  )
}
