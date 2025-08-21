import type { FastifyInstance } from "fastify"
import { AgentService } from "../services/agent"
import { CreateAgentSchema } from "@repo/schemas"

export async function agentRoutes(fastify: FastifyInstance) {
  const agentService = new AgentService()

  // Auth middleware
  const authenticate = async (request: any, reply: any) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.status(401).send({ error: "Unauthorized" })
    }
  }

  // Get all agents for organization
  fastify.get("/", { preHandler: authenticate }, async (request) => {
    const user = request.user as any
    const agents = await agentService.getAgentsByOrganization(user.organizationId)
    return { agents }
  })

  // Create agent
  fastify.post(
    "/",
    {
      preHandler: authenticate,
      schema: {
        body: CreateAgentSchema,
      },
    },
    async (request) => {
      const user = request.user as any
      const agentData = request.body as any

      const agent = await agentService.createAgent({
        ...agentData,
        organizationId: user.organizationId,
        createdBy: user.userId,
      })

      return { agent }
    },
  )

  // Get agent by ID
  fastify.get("/:id", { preHandler: authenticate }, async (request) => {
    const { id } = request.params as any
    const user = request.user as any

    const agent = await agentService.getAgentById(id, user.organizationId)

    if (!agent) {
      throw new Error("Agent not found")
    }

    return { agent }
  })

  // Update agent
  fastify.put("/:id", { preHandler: authenticate }, async (request) => {
    const { id } = request.params as any
    const user = request.user as any
    const updates = request.body as any

    const agent = await agentService.updateAgent(id, updates, user.organizationId)

    if (!agent) {
      throw new Error("Agent not found")
    }

    return { agent }
  })

  // Delete agent
  fastify.delete("/:id", { preHandler: authenticate }, async (request) => {
    const { id } = request.params as any
    const user = request.user as any

    await agentService.deleteAgent(id, user.organizationId)

    return { message: "Agent deleted successfully" }
  })
}
