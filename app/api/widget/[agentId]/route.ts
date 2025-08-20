import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { agentId: string } }) {
  try {
    // In production, this would:
    // 1. Validate agent exists and is active
    // 2. Check widget permissions
    // 3. Return widget configuration
    // 4. Track widget loads for analytics

    const { searchParams } = new URL(request.url)
    const theme = searchParams.get("theme") || "light"
    const color = searchParams.get("color") || "#0891b2"

    // Mock widget configuration
    const widgetConfig = {
      agentId: params.agentId,
      name: "Customer Support Bot",
      theme,
      primaryColor: color,
      welcomeMessage: "Hi! How can I help you today?",
      placeholder: "Type your message...",
      status: "active",
    }

    return NextResponse.json(widgetConfig)
  } catch (error) {
    console.error("[v0] Widget config API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
