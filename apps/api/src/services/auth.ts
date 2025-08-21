import jwt from "jsonwebtoken"
import { UserModel } from "@axonstream/database/models/user"
import { OrganizationModel } from "@axonstream/database/models/organization"
import { CryptoUtils } from "@axonstream/utils"
import { config } from "@axonstream/config"
import type {
  RegisterRequest,
  AuthRequest,
  AuthResponse,
  User,
  Organization,
  UserRole,
  JWTPayload,
} from "@axonstream/types"

export class AuthService {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await UserModel.findByEmail(data.email)
    if (existingUser) {
      throw new Error("User already exists with this email")
    }

    // Create organization
    const organization = await OrganizationModel.create({
      name: data.organizationName,
      slug: CryptoUtils.generateSlug(data.organizationName),
    })

    // Hash password
    const passwordHash = await CryptoUtils.hashPassword(data.password)

    // Create user
    const user = await UserModel.create({
      email: data.email,
      name: data.name,
      passwordHash,
      organizationId: organization.id,
      role: "admin" as UserRole, // First user is admin
    })

    // Generate JWT token
    const token = this.generateToken(user)

    return {
      user,
      organization,
      token,
    }
  }

  async login(data: AuthRequest): Promise<AuthResponse> {
    // Find user
    const user = await UserModel.findByEmail(data.email)
    if (!user) {
      throw new Error("Invalid email or password")
    }

    // Get password hash
    const passwordHash = await UserModel.getPasswordHash(data.email)
    if (!passwordHash) {
      throw new Error("Invalid email or password")
    }

    // Verify password
    const isValidPassword = await CryptoUtils.comparePassword(data.password, passwordHash)
    if (!isValidPassword) {
      throw new Error("Invalid email or password")
    }

    // Get organization
    const organization = await OrganizationModel.findById(user.organizationId)
    if (!organization) {
      throw new Error("Organization not found")
    }

    // Generate JWT token
    const token = this.generateToken(user)

    return {
      user,
      organization,
      token,
    }
  }

  async getCurrentUser(userId: string): Promise<{ user: User; organization: Organization }> {
    const user = await UserModel.findById(userId)
    if (!user) {
      throw new Error("User not found")
    }

    const organization = await OrganizationModel.findById(user.organizationId)
    if (!organization) {
      throw new Error("Organization not found")
    }

    return { user, organization }
  }

  private generateToken(user: User): string {
    const payload: JWTPayload = {
      userId: user.id,
      organizationId: user.organizationId,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
    }

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    })
  }
}
