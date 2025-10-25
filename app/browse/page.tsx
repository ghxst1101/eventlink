import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { EventCard } from "@/components/event-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import type { EventWithDetails, Category } from "@/lib/types/database"
import Link from "next/link"

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; live?: string; search?: string }>
}) {
  const params = await searchParams
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

  // Get categories
  const { data: categories } = await supabase.from("categories").select("*").order("name")

  // Build query
  let query = supabase.from("events").select(
    `
      *,
      category:categories(*),
      organizer:profiles(*)
    `,
  )

  // Apply filters
  if (params.live === "true") {
    query = query.eq("is_live", true)
  }

  if (params.category) {
    const category = categories?.find((c: Category) => c.slug === params.category)
    if (category) {
      query = query.eq("category_id", category.id)
    }
  }

  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`)
  }

  // Get events
  const { data: events } = await query.order("start_time", { ascending: true }).limit(50)

  // Get RSVP counts
  const eventIds = (events || []).map((e) => e.id)
  const { data: rsvpCounts } = await supabase
    .from("rsvps")
    .select("event_id")
    .in("event_id", eventIds)
    .eq("status", "going")

  const rsvpCountMap = (rsvpCounts || []).reduce(
    (acc, rsvp) => {
      acc[rsvp.event_id] = (acc[rsvp.event_id] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const eventsWithDetails: EventWithDetails[] = (events || []).map((event) => ({
    ...event,
    rsvp_count: rsvpCountMap[event.id] || 0,
  }))

  const selectedCategory = categories?.find((c: Category) => c.slug === params.category)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navigation user={user} profile={profile} />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Browse Events</h1>
          <p className="text-slate-400">Discover live and upcoming events from creators around the world</p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search events..."
              className="pl-10 bg-slate-900 border-slate-800 text-white"
              defaultValue={params.search}
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/browse">
              <Badge
                variant={!params.category && params.live !== "true" ? "default" : "outline"}
                className={
                  !params.category && params.live !== "true"
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "border-slate-700 text-slate-400 hover:text-white hover:border-slate-600"
                }
              >
                All Events
              </Badge>
            </Link>
            <Link href="/browse?live=true">
              <Badge
                variant={params.live === "true" ? "default" : "outline"}
                className={
                  params.live === "true"
                    ? "bg-red-600 hover:bg-red-700"
                    : "border-slate-700 text-slate-400 hover:text-white hover:border-slate-600"
                }
              >
                Live Now
              </Badge>
            </Link>
            {categories?.map((category: Category) => (
              <Link key={category.id} href={`/browse?category=${category.slug}`}>
                <Badge
                  variant={params.category === category.slug ? "default" : "outline"}
                  className={
                    params.category === category.slug
                      ? "text-white"
                      : "border-slate-700 text-slate-400 hover:text-white hover:border-slate-600"
                  }
                  style={
                    params.category === category.slug ? { backgroundColor: category.color || "#8b5cf6" } : undefined
                  }
                >
                  {category.icon} {category.name}
                </Badge>
              </Link>
            ))}
          </div>
        </div>

        {/* Results */}
        {eventsWithDetails.length > 0 ? (
          <>
            <div className="mb-4 text-sm text-slate-400">
              {eventsWithDetails.length} event{eventsWithDetails.length !== 1 ? "s" : ""} found
              {selectedCategory && ` in ${selectedCategory.name}`}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {eventsWithDetails.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">No events found</h3>
            <p className="text-slate-400 mb-6">Try adjusting your filters or check back later</p>
            <Button asChild variant="outline" className="border-slate-700 text-white hover:bg-slate-800 bg-transparent">
              <Link href="/browse">Clear Filters</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
