import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import type { NextRequest } from "next/server"
import { Database } from "./database"

export interface User {
  id: string
  email: string
  name: string
  organizationId: string
  role: "admin" | "manager" | "user"
  permissions: string[]
  createdAt: Date
  lastLoginAt?: Date
}

export interface Organization {
  id: string
  name: string
  plan: "free" | "pro" | "enterprise"
  settings: {
    maxAgents: number
    maxTools: number
    apiCallsPerMonth: number
  }
  createdAt: Date
}

export interface LoginResult {
  user: User
  token: string
}

export interface RegisterResult {
  user: User
  organization: Organization
}

const ROLE_PERMISSIONS = {
  admin: ["manage_users", "manage_organization", "create_agents", "manage_tools", "view_analytics"],
  manager: ["create_agents", "manage_tools", "view_analytics", "manage_team_users"],
  user: ["create_agents", "view_own_agents"],
}

export class AuthService {
  private static JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"
  private static SALT_ROUNDS = 12

  static async register(
    email: string,
    password: string,
    name: string,
    organizationName: string,
  ): Promise<RegisterResult> {
    // Check if user already exists
    const existingUserQuery = "SELECT id FROM users WHERE email = $1"
    const existingUser = await Database.query(existingUserQuery, [email])

    if (existingUser.rows.length > 0) {
      throw new Error("User with this email already exists")
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS)

    // Create organization first
    const orgQuery = `
      INSERT INTO organizations (name, plan, settings)
      VALUES ($1, $2, $3)
      RETURNING id, name, plan, settings, created_at as "createdAt"
    `
    const orgResult = await Database.query(orgQuery, [
      organizationName,
      "free",
      JSON.stringify({
        maxAgents: 5,
        maxTools: 3,
        apiCallsPerMonth: 1000,
      }),
    ])

    const organization = {
      ...orgResult.rows[0],
      settings:
        typeof orgResult.rows[0].settings === "string"
          ? JSON.parse(orgResult.rows[0].settings)
          : orgResult.rows[0].settings,
    }

    // Create user
    const userQuery = `
      INSERT INTO users (organization_id, email, password_hash, first_name, last_name, role, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, organization_id as "organizationId", email, 
                CONCAT(first_name, ' ', last_name) as name, role, 
                created_at as "createdAt"
    `
    const [firstName, ...lastNameParts] = name.split(" ")
    const lastName = lastNameParts.join(" ") || ""

    const userResult = await Database.query(userQuery, [
      organization.id,
      email,
      passwordHash,
      firstName,
      lastName,
      "admin", // First user in organization is admin
      "active",
    ])

    const user: User = {
      ...userResult.rows[0],
      permissions: ROLE_PERMISSIONS.admin,
    }

    return { user, organization }
  }

  static async login(email: string, password: string): Promise<LoginResult> {
    // Find user by email with organization info
    const query = `
      SELECT u.id, u.organization_id as "organizationId", u.email, 
             CONCAT(u.first_name, ' ', u.last_name) as name, 
             u.role, u.password_hash as "passwordHash", u.created_at as "createdAt",
             u.last_login as "lastLoginAt"
      FROM users u
      WHERE u.email = $1 AND u.status = 'active'
    `
    const result = await Database.query(query, [email])

    if (result.rows.length === 0) {
      throw new Error("Invalid email or password")
    }

    const foundUser = result.rows[0]

    // Verify password
    const isValidPassword = await bcrypt.compare(password, foundUser.passwordHash)
    if (!isValidPassword) {
      throw new Error("Invalid email or password")
    }

    // Update last login
    const updateLoginQuery = "UPDATE users SET last_login = NOW() WHERE id = $1"
    await Database.query(updateLoginQuery, [foundUser.id])

    // Generate JWT token
    const token = jwt.sign({ userId: foundUser.id, organizationId: foundUser.organizationId }, this.JWT_SECRET, {
      expiresIn: "7d",
    })

    // Store session in database
    const sessionQuery = `
      INSERT INTO sessions (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
      ON CONFLICT (token_hash) DO UPDATE SET expires_at = $3
    `
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)
    await Database.query(sessionQuery, [foundUser.id, token, expiresAt])

    const user: User = {
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name,
      organizationId: foundUser.organizationId,
      role: foundUser.role,
      permissions: ROLE_PERMISSIONS[foundUser.role as keyof typeof ROLE_PERMISSIONS],
      createdAt: foundUser.createdAt,
      lastLoginAt: foundUser.lastLoginAt,
    }

