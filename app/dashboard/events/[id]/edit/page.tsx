import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { EventForm } from "@/components/event-form"
import { EventControls } from "@/components/event-controls"
import { redirect, notFound } from "next/navigation"

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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

  // Get event
  const { data: event } = await supabase.from("events").select("*").eq("id", id).eq("organizer_id", user.id).single()

  if (!event) {
    notFound()
  }

  // Get categories
  const { data: categories } = await supabase.from("categories").select("*").order("name")

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navigation user={user} profile={profile} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Edit Event</h1>
              <p className="text-slate-400">Update your event details</p>
            </div>

            <EventForm categories={categories || []} userId={user.id} event={event} />
          </div>

          <div>
            <EventControls eventId={event.id} isLive={event.is_live} viewerCount={event.viewer_count} />
          </div>
        </div>
      </div>
    </div>
  )
}
