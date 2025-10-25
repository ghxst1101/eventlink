"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Plus, X } from "lucide-react"

type CardType = { suit: string; value: string; numValue: number }

export default function BlackjackGame() {
  const [playerHand, setPlayerHand] = useState<CardType[]>([])
  const [dealerHand, setDealerHand] = useState<CardType[]>([])
  const [deck, setDeck] = useState<CardType[]>([])
  const [gameState, setGameState] = useState<"idle" | "playing" | "playerWin" | "dealerWin" | "tie">("idle")
  const [playerScore, setPlayerScore] = useState(0)
  const [dealerScore, setDealerScore] = useState(0)
  const [showDealerCards, setShowDealerCards] = useState(false)

  const suits = ["♠", "♥", "♦", "♣"]
  const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]

  const createDeck = (): CardType[] => {
    const newDeck: CardType[] = []
    suits.forEach((suit) => {
      values.forEach((value) => {
        let numValue = Number.parseInt(value)
        if (value === "A") numValue = 11
        else if (["J", "Q", "K"].includes(value)) numValue = 10
        newDeck.push({ suit, value, numValue })
      })
    })
    return newDeck.sort(() => Math.random() - 0.5)
  }

  const calculateScore = (hand: CardType[]): number => {
    let score = hand.reduce((sum, card) => sum + card.numValue, 0)
    let aces = hand.filter((card) => card.value === "A").length

    while (score > 21 && aces > 0) {
      score -= 10
      aces--
    }

    return score
  }

  const startGame = () => {
    const newDeck = createDeck()
    const player = [newDeck.pop()!, newDeck.pop()!]
    const dealer = [newDeck.pop()!, newDeck.pop()!]

    setDeck(newDeck)
    setPlayerHand(player)
    setDealerHand(dealer)
    setPlayerScore(calculateScore(player))
    setDealerScore(calculateScore(dealer))
    setGameState("playing")
    setShowDealerCards(false)
  }

  const hit = () => {
    if (gameState !== "playing") return

    const newCard = deck.pop()!
    const newHand = [...playerHand, newCard]
    const newScore = calculateScore(newHand)

    setPlayerHand(newHand)
    setPlayerScore(newScore)
    setDeck([...deck])

    if (newScore > 21) {
      setShowDealerCards(true)
      setGameState("dealerWin")
    }
  }

  const stand = () => {
    if (gameState !== "playing") return

    setShowDealerCards(true)
    const newDealerHand = [...dealerHand]
    let newDealerScore = calculateScore(newDealerHand)

    while (newDealerScore < 17) {
      const newCard = deck.pop()!
      newDealerHand.push(newCard)
      newDealerScore = calculateScore(newDealerHand)
    }

    setDealerHand(newDealerHand)
    setDealerScore(newDealerScore)

    if (newDealerScore > 21 || playerScore > newDealerScore) {
      setGameState("playerWin")
    } else if (playerScore < newDealerScore) {
      setGameState("dealerWin")
    } else {
      setGameState("tie")
    }
  }

  const renderCard = (card: CardType, hidden = false) => {
    if (hidden) {
      return (
        <div className="w-20 h-28 bg-purple-600 rounded-lg border-2 border-purple-400 flex items-center justify-center">
          <div className="text-4xl">🂠</div>
        </div>
      )
    }

    const isRed = card.suit === "♥" || card.suit === "♦"
    return (
      <div className="w-20 h-28 bg-white rounded-lg border-2 border-slate-300 p-2 flex flex-col justify-between">
        <div className={`text-xl font-bold ${isRed ? "text-red-600" : "text-slate-900"}`}>
          {card.value}
          {card.suit}
        </div>
        <div className={`text-3xl text-center ${isRed ? "text-red-600" : "text-slate-900"}`}>{card.suit}</div>
        <div className={`text-xl font-bold text-right ${isRed ? "text-red-600" : "text-slate-900"}`}>
          {card.value}
          {card.suit}
        </div>
      </div>
    )
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

        <Card className="border-slate-800 bg-slate-900/50 max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-white text-center text-2xl">Blackjack</CardTitle>
            <CardDescription className="text-slate-400 text-center">Get as close to 21 as possible!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Dealer Hand */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Dealer</h3>
                <Badge className="bg-slate-700 text-white border-0">{showDealerCards ? dealerScore : "?"}</Badge>
              </div>
              <div className="flex gap-2 justify-center">
                {dealerHand.map((card, i) => (
                  <div key={i}>{renderCard(card, !showDealerCards && i === 1)}</div>
                ))}
              </div>
            </div>

            {/* Game Status */}
            {gameState !== "idle" && gameState !== "playing" && (
              <div className="text-center p-4 rounded-lg bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30">
                <div className="text-2xl font-bold text-white">
                  {gameState === "playerWin" && "You Win! 🎉"}
                  {gameState === "dealerWin" && "Dealer Wins"}
                  {gameState === "tie" && "Push (Tie)"}
                </div>
              </div>
            )}

            {/* Player Hand */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Your Hand</h3>
                <Badge
                  className={playerScore > 21 ? "bg-red-600 text-white border-0" : "bg-purple-600 text-white border-0"}
                >
                  {playerScore}
                </Badge>
              </div>
              <div className="flex gap-2 justify-center">
                {playerHand.map((card, i) => (
                  <div key={i}>{renderCard(card)}</div>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3 justify-center">
              {gameState === "idle" && (
                <Button onClick={startGame} size="lg" className="bg-purple-600 hover:bg-purple-700">
                  <Play className="mr-2 h-5 w-5" />
                  Deal Cards
                </Button>
              )}
              {gameState === "playing" && (
                <>
                  <Button onClick={hit} size="lg" className="bg-green-600 hover:bg-green-700">
                    <Plus className="mr-2 h-5 w-5" />
                    Hit
                  </Button>
                  <Button onClick={stand} size="lg" className="bg-red-600 hover:bg-red-700">
                    <X className="mr-2 h-5 w-5" />
                    Stand
                  </Button>
                </>
              )}
              {(gameState === "playerWin" || gameState === "dealerWin" || gameState === "tie") && (
                <Button onClick={startGame} size="lg" className="bg-purple-600 hover:bg-purple-700">
                  <Play className="mr-2 h-5 w-5" />
                  New Game
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
