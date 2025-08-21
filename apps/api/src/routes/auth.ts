import type { FastifyInstance } from "fastify"
import { AuthService } from "../services/auth"
import { LoginSchema, RegisterSchema } from "@repo/schemas"

export async function authRoutes(fastify: FastifyInstance) {
  const authService = new AuthService()

  // Register
  fastify.post(
    "/register",
    {
      schema: {
        body: RegisterSchema,
      },
    },
    async (request, reply) => {
      try {
        const { email, password, name, organizationName } = request.body as any

        const result = await authService.register({
          email,
          password,
          name,
          organizationName,
        })

        if (!result.success) {
          return reply.status(400).send({ error: result.error })
        }

        // Set HTTP-only cookie
        reply.setCookie("token", result.token!, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })

        return { user: result.user, organization: result.organization }
      } catch (error) {
        fastify.log.error(error)
        return reply.status(500).send({ error: "Registration failed" })
      }
    },
  )

  // Login
  fastify.post(
    "/login",
    {
      schema: {
        body: LoginSchema,
      },
    },
    async (request, reply) => {
      try {
        const { email, password } = request.body as any

        const result = await authService.login(email, password)

        if (!result.success) {
          return reply.status(401).send({ error: result.error })
        }

        // Set HTTP-only cookie
        reply.setCookie("token", result.token!, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })

        return { user: result.user, organization: result.organization }
      } catch (error) {
        fastify.log.error(error)
        return reply.status(500).send({ error: "Login failed" })
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
          reply.status(401).send({ error: "Unauthorized" })
        }
      },
    },
    async (request) => {
      const userId = (request.user as any).userId
      const user = await authService.getUserById(userId)

      if (!user) {
        throw new Error("User not found")
      }

      return { user }
    },
  )

  // Logout
  fastify.post("/logout", async (request, reply) => {
    reply.clearCookie("token")
    return { message: "Logged out successfully" }
  })
}
