import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function JoinEventPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const supabase = await createClient()

  // Find event by join code
  const { data: event } = await supabase
    .from("events")
    .select(
      `
      *,
      category:categories(*),
      organizer:profiles(*)
    `,
    )
    .eq("join_code", code.toUpperCase())
    .single()

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white text-center">Event Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-slate-400">The join code "{code}" is invalid or the event has ended.</p>
            <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
              <Link href="/">Browse Events</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If event requires auth and user is not logged in, redirect to login
  if (event.require_auth_to_join && !user) {
    redirect(`/auth/login?redirect=/join/${code}`)
  }

  // Redirect to event page
  redirect(`/events/${event.id}`)
}
