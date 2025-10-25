"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Trophy, Clock, Zap } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

export default function WordScramblePage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string

  const words = [
    { word: "JAVASCRIPT", hint: "Popular programming language", scrambled: "VASCAJIRPT" },
    { word: "COMPUTER", hint: "Electronic device", scrambled: "PMOCTURE" },
    { word: "KEYBOARD", hint: "Input device", scrambled: "YOBDKARE" },
    { word: "INTERNET", hint: "Global network", scrambled: "TNEINTER" },
    { word: "ALGORITHM", hint: "Step-by-step procedure", scrambled: "MHIGLATRO" },
    { word: "DATABASE", hint: "Organized data storage", scrambled: "ATABASED" },
    { word: "FUNCTION", hint: "Reusable code block", scrambled: "NFUCNOIT" },
    { word: "VARIABLE", hint: "Data container", scrambled: "BARVIALE" },
  ]

  const [currentRound, setCurrentRound] = useState(0)
  const [guess, setGuess] = useState("")
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [gameState, setGameState] = useState<"playing" | "correct" | "wrong" | "finished">("playing")
  const [streak, setStreak] = useState(0)

  const currentWord = words[currentRound]

  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && gameState === "playing") {
      handleWrong()
    }
  }, [timeLeft, gameState])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (guess.toUpperCase() === currentWord.word) {
      const points = timeLeft * 10 + streak * 50
      setScore(score + points)
      setStreak(streak + 1)
      setGameState("correct")
      setTimeout(() => nextRound(), 1500)
    } else {
      handleWrong()
    }
  }

  const handleWrong = () => {
    setStreak(0)
    setGameState("wrong")
    setTimeout(() => nextRound(), 2000)
  }

  const nextRound = () => {
    if (currentRound + 1 >= words.length) {
      setGameState("finished")
    } else {
      setCurrentRound(currentRound + 1)
      setGuess("")
      setTimeLeft(30)
      setGameState("playing")
    }
  }

  if (gameState === "finished") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-3xl text-white text-center">Game Complete!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <Trophy className="h-16 w-16 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-5xl font-bold text-white mb-2">{score}</h3>
              <p className="text-slate-400">Total Points</p>
            </div>
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
              <div className="p-4 bg-slate-800 rounded-lg">
                <p className="text-2xl font-bold text-purple-400">{currentRound}</p>
                <p className="text-xs text-slate-400">Words Solved</p>
              </div>
              <div className="p-4 bg-slate-800 rounded-lg">
                <p className="text-2xl font-bold text-purple-400">{Math.max(...[streak, 0])}</p>
                <p className="text-xs text-slate-400">Best Streak</p>
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
            Round {currentRound + 1}/{words.length}
          </Badge>
          <div className="flex items-center gap-4">
            {streak > 0 && (
              <Badge className="bg-orange-600 text-white border-0 text-lg px-4 py-2">
                <Zap className="h-4 w-4 mr-2" />
                {streak}x Streak
              </Badge>
            )}
            <Badge className="bg-slate-800 text-white border-0 text-lg px-4 py-2">
              <Trophy className="h-4 w-4 mr-2" />
              {score}
            </Badge>
            <Badge className="bg-slate-800 text-white border-0 text-lg px-4 py-2">
              <Clock className="h-4 w-4 mr-2" />
              {timeLeft}s
            </Badge>
          </div>
        </div>

        {/* Game Card */}
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-center text-white text-sm mb-4">Unscramble the word:</CardTitle>
            <div className="text-center">
              <p className="text-5xl font-bold text-white tracking-widest mb-4">{currentWord.scrambled}</p>
              <p className="text-slate-400">Hint: {currentWord.hint}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {gameState === "playing" && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  value={guess}
                  onChange={(e) => setGuess(e.target.value.toUpperCase())}
                  placeholder="Type your answer..."
                  className="bg-slate-800 border-slate-700 text-white text-center text-2xl h-16 tracking-wider"
                  autoFocus
                />
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-lg">
                  Submit Answer
                </Button>
              </form>
            )}

            {gameState === "correct" && (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-3xl font-bold text-green-400 mb-2">Correct!</h3>
                <p className="text-slate-400">+{timeLeft * 10 + (streak - 1) * 50} points</p>
              </div>
            )}

            {gameState === "wrong" && (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">😔</div>
                <h3 className="text-3xl font-bold text-red-400 mb-2">Time's Up!</h3>
                <p className="text-slate-400">
                  The answer was: <span className="text-white font-bold">{currentWord.word}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
