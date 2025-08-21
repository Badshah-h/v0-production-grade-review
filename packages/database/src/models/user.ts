import type { User, UserRole } from "@axonstream/types"
import { db } from "../connection"

export class UserModel {
  static async create(userData: {
    email: string
    name: string
    passwordHash: string
    organizationId: string
    role: UserRole
  }): Promise<User> {
    const query = `
      INSERT INTO users (email, name, password_hash, organization_id, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, name, organization_id, role, is_active, created_at, updated_at
    `
    const result = await db.query(query, [
      userData.email,
      userData.name,
      userData.passwordHash,
      userData.organizationId,
      userData.role,
    ])

    return this.mapRowToUser(result.rows[0])
  }

  static async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, email, name, organization_id, role, is_active, created_at, updated_at
      FROM users WHERE email = $1 AND is_active = true
    `
    const result = await db.query(query, [email])

    if (result.rows.length === 0) return null
    return this.mapRowToUser(result.rows[0])
  }

  static async findById(id: string): Promise<User | null> {
    const query = `
      SELECT id, email, name, organization_id, role, is_active, created_at, updated_at
      FROM users WHERE id = $1 AND is_active = true
    `
    const result = await db.query(query, [id])

    if (result.rows.length === 0) return null
    return this.mapRowToUser(result.rows[0])
  }

  static async findByOrganization(
    organizationId: string,
    page = 1,
    limit = 10,
  ): Promise<{
    users: User[]
    total: number
  }> {
    const offset = (page - 1) * limit

    const countQuery = "SELECT COUNT(*) FROM users WHERE organization_id = $1 AND is_active = true"
    const countResult = await db.query(countQuery, [organizationId])
    const total = Number.parseInt(countResult.rows[0].count)

    const query = `
      SELECT id, email, name, organization_id, role, is_active, created_at, updated_at
      FROM users 
      WHERE organization_id = $1 AND is_active = true
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `
    const result = await db.query(query, [organizationId, limit, offset])

    return {
      users: result.rows.map(this.mapRowToUser),
      total,
    }
  }

  static async getPasswordHash(email: string): Promise<string | null> {
    const query = "SELECT password_hash FROM users WHERE email = $1 AND is_active = true"
    const result = await db.query(query, [email])

    if (result.rows.length === 0) return null
    return result.rows[0].password_hash
  }

  static async updateRole(userId: string, role: UserRole, organizationId: string): Promise<User | null> {
    const query = `
      UPDATE users 
      SET role = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND organization_id = $3 AND is_active = true
      RETURNING id, email, name, organization_id, role, is_active, created_at, updated_at
    `
    const result = await db.query(query, [role, userId, organizationId])

    if (result.rows.length === 0) return null
    return this.mapRowToUser(result.rows[0])
  }

  private static mapRowToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      organizationId: row.organization_id,
      role: row.role as UserRole,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }
}
