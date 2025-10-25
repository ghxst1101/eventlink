"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Gamepad2, Play, Plus } from "lucide-react"
import Link from "next/link"
import type { GameSession } from "@/lib/types/database"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EventGamesListProps {
  eventId: string
  gameSessions: GameSession[]
  isOrganizer: boolean
  isModerator: boolean
  userId?: string
}

const AVAILABLE_GAMES = [
  { id: "trivia", name: "Trivia", icon: "🧠", description: "Test your knowledge" },
  { id: "drawing", name: "Drawing Game", icon: "🎨", description: "Draw and guess" },
  { id: "poll", name: "Live Poll", icon: "📊", description: "Vote on questions" },
  { id: "word-scramble", name: "Word Scramble", icon: "🔤", description: "Unscramble words" },
  { id: "reaction-time", name: "Reaction Time", icon: "⚡", description: "Test your reflexes" },
  { id: "charades", name: "Charades", icon: "🎭", description: "Act it out" },
  { id: "two-truths", name: "Two Truths & A Lie", icon: "🤔", description: "Guess the lie" },
  { id: "emoji-story", name: "Emoji Story", icon: "😀", description: "Tell stories with emojis" },
]

export function EventGamesList({ eventId, gameSessions, isOrganizer, isModerator, userId }: EventGamesListProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [selectedGame, setSelectedGame] = useState("")
  const [maxRounds, setMaxRounds] = useState("5")

  const createGameSession = async () => {
    if (!selectedGame) return

    try {
      const response = await fetch("/api/games/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          gameType: selectedGame,
          maxRounds: Number.parseInt(maxRounds),
        }),
      })

      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error("Failed to create game:", error)
    }
  }

  return (
    <div className="space-y-4">
      {/* Active Games */}
      {gameSessions.length > 0 ? (
        <div className="grid gap-3">
          {gameSessions.map((session) => {
            const gameInfo = AVAILABLE_GAMES.find((g) => g.id === session.game_type)
            return (
              <Card key={session.id} className="border-slate-700 bg-slate-800/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{gameInfo?.icon || "🎮"}</div>
                      <div>
                        <h4 className="font-semibold text-white">{gameInfo?.name || session.game_type}</h4>
                        <p className="text-xs text-slate-400">
                          Round {session.current_round} of {session.max_rounds}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          session.status === "active"
                            ? "bg-green-600 text-white"
                            : session.status === "waiting"
                              ? "bg-yellow-600 text-white"
                              : "bg-slate-600 text-white"
                        }
                      >
                        {session.status}
                      </Badge>
                      <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <Link href={`/games/${session.game_type}/${session.id}`}>
                          <Play className="h-4 w-4 mr-1" />
                          {session.status === "waiting" ? "Join" : "Play"}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <Gamepad2 className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No active games yet</p>
        </div>
      )}

      {/* Create Game Button (for organizer/moderator) */}
      {(isOrganizer || isModerator) && (
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="w-full bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Create New Game
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Game</DialogTitle>
              <DialogDescription className="text-slate-400">
                Choose a game type and configure settings
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="game-type" className="text-white">
                  Game Type
                </Label>
                <Select value={selectedGame} onValueChange={setSelectedGame}>
                  <SelectTrigger id="game-type" className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Select a game" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {AVAILABLE_GAMES.map((game) => (
                      <SelectItem key={game.id} value={game.id} className="text-white">
                        {game.icon} {game.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-rounds" className="text-white">
                  Number of Rounds
                </Label>
                <Input
                  id="max-rounds"
                  type="number"
                  min="1"
                  max="20"
                  value={maxRounds}
                  onChange={(e) => setMaxRounds(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <Button
                onClick={createGameSession}
                disabled={!selectedGame}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Create Game
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Available Games Preview */}
      {!isOrganizer && !isModerator && gameSessions.length === 0 && (
        <div className="grid grid-cols-2 gap-2">
          {AVAILABLE_GAMES.slice(0, 4).map((game) => (
            <div key={game.id} className="p-3 rounded-lg bg-slate-800/30 border border-slate-700">
              <div className="text-2xl mb-1">{game.icon}</div>
              <p className="text-xs font-medium text-white">{game.name}</p>
              <p className="text-xs text-slate-500">{game.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
