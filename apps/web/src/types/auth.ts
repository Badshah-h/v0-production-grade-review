export interface User {
  id: string
  email: string
  name: string
  organizationId: string
  role: UserRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Organization {
  id: string
  name: string
  slug: string
  plan: OrganizationPlan
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Session {
  id: string
  userId: string
  token: string
  expiresAt: Date
  createdAt: Date
}

export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
  USER = "user",
}

export enum OrganizationPlan {
  STARTER = "starter",
  PROFESSIONAL = "professional",
  ENTERPRISE = "enterprise",
}

export interface AuthRequest {
  email: string
  password: string
}

export interface RegisterRequest extends AuthRequest {
  name: string
  organizationName: string
}

export interface AuthResponse {
  user: User
  organization: Organization
  token: string
}

export interface JWTPayload {
  userId: string
  organizationId: string
  role: UserRole
  iat: number
  exp: number
}
