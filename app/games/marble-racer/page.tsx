"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, RotateCcw, Play } from "lucide-react"

export default function MarbleRacerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<"idle" | "playing" | "finished">("idle")
  const [time, setTime] = useState(0)
  const [bestTime, setBestTime] = useState<number | null>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const marble = { x: 50, y: 50, vx: 0, vy: 0, radius: 15 }
    const obstacles: Array<{ x: number; y: number; width: number; height: number }> = []
    const finish = { x: 700, y: 350, width: 50, height: 100 }
    let startTime = 0

    // Generate obstacles
    for (let i = 0; i < 8; i++) {
      obstacles.push({
        x: 150 + i * 80,
        y: Math.random() * 300 + 50,
        width: 40,
        height: Math.random() * 100 + 50,
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw track
      ctx.fillStyle = "#1e293b"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw grid
      ctx.strokeStyle = "#334155"
      ctx.lineWidth = 1
      for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, canvas.height)
        ctx.stroke()
      }
      for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(canvas.width, i)
        ctx.stroke()
      }

      // Draw obstacles
      ctx.fillStyle = "#ef4444"
      obstacles.forEach((obs) => {
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height)
      })

      // Draw finish line
      ctx.fillStyle = "#22c55e"
      ctx.fillRect(finish.x, finish.y, finish.width, finish.height)
      ctx.fillStyle = "#fff"
      ctx.font = "16px sans-serif"
      ctx.fillText("FINISH", finish.x + 5, finish.y + 30)

      // Draw marble
      const gradient = ctx.createRadialGradient(marble.x, marble.y, 0, marble.x, marble.y, marble.radius)
      gradient.addColorStop(0, "#a855f7")
      gradient.addColorStop(1, "#7c3aed")
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(marble.x, marble.y, marble.radius, 0, Math.PI * 2)
      ctx.fill()

      // Draw shine on marble
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
      ctx.beginPath()
      ctx.arc(marble.x - 5, marble.y - 5, 5, 0, Math.PI * 2)
      ctx.fill()
    }

    const update = () => {
      if (gameState !== "playing") return

      // Apply gravity and friction
      marble.vy += 0.3
      marble.vx *= 0.98
      marble.vy *= 0.98

      marble.x += marble.vx
      marble.y += marble.vy

      // Boundary collision
      if (marble.y + marble.radius > canvas.height) {
        marble.y = canvas.height - marble.radius
        marble.vy *= -0.7
      }
      if (marble.y - marble.radius < 0) {
        marble.y = marble.radius
        marble.vy *= -0.7
      }
      if (marble.x + marble.radius > canvas.width) {
        marble.x = canvas.width - marble.radius
        marble.vx *= -0.7
      }
      if (marble.x - marble.radius < 0) {
        marble.x = marble.radius
        marble.vx *= -0.7
      }

      // Obstacle collision
      obstacles.forEach((obs) => {
        if (
          marble.x + marble.radius > obs.x &&
          marble.x - marble.radius < obs.x + obs.width &&
          marble.y + marble.radius > obs.y &&
          marble.y - marble.radius < obs.y + obs.height
        ) {
          marble.vx *= -0.5
          marble.vy *= -0.5
        }
      })

      // Check finish
      if (
        marble.x + marble.radius > finish.x &&
        marble.x - marble.radius < finish.x + finish.width &&
        marble.y + marble.radius > finish.y &&
        marble.y - marble.radius < finish.y + finish.height
      ) {
        const finalTime = ((Date.now() - startTime) / 1000).toFixed(2)
        setTime(Number.parseFloat(finalTime))
        if (!bestTime || Number.parseFloat(finalTime) < bestTime) {
          setBestTime(Number.parseFloat(finalTime))
        }
        setGameState("finished")
      }

      setTime((Date.now() - startTime) / 1000)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== "playing") return
      const speed = 2
      switch (e.key) {
        case "ArrowUp":
          marble.vy -= speed
          break
        case "ArrowDown":
          marble.vy += speed
          break
        case "ArrowLeft":
          marble.vx -= speed
          break
        case "ArrowRight":
          marble.vx += speed
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    const gameLoop = () => {
      update()
      draw()
      animationRef.current = requestAnimationFrame(gameLoop)
    }

    if (gameState === "playing") {
      startTime = Date.now()
      gameLoop()
    } else {
      draw()
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [gameState, bestTime])

  const startGame = () => {
    setGameState("playing")
    setTime(0)
  }

  const resetGame = () => {
    setGameState("idle")
    setTime(0)
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            className="border-slate-700 text-white bg-transparent"
            onClick={() => window.history.back()}
          >
            ← Back to Games
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Marble Racer
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Use arrow keys to navigate your marble to the finish line!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={450}
                  className="w-full border border-slate-700 rounded-lg"
                />
                <div className="flex items-center justify-between mt-4">
                  <div className="flex gap-4">
                    {gameState === "idle" && (
                      <Button onClick={startGame} className="bg-purple-600 hover:bg-purple-700">
                        <Play className="mr-2 h-4 w-4" />
                        Start Race
                      </Button>
                    )}
                    {gameState === "finished" && (
                      <Button onClick={resetGame} className="bg-purple-600 hover:bg-purple-700">
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Race Again
                      </Button>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{time.toFixed(2)}s</div>
                    <div className="text-sm text-slate-400">Current Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-white text-lg">Your Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                  <span className="text-slate-400">Best Time</span>
                  <Badge className="bg-yellow-600 text-white border-0">
                    {bestTime ? `${bestTime.toFixed(2)}s` : "N/A"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                  <span className="text-slate-400">Status</span>
                  <Badge
                    className={
                      gameState === "playing"
                        ? "bg-green-600 text-white border-0"
                        : gameState === "finished"
                          ? "bg-blue-600 text-white border-0"
                          : "bg-slate-600 text-white border-0"
                    }
                  >
                    {gameState === "playing" ? "Racing" : gameState === "finished" ? "Finished" : "Ready"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-white text-lg">Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-slate-700">
                    ↑
                  </Badge>
                  <span>Move Up</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-slate-700">
                    ↓
                  </Badge>
                  <span>Move Down</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-slate-700">
                    ←
                  </Badge>
                  <span>Move Left</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-slate-700">
                    →
                  </Badge>
                  <span>Move Right</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
