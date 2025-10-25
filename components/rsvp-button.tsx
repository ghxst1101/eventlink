"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Check, Loader2, Star } from "lucide-react"

interface RSVPButtonProps {
  eventId: string
  userId?: string
  currentStatus?: "going" | "interested" | "not_going" | null
  isUpcoming: boolean
  isFull: boolean
}

export function RSVPButton({ eventId, userId, currentStatus, isUpcoming, isFull }: RSVPButtonProps) {
  const [status, setStatus] = useState(currentStatus)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleRSVP = async (newStatus: "going" | "interested") => {
    if (!userId) {
      router.push("/auth/login")
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    try {
      if (status === newStatus) {
        // Remove RSVP
        await supabase.from("rsvps").delete().eq("event_id", eventId).eq("user_id", userId)
        setStatus(null)
      } else {
        // Upsert RSVP
        await supabase.from("rsvps").upsert(
          {
            event_id: eventId,
            user_id: userId,
            status: newStatus,
          },
          {
            onConflict: "event_id,user_id",
          },
        )
        setStatus(newStatus)
      }
      router.refresh()
    } catch (error) {
      console.error("Error updating RSVP:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isUpcoming) {
    return <div className="text-center py-3 text-slate-400 text-sm">This event has ended</div>
  }

  if (isFull && status !== "going") {
    return <div className="text-center py-3 text-amber-400 text-sm">Event is at capacity</div>
  }

  return (
    <div className="flex gap-2">
      <Button
        onClick={() => handleRSVP("going")}
        disabled={isLoading}
        className={`flex-1 ${
          status === "going" ? "bg-purple-600 hover:bg-purple-700" : "bg-slate-800 hover:bg-slate-700 text-white"
        }`}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : status === "going" ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            Going
          </>
        ) : (
          "RSVP"
        )}
      </Button>
      <Button
        onClick={() => handleRSVP("interested")}
        disabled={isLoading}
        variant="outline"
        className={`${
          status === "interested"
            ? "border-purple-500 text-purple-400 bg-purple-500/10"
            : "border-slate-700 text-slate-400 hover:text-white hover:border-slate-600"
        }`}
      >
        {status === "interested" ? <Star className="h-4 w-4 fill-current" /> : <Star className="h-4 w-4" />}
      </Button>
    </div>
  )
}
