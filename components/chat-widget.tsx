"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, User, Send, Minimize2, Maximize2, X } from "lucide-react"

interface ChatWidgetProps {
  agentId: string
  agentName?: string
  position?: "bottom-right" | "bottom-left"
  theme?: "light" | "dark"
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function ChatWidget({
  agentId,
  agentName = "AI Assistant",
  position = "bottom-right",
  theme = "light",
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: Message = {
      id: "welcome",
      role: "assistant",
      content: `Hi! I'm ${agentName}. How can I help you today?`,
      timestamp: new Date(),
    }
    setMessages([welcomeMessage])
  }, [agentName])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content:
          "Thank you for your message! This is a simulated response from the chat widget. In production, this would connect to your agent's API.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const positionClasses = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  }

  if (!isOpen) {
    return (
      <div className={`fixed ${positionClasses[position]} z-50`}>
        <Button onClick={() => setIsOpen(true)} className="h-14 w-14 rounded-full shadow-lg" size="lg">
          <Bot className="h-6 w-6" />
        </Button>
      </div>
    )
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <Card className={`w-80 h-96 shadow-xl ${isMinimized ? "h-12" : ""}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 bg-primary text-primary-foreground rounded-t-lg">
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-primary-foreground text-primary text-xs">
                <Bot className="h-3 w-3" />
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-sm">{agentName}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-primary-foreground hover:bg-primary-foreground/20"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-primary-foreground hover:bg-primary-foreground/20"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-80">
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-2 ${
                      message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                    }`}
                  >
                    <Avatar className="h-6 w-6 flex-shrink-0">
                      <AvatarFallback
                        className={`text-xs ${message.role === "user" ? "bg-secondary" : "bg-primary text-primary-foreground"}`}
                      >
                        {message.role === "user" ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`rounded-lg px-3 py-2 max-w-[200px] text-sm ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-start space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        <Bot className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg px-3 py-2">
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div
                          className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-3 border-t">
              <div className="flex items-center space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  disabled={isLoading}
                  className="flex-1 h-8 text-sm"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Send className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
