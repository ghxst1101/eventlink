"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"

interface LiveIndicatorProps {
  eventId: string
  initialIsLive: boolean
  initialViewerCount: number
}

export function LiveIndicator({ eventId, initialIsLive, initialViewerCount }: LiveIndicatorProps) {
  const [isLive, setIsLive] = useState(initialIsLive)
  const [viewerCount, setViewerCount] = useState(initialViewerCount)

  useEffect(() => {
    const supabase = createClient()

    // Subscribe to event updates
    const channel = supabase
      .channel(`event:${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "events",
          filter: `id=eq.${eventId}`,
        },
        (payload) => {
          setIsLive(payload.new.is_live)
          setViewerCount(payload.new.viewer_count)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventId])

  if (!isLive) return null

  return (
    <div className="flex items-center gap-2">
      <Badge className="bg-red-600 text-white border-0 animate-pulse">
        <span className="relative flex h-2 w-2 mr-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
        LIVE
      </Badge>
      {viewerCount > 0 && (
        <Badge variant="outline" className="border-slate-700 text-slate-400">
          <Users className="h-3 w-3 mr-1" />
          {viewerCount} watching
        </Badge>
      )}
    </div>
  )
}
