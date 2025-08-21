import { DatabaseService } from "@axonstream/database"
import type { Agent, CreateAgentRequest, UpdateAgentRequest } from "@axonstream/types"

export class AgentService {
  private db: DatabaseService

  constructor() {
    this.db = new DatabaseService()
  }

  async createAgent(data: CreateAgentRequest & { organizationId: string; createdBy: string }): Promise<Agent> {
    const query = `
      INSERT INTO agents (name, description, system_prompt, personality, tools, provider, settings, organization_id, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `

    const values = [
      data.name,
      data.description || null,
      data.systemPrompt,
      JSON.stringify(data.personality),
      JSON.stringify(data.tools),
      data.provider,
      JSON.stringify(data.settings),
      data.organizationId,
      data.createdBy,
    ]

    const result = await this.db.query(query, values)
    return result.rows[0]
  }

  async getAgentsByOrganization(organizationId: string): Promise<Agent[]> {
    const query = `
      SELECT a.*, u.name as creator_name
      FROM agents a
      LEFT JOIN users u ON a.created_by = u.id
      WHERE a.organization_id = $1 AND a.status = 'active'
      ORDER BY a.created_at DESC
    `

    const result = await this.db.query(query, [organizationId])
    return result.rows
  }

  async getAgentById(id: string, organizationId: string): Promise<Agent | null> {
    const query = `
      SELECT a.*, u.name as creator_name
      FROM agents a
      LEFT JOIN users u ON a.created_by = u.id
      WHERE a.id = $1 AND a.organization_id = $2 AND a.status = 'active'
    `

    const result = await this.db.query(query, [id, organizationId])
    return result.rows[0] || null
  }

  async updateAgent(id: string, data: UpdateAgentRequest, organizationId: string): Promise<Agent | null> {
    const updates: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (data.name) {
      updates.push(`name = $${paramCount++}`)
      values.push(data.name)
    }

    if (data.description !== undefined) {
      updates.push(`description = $${paramCount++}`)
      values.push(data.description)
    }

    if (data.systemPrompt) {
      updates.push(`system_prompt = $${paramCount++}`)
      values.push(data.systemPrompt)
    }

    if (data.personality) {
      updates.push(`personality = $${paramCount++}`)
      values.push(JSON.stringify(data.personality))
    }

    if (data.tools) {
      updates.push(`tools = $${paramCount++}`)
      values.push(JSON.stringify(data.tools))
    }

    if (data.provider) {
      updates.push(`provider = $${paramCount++}`)
      values.push(data.provider)
    }

    if (data.settings) {
      updates.push(`settings = $${paramCount++}`)
      values.push(JSON.stringify(data.settings))
    }

    if (updates.length === 0) {
      return this.getAgentById(id, organizationId)
    }

    updates.push(`updated_at = NOW()`)
    values.push(id, organizationId)

    const query = `
      UPDATE agents
      SET ${updates.join(", ")}
      WHERE id = $${paramCount++} AND organization_id = $${paramCount++} AND status = 'active'
      RETURNING *
    `

    const result = await this.db.query(query, values)
    return result.rows[0] || null
  }

  async deleteAgent(id: string, organizationId: string): Promise<void> {
    const query = `
      UPDATE agents
      SET status = 'deleted', updated_at = NOW()
      WHERE id = $1 AND organization_id = $2
    `

    await this.db.query(query, [id, organizationId])
  }
}
