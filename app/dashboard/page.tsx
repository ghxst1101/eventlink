import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Eye, Plus } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get user's events
  const { data: myEvents } = await supabase
    .from("events")
    .select(
      `
      *,
      category:categories(*)
    `,
    )
    .eq("organizer_id", user.id)
    .order("start_time", { ascending: false })

  // Get RSVP'd events
  const { data: rsvps } = await supabase
    .from("rsvps")
    .select(
      `
      *,
      event:events(
        *,
        category:categories(*),
        organizer:profiles(*)
      )
    `,
    )
    .eq("user_id", user.id)
    .eq("status", "going")
    .order("created_at", { ascending: false })

  // Get RSVP counts for user's events
  const myEventIds = (myEvents || []).map((e) => e.id)
  const { data: rsvpCounts } = await supabase
    .from("rsvps")
    .select("event_id")
    .in("event_id", myEventIds)
    .eq("status", "going")

  const rsvpCountMap = (rsvpCounts || []).reduce(
    (acc, rsvp) => {
      acc[rsvp.event_id] = (acc[rsvp.event_id] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const totalAttendees = Object.values(rsvpCountMap).reduce((sum, count) => sum + count, 0)
  const totalViews = (myEvents || []).reduce((sum, event) => sum + (event.viewer_count || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navigation user={user} profile={profile} />

      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-purple-600 text-2xl">
                {profile?.username?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-white">{profile?.username || "User"}</h1>
              <p className="text-slate-400">{user.email}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-slate-800 bg-slate-900/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-purple-600/20">
                    <Calendar className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{myEvents?.length || 0}</p>
                    <p className="text-sm text-slate-400">Events Created</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-pink-600/20">
                    <Users className="h-6 w-6 text-pink-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{totalAttendees}</p>
                    <p className="text-sm text-slate-400">Total Attendees</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-blue-600/20">
                    <Eye className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{totalViews}</p>
                    <p className="text-sm text-slate-400">Total Views</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* My Events */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">My Events</h2>
            <Button asChild className="bg-purple-600 hover:bg-purple-700">
              <Link href="/events/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Link>
            </Button>
          </div>

          {myEvents && myEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myEvents.map((event) => (
                <Card key={event.id} className="border-slate-800 bg-slate-900/50 hover:bg-slate-900 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        {event.category && (
                          <Badge
                            className="mb-2 border-0 text-white"
                            style={{ backgroundColor: event.category.color || "#8b5cf6" }}
                          >
                            {event.category.icon} {event.category.name}
                          </Badge>
                        )}
                        <h3 className="font-semibold text-white line-clamp-2">{event.title}</h3>
                      </div>
                      {event.is_live && <Badge className="bg-red-600 text-white border-0 ml-2">LIVE</Badge>}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        <span>{rsvpCountMap[event.id] || 0} going</span>
                      </div>
                      {event.is_live && (
                        <div className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          <span>{event.viewer_count} watching</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="flex-1 border-slate-700 text-white hover:bg-slate-800 bg-transparent"
                      >
                        <Link href={`/events/${event.id}`}>View</Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="flex-1 border-slate-700 text-white hover:bg-slate-800 bg-transparent"
                      >
                        <Link href={`/dashboard/events/${event.id}/edit`}>Edit</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-slate-800 bg-slate-900/50">
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No events yet</h3>
                <p className="text-slate-400 mb-4">Create your first event to get started</p>
                <Button asChild className="bg-purple-600 hover:bg-purple-700">
                  <Link href="/events/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RSVP'd Events */}
        {rsvps && rsvps.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Events I'm Attending</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rsvps.map((rsvp: any) => (
                <Card key={rsvp.id} className="border-slate-800 bg-slate-900/50 hover:bg-slate-900 transition-colors">
                  <CardContent className="p-4">
                    {rsvp.event.category && (
                      <Badge
                        className="mb-2 border-0 text-white"
                        style={{ backgroundColor: rsvp.event.category.color || "#8b5cf6" }}
                      >
                        {rsvp.event.category.icon} {rsvp.event.category.name}
                      </Badge>
                    )}
                    <h3 className="font-semibold text-white line-clamp-2 mb-2">{rsvp.event.title}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={rsvp.event.organizer.avatar_url || undefined} />
                        <AvatarFallback className="text-xs bg-purple-600">
                          {rsvp.event.organizer.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-slate-400">{rsvp.event.organizer.username}</span>
                    </div>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full border-slate-700 text-white hover:bg-slate-800 bg-transparent"
                    >
                      <Link href={`/events/${rsvp.event.id}`}>View Event</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