    return { user, token }
  }

  static async getCurrentUser(token: string): Promise<User | null> {
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, this.JWT_SECRET) as { userId: string; organizationId: string }

      // Check session in database
      const sessionQuery = `
        SELECT s.user_id, s.expires_at
        FROM sessions s
        WHERE s.token_hash = $1 AND s.expires_at > NOW()
      `
      const sessionResult = await Database.query(sessionQuery, [token])

      if (sessionResult.rows.length === 0) {
        return null
      }

      // Get user with organization info
      const userQuery = `
        SELECT u.id, u.organization_id as "organizationId", u.email,
               CONCAT(u.first_name, ' ', u.last_name) as name,
               u.role, u.created_at as "createdAt", u.last_login as "lastLoginAt"
        FROM users u
        WHERE u.id = $1 AND u.status = 'active'
      `
      const userResult = await Database.query(userQuery, [decoded.userId])

      if (userResult.rows.length === 0) {
        return null
      }

      const user = userResult.rows[0]
      return {
        ...user,
        permissions: ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS],
      }
    } catch (error) {
      return null
    }
  }

  static hasPermission(user: User, permission: string): boolean {
    return user.permissions.includes(permission)
  }

  static async getOrganizationUsers(organizationId: string): Promise<User[]> {
    const query = `
      SELECT u.id, u.organization_id as "organizationId", u.email,
             CONCAT(u.first_name, ' ', u.last_name) as name,
             u.role, u.created_at as "createdAt", u.last_login as "lastLoginAt"
      FROM users u
      WHERE u.organization_id = $1 AND u.status = 'active'
      ORDER BY u.created_at DESC
    `
    const result = await Database.query(query, [organizationId])

    return result.rows.map((user: any) => ({
      ...user,
      permissions: ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS],
    }))
  }

  static async updateUserRole(
    userId: string,
    newRole: "admin" | "manager" | "user",
    currentUserId: string,
  ): Promise<User> {
    // Get both users and verify they're in same organization
    const query = `
      SELECT u1.id as user_id, u1.organization_id as user_org, u1.role as user_role,
             CONCAT(u1.first_name, ' ', u1.last_name) as user_name, u1.email as user_email,
             u1.created_at as user_created, u1.last_login as user_last_login,
             u2.id as current_user_id, u2.organization_id as current_user_org, u2.role as current_user_role
      FROM users u1, users u2
      WHERE u1.id = $1 AND u2.id = $2 AND u1.status = 'active' AND u2.status = 'active'
    `
    const result = await Database.query(query, [userId, currentUserId])

    if (result.rows.length === 0) {
      throw new Error("User not found")
    }

    const row = result.rows[0]

    // Check if users are in same organization
    if (row.user_org !== row.current_user_org) {
      throw new Error("Cannot modify users from different organizations")
    }

    // Check permissions
    const currentUser: User = {
      id: row.current_user_id,
      organizationId: row.current_user_org,
      role: row.current_user_role,
      permissions: ROLE_PERMISSIONS[row.current_user_role as keyof typeof ROLE_PERMISSIONS],
      email: "",
      name: "",
      createdAt: new Date(),
    }

    if (!this.hasPermission(currentUser, "manage_users")) {
      throw new Error("Insufficient permissions to modify user roles")
    }

    // Update user role
    const updateQuery = "UPDATE users SET role = $1 WHERE id = $2"
    await Database.query(updateQuery, [newRole, userId])

    const updatedUser: User = {
      id: row.user_id,
      email: row.user_email,
      name: row.user_name,
      organizationId: row.user_org,
      role: newRole,
      permissions: ROLE_PERMISSIONS[newRole],
      createdAt: row.user_created,
      lastLoginAt: row.user_last_login,
    }

    return updatedUser
  }

  static async logout(token: string): Promise<void> {
    const query = "DELETE FROM sessions WHERE token_hash = $1"
    await Database.query(query, [token])
  }

  // Cleanup expired sessions
  static async cleanupExpiredSessions(): Promise<void> {
    const query = "DELETE FROM sessions WHERE expires_at < NOW()"
    await Database.query(query)
  }
}

export async function getCurrentUser(request: NextRequest): Promise<User | null> {
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.substring(7)
  return AuthService.getCurrentUser(token)
}

export async function getTenant(tenantId: string): Promise<Organization | null> {
  const query = `
    SELECT id, name, plan, settings, created_at as "createdAt"
    FROM organizations 
    WHERE id = $1
  `
  const result = await Database.query(query, [tenantId])

  if (result.rows.length === 0) return null

  const org = result.rows[0]
  return {
    ...org,
    settings: typeof org.settings === "string" ? JSON.parse(org.settings) : org.settings,
  }
}

// Cleanup expired sessions every hour
setInterval(
  () => {
    AuthService.cleanupExpiredSessions()
  },
  60 * 60 * 1000,
)
