import Fastify from "fastify"
import cors from "@fastify/cors"
import jwt from "@fastify/jwt"
import { config } from "@axonstream/config"
import { authRoutes } from "./routes/auth"
import { agentRoutes } from "./routes/agents"
import { chatRoutes } from "./routes/chat"
import { userRoutes } from "./routes/users"

const server = Fastify({
  logger: {
    level: config.logging.level,
  },
})

// Register plugins
server.register(cors, {
  origin: config.cors.origin,
  credentials: true,
})

server.register(jwt, {
  secret: config.jwt.secret,
})

// Health check
server.get("/health", async () => {
  return { status: "ok", timestamp: new Date().toISOString() }
})

// Register routes
server.register(authRoutes, { prefix: "/api/auth" })
server.register(agentRoutes, { prefix: "/api/agents" })
server.register(chatRoutes, { prefix: "/api/chat" })
server.register(userRoutes, { prefix: "/api/users" })

// Error handler
server.setErrorHandler((error, request, reply) => {
  server.log.error(error)

  if (error.validation) {
    reply.status(400).send({
      success: false,
      error: "Validation Error",
      details: error.validation,
    })
    return
  }

  if (error.statusCode) {
    reply.status(error.statusCode).send({
      success: false,
      error: error.message,
    })
    return
  }

  reply.status(500).send({
    success: false,
    error: "Internal Server Error",
  })
})

const start = async () => {
  try {
    await server.listen({ port: config.port, host: "0.0.0.0" })
    server.log.info(`Server listening on port ${config.port}`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
