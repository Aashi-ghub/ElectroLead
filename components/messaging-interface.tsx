"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Phone, Video } from "lucide-react"

interface Message {
  id: string
  sender: "user" | "supplier"
  content: string
  timestamp: string
  avatar?: string
}

export function MessagingInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "supplier",
      content: "Hi! I can provide the LED lighting units you requested. What's your timeline?",
      timestamp: "10:30 AM",
    },
    {
      id: "2",
      sender: "user",
      content: "We need them by end of month. Can you provide a quote?",
      timestamp: "10:35 AM",
    },
    {
      id: "3",
      sender: "supplier",
      content: "For 1000 units, we can offer $8.50 per unit with bulk discount. Delivery included.",
      timestamp: "10:40 AM",
    },
  ])
  const [newMessage, setNewMessage] = useState("")

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([
        ...messages,
        {
          id: String(messages.length + 1),
          sender: "user",
          content: newMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ])
      setNewMessage("")
    }
  }

  return (
    <Card className="max-w-2xl h-96 flex flex-col">
      <CardHeader className="border-b border-border pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>ElectroSupply Co.</CardTitle>
            <p className="text-sm text-foreground/60">Verified Supplier • Response time: 2 hours</p>
          </div>
          <div className="flex gap-2">
            <Button size="icon" variant="outline">
              <Phone size={18} />
            </Button>
            <Button size="icon" variant="outline">
              <Video size={18} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                message.sender === "user"
                  ? "bg-primary text-primary-foreground rounded-br-none"
                  : "bg-muted text-foreground rounded-bl-none"
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
            </div>
          </div>
        ))}
      </CardContent>

      <div className="border-t border-border p-4 flex gap-2">
        <Input
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <Button size="icon" className="bg-primary hover:bg-primary/90" onClick={handleSendMessage}>
          <Send size={18} />
        </Button>
      </div>
    </Card>
  )
}
