"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import type { Category } from "@/lib/types/database"

interface EventFormProps {
  categories: Category[]
  userId: string
  event?: any
}

export function EventForm({ categories, userId, event }: EventFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: event?.title || "",
    description: event?.description || "",
    category_id: event?.category_id || "",
    start_time: event?.start_time ? new Date(event.start_time).toISOString().slice(0, 16) : "",
    end_time: event?.end_time ? new Date(event.end_time).toISOString().slice(0, 16) : "",
    banner_url: event?.banner_url || "",
    stream_url: event?.stream_url || "",
    discord_invite_url: event?.discord_invite_url || "",
    max_attendees: event?.max_attendees || "",
    tags: event?.tags?.join(", ") || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        category_id: formData.category_id || null,
        organizer_id: userId,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
        banner_url: formData.banner_url || null,
        stream_url: formData.stream_url || null,
        discord_invite_url: formData.discord_invite_url || null,
        max_attendees: formData.max_attendees ? Number.parseInt(formData.max_attendees) : null,
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : null,
      }

      if (event) {
        // Update existing event
        const { error: updateError } = await supabase.from("events").update(eventData).eq("id", event.id)

        if (updateError) throw updateError

        router.push(`/events/${event.id}`)
      } else {
        // Create new event
        const { data, error: insertError } = await supabase.from("events").insert(eventData).select().single()

        if (insertError) throw insertError

        router.push(`/events/${data.id}`)
      }

      router.refresh()
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-slate-800 bg-slate-900/50">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">
              Event Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Amazing Gaming Tournament"
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">
              Description *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell people what your event is about..."
              className="bg-slate-800 border-slate-700 text-white min-h-32"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-white">
                Category
              </Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id} className="text-white">
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_attendees" className="text-white">
                Max Attendees
              </Label>
              <Input
                id="max_attendees"
                type="number"
                value={formData.max_attendees}
                onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value })}
                placeholder="Leave empty for unlimited"
                className="bg-slate-800 border-slate-700 text-white"
                min="1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="start_time" className="text-white">
                Start Time *
              </Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time" className="text-white">
                End Time *
              </Label>
              <Input
                id="end_time"
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="banner_url" className="text-white">
              Banner Image URL
            </Label>
            <Input
              id="banner_url"
              type="url"
              value={formData.banner_url}
              onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
              placeholder="https://example.com/banner.jpg"
              className="bg-slate-800 border-slate-700 text-white"
            />
            <p className="text-xs text-slate-500">Recommended size: 1280x720px</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stream_url" className="text-white">
              Stream Embed URL
            </Label>
            <Input
              id="stream_url"
              type="url"
              value={formData.stream_url}
              onChange={(e) => setFormData({ ...formData, stream_url: e.target.value })}
              placeholder="https://www.youtube.com/embed/..."
              className="bg-slate-800 border-slate-700 text-white"
            />
            <p className="text-xs text-slate-500">YouTube, Twitch, or other embeddable stream URL</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="discord_invite_url" className="text-white">
              Discord Invite Link
            </Label>
            <Input
              id="discord_invite_url"
              type="url"
              value={formData.discord_invite_url}
              onChange={(e) => setFormData({ ...formData, discord_invite_url: e.target.value })}
              placeholder="https://discord.gg/..."
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags" className="text-white">
              Tags
            </Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="gaming, tournament, competitive (comma separated)"
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1 bg-purple-600 hover:bg-purple-700">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {event ? "Updating..." : "Creating..."}
                </>
              ) : event ? (
                "Update Event"
              ) : (
                "Create Event"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="border-slate-700 text-white hover:bg-slate-800"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
