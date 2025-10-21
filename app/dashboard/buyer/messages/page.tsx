"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Send } from "lucide-react"

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(0)
  const [message, setMessage] = useState("")

  const conversations = [
    {
      id: 1,
      name: "Raj Electronics",
      avatar: "🏭",
      lastMessage: "Can we discuss bulk pricing?",
      unread: 3,
      messages: [
        { sender: "them", text: "Hi, interested in your cables", time: "14:30" },
        { sender: "you", text: "We can offer 5% discount for orders above ₹50L", time: "14:35" },
        { sender: "them", text: "What about delivery time?", time: "14:40" },
      ],
    },
    {
      id: 2,
      name: "Power Solutions",
      avatar: "⚡",
      lastMessage: "Transformer enquiry",
      unread: 0,
      messages: [{ sender: "them", text: "We have stock available", time: "10:15" }],
    },
  ]

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessage("")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link href="/dashboard/buyer">
            <button className="text-foreground/60 hover:text-foreground">
              <ArrowLeft size={24} />
            </button>
          </Link>
          <h1 className="text-2xl font-bold">Messages</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <Card className="p-4 overflow-y-auto">
            <h2 className="font-semibold mb-4">Conversations</h2>
            <div className="space-y-2">
              {conversations.map((conv, idx) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(idx)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedConversation === idx
                      ? "bg-primary/10 border border-primary"
                      : "hover:bg-muted border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{conv.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{conv.name}</p>
                      <p className="text-xs text-foreground/60 truncate">{conv.lastMessage}</p>
                    </div>
                    {conv.unread > 0 && (
                      <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Chat Area */}
          <Card className="md:col-span-2 p-6 flex flex-col">
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
              {conversations[selectedConversation].messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === "you" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.sender === "you" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-xs opacity-70 mt-1">{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button onClick={handleSendMessage} size="sm">
                <Send size={18} />
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
