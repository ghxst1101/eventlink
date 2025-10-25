import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, Users, ExternalLink, MessageCircle, Gamepad2 } from "lucide-react"
import { format } from "date-fns"
import { notFound } from "next/navigation"
import { RSVPButton } from "@/components/rsvp-button"
import { LiveChat } from "@/components/live-chat"
import { QRCodeDisplay } from "@/components/qr-code-display"
import { EventGamesList } from "@/components/event-games-list"
import { ModeratorManager } from "@/components/moderator-manager"
import Link from "next/link"

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    profile = data
  }

  const { data: event } = await supabase
    .from("events")
    .select(
      `
      *,
      category:categories(*),
      organizer:profiles(*)
    `,
    )
    .eq("id", id)
    .single()

  if (!event) {
    notFound()
  }

  const isOrganizer = user?.id === event.organizer_id
  let isModerator = false
  if (user && !isOrganizer) {
    const { data: modData } = await supabase
      .from("moderators")
      .select("*")
      .eq("event_id", id)
      .eq("user_id", user.id)
      .single()
    isModerator = !!modData
  }

  const { count: rsvpCount } = await supabase
    .from("rsvps")
    .select("*", { count: "exact", head: true })
    .eq("event_id", id)
    .eq("status", "going")

  let userRsvp = null
  if (user) {
    const { data } = await supabase.from("rsvps").select("*").eq("event_id", id).eq("user_id", user.id).single()
    userRsvp = data
  }

  const { data: attendees } = await supabase
    .from("rsvps")
    .select("user:profiles(*)")
    .eq("event_id", id)
    .eq("status", "going")
    .limit(12)

  const { data: gameSessions } = await supabase
    .from("game_sessions")
    .select("*")
    .eq("event_id", id)
    .in("status", ["waiting", "active"])
    .order("created_at", { ascending: false })

  const startTime = new Date(event.start_time)
  const endTime = new Date(event.end_time)
  const isUpcoming = startTime > new Date()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navigation user={user} profile={profile} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player / Banner */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
              {event.is_live && event.stream_url ? (
                <iframe
                  src={event.stream_url}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : event.custom_game_embed ? (
                <iframe
                  src={event.custom_game_embed}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src={
                      event.banner_url ||
                      `/placeholder.svg?height=720&width=1280&query=${encodeURIComponent(event.title) || "/placeholder.svg"}`
                    }
                    alt={event.title}
                    className="object-cover w-full h-full"
                  />
                  {event.is_live && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-red-600 text-white border-0 animate-pulse text-base px-3 py-1">
                        <span className="relative flex h-2.5 w-2.5 mr-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                        </span>
                        LIVE
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Event Info */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {event.category && (
                      <Badge
                        className="border-0 text-white"
                        style={{ backgroundColor: event.category.color || "#8b5cf6" }}
                      >
                        {event.category.icon} {event.category.name}
                      </Badge>
                    )}
                    {event.is_live && (
                      <Badge className="bg-red-600 text-white border-0">
                        <Users className="h-3 w-3 mr-1" />
                        {event.viewer_count} watching
                      </Badge>
                    )}
                    {event.visibility === "private" && (
                      <Badge variant="outline" className="border-yellow-600 text-yellow-600">
                        Private
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{event.title}</h1>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={event.organizer.avatar_url || undefined} />
                      <AvatarFallback className="bg-purple-600 text-sm">
                        {event.organizer.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-white">{event.organizer.username}</p>
                      <p className="text-xs text-slate-400">Organizer</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-800" />

              <div>
                <h2 className="text-xl font-semibold text-white mb-3">About This Event</h2>
                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{event.description}</p>
              </div>

              {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline" className="border-slate-700 text-slate-400">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {(gameSessions && gameSessions.length > 0) || isOrganizer || isModerator ? (
              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Gamepad2 className="h-5 w-5 text-purple-400" />
                    Interactive Games
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <EventGamesList
                    eventId={event.id}
                    gameSessions={gameSessions || []}
                    isOrganizer={isOrganizer}
                    isModerator={isModerator}
                    userId={user?.id}
                  />
                </CardContent>
              </Card>
            ) : null}

            {isOrganizer && (
              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="text-white">Moderator Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <ModeratorManager eventId={event.id} organizerId={event.organizer_id} />
                </CardContent>
              </Card>
            )}

            {/* Live Chat */}
            {(event.is_live || isOrganizer || isModerator) && (user || event.allow_spectators) && (
              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <MessageCircle className="h-5 w-5" />
                    Live Chat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {user ? (
                    <LiveChat
                      eventId={event.id}
                      userId={user.id}
                      username={profile?.username || "Anonymous"}
                      isModerator={isOrganizer || isModerator}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-slate-400 mb-4">Sign in to join the chat</p>
                      <Link
                        href="/auth/login"
                        className="inline-flex items-center px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors"
                      >
                        Sign In
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {event.join_code && (event.visibility === "public" || isOrganizer || isModerator || userRsvp) && (
              <QRCodeDisplay eventId={event.id} joinCode={event.join_code} eventTitle={event.title} />
            )}

            {/* RSVP Card */}
            <Card className="border-slate-800 bg-slate-900/50">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-purple-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-400">Date</p>
                      <p className="text-white font-medium">{format(startTime, "EEEE, MMMM d, yyyy")}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-purple-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-400">Time</p>
                      <p className="text-white font-medium">
                        {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-purple-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-400">Attendees</p>
                      <p className="text-white font-medium">
                        {rsvpCount || 0} going
                        {event.max_attendees && ` / ${event.max_attendees} max`}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="bg-slate-800" />

                {user ? (
                  <RSVPButton
                    eventId={event.id}
                    userId={user.id}
                    currentStatus={userRsvp?.status}
                    isUpcoming={isUpcoming}
                    isFull={event.max_attendees ? (rsvpCount || 0) >= event.max_attendees : false}
                  />
                ) : event.allow_spectators ? (
                  <div className="text-center py-2">
                    <p className="text-sm text-slate-400 mb-3">You're spectating this event</p>
                    <Link
                      href="/auth/login"
                      className="inline-flex items-center justify-center w-full px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors"
                    >
                      Sign In to Join
                    </Link>
                  </div>
                ) : (
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center justify-center w-full px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors"
                  >
                    Sign In to RSVP
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Discord Link */}
            {event.discord_invite_url && (
              <Card className="border-slate-800 bg-slate-900/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-[#5865F2]/20">
                      <svg className="h-6 w-6 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Join Discord</h3>
                      <p className="text-xs text-slate-400">Connect with the community</p>
                    </div>
                  </div>
                  <Link
                    href={event.discord_invite_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-medium transition-colors"
                  >
                    Join Server
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Attendees */}
            {attendees && attendees.length > 0 && (
              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="text-white">Attendees ({rsvpCount})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-3">
                    {attendees.map((attendee: any) => (
                      <div key={attendee.user.id} className="flex flex-col items-center gap-1">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={attendee.user.avatar_url || undefined} />
                          <AvatarFallback className="bg-purple-600 text-xs">
                            {attendee.user.username[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-xs text-slate-400 truncate w-full text-center">{attendee.user.username}</p>
                      </div>
                    ))}
                  </div>
                  {(rsvpCount || 0) > 12 && (
                    <p className="text-xs text-slate-500 text-center mt-3">+{(rsvpCount || 0) - 12} more attending</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
