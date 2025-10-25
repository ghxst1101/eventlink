import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Gamepad2, TrendingUp } from "lucide-react"

export default async function GamesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    profile = data
  }

  const { data: games } = await supabase
    .from("games")
    .select("*")
    .eq("is_active", true)
    .order("play_count", { ascending: false })

  const categories = [
    { name: "All Games", slug: "all" },
    { name: "Arcade", slug: "arcade" },
    { name: "Casino", slug: "casino" },
    { name: "Racing", slug: "racing" },
    { name: "Puzzle", slug: "puzzle" },
  ]

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation user={user} profile={profile} />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Gamepad2 className="h-8 w-8 text-purple-500" />
            <h1 className="text-4xl font-bold text-white">Game Arcade</h1>
          </div>
          <p className="text-lg text-slate-400">Play exciting games and compete on the leaderboards!</p>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Badge
              key={category.slug}
              variant="outline"
              className="cursor-pointer border-slate-700 text-slate-300 hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-colors"
            >
              {category.name}
            </Badge>
          ))}
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games?.map((game) => (
            <Link key={game.id} href={`/games/${game.slug}`}>
              <Card className="border-slate-800 bg-slate-900/50 hover:border-purple-500/50 transition-all group cursor-pointer h-full">
                <CardHeader className="p-0">
                  <div className="aspect-video relative overflow-hidden rounded-t-lg">
                    <img
                      src={game.thumbnail_url || "/placeholder.svg?height=200&width=300"}
                      alt={game.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <Badge className="absolute top-2 right-2 bg-slate-900/80 text-white border-0">
                      {game.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-lg text-white mb-2 group-hover:text-purple-400 transition-colors">
                    {game.name}
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-sm mb-3">{game.description}</CardDescription>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <TrendingUp className="h-3 w-3" />
                    <span>{game.play_count.toLocaleString()} plays</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
