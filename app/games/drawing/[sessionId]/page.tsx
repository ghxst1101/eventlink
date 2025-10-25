"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Palette, Trash2, Clock, Users, Send } from "lucide-react"
import { useParams } from "next/navigation"

export default function DrawingGamePage() {
  const params = useParams()
  const sessionId = params.sessionId as string
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState("#ffffff")
  const [brushSize, setBrushSize] = useState(3)
  const [gameState, setGameState] = useState<"waiting" | "drawing" | "guessing" | "results">("drawing")
  const [currentWord, setCurrentWord] = useState("ROCKET")
  const [timeLeft, setTimeLeft] = useState(60)
  const [guess, setGuess] = useState("")
  const [guesses, setGuesses] = useState<{ player: string; guess: string; correct: boolean }[]>([])
  const [score, setScore] = useState(0)

  const colors = ["#ffffff", "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff", "#ffa500", "#000000"]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Fill with dark background
    ctx.fillStyle = "#1e293b"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    draw(e)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (ctx) {
      ctx.beginPath()
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.lineWidth = brushSize
    ctx.lineCap = "round"
    ctx.strokeStyle = color

    ctx.lineTo(x, y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    ctx.fillStyle = "#1e293b"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const handleGuess = (e: React.FormEvent) => {
    e.preventDefault()
    if (!guess.trim()) return

    const isCorrect = guess.toLowerCase() === currentWord.toLowerCase()
    setGuesses([...guesses, { player: "You", guess, correct: isCorrect }])

    if (isCorrect) {
      setScore(score + timeLeft * 10)
    }

    setGuess("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="max-w-7xl mx-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Drawing Canvas */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Draw: {currentWord}</CardTitle>
                  <div className="flex items-center gap-4">
                    <Badge className="bg-purple-600 text-white border-0 text-lg px-4 py-2">
                      <Clock className="h-4 w-4 mr-2" />
                      {timeLeft}s
                    </Badge>
                    <Badge className="bg-slate-800 text-white border-0 text-lg px-4 py-2">Score: {score}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Canvas */}
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseUp={stopDrawing}
                    onMouseMove={draw}
                    onMouseLeave={stopDrawing}
                    className="w-full h-[500px] border-2 border-slate-700 rounded-lg cursor-crosshair"
                  />
                </div>

                {/* Tools */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-slate-400" />
                    <div className="flex gap-2">
                      {colors.map((c) => (
                        <button
                          key={c}
                          onClick={() => setColor(c)}
                          className={`w-8 h-8 rounded-full border-2 ${color === c ? "border-purple-500 scale-110" : "border-slate-700"} transition-all`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Size:</span>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                      className="w-24"
                    />
                    <span className="text-sm text-white">{brushSize}px</span>
                  </div>

                  <Button onClick={clearCanvas} variant="outline" size="sm" className="border-slate-700 bg-transparent">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Guessing Panel */}
          <div className="space-y-4">
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Guesses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Guess Input */}
                <form onSubmit={handleGuess} className="flex gap-2">
                  <Input
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    placeholder="Type your guess..."
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                  <Button type="submit" size="icon" className="bg-purple-600 hover:bg-purple-700">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>

                {/* Guesses List */}
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {guesses.map((g, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg ${g.correct ? "bg-green-900/30 border border-green-700" : "bg-slate-800"}`}
                    >
                      <p className="text-sm font-semibold text-white">{g.player}</p>
                      <p className={`text-sm ${g.correct ? "text-green-400" : "text-slate-400"}`}>{g.guess}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-white text-sm">How to Play</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-400 space-y-2">
                <p>🎨 Draw the word shown at the top</p>
                <p>⏱️ You have 60 seconds per round</p>
                <p>💬 Other players will try to guess</p>
                <p>⭐ Faster guesses = more points!</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
