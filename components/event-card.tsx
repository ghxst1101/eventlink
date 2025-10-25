import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Users } from "lucide-react"
import type { EventWithDetails } from "@/lib/types/database"
import { formatDistanceToNow } from "date-fns"

interface EventCardProps {
  event: EventWithDetails
}

export function EventCard({ event }: EventCardProps) {
  const startTime = new Date(event.start_time)
  const isUpcoming = startTime > new Date()
  const timeText = isUpcoming
    ? `Starts ${formatDistanceToNow(startTime, { addSuffix: true })}`
    : event.is_live
      ? "Live Now"
      : "Ended"

  return (
    <Link href={`/events/${event.id}`}>
      <Card className="group overflow-hidden border-slate-800 bg-slate-900/50 hover:bg-slate-900 transition-all hover:border-purple-500/50">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={event.banner_url || `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(event.title)}`}
            alt={event.title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
          {event.is_live && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-red-600 text-white border-0 animate-pulse">
                <span className="relative flex h-2 w-2 mr-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                LIVE
              </Badge>
            </div>
          )}
          {event.category && (
            <div className="absolute top-3 right-3">
              <Badge className="border-0 text-white" style={{ backgroundColor: event.category.color || "#8b5cf6" }}>
                {event.category.icon} {event.category.name}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-white line-clamp-1 group-hover:text-purple-400 transition-colors">
              {event.title}
            </h3>
            <p className="text-sm text-slate-400 line-clamp-2 mt-1">{event.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={event.organizer.avatar_url || undefined} />
              <AvatarFallback className="text-xs bg-purple-600">
                {event.organizer.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-slate-400">{event.organizer.username}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{timeText}</span>
              </div>
              {event.rsvp_count > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  <span>{event.rsvp_count} going</span>
                </div>
              )}
            </div>
            {event.is_live && event.viewer_count > 0 && (
              <div className="flex items-center gap-1 text-red-400">
                <Users className="h-3.5 w-3.5" />
                <span>{event.viewer_count} watching</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
