import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { eventId, gameType, maxRounds } = body

    // Verify user is organizer or moderator
    const { data: event } = await supabase.from("events").select("organizer_id").eq("id", eventId).single()

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    const isOrganizer = event.organizer_id === user.id

    if (!isOrganizer) {
      const { data: modData } = await supabase
        .from("moderators")
        .select("*")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .single()

      if (!modData) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
    }

    // Generate unique join code for the game session
    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    // Create game session
    const { data: session, error } = await supabase
      .from("game_sessions")
      .insert({
        event_id: eventId,
        game_type: gameType,
        status: "waiting",
        current_round: 1,
        max_rounds: maxRounds || 5,
        settings: { join_code: joinCode },
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating game session:", error)
      return NextResponse.json({ error: "Failed to create game" }, { status: 500 })
    }

    return NextResponse.json({ session })
  } catch (error) {
    console.error("Error in game creation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
