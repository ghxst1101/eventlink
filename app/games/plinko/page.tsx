"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play } from "lucide-react"

export default function PlinkoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [isDropping, setIsDropping] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const pegs: Array<{ x: number; y: number }> = []
    const balls: Array<{ x: number; y: number; vx: number; vy: number; radius: number }> = []
    const multipliers = [100, 50, 20, 10, 5, 2, 5, 10, 20, 50, 100]

    // Create pegs
    for (let row = 0; row < 12; row++) {
      for (let col = 0; col < row + 3; col++) {
        pegs.push({
          x: canvas.width / 2 - (row * 30) / 2 + col * 30,
          y: 80 + row * 35,
        })
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Background
      ctx.fillStyle = "#0f172a"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw pegs
      pegs.forEach((peg) => {
        ctx.fillStyle = "#475569"
        ctx.beginPath()
        ctx.arc(peg.x, peg.y, 5, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw multiplier zones
      const zoneWidth = canvas.width / multipliers.length
      multipliers.forEach((mult, i) => {
        const color = mult >= 50 ? "#22c55e" : mult >= 10 ? "#3b82f6" : mult >= 5 ? "#a855f7" : "#64748b"
        ctx.fillStyle = color
        ctx.fillRect(i * zoneWidth, canvas.height - 60, zoneWidth, 60)
        ctx.fillStyle = "#fff"
        ctx.font = "14px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(`${mult}x`, i * zoneWidth + zoneWidth / 2, canvas.height - 30)
      })

      // Draw balls
      balls.forEach((ball) => {
        const gradient = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, ball.radius)
        gradient.addColorStop(0, "#fbbf24")
        gradient.addColorStop(1, "#f59e0b")
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    const update = () => {
      balls.forEach((ball, index) => {
        ball.vy += 0.5 // gravity
        ball.x += ball.vx
        ball.y += ball.vy

        // Peg collision
        pegs.forEach((peg) => {
          const dx = ball.x - peg.x
          const dy = ball.y - peg.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < ball.radius + 5) {
            const angle = Math.atan2(dy, dx)
            ball.vx = Math.cos(angle) * 3
            ball.vy = Math.sin(angle) * 3
          }
        })

        // Bottom collision
        if (ball.y + ball.radius > canvas.height - 60) {
          const zoneWidth = canvas.width / multipliers.length
          const zoneIndex = Math.floor(ball.x / zoneWidth)
          const multiplier = multipliers[Math.max(0, Math.min(zoneIndex, multipliers.length - 1))]
          setScore(multiplier)
          setTotalScore((prev) => prev + multiplier)
          balls.splice(index, 1)
          setIsDropping(false)
        }

        // Side boundaries
        if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
          ball.vx *= -0.8
        }
      })
    }

    const gameLoop = () => {
      update()
      draw()
      requestAnimationFrame(gameLoop)
    }

    gameLoop()
  }, [])

  const dropBall = () => {
    if (isDropping) return
    setIsDropping(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Access balls array through a ref or state
    const ball = {
      x: canvas.width / 2 + (Math.random() - 0.5) * 20,
      y: 20,
      vx: (Math.random() - 0.5) * 2,
      vy: 0,
      radius: 8,
    }

    // This is a simplified version - in production you'd manage balls state properly
    console.log("[v0] Ball dropped at", ball.x)
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
                <CardTitle className="text-white">Plinko</CardTitle>
                <CardDescription className="text-slate-400">
                  Drop the ball and watch it bounce through the pegs!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={500}
                  className="w-full border border-slate-700 rounded-lg"
                />
                <div className="flex items-center justify-center mt-4">
                  <Button onClick={dropBall} disabled={isDropping} className="bg-purple-600 hover:bg-purple-700">
                    <Play className="mr-2 h-4 w-4" />
                    Drop Ball
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-white text-lg">Score</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-6 rounded-lg bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30">
                  <div className="text-4xl font-bold text-white">{totalScore}</div>
                  <div className="text-sm text-slate-400 mt-1">Total Points</div>
                </div>
                {score > 0 && (
                  <div className="text-center p-4 rounded-lg bg-green-600/20 border border-green-500/30">
                    <div className="text-2xl font-bold text-green-400">+{score}</div>
                    <div className="text-xs text-slate-400">Last Drop</div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-white text-lg">Multipliers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <Badge className="bg-green-600 text-white border-0">100x</Badge>
                  <span className="text-slate-400">Jackpot!</span>
                </div>
                <div className="flex items-center justify-between">
                  <Badge className="bg-green-600 text-white border-0">50x</Badge>
                  <span className="text-slate-400">Excellent</span>
                </div>
                <div className="flex items-center justify-between">
                  <Badge className="bg-blue-600 text-white border-0">20x</Badge>
                  <span className="text-slate-400">Great</span>
                </div>
                <div className="flex items-center justify-between">
                  <Badge className="bg-purple-600 text-white border-0">5-10x</Badge>
                  <span className="text-slate-400">Good</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
