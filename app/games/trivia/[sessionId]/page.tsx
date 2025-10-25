"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Trophy, Clock } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

interface TriviaQuestion {
  question: string
  options: string[]
  correct_answer: number
  category: string
  difficulty: string
  time_limit: number
}

export default function TriviaGamePage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  const supabase = createClient()

  const [gameState, setGameState] = useState<"waiting" | "question" | "results" | "final">("waiting")
  const [currentQuestion, setCurrentQuestion] = useState<TriviaQuestion | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(30)
  const [score, setScore] = useState(0)
  const [round, setRound] = useState(1)
  const [totalRounds, setTotalRounds] = useState(10)
  const [participants, setParticipants] = useState<any[]>([])
  const [leaderboard, setLeaderboard] = useState<any[]>([])

  // Sample trivia questions
  const triviaQuestions: TriviaQuestion[] = [
    {
      question: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      correct_answer: 2,
      category: "Geography",
      difficulty: "Easy",
      time_limit: 15,
    },
    {
      question: "Which planet is known as the Red Planet?",
      options: ["Venus", "Mars", "Jupiter", "Saturn"],
      correct_answer: 1,
      category: "Science",
      difficulty: "Easy",
      time_limit: 15,
    },
    {
      question: "Who painted the Mona Lisa?",
      options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
      correct_answer: 2,
      category: "Art",
      difficulty: "Medium",
      time_limit: 20,
    },
    {
      question: "What is the largest ocean on Earth?",
      options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
      correct_answer: 3,
      category: "Geography",
      difficulty: "Easy",
      time_limit: 15,
    },
    {
      question: "In what year did World War II end?",
      options: ["1943", "1944", "1945", "1946"],
      correct_answer: 2,
      category: "History",
      difficulty: "Medium",
      time_limit: 20,
    },
    {
      question: "What is the chemical symbol for gold?",
      options: ["Go", "Gd", "Au", "Ag"],
      correct_answer: 2,
      category: "Science",
      difficulty: "Medium",
      time_limit: 20,
    },
    {
      question: "Which country is home to the kangaroo?",
      options: ["New Zealand", "Australia", "South Africa", "Brazil"],
      correct_answer: 1,
      category: "Geography",
      difficulty: "Easy",
      time_limit: 15,
    },
    {
      question: "What is the smallest prime number?",
      options: ["0", "1", "2", "3"],
      correct_answer: 2,
      category: "Math",
      difficulty: "Easy",
      time_limit: 15,
    },
    {
      question: "Who wrote 'Romeo and Juliet'?",
      options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
      correct_answer: 1,
      category: "Literature",
      difficulty: "Easy",
      time_limit: 15,
    },
    {
      question: "What is the speed of light?",
      options: ["299,792 km/s", "150,000 km/s", "500,000 km/s", "1,000,000 km/s"],
      correct_answer: 0,
      category: "Science",
      difficulty: "Hard",
      time_limit: 25,
    },
  ]

  useEffect(() => {
    // Start game after 3 seconds
    const timer = setTimeout(() => {
      startNextQuestion()
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (gameState === "question" && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (gameState === "question" && timeLeft === 0) {
      handleAnswerSubmit()
    }
  }, [gameState, timeLeft])

  const startNextQuestion = () => {
    if (round > totalRounds) {
      setGameState("final")
      return
    }

    const question = triviaQuestions[round - 1]
    setCurrentQuestion(question)
    setTimeLeft(question.time_limit)
    setSelectedAnswer(null)
    setGameState("question")
  }

  const handleAnswerSelect = (index: number) => {
    if (selectedAnswer === null) {
      setSelectedAnswer(index)
    }
  }

  const handleAnswerSubmit = () => {
    if (currentQuestion && selectedAnswer === currentQuestion.correct_answer) {
      const points = Math.max(100, timeLeft * 10)
      setScore(score + points)
    }
    setGameState("results")

    setTimeout(() => {
      setRound(round + 1)
      startNextQuestion()
    }, 3000)
  }

  if (gameState === "waiting") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-3xl text-white text-center">Trivia Challenge</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-purple-600/20 flex items-center justify-center animate-pulse">
                <Trophy className="h-12 w-12 text-purple-400" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Get Ready!</h3>
              <p className="text-slate-400">The game will start in a moment...</p>
            </div>
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="p-4 bg-slate-800 rounded-lg">
                <p className="text-2xl font-bold text-purple-400">{totalRounds}</p>
                <p className="text-xs text-slate-400">Questions</p>
              </div>
              <div className="p-4 bg-slate-800 rounded-lg">
                <p className="text-2xl font-bold text-purple-400">15-25s</p>
                <p className="text-xs text-slate-400">Per Question</p>
              </div>
              <div className="p-4 bg-slate-800 rounded-lg">
                <p className="text-2xl font-bold text-purple-400">1000+</p>
                <p className="text-xs text-slate-400">Max Points</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (gameState === "final") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-3xl text-white text-center">Game Over!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <Trophy className="h-16 w-16 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-white mb-2">{score} Points</h3>
              <p className="text-slate-400">Great job! You answered {totalRounds} questions.</p>
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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge className="bg-purple-600 text-white border-0 text-lg px-4 py-2">
              Round {round}/{totalRounds}
            </Badge>
            <div className="flex items-center gap-2 text-white">
              <Trophy className="h-5 w-5 text-yellow-400" />
              <span className="text-xl font-bold">{score}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-400" />
            <span className="text-2xl font-bold text-white">{timeLeft}s</span>
          </div>
        </div>

        {/* Progress */}
        <Progress value={(round / totalRounds) * 100} className="h-2" />

        {/* Question Card */}
        {currentQuestion && gameState === "question" && (
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <Badge variant="outline" className="border-purple-500 text-purple-400">
                  {currentQuestion.category}
                </Badge>
                <Badge
                  variant="outline"
                  className={
                    currentQuestion.difficulty === "Easy"
                      ? "border-green-500 text-green-400"
                      : currentQuestion.difficulty === "Medium"
                        ? "border-yellow-500 text-yellow-400"
                        : "border-red-500 text-red-400"
                  }
                >
                  {currentQuestion.difficulty}
                </Badge>
              </div>
              <CardTitle className="text-2xl text-white text-balance">{currentQuestion.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={selectedAnswer !== null}
                  className={`w-full h-auto py-4 text-left justify-start text-lg ${
                    selectedAnswer === index
                      ? "bg-purple-600 hover:bg-purple-600 text-white"
                      : "bg-slate-800 hover:bg-slate-700 text-white"
                  }`}
                >
                  <span className="mr-3 font-bold">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </Button>
              ))}

              {selectedAnswer !== null && (
                <Button onClick={handleAnswerSubmit} className="w-full bg-green-600 hover:bg-green-700 text-white mt-4">
                  Submit Answer
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {gameState === "results" && currentQuestion && (
          <Card className="border-slate-800 bg-slate-900/50">
            <CardContent className="py-8 text-center space-y-4">
              {selectedAnswer === currentQuestion.correct_answer ? (
                <>
                  <div className="text-6xl">🎉</div>
                  <h3 className="text-3xl font-bold text-green-400">Correct!</h3>
                  <p className="text-slate-400">
                    +{Math.max(100, timeLeft * 10)} points (answered in {currentQuestion.time_limit - timeLeft}s)
                  </p>
                </>
              ) : (
                <>
                  <div className="text-6xl">😔</div>
                  <h3 className="text-3xl font-bold text-red-400">Incorrect</h3>
                  <p className="text-slate-400">
                    The correct answer was:{" "}
                    <span className="text-white font-semibold">
                      {currentQuestion.options[currentQuestion.correct_answer]}
                    </span>
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
