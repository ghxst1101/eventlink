import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { EventForm } from "@/components/event-form"
import { redirect } from "next/navigation"

export default async function CreateEventPage() {
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

  // Get categories
  const { data: categories } = await supabase.from("categories").select("*").order("name")

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navigation user={user} profile={profile} />

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create New Event</h1>
          <p className="text-slate-400">Fill in the details to create your event</p>
        </div>

        <EventForm categories={categories || []} userId={user.id} />
      </div>
    </div>
  )
}
