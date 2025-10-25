"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QrCode, Copy, Check } from "lucide-react"

interface QRCodeDisplayProps {
  eventId: string
  joinCode: string
  eventTitle: string
}

export function QRCodeDisplay({ eventId, joinCode, eventTitle }: QRCodeDisplayProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const joinUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/join/${joinCode}`

  useEffect(() => {
    // Generate QR code using QR Server API
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(joinUrl)}`
    setQrCodeUrl(qrUrl)
  }, [joinUrl])

  const copyJoinCode = async () => {
    await navigator.clipboard.writeText(joinCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyJoinUrl = async () => {
    await navigator.clipboard.writeText(joinUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="border-slate-800 bg-slate-900/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <QrCode className="h-5 w-5 text-purple-400" />
          Quick Join
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code */}
        <div className="flex justify-center p-4 bg-white rounded-lg">
          {qrCodeUrl && <img src={qrCodeUrl || "/placeholder.svg"} alt="QR Code" className="w-48 h-48" />}
        </div>

        {/* Join Code */}
        <div className="space-y-2">
          <p className="text-sm text-slate-400 text-center">Scan QR code or use join code:</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-4 py-3 bg-slate-800 rounded-lg text-center">
              <p className="text-2xl font-bold text-white tracking-wider">{joinCode}</p>
            </div>
            <Button size="icon" variant="outline" onClick={copyJoinCode} className="border-slate-700 bg-transparent">
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Join URL */}
        <div className="space-y-2">
          <p className="text-sm text-slate-400">Or share this link:</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 bg-slate-800 rounded-lg">
              <p className="text-xs text-slate-300 truncate">{joinUrl}</p>
            </div>
            <Button size="icon" variant="outline" onClick={copyJoinUrl} className="border-slate-700 bg-transparent">
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
