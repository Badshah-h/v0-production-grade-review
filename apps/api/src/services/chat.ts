import { DatabaseService } from "@axonstream/database"
import type { ChatSession, ChatMessage } from "@axonstream/types"
import { v4 as uuidv4 } from "uuid"

export class ChatService {
  private db: DatabaseService

  constructor() {
    this.db = new DatabaseService()
  }

  async startSession(agentId: string, userId: string, organizationId: string): Promise<ChatSession> {
    // Verify agent belongs to organization
    const agentQuery = `
      SELECT id FROM agents 
      WHERE id = $1 AND organization_id = $2 AND status = 'active'
    `
    const agentResult = await this.db.query(agentQuery, [agentId, organizationId])

    if (agentResult.rows.length === 0) {
      throw new Error("Agent not found")
    }

    const sessionId = uuidv4()
    const query = `
      INSERT INTO chat_sessions (id, agent_id, user_id, organization_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `

    const result = await this.db.query(query, [sessionId, agentId, userId, organizationId])
    return result.rows[0]
  }

  async sendMessage(data: {
    agentId: string
    sessionId: string
    message: string
    userId: string
    organizationId: string
  }): Promise<ChatMessage> {
    // Verify session belongs to user and organization
    const sessionQuery = `
      SELECT cs.*, a.system_prompt, a.settings, a.provider
      FROM chat_sessions cs
      JOIN agents a ON cs.agent_id = a.id
      WHERE cs.id = $1 AND cs.user_id = $2 AND cs.organization_id = $3
    `
    const sessionResult = await this.db.query(sessionQuery, [data.sessionId, data.userId, data.organizationId])

    if (sessionResult.rows.length === 0) {
      throw new Error("Session not found")
    }

    const session = sessionResult.rows[0]

    // Store user message
    const userMessageQuery = `
      INSERT INTO chat_messages (session_id, role, content, metadata)
      VALUES ($1, 'user', $2, $3)
      RETURNING *
    `

    await this.db.query(userMessageQuery, [data.sessionId, data.message, JSON.stringify({ timestamp: new Date() })])

    // Generate AI response (mock for now)
    const aiResponse = await this.generateAIResponse(data.message, session)

    // Store AI response
    const aiMessageQuery = `
      INSERT INTO chat_messages (session_id, role, content, metadata)
      VALUES ($1, 'assistant', $2, $3)
      RETURNING *
    `

    const result = await this.db.query(aiMessageQuery, [
      data.sessionId,
      aiResponse,
      JSON.stringify({
        timestamp: new Date(),
        provider: session.provider,
        model: session.settings?.model || "default",
      }),
    ])

    return result.rows[0]
  }

  async getChatHistory(sessionId: string, organizationId: string): Promise<ChatMessage[]> {
    const query = `
      SELECT cm.*
      FROM chat_messages cm
      JOIN chat_sessions cs ON cm.session_id = cs.id
      WHERE cm.session_id = $1 AND cs.organization_id = $2
      ORDER BY cm.created_at ASC
    `

    const result = await this.db.query(query, [sessionId, organizationId])
    return result.rows
  }

  private async generateAIResponse(message: string, session: any): Promise<string> {
    // Mock AI response - in production, integrate with OpenAI/Anthropic
    const responses = [
      "I understand your request. Let me help you with that.",
      "That's an interesting question. Based on the information provided...",
      "I can assist you with this. Here's what I recommend...",
      "Thank you for your message. Let me provide you with a detailed response.",
    ]

    return responses[Math.floor(Math.random() * responses.length)]
  }
}
