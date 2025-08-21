import { z } from "zod"

// Auth schemas
export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export const RegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  organizationName: z.string().min(2, "Organization name must be at least 2 characters"),
})

export const UpdateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
})

// Agent schemas
export const CreateAgentSchema = z.object({
  name: z.string().min(1, "Agent name is required"),
  description: z.string().optional(),
  systemPrompt: z.string().min(1, "System prompt is required"),
  personality: z.object({
    tone: z.enum(["professional", "friendly", "casual", "formal"]),
    style: z.enum(["concise", "detailed", "conversational"]),
    responseLength: z.enum(["short", "medium", "long"]),
  }),
  tools: z.array(z.string()).default([]),
  provider: z.enum(["openai", "anthropic", "local"]),
  settings: z.object({
    temperature: z.number().min(0).max(2).default(0.7),
    maxTokens: z.number().min(1).max(4000).default(1000),
  }),
})

export const UpdateAgentSchema = CreateAgentSchema.partial()

export type LoginRequest = z.infer<typeof LoginSchema>
export type RegisterRequest = z.infer<typeof RegisterSchema>
export type UpdateUserRequest = z.infer<typeof UpdateUserSchema>
export type CreateAgentRequest = z.infer<typeof CreateAgentSchema>
export type UpdateAgentRequest = z.infer<typeof UpdateAgentSchema>
