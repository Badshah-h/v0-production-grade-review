import type { FastifyInstance } from "fastify"
import { ChatService } from "../services/chat"

export async function chatRoutes(fastify: FastifyInstance) {
  const chatService = new ChatService()

  // Auth middleware
  const authenticate = async (request: any, reply: any) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.status(401).send({ error: "Unauthorized" })
    }
  }

  // Start chat session
  fastify.post("/:agentId/start", { preHandler: authenticate }, async (request) => {
    const { agentId } = request.params as any
    const user = request.user as any

    const session = await chatService.startSession(agentId, user.userId, user.organizationId)

    return { session }
  })

  // Send message
  fastify.post("/:agentId/message", { preHandler: authenticate }, async (request) => {
    const { agentId } = request.params as any
    const { message, sessionId } = request.body as any
    const user = request.user as any

    const response = await chatService.sendMessage({
      agentId,
      sessionId,
      message,
      userId: user.userId,
      organizationId: user.organizationId,
    })

    return { response }
  })

  // Get chat history
  fastify.get("/:agentId/history/:sessionId", { preHandler: authenticate }, async (request) => {
    const { agentId, sessionId } = request.params as any
    const user = request.user as any

    const messages = await chatService.getChatHistory(sessionId, user.organizationId)

    return { messages }
  })
}
