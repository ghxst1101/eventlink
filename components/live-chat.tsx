"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { ChatMessage } from "@/lib/types/database"

interface LiveChatProps {
  eventId: string
  userId: string
  username: string
  isModerator?: boolean
}

interface ChatMessageWithProfile extends ChatMessage {
  profile: {
    username: string
    avatar_url: string | null
  }
}

export function LiveChat({ eventId, userId, username, isModerator = false }: LiveChatProps) {
  const [messages, setMessages] = useState<ChatMessageWithProfile[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    loadMessages()

    const channel = supabase
      .channel(`chat:${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `event_id=eq.${eventId}`,
        },
        async (payload) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("username, avatar_url")
            .eq("id", payload.new.user_id)
            .single()

          if (profile) {
            setMessages((prev) => [
              ...prev,
              {
                ...(payload.new as ChatMessage),
                profile,
              },
            ])
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "chat_messages",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          setMessages((prev) => prev.filter((msg) => msg.id !== payload.old.id))
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async () => {
    const { data } = await supabase
      .from("chat_messages")
      .select(
        `
        *,
        profile:profiles(username, avatar_url)
      `,
      )
      .eq("event_id", eventId)
      .order("created_at", { ascending: true })
      .limit(100)

    if (data) {
      setMessages(data as ChatMessageWithProfile[])
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isLoading) return

    setIsLoading(true)
    try {
      await supabase.from("chat_messages").insert({
        event_id: eventId,
        user_id: userId,
        message: newMessage.trim(),
      })
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!isModerator) return

    try {
      await supabase.from("chat_messages").delete().eq("id", messageId)
    } catch (error) {
      console.error("Error deleting message:", error)
    }
  }

  return (
    <div className="flex flex-col h-[500px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.length === 0 ? (
          <div className="text-center text-slate-500 py-8">No messages yet. Be the first to say something!</div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex gap-3 group">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={msg.profile.avatar_url || undefined} />
                <AvatarFallback className="bg-purple-600 text-xs">
                  {msg.profile.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-white text-sm">{msg.profile.username}</span>
                  <span className="text-xs text-slate-500">
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                  </span>
                  {isModerator && msg.user_id !== userId && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <p className="text-sm text-slate-300 break-words">{msg.message}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Send a message..."
          className="flex-1 bg-slate-800 border-slate-700 text-white"
          maxLength={500}
          disabled={isLoading}
        />
        <Button
          type="submit"
          disabled={isLoading || !newMessage.trim()}
          size="icon"
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
