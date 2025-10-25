"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, Users, Clock, TrendingUp } from "lucide-react"
import { useParams } from "next/navigation"

interface PollOption {
  id: string
  text: string
  votes: number
  percentage: number
}

export default function PollGamePage() {
  const params = useParams()
  const sessionId = params.sessionId as string

  const [pollQuestion, setPollQuestion] = useState("What's your favorite programming language?")
  const [options, setOptions] = useState<PollOption[]>([
    { id: "1", text: "JavaScript", votes: 45, percentage: 35 },
    { id: "2", text: "Python", votes: 38, percentage: 30 },
    { id: "3", text: "TypeScript", votes: 25, percentage: 20 },
    { id: "4", text: "Rust", votes: 19, percentage: 15 },
  ])
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [totalVotes, setTotalVotes] = useState(127)
  const [timeLeft, setTimeLeft] = useState(30)
  const [liveVoters, setLiveVoters] = useState(127)

  useEffect(() => {
    if (timeLeft > 0 && !hasVoted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft, hasVoted])

  // Simulate live voting
  useEffect(() => {
    if (!hasVoted) {
      const interval = setInterval(() => {
        setOptions((prev) =>
          prev.map((opt) => {
            const randomVote = Math.random() > 0.7
            if (randomVote) {
              const newVotes = opt.votes + 1
              return { ...opt, votes: newVotes }
            }
            return opt
          }),
        )
        setTotalVotes((prev) => (Math.random() > 0.7 ? prev + 1 : prev))
        setLiveVoters((prev) => prev + Math.floor(Math.random() * 3))
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [hasVoted])

  // Recalculate percentages
  useEffect(() => {
    const total = options.reduce((sum, opt) => sum + opt.votes, 0)
    setOptions((prev) =>
      prev.map((opt) => ({
        ...opt,
        percentage: total > 0 ? Math.round((opt.votes / total) * 100) : 0,
      })),
    )
  }, [options.map((o) => o.votes).join(",")])

  const handleVote = (optionId: string) => {
    if (hasVoted) return

    setSelectedOption(optionId)
    setOptions((prev) => prev.map((opt) => (opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt)))
    setTotalVotes(totalVotes + 1)
    setHasVoted(true)
  }

  const sortedOptions = [...options].sort((a, b) => b.votes - a.votes)
  const winner = sortedOptions[0]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Badge className="bg-purple-600 text-white border-0 text-lg px-4 py-2">
            <BarChart3 className="h-4 w-4 mr-2" />
            Live Poll
          </Badge>
          <div className="flex items-center gap-4">
            <Badge className="bg-slate-800 text-white border-0 text-lg px-4 py-2">
              <Users className="h-4 w-4 mr-2" />
              {liveVoters} online
            </Badge>
            {!hasVoted && (
              <Badge className="bg-slate-800 text-white border-0 text-lg px-4 py-2">
                <Clock className="h-4 w-4 mr-2" />
                {timeLeft}s
              </Badge>
            )}
          </div>
        </div>

        {/* Poll Card */}
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-3xl text-white text-balance">{pollQuestion}</CardTitle>
            <p className="text-slate-400 mt-2">{totalVotes} total votes</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {options.map((option, index) => (
              <div key={option.id} className="space-y-2">
                <Button
                  onClick={() => handleVote(option.id)}
                  disabled={hasVoted}
                  className={`w-full h-auto py-6 text-left justify-between text-lg relative overflow-hidden ${
                    hasVoted
                      ? selectedOption === option.id
                        ? "bg-purple-600 hover:bg-purple-600 text-white"
                        : "bg-slate-800 hover:bg-slate-800 text-white"
                      : "bg-slate-800 hover:bg-slate-700 text-white"
                  }`}
                >
                  {hasVoted && (
                    <div
                      className="absolute inset-0 bg-purple-600/20 transition-all duration-500"
                      style={{ width: `${option.percentage}%` }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-3">
                    <span className="font-bold">{String.fromCharCode(65 + index)}.</span>
                    {option.text}
                    {hasVoted && option.id === winner.id && <TrendingUp className="h-5 w-5 text-yellow-400 ml-2" />}
                  </span>
                  {hasVoted && (
                    <span className="relative z-10 flex items-center gap-3">
                      <span className="text-2xl font-bold">{option.percentage}%</span>
                      <span className="text-sm text-slate-400">({option.votes} votes)</span>
                    </span>
                  )}
                </Button>
              </div>
            ))}

            {hasVoted && (
              <div className="mt-6 p-4 bg-green-900/20 border border-green-700 rounded-lg">
                <p className="text-green-400 text-center font-semibold">✓ Your vote has been recorded!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live Stats */}
        {hasVoted && (
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-white">Live Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sortedOptions.map((option, index) => (
                <div key={option.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {index === 0 && <span className="text-2xl">🥇</span>}
                      {index === 1 && <span className="text-2xl">🥈</span>}
                      {index === 2 && <span className="text-2xl">🥉</span>}
                      <span className="text-white font-medium">{option.text}</span>
                    </div>
                    <span className="text-slate-400">{option.votes} votes</span>
                  </div>
                  <Progress value={option.percentage} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
