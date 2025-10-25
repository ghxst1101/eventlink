import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="text-center space-y-6">
        <div className="text-8xl">🔍</div>
        <h1 className="text-4xl font-bold text-white">Event Not Found</h1>
        <p className="text-slate-400 max-w-md">The event you're looking for doesn't exist or has been removed.</p>
        <Button asChild className="bg-purple-600 hover:bg-purple-700">
          <Link href="/browse">Browse Events</Link>
        </Button>
      </div>
    </div>
  )
}
