"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

interface ProfileSettingsFormProps {
  onSave: (data: any) => Promise<void>
  initialData: any
}

export function ProfileSettingsForm({ onSave, initialData }: ProfileSettingsFormProps) {
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    bio: initialData.bio || "",
    location: initialData.location || "",
    website: initialData.website || "",
    twitter: initialData.twitter || "",
    youtube: initialData.youtube || "",
    isPublic: initialData.isPublic ?? true,
    allowComments: initialData.allowComments ?? true,
    emailNotifications: initialData.emailNotifications ?? true,
    ...initialData,
  })
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSwitchChange = (name: string, value: boolean) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSave(formData)
    } catch (error) {
      console.error("Error saving profile:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Update your basic profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Display Name *</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleInputChange} maxLength={50} required />
            <p className="text-xs text-muted-foreground mt-1">{formData.name.length}/50 characters</p>
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Tell us about yourself..."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">{formData.bio.length}/500 characters</p>
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Your location"
              maxLength={100}
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle>Social Links</CardTitle>
          <CardDescription>Add your social media profiles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              type="url"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div>
            <Label htmlFor="twitter">Twitter</Label>
            <Input
              id="twitter"
              name="twitter"
              value={formData.twitter}
              onChange={handleInputChange}
              placeholder="@yourusername"
            />
          </div>

          <div>
            <Label htmlFor="youtube">YouTube</Label>
            <Input
              id="youtube"
              name="youtube"
              value={formData.youtube}
              onChange={handleInputChange}
              placeholder="Your YouTube channel URL"
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
          <CardDescription>Control who can see your profile and content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="isPublic">Public Profile</Label>
              <p className="text-sm text-muted-foreground">Allow others to find and view your profile</p>
            </div>
            <Switch
              id="isPublic"
              checked={formData.isPublic}
              onCheckedChange={(value) => handleSwitchChange("isPublic", value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="allowComments">Allow Comments</Label>
              <p className="text-sm text-muted-foreground">Let others comment on your videos</p>
            </div>
            <Switch
              id="allowComments"
              checked={formData.allowComments}
              onCheckedChange={(value) => handleSwitchChange("allowComments", value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive email notifications for activity</p>
            </div>
            <Switch
              id="emailNotifications"
              checked={formData.emailNotifications}
              onCheckedChange={(value) => handleSwitchChange("emailNotifications", value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
