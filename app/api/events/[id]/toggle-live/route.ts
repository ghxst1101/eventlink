import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get event and verify ownership
  const { data: event } = await supabase.from("events").select("*").eq("id", id).eq("organizer_id", user.id).single()

  if (!event) {
    return NextResponse.json({ error: "Event not found or unauthorized" }, { status: 404 })
  }

  // Toggle live status
  const { data: updatedEvent, error } = await supabase
    .from("events")
    .update({
      is_live: !event.is_live,
      viewer_count: !event.is_live ? 0 : event.viewer_count,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(updatedEvent)
}
