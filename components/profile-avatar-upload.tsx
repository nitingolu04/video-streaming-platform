"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Upload, X } from "lucide-react"
import { storage, auth, db } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { updateProfile } from "firebase/auth"
import { doc, updateDoc } from "firebase/firestore"
import { useAuth } from "@/hooks/useAuth"

interface ProfileAvatarUploadProps {
  currentAvatar?: string
  userName: string
  onAvatarUpdate?: (newAvatarUrl: string) => void
}

export function ProfileAvatarUpload({ currentAvatar, userName, onAvatarUpdate }: ProfileAvatarUploadProps) {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file")
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB")
        return
      }

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Upload file
      uploadAvatar(file)
    }
  }

  const uploadAvatar = async (file: File) => {
    if (!user || !storage || !auth.currentUser || !db) {
      alert("Authentication required")
      return
    }

    setUploading(true)

    try {
      // Create a reference to the file location
      const fileExtension = file.name.split(".").pop()
      const fileName = `avatars/${user.uid}.${fileExtension}`
      const storageRef = ref(storage, fileName)

      // Upload the file
      const snapshot = await uploadBytes(storageRef, file)

      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref)

      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        photoURL: downloadURL,
      })

      // Update Firestore user document
      await updateDoc(doc(db, "users", user.uid), {
        photoURL: downloadURL,
        updatedAt: new Date(),
      })

      // Call the callback if provided
      onAvatarUpdate?.(downloadURL)

      setPreviewUrl(null)
      alert("Avatar updated successfully!")
    } catch (error) {
      console.error("Error uploading avatar:", error)
      alert("Failed to upload avatar. Please try again.")
      setPreviewUrl(null)
    } finally {
      setUploading(false)
    }
  }

  const clearPreview = () => {
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={previewUrl || currentAvatar || ""} />
          <AvatarFallback className="text-2xl">{userName?.[0] || "U"}</AvatarFallback>
        </Avatar>

        {previewUrl && (
          <Button
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
            onClick={clearPreview}
          >
            <X className="h-3 w-3" />
          </Button>
        )}

        <Button
          variant="secondary"
          size="sm"
          className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </Button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="flex items-center space-x-2"
      >
        <Upload className="h-4 w-4" />
        <span>{uploading ? "Uploading..." : "Change Avatar"}</span>
      </Button>
    </div>
  )
}
