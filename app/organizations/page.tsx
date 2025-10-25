import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { Users, Calendar, Plus, Building2 } from "lucide-react"

export default async function OrganizationsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    profile = data
  }

  // Mock organizations data (would come from database)
  const organizations = [
    {
      id: "1",
      name: "Gaming Legends",
      slug: "gaming-legends",
      description: "Premier esports organization hosting weekly tournaments",
      logo_url: "/abstract-gaming-logo.png",
      member_count: 1250,
      event_count: 45,
      owner: { username: "ProGamer123", avatar_url: null },
    },
    {
      id: "2",
      name: "Tech Talks",
      slug: "tech-talks",
      description: "Weekly tech discussions and coding challenges",
      logo_url: "/abstract-tech-logo.png",
      member_count: 890,
      event_count: 32,
      owner: { username: "DevMaster", avatar_url: null },
    },
    {
      id: "3",
      name: "Music Collective",
      slug: "music-collective",
      description: "Live music performances and DJ sets",
      logo_url: "/abstract-music-logo.png",
      member_count: 2100,
      event_count: 67,
      owner: { username: "DJ_Beats", avatar_url: null },
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navigation user={user} profile={profile} />

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Organizations</h1>
            <p className="text-slate-400">Join communities and discover recurring events</p>
          </div>
          {user && (
            <Button asChild className="bg-purple-600 hover:bg-purple-700">
              <Link href="/organizations/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Organization
              </Link>
            </Button>
          )}
        </div>

        {/* Organizations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org) => (
            <Card key={org.id} className="border-slate-800 bg-slate-900/50 hover:border-purple-600 transition-colors">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden">
                    {org.logo_url ? (
                      <img
                        src={org.logo_url || "/placeholder.svg"}
                        alt={org.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="h-8 w-8 text-purple-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-white text-lg mb-1">{org.name}</CardTitle>
                    <p className="text-sm text-slate-400 line-clamp-2">{org.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-slate-400">
                    <Users className="h-4 w-4" />
                    <span>{org.member_count.toLocaleString()} members</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Calendar className="h-4 w-4" />
                    <span>{org.event_count} events</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={org.owner.avatar_url || undefined} />
                    <AvatarFallback className="bg-purple-600 text-xs">
                      {org.owner.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-slate-400">by {org.owner.username}</span>
                </div>

                <Button asChild className="w-full bg-slate-800 hover:bg-slate-700 text-white">
                  <Link href={`/organizations/${org.slug}`}>View Organization</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
