import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { EventCard } from "@/components/event-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowRight, Calendar, Sparkles, Users, Zap, Plus } from "lucide-react"
import type { EventWithDetails, Category } from "@/lib/types/database"

export default async function HomePage() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user profile if logged in
  let profile = null
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    profile = data
  }

  // Get live events
  const { data: liveEvents } = await supabase
    .from("events")
    .select(
      `
      *,
      category:categories(*),
      organizer:profiles(*)
    `,
    )
    .eq("is_live", true)
    .order("viewer_count", { ascending: false })
    .limit(6)

  // Get upcoming events
  const { data: upcomingEvents } = await supabase
    .from("events")
    .select(
      `
      *,
      category:categories(*),
      organizer:profiles(*)
    `,
    )
    .gte("start_time", new Date().toISOString())
    .eq("is_live", false)
    .order("start_time", { ascending: true })
    .limit(8)

  // Get categories
  const { data: categories } = await supabase.from("categories").select("*").order("name")

  // Get RSVP counts for events
  const allEventIds = [...(liveEvents || []), ...(upcomingEvents || [])].map((e) => e.id)
  const { data: rsvpCounts } = await supabase
    .from("rsvps")
    .select("event_id")
    .in("event_id", allEventIds)
    .eq("status", "going")

  // Map RSVP counts to events
  const rsvpCountMap = (rsvpCounts || []).reduce(
    (acc, rsvp) => {
      acc[rsvp.event_id] = (acc[rsvp.event_id] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const liveEventsWithDetails: EventWithDetails[] = (liveEvents || []).map((event) => ({
    ...event,
    rsvp_count: rsvpCountMap[event.id] || 0,
  }))

  const upcomingEventsWithDetails: EventWithDetails[] = (upcomingEvents || []).map((event) => ({
    ...event,
    rsvp_count: rsvpCountMap[event.id] || 0,
  }))

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navigation user={user} profile={profile} />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-pink-600/20" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30">
              <Sparkles className="h-3 w-3 mr-1" />
              Connect Through Live Events
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-white text-balance">
              Discover Events That Bring Communities Together
            </h1>
            <p className="text-xl text-slate-400 text-balance">
              Join live streams, gaming tournaments, music shows, and more. Connect with your favorite creators and
              communities in real-time.
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
                <Link href="/browse">
                  Browse Events
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              {!user && (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-slate-700 text-white hover:bg-slate-800 bg-transparent"
                >
                  <Link href="/auth/login">Sign In with Discord</Link>
                </Button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mt-16">
            <div className="text-center p-6 rounded-lg bg-slate-900/50 border border-slate-800">
              <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">10K+</div>
              <div className="text-sm text-slate-400">Active Users</div>
            </div>
            <div className="text-center p-6 rounded-lg bg-slate-900/50 border border-slate-800">
              <Calendar className="h-8 w-8 text-pink-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">500+</div>
              <div className="text-sm text-slate-400">Events Monthly</div>
            </div>
            <div className="text-center p-6 rounded-lg bg-slate-900/50 border border-slate-800">
              <Zap className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-sm text-slate-400">Live Content</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-white mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.map((category: Category) => (
              <Link
                key={category.id}
                href={`/browse?category=${category.slug}`}
                className="group p-4 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-purple-500/50 transition-all text-center"
              >
                <div className="text-3xl mb-2">{category.icon}</div>
                <div className="text-sm font-medium text-white group-hover:text-purple-400 transition-colors">
                  {category.name}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Live Now */}
      {liveEventsWithDetails.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white">Live Now</h2>
              <Badge className="bg-red-600 text-white border-0 animate-pulse">
                <span className="relative flex h-2 w-2 mr-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                {liveEventsWithDetails.length} LIVE
              </Badge>
            </div>
            <Button asChild variant="ghost" className="text-purple-400 hover:text-purple-300">
              <Link href="/browse?live=true">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveEventsWithDetails.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      {upcomingEventsWithDetails.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Upcoming Events</h2>
            <Button asChild variant="ghost" className="text-purple-400 hover:text-purple-300">
              <Link href="/browse">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {upcomingEventsWithDetails.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-6 p-12 rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-balance">Ready to Host Your Own Event?</h2>
          <p className="text-lg text-slate-300 text-balance">
            Create engaging live experiences for your community. Stream, interact, and grow your audience.
          </p>
          <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
            <Link href={user ? "/events/create" : "/auth/login"}>
              <Plus className="mr-2 h-5 w-5" />
              Create Your First Event
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
