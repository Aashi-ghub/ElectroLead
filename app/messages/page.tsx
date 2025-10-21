"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Send, Search } from "lucide-react"
import AppNavbar from "@/components/app-navbar"

export default function MessagesPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)
  const [selectedChat, setSelectedChat] = useState<number | null>(0)
  const [messageText, setMessageText] = useState("")
  const [chats] = useState([
    {
      id: 1,
      name: "Raj Electronics",
      role: "Buyer",
      lastMessage: "Can you provide a quote for 100 units?",
      timestamp: "2 hours ago",
      unread: 2,
      messages: [
        { id: 1, sender: "Raj Electronics", text: "Hi, interested in your products", time: "10:30 AM" },
        { id: 2, sender: "You", text: "Hello! Yes, we have great options", time: "10:35 AM" },
        { id: 3, sender: "Raj Electronics", text: "Can you provide a quote for 100 units?", time: "10:40 AM" },
      ],
    },
    {
      id: 2,
      name: "Electra Power",
      role: "Supplier",
      lastMessage: "Quote sent successfully",
      timestamp: "1 day ago",
      unread: 0,
      messages: [
        { id: 1, sender: "Electra Power", text: "We have the best prices", time: "Yesterday" },
        { id: 2, sender: "You", text: "Thanks for the offer", time: "Yesterday" },
      ],
    },
  ])

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/auth/login")
    } else {
      setUser(JSON.parse(storedUser))
    }
  }, [router])

  const handleSendMessage = () => {
    if (messageText.trim()) {
      setMessageText("")
    }
  }

  if (!user) return null

  const currentChat = chats[selectedChat || 0]

  return (
    <main className="min-h-screen bg-background">
      <AppNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 h-[calc(100vh-200px)] lg:h-[600px]">
          {/* Chat List */}
          <div className="lg:col-span-1 bg-white rounded-lg border border-border flex flex-col order-2 lg:order-1">
            <div className="p-3 lg:p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-primary mb-3 lg:mb-4">Messages</h2>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                <input
                  type="text"
                  placeholder="Search chats..."
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-sm"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {chats.map((chat, idx) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(idx)}
                  className={`w-full p-3 lg:p-4 border-b border-border text-left transition-colors ${
                    selectedChat === idx ? "bg-primary/5 border-l-2 border-l-accent" : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-foreground">{chat.name}</h3>
                    {chat.unread > 0 && (
                      <span className="bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded-full">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-foreground/60 mb-1">{chat.role}</p>
                  <p className="text-sm text-foreground/60 truncate">{chat.lastMessage}</p>
                  <p className="text-xs text-foreground/40 mt-1">{chat.timestamp}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-border flex flex-col order-1 lg:order-2">
            {currentChat ? (
              <>
                {/* Chat Header */}
                <div className="p-3 lg:p-4 border-b border-border flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-primary truncate">{currentChat.name}</h3>
                    <p className="text-xs text-foreground/60">{currentChat.role}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-3 lg:space-y-4">
                  {currentChat.messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === "You" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] sm:max-w-xs px-3 lg:px-4 py-2 rounded-lg ${
                          msg.sender === "You" ? "bg-primary text-white" : "bg-muted text-foreground"
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-xs mt-1 ${msg.sender === "You" ? "text-white/70" : "text-foreground/60"}`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-3 lg:p-4 border-t border-border">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-3 lg:px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-sm"
                    />
                    <button onClick={handleSendMessage} className="btn-primary flex items-center gap-1 lg:gap-2 px-3 lg:px-4">
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-foreground/60">
                <p>Select a chat to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
