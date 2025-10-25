"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Radio, Radio as RadioOff, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface EventControlsProps {
  eventId: string
  isLive: boolean
  viewerCount: number
}

export function EventControls({ eventId, isLive, viewerCount }: EventControlsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const toggleLive = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/events/${eventId}/toggle-live`, {
        method: "POST",
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Error toggling live status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-slate-800 bg-slate-900/50">
      <CardHeader>
        <CardTitle className="text-white">Event Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">Live Status</p>
            <p className="text-xs text-slate-400">Toggle your event's live status</p>
          </div>
          {isLive ? (
            <Badge className="bg-red-600 text-white border-0">LIVE</Badge>
          ) : (
            <Badge variant="outline" className="border-slate-700 text-slate-400">
              Offline
            </Badge>
          )}
        </div>

        {isLive && (
          <div className="p-3 rounded-lg bg-slate-800 border border-slate-700">
            <p className="text-sm text-slate-300">
              <span className="font-semibold text-white">{viewerCount}</span> viewers watching
            </p>
          </div>
        )}

        <Button onClick={toggleLive} disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-700">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : isLive ? (
            <>
              <RadioOff className="mr-2 h-4 w-4" />
              End Stream
            </>
          ) : (
            <>
              <Radio className="mr-2 h-4 w-4" />
              Go Live
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
