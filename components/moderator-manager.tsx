"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Shield, X, Plus, Search } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface ModeratorManagerProps {
  eventId: string
  organizerId: string
}

interface Moderator {
  id: string
  user_id: string
  permissions: string[]
  user: {
    username: string
    avatar_url: string | null
  }
}

export function ModeratorManager({ eventId, organizerId }: ModeratorManagerProps) {
  const [moderators, setModerators] = useState<Moderator[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadModerators()
  }, [eventId])

  const loadModerators = async () => {
    const { data } = await supabase
      .from("moderators")
      .select(
        `
        *,
        user:profiles(username, avatar_url)
      `,
      )
      .eq("event_id", eventId)

    if (data) {
      setModerators(data as any)
    }
  }

  const searchUsers = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    const { data } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .ilike("username", `%${searchQuery}%`)
      .limit(5)

    if (data) {
      // Filter out organizer and existing moderators
      const filtered = data.filter(
        (user) => user.id !== organizerId && !moderators.some((mod) => mod.user_id === user.id),
      )
      setSearchResults(filtered)
    }
    setIsSearching(false)
  }

  const addModerator = async (userId: string) => {
    const { error } = await supabase.from("moderators").insert({
      event_id: eventId,
      user_id: userId,
      permissions: ["manage_chat", "kick_users", "manage_games"],
    })

    if (!error) {
      setSearchQuery("")
      setSearchResults([])
      loadModerators()
    }
  }

  const removeModerator = async (moderatorId: string) => {
    const { error } = await supabase.from("moderators").delete().eq("id", moderatorId)

    if (!error) {
      loadModerators()
    }
  }

  return (
    <div className="space-y-4">
      {/* Current Moderators */}
      {moderators.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-white flex items-center gap-2">
            <Shield className="h-4 w-4 text-purple-400" />
            Current Moderators ({moderators.length})
          </h4>
          <div className="space-y-2">
            {moderators.map((mod) => (
              <div key={mod.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={mod.user.avatar_url || undefined} />
                    <AvatarFallback className="bg-purple-600 text-xs">
                      {mod.user.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-white">{mod.user.username}</p>
                    <div className="flex gap-1 mt-1">
                      {mod.permissions.map((perm) => (
                        <Badge key={perm} variant="outline" className="text-xs border-slate-600 text-slate-400">
                          {perm.replace("_", " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeModerator(mod.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-950/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Moderator */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-white">Add Moderator</h4>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search users by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchUsers()}
              className="pl-9 bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <Button onClick={searchUsers} disabled={isSearching} className="bg-purple-600 hover:bg-purple-700">
            Search
          </Button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-2 mt-2">
            {searchResults.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback className="bg-purple-600 text-xs">{user.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <p className="text-sm text-white">{user.username}</p>
                </div>
                <Button size="sm" onClick={() => addModerator(user.id)} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
