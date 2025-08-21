import type { FastifyPluginAsync } from "fastify"
import { AuthService } from "../../services/auth"
import type { RegisterRequest, AuthRequest } from "@axonstream/types"

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  const authService = new AuthService()

  // Register
  fastify.post<{ Body: RegisterRequest }>(
    "/register",
    {
      schema: {
        body: {
          type: "object",
          required: ["email", "password", "name", "organizationName"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8 },
            name: { type: "string", minLength: 2 },
            organizationName: { type: "string", minLength: 2 },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const result = await authService.register(request.body)

        reply.setCookie("auth-token", result.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })

        return {
          success: true,
          data: {
            user: result.user,
            organization: result.organization,
          },
        }
      } catch (error) {
        reply.status(400)
        return {
          success: false,
          error: error instanceof Error ? error.message : "Registration failed",
        }
      }
    },
  )

  // Login
  fastify.post<{ Body: AuthRequest }>(
    "/login",
    {
      schema: {
        body: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const result = await authService.login(request.body)

        reply.setCookie("auth-token", result.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })

        return {
          success: true,
          data: {
            user: result.user,
            organization: result.organization,
          },
        }
      } catch (error) {
        reply.status(401)
        return {
          success: false,
          error: error instanceof Error ? error.message : "Login failed",
        }
      }
    },
  )

  // Get current user
  fastify.get(
    "/me",
    {
      preHandler: async (request, reply) => {
        try {
          await request.jwtVerify()
        } catch (err) {
          reply.status(401).send({ success: false, error: "Unauthorized" })
        }
      },
    },
    async (request) => {
      try {
        const user = await authService.getCurrentUser(request.user.userId)
        return {
          success: true,
          data: user,
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to get user",
        }
      }
    },
  )

  // Logout
  fastify.post("/logout", async (request, reply) => {
    reply.clearCookie("auth-token")
    return { success: true, message: "Logged out successfully" }
  })
}
