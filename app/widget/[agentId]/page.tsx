"use client"

import { useEffect, useState } from "react"
import { ChatWidget } from "@/components/chat-widget"

interface WidgetPageProps {
  params: { agentId: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function WidgetPage({ params, searchParams }: WidgetPageProps) {
  const [config, setConfig] = useState({
    theme: "light" as "light" | "dark",
    primaryColor: "#0891b2",
    size: "medium" as "small" | "medium" | "large",
    welcomeMessage: "Hi! How can I help you today?",
    placeholder: "Type your message...",
  })

  useEffect(() => {
    // Parse URL parameters
    const theme = (searchParams.theme as string) || "light"
    const color = (searchParams.color as string) || "#0891b2"
    const size = (searchParams.size as string) || "medium"
    const welcome = (searchParams.welcome as string) || "Hi! How can I help you today?"
    const placeholder = (searchParams.placeholder as string) || "Type your message..."

    setConfig({
      theme: theme as "light" | "dark",
      primaryColor: color,
      size: size as "small" | "medium" | "large",
      welcomeMessage: decodeURIComponent(welcome),
      placeholder: decodeURIComponent(placeholder),
    })
  }, [searchParams])

  return (
    <div className="h-screen w-full">
      <ChatWidget agentId={params.agentId} agentName="AI Assistant" position="bottom-right" theme={config.theme} />
    </div>
  )
}
