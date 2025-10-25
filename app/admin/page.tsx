import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Users, Calendar, Shield, Activity, MessageSquare, Eye, Building2 } from "lucide-react"

export default async function AdminDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
// Using hardcoded email for now but probably bad idea for you to use this method
  if (!user || user.email !== "ENTER_ADMIN_EMAIL_HERE") {
    redirect("/")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get statistics
  const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  const { count: totalEvents } = await supabase.from("events").select("*", { count: "exact", head: true })

  const { count: liveEvents } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("is_live", true)

  const { count: totalMessages } = await supabase.from("chat_messages").select("*", { count: "exact", head: true })

  const { data: recentEvents } = await supabase
    .from("events")
    .select(
      `
      *,
      organizer:profiles(username),
      category:categories(name)
    `,
    )
    .order("created_at", { ascending: false })
    .limit(10)

  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10)

  // Mock analytics data
  const analytics = {
    totalViews: 45230,
    peakViewers: 1250,
    avgSessionDuration: "12m 34s",
    totalOrganizations: 15,
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-purple-500" />
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-sm text-slate-400">Full platform management and analytics</p>
              </div>
            </div>
            <Button asChild variant="outline" className="border-slate-700 text-white bg-transparent">
              <Link href="/">Back to Site</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Users</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalUsers || 0}</div>
              <p className="text-xs text-slate-500 mt-1">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalEvents || 0}</div>
              <p className="text-xs text-slate-500 mt-1">+8% from last month</p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Live Now</CardTitle>
              <Activity className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{liveEvents || 0}</div>
              <p className="text-xs text-slate-500 mt-1">{analytics.peakViewers} peak viewers</p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{analytics.totalViews.toLocaleString()}</div>
              <p className="text-xs text-slate-500 mt-1">Avg: {analytics.avgSessionDuration}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="bg-slate-900 border border-slate-800">
            <TabsTrigger value="events" className="data-[state=active]:bg-purple-600">
              Events
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-purple-600">
              Users
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="moderation" className="data-[state=active]:bg-purple-600">
              Moderation
            </TabsTrigger>
            <TabsTrigger value="organizations" className="data-[state=active]:bg-purple-600">
              Organizations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-4">
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-white">All Events</CardTitle>
                <CardDescription className="text-slate-400">Manage and moderate platform events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentEvents?.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-white truncate">{event.title}</p>
                          {event.is_live && <Badge className="bg-red-600 text-white border-0 text-xs">LIVE</Badge>}
                          {event.visibility === "private" && (
                            <Badge className="bg-yellow-600 text-white border-0 text-xs">PRIVATE</Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          by {event.organizer?.username} • {event.category?.name} • {event.viewer_count} viewers
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button asChild size="sm" variant="outline" className="border-slate-700 bg-transparent">
                          <Link href={`/events/${event.id}`}>View</Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-700 text-red-400 hover:bg-red-900/20 bg-transparent"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-white">User Management</CardTitle>
                <CardDescription className="text-slate-400">View and manage platform users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentUsers?.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url || "/placeholder.svg"}
                            alt={user.username}
                            className="h-10 w-10 rounded-full"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-medium">
                            {user.username[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-white">{user.username}</p>
                          <p className="text-xs text-slate-400">{user.email || "No email"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.role === "admin" && <Badge className="bg-purple-600 text-white border-0">Admin</Badge>}
                        <Button size="sm" variant="outline" className="border-slate-700 bg-transparent">
                          Manage
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="text-white">Platform Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Total Messages</span>
                    <span className="text-white font-bold">{totalMessages?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Avg Session Duration</span>
                    <span className="text-white font-bold">{analytics.avgSessionDuration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Peak Concurrent Users</span>
                    <span className="text-white font-bold">{analytics.peakViewers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Organizations</span>
                    <span className="text-white font-bold">{analytics.totalOrganizations}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="text-white">Top Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">🎮 Gaming</span>
                    <Badge className="bg-purple-600 text-white border-0">245 events</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">🎵 Music</span>
                    <Badge className="bg-purple-600 text-white border-0">189 events</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">💻 Tech</span>
                    <Badge className="bg-purple-600 text-white border-0">156 events</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">🎨 Art</span>
                    <Badge className="bg-purple-600 text-white border-0">98 events</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="moderation" className="space-y-4">
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-white">Moderation Queue</CardTitle>
                <CardDescription className="text-slate-400">Review flagged content and reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No pending moderation items</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="organizations" className="space-y-4">
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-white">Organizations</CardTitle>
                <CardDescription className="text-slate-400">Manage platform organizations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "Gaming Legends", members: 1250, events: 45 },
                    { name: "Tech Talks", members: 890, events: 32 },
                    { name: "Music Collective", members: 2100, events: 67 },
                  ].map((org, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50">
                      <div className="flex items-center gap-3">
                        <Building2 className="h-10 w-10 text-purple-400" />
                        <div>
                          <p className="text-sm font-medium text-white">{org.name}</p>
                          <p className="text-xs text-slate-400">
                            {org.members} members • {org.events} events
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="border-slate-700 bg-transparent">
                        Manage
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
