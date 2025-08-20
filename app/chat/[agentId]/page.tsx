"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Bot, User, Send, Copy, RefreshCw, Settings, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  isStreaming?: boolean
  metadata?: {
    toolsUsed?: string[]
    responseTime?: number
    tokens?: number
  }
}

interface Agent {
  id: string
  name: string
  description: string
  status: "active" | "inactive"
  configuration: {
    provider: string
    model: string
    temperature: number
    responseStyle: string
  }
  tools: string[]
}

export default function ChatPage({ params }: { params: { agentId: string } }) {
  const router = useRouter()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WebSocket | null>(null)

  // Mock agent data - in production this would fetch from API
  useEffect(() => {
    const mockAgent: Agent = {
      id: params.agentId,
      name: "Customer Support Bot",
      description: "Handles customer inquiries and support tickets",
      status: "active",
      configuration: {
        provider: "openai",
        model: "gpt-4",
        temperature: 0.7,
        responseStyle: "professional",
      },
      tools: ["knowledge-base", "web-search", "email"],
    }
    setAgent(mockAgent)

    // Initialize with welcome message
    const welcomeMessage: Message = {
      id: "welcome",
      role: "assistant",
      content: `Hello! I'm ${mockAgent.name}. ${mockAgent.description}. How can I help you today?`,
      timestamp: new Date(),
    }
    setMessages([welcomeMessage])
  }, [params.agentId])

  // WebSocket connection simulation
  useEffect(() => {
    // In production, this would establish a real WebSocket connection
    setIsConnected(true)

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  // Auto-scroll to bottom
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
    setIsTyping(true)

    // Simulate typing delay
    setTimeout(() => {
      setIsTyping(false)

      // Simulate agent response with streaming
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
        metadata: {
          toolsUsed: ["knowledge-base"],
          responseTime: 1200,
          tokens: 150,
        },
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Simulate streaming response
      const fullResponse = `Thank you for your question! Based on my knowledge base, I can help you with that. Let me provide you with a comprehensive answer that addresses your specific needs.

This is a simulated response that demonstrates the real-time streaming capability of the chat engine. In a production environment, this would be connected to the actual AI provider and would stream the response token by token.

Is there anything specific you'd like me to clarify or expand on?`

      let currentContent = ""
      const words = fullResponse.split(" ")

      words.forEach((word, index) => {
        setTimeout(() => {
          currentContent += (index > 0 ? " " : "") + word
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessage.id
                ? { ...msg, content: currentContent, isStreaming: index < words.length - 1 }
                : msg,
            ),
          )

          if (index === words.length - 1) {
            setIsLoading(false)
          }
        }, index * 50)
      })
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const regenerateResponse = (messageId: string) => {
    // In production, this would regenerate the AI response
    console.log("[v0] Regenerating response for message:", messageId)
  }

  if (!agent) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push("/")} className="p-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-heading font-bold text-lg">{agent.name}</h1>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                    {isConnected ? "Connected" : "Disconnected"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {agent.configuration.provider} • {agent.configuration.model}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear Chat
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="max-w-4xl mx-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                  }`}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback
                      className={message.role === "user" ? "bg-secondary" : "bg-primary text-primary-foreground"}
                    >
                      {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex-1 max-w-[80%] ${message.role === "user" ? "text-right" : ""}`}>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground ml-auto"
                          : "bg-card border border-border"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      {message.isStreaming && (
                        <div className="flex items-center mt-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-primary rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-primary rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div
                      className={`flex items-center mt-1 space-x-2 text-xs text-muted-foreground ${message.role === "user" ? "justify-end" : ""}`}
                    >
                      <span>{message.timestamp.toLocaleTimeString()}</span>
                      {message.metadata?.toolsUsed && (
                        <Badge variant="outline" className="text-xs">
                          Tools: {message.metadata.toolsUsed.join(", ")}
                        </Badge>
                      )}
                      {message.role === "assistant" && (
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => copyMessage(message.content)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => regenerateResponse(message.id)}
                          >
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-card border border-border rounded-lg px-4 py-2">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-border p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-end space-x-2">
                <div className="flex-1 relative">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="pr-12 min-h-[44px] resize-none"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    size="sm"
                    className="absolute right-1 top-1 h-8 w-8 p-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <div className="flex items-center space-x-4">
                  <span>Press Enter to send, Shift+Enter for new line</span>
                  {agent.tools.length > 0 && <span>Tools available: {agent.tools.join(", ")}</span>}
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
                  <span>{isConnected ? "Connected" : "Disconnected"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-border bg-card">
          <div className="p-4">
            <h3 className="font-heading font-bold mb-4">Agent Details</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground mt-1">{agent.description}</p>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium">Configuration</Label>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Provider:</span>
                    <span>{agent.configuration.provider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Model:</span>
                    <span>{agent.configuration.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Temperature:</span>
                    <span>{agent.configuration.temperature}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Style:</span>
                    <span className="capitalize">{agent.configuration.responseStyle}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium">Available Tools</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {agent.tools.map((tool) => (
                    <Badge key={tool} variant="outline" className="text-xs">
                      {tool.replace("-", " ")}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium">Session Stats</Label>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Messages:</span>
                    <span>{messages.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Session time:</span>
                    <span>5 min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}
