"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Send, MessageSquare } from "lucide-react"

export interface Conversation {
  enquiry_id: string
  enquiry_title: string
  enquiry_status: string
  contact_id: string
  contact_name: string
  contact_company: string | null
  contact_city: string | null
  contact_state: string | null
  last_message: string | null
  last_message_at: string | null
  last_message_sender_id: string | null
  unread_count: number
}

interface Message {
  id: string
  sender_id: string
  recipient_id: string
  body: string
  read_at: string | null
  created_at: string
}

const POLL_MS = 10000

const threadKey = (c: Pick<Conversation, "enquiry_id" | "contact_id">) => `${c.enquiry_id}:${c.contact_id}`

function formatTime(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const sameDay = d.toDateString() === today.toDateString()
  return sameDay
    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString([], { day: "numeric", month: "short" })
}

export default function MessagesView({
  currentUserId,
  counterpartyLabel,
  enquiryHrefBase,
}: {
  currentUserId: string
  /** "Suppliers" for a buyer, "Buyers" for a seller - only affects copy. */
  counterpartyLabel: string
  /** Each role reads enquiries under its own dashboard path. */
  enquiryHrefBase: string
}) {
  const searchParams = useSearchParams()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const selected = conversations.find((c) => threadKey(c) === selectedKey) ?? null

  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/messages/conversations")
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to load conversations")
      setConversations(data.conversations ?? [])
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load conversations")
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load, then poll so a reply from the other side shows up without a
  // manual refresh. Deliberately polling rather than websockets - the backend
  // is a stateless Express app behind Render's free tier.
  useEffect(() => {
    loadConversations()
    const id = setInterval(loadConversations, POLL_MS)
    return () => clearInterval(id)
  }, [loadConversations])

  // Open the thread named in the query string (the "Message" buttons on the
  // enquiry and quote pages link straight here), else the first conversation.
  useEffect(() => {
    if (selectedKey || conversations.length === 0) return
    const enquiryId = searchParams.get("enquiry_id")
    const contactId = searchParams.get("contact_id")
    const deepLinked =
      enquiryId && contactId
        ? conversations.find((c) => c.enquiry_id === enquiryId && c.contact_id === contactId)
        : null
    setSelectedKey(threadKey(deepLinked ?? conversations[0]))
  }, [conversations, searchParams, selectedKey])

  const loadThread = useCallback(async (conv: Conversation) => {
    const params = new URLSearchParams({ enquiry_id: conv.enquiry_id, contact_id: conv.contact_id })
    try {
      const res = await fetch(`/api/messages/thread?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to load conversation")
      setMessages(data.messages ?? [])
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load conversation")
    }
  }, [])

  useEffect(() => {
    if (!selected) return
    loadThread(selected)
    const id = setInterval(() => loadThread(selected), POLL_MS)
    return () => clearInterval(id)
  }, [selectedKey, loadThread]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages])

  const handleSend = async () => {
    const body = draft.trim()
    if (!body || !selected || sending) return
    setSending(true)
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enquiry_id: selected.enquiry_id, contact_id: selected.contact_id, body }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to send message")
      setMessages((prev) => [...prev, data.message])
      setDraft("")
      setError(null)
      loadConversations()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send message")
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return <p className="text-foreground/60">Loading conversations...</p>
  }

  if (conversations.length === 0) {
    return (
      <Card className="p-10 text-center">
        <MessageSquare className="mx-auto mb-4 text-foreground/30" size={40} />
        <h2 className="text-lg font-semibold mb-2">No conversations yet</h2>
        <p className="text-sm text-foreground/60 max-w-md mx-auto">
          Conversations open automatically once a quote connects you to a counterparty. Until then there is
          nobody to message.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 h-[calc(100vh-260px)] min-h-[420px]">
        {/* Conversation list */}
        <Card className="p-4 overflow-y-auto">
          <h2 className="font-semibold mb-4 text-sm text-foreground/60 uppercase tracking-wide">
            {counterpartyLabel}
          </h2>
          <div className="space-y-2">
            {conversations.map((conv) => {
              const key = threadKey(conv)
              return (
                <button
                  key={key}
                  onClick={() => setSelectedKey(key)}
                  className={`w-full text-left p-3 rounded-lg transition-colors border ${
                    selectedKey === key ? "bg-primary/10 border-primary" : "hover:bg-muted border-transparent"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{conv.contact_company || conv.contact_name}</p>
                      <p className="text-xs text-foreground/50 truncate">{conv.enquiry_title}</p>
                      <p className="text-xs text-foreground/60 truncate mt-1">
                        {conv.last_message ?? "No messages yet"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {conv.last_message_at && (
                        <span className="text-[10px] text-foreground/40">{formatTime(conv.last_message_at)}</span>
                      )}
                      {conv.unread_count > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs rounded-full min-w-5 h-5 px-1.5 flex items-center justify-center">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </Card>

        {/* Thread */}
        <Card className="lg:col-span-2 p-6 flex flex-col">
          {selected && (
            <div className="pb-4 mb-4 border-b border-border">
              <p className="font-semibold">{selected.contact_company || selected.contact_name}</p>
              <p className="text-xs text-foreground/60">
                {selected.contact_name}
                {selected.contact_city ? ` · ${selected.contact_city}` : ""} · re:{" "}
                <Link href={`${enquiryHrefBase}/${selected.enquiry_id}`} className="underline">
                  {selected.enquiry_title}
                </Link>
              </p>
            </div>
          )}

          <div ref={scrollRef} className="flex-1 overflow-y-auto mb-4 space-y-3">
            {messages.length === 0 ? (
              <p className="text-sm text-foreground/50 text-center py-8">
                No messages yet — say hello to start the conversation.
              </p>
            ) : (
              messages.map((msg) => {
                const mine = msg.sender_id === currentUserId
                return (
                  <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-sm px-4 py-2 rounded-lg ${
                        mine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.body}</p>
                      <p className="text-[10px] opacity-70 mt-1">{formatTime(msg.created_at)}</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button onClick={handleSend} size="sm" disabled={sending || !draft.trim()}>
              <Send size={18} />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
