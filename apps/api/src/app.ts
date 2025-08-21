import Fastify from "fastify"
import cors from "@fastify/cors"
import jwt from "@fastify/jwt"
import cookie from "@fastify/cookie"
import { authRoutes } from "./routes/auth"
import { agentRoutes } from "./routes/agents"
import { chatRoutes } from "./routes/chat"
import { userRoutes } from "./routes/users"
import { toolRoutes } from "./routes/tools"

const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
  },
})

// Register plugins
app.register(cors, {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
})

app.register(jwt, {
  secret: process.env.JWT_SECRET || "your-secret-key",
  cookie: {
    cookieName: "token",
    signed: false,
  },
})

app.register(cookie)

// Health check
app.get("/health", async () => {
  return { status: "ok", timestamp: new Date().toISOString() }
})

// Register routes
app.register(authRoutes, { prefix: "/api/auth" })
app.register(agentRoutes, { prefix: "/api/agents" })
app.register(chatRoutes, { prefix: "/api/chat" })
app.register(userRoutes, { prefix: "/api/users" })
app.register(toolRoutes, { prefix: "/api/tools" })

// Error handler
app.setErrorHandler((error, request, reply) => {
  app.log.error(error)
  reply.status(500).send({ error: "Internal Server Error" })
})

export default app
