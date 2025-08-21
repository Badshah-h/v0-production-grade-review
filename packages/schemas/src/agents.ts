import { z } from "zod"

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

export type CreateAgentRequest = z.infer<typeof CreateAgentSchema>
export type UpdateAgentRequest = z.infer<typeof UpdateAgentSchema>
