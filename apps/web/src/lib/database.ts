import { Pool } from "pg"

export interface Agent {
  id: string
  tenantId: string
  name: string
  description: string
  systemPrompt: string
  configuration: {
    provider: "openai" | "anthropic" | "google"
    model: string
    temperature: number
    maxTokens: number
    responseStyle: "professional" | "casual" | "technical"
  }
  tools: string[]
  status: "active" | "inactive" | "draft"
  createdAt: Date
  updatedAt: Date
}

export interface Tool {
  id: string
  tenantId: string
  name: string
  type: "web-search" | "knowledge-base" | "email" | "calendar" | "crm" | "database"
  configuration: Record<string, any>
  status: "active" | "inactive"
  createdAt: Date
}

export interface Conversation {
  id: string
  agentId: string
  sessionId: string
  messages: Array<{
    id: string
    role: "user" | "assistant" | "system"
    content: string
    timestamp: Date
    metadata?: Record<string, any>
  }>
  createdAt: Date
  updatedAt: Date
}

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

export class Database {
  static async query(text: string, params?: any[]): Promise<any> {
    const client = await pool.connect()
    try {
      const result = await client.query(text, params)
      return result
    } finally {
      client.release()
    }
  }

  static async getAgentsByTenant(tenantId: string): Promise<Agent[]> {
    const query = `
      SELECT id, tenant_id as "tenantId", name, description, system_prompt as "systemPrompt",
             configuration, tools, status, created_at as "createdAt", updated_at as "updatedAt"
      FROM agents 
      WHERE tenant_id = $1 AND status != 'deleted'
      ORDER BY created_at DESC
    `
    const result = await this.query(query, [tenantId])
    return result.rows.map((row: any) => ({
      ...row,
      configuration: typeof row.configuration === "string" ? JSON.parse(row.configuration) : row.configuration,
      tools: Array.isArray(row.tools) ? row.tools : JSON.parse(row.tools || "[]"),
    }))
  }

  static async createAgent(agent: Omit<Agent, "id" | "createdAt" | "updatedAt">): Promise<Agent> {
    const query = `
      INSERT INTO agents (tenant_id, name, description, system_prompt, configuration, tools, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, tenant_id as "tenantId", name, description, system_prompt as "systemPrompt",
                configuration, tools, status, created_at as "createdAt", updated_at as "updatedAt"
    `
    const result = await this.query(query, [
      agent.tenantId,
      agent.name,
      agent.description,
      agent.systemPrompt,
      JSON.stringify(agent.configuration),
      JSON.stringify(agent.tools),
      agent.status,
    ])

    const row = result.rows[0]
    return {
      ...row,
      configuration: typeof row.configuration === "string" ? JSON.parse(row.configuration) : row.configuration,
      tools: Array.isArray(row.tools) ? row.tools : JSON.parse(row.tools || "[]"),
    }
  }

  static async getToolsByTenant(tenantId: string): Promise<Tool[]> {
    const query = `
      SELECT id, tenant_id as "tenantId", name, type, configuration, status, created_at as "createdAt"
      FROM tools 
      WHERE tenant_id = $1 AND status = 'active'
      ORDER BY created_at DESC
    `
    const result = await this.query(query, [tenantId])
    return result.rows.map((row: any) => ({
      ...row,
      configuration: typeof row.configuration === "string" ? JSON.parse(row.configuration) : row.configuration,
    }))
  }

  static async createTool(tool: Omit<Tool, "id" | "createdAt">): Promise<Tool> {
    const query = `
      INSERT INTO tools (tenant_id, name, type, configuration, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, tenant_id as "tenantId", name, type, configuration, status, created_at as "createdAt"
    `
    const result = await this.query(query, [
      tool.tenantId,
      tool.name,
      tool.type,
      JSON.stringify(tool.configuration),
      tool.status,
    ])

    const row = result.rows[0]
    return {
      ...row,
      configuration: typeof row.configuration === "string" ? JSON.parse(row.configuration) : row.configuration,
    }
  }

  static async getConversation(conversationId: string): Promise<Conversation | null> {
    const query = `
      SELECT id, agent_id as "agentId", session_id as "sessionId", messages, 
             created_at as "createdAt", updated_at as "updatedAt"
      FROM conversations 
      WHERE id = $1
    `
    const result = await this.query(query, [conversationId])
    if (result.rows.length === 0) return null

    const row = result.rows[0]
    return {
      ...row,
      messages: Array.isArray(row.messages) ? row.messages : JSON.parse(row.messages || "[]"),
    }
  }

  static async saveConversation(conversation: Conversation): Promise<void> {
    const query = `
      INSERT INTO conversations (id, agent_id, session_id, messages, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        messages = $4,
        updated_at = $6
    `
    await this.query(query, [
      conversation.id,
      conversation.agentId,
      conversation.sessionId,
      JSON.stringify(conversation.messages),
      conversation.createdAt,
      conversation.updatedAt,
    ])
  }
}
