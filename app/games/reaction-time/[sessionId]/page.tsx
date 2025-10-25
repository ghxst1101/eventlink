"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap, Trophy, Clock } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

export default function ReactionTimePage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string

  const [gameState, setGameState] = useState<"waiting" | "ready" | "go" | "clicked" | "finished">("waiting")
  const [round, setRound] = useState(1)
  const [reactionTimes, setReactionTimes] = useState<number[]>([])
  const [startTime, setStartTime] = useState(0)
  const [countdown, setCountdown] = useState(3)
  const maxRounds = 5

  useEffect(() => {
    if (gameState === "waiting") {
      const timer = setTimeout(() => {
        setGameState("ready")
        setCountdown(3)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [gameState])

  useEffect(() => {
    if (gameState === "ready" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (gameState === "ready" && countdown === 0) {
      const randomDelay = Math.random() * 3000 + 1000
      const timer = setTimeout(() => {
        setGameState("go")
        setStartTime(Date.now())
      }, randomDelay)
      return () => clearTimeout(timer)
    }
  }, [gameState, countdown])

  const handleClick = () => {
    if (gameState === "go") {
      const reactionTime = Date.now() - startTime
      setReactionTimes([...reactionTimes, reactionTime])
      setGameState("clicked")

      setTimeout(() => {
        if (round >= maxRounds) {
          setGameState("finished")
        } else {
          setRound(round + 1)
          setGameState("waiting")
        }
      }, 1500)
    } else if (gameState === "ready") {
      // Too early!
      setReactionTimes([...reactionTimes, 9999])
      setGameState("clicked")
      setTimeout(() => {
        if (round >= maxRounds) {
          setGameState("finished")
        } else {
          setRound(round + 1)
          setGameState("waiting")
        }
      }, 1500)
    }
  }

  const averageTime =
    reactionTimes.length > 0
      ? Math.round(
          reactionTimes.filter((t) => t < 9999).reduce((a, b) => a + b, 0) /
            reactionTimes.filter((t) => t < 9999).length,
        )
      : 0

  const bestTime = reactionTimes.length > 0 ? Math.min(...reactionTimes.filter((t) => t < 9999)) : 0

  if (gameState === "finished") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-3xl text-white text-center">Results</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <Zap className="h-16 w-16 text-white" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="p-6 bg-slate-800 rounded-lg">
                <p className="text-4xl font-bold text-green-400 mb-2">{bestTime}ms</p>
                <p className="text-sm text-slate-400">Best Time</p>
              </div>
              <div className="p-6 bg-slate-800 rounded-lg">
                <p className="text-4xl font-bold text-purple-400 mb-2">{averageTime}ms</p>
                <p className="text-sm text-slate-400">Average Time</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-400">All Attempts:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {reactionTimes.map((time, i) => (
                  <Badge
                    key={i}
                    className={time < 9999 ? "bg-slate-800 text-white border-0" : "bg-red-900 text-white border-0"}
                  >
                    {time < 9999 ? `${time}ms` : "Too Early!"}
                  </Badge>
                ))}
              </div>
            </div>
            <Button onClick={() => router.push("/games")} className="bg-purple-600 hover:bg-purple-700">
              Back to Games
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Badge className="bg-purple-600 text-white border-0 text-lg px-4 py-2">
            Round {round}/{maxRounds}
          </Badge>
          {averageTime > 0 && (
            <Badge className="bg-slate-800 text-white border-0 text-lg px-4 py-2">Avg: {averageTime}ms</Badge>
          )}
        </div>

        {/* Game Area */}
        <Card
          onClick={handleClick}
          className={`border-4 cursor-pointer transition-all duration-300 min-h-[500px] flex items-center justify-center ${
            gameState === "waiting"
              ? "border-slate-800 bg-slate-900/50"
              : gameState === "ready"
                ? "border-yellow-600 bg-yellow-900/20"
                : gameState === "go"
                  ? "border-green-600 bg-green-900/20"
                  : "border-purple-600 bg-purple-900/20"
          }`}
        >
          <CardContent className="text-center">
            {gameState === "waiting" && (
              <div className="space-y-4">
                <Clock className="h-16 w-16 text-slate-400 mx-auto animate-pulse" />
                <h3 className="text-2xl font-bold text-white">Get Ready...</h3>
                <p className="text-slate-400">Click when the screen turns green!</p>
              </div>
            )}

            {gameState === "ready" && (
              <div className="space-y-4">
                <div className="text-8xl font-bold text-yellow-400">{countdown > 0 ? countdown : "..."}</div>
                <h3 className="text-2xl font-bold text-yellow-400">Wait for it...</h3>
                <p className="text-slate-400">Don't click yet!</p>
              </div>
            )}

            {gameState === "go" && (
              <div className="space-y-4">
                <Zap className="h-24 w-24 text-green-400 mx-auto animate-pulse" />
                <h3 className="text-4xl font-bold text-green-400">CLICK NOW!</h3>
              </div>
            )}

            {gameState === "clicked" && (
              <div className="space-y-4">
                {reactionTimes[reactionTimes.length - 1] < 9999 ? (
                  <>
                    <Trophy className="h-16 w-16 text-purple-400 mx-auto" />
                    <h3 className="text-4xl font-bold text-purple-400">{reactionTimes[reactionTimes.length - 1]}ms</h3>
                    <p className="text-slate-400">
                      {reactionTimes[reactionTimes.length - 1] < 200
                        ? "Lightning fast! ⚡"
                        : reactionTimes[reactionTimes.length - 1] < 300
                          ? "Great reaction! 🎯"
                          : "Good job! 👍"}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-6xl">😅</div>
                    <h3 className="text-3xl font-bold text-red-400">Too Early!</h3>
                    <p className="text-slate-400">Wait for the green screen next time</p>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
