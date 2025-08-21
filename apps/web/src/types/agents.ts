export interface Agent {
  id: string
  name: string
  description: string
  organizationId: string
  systemPrompt: string
  configuration: AgentConfiguration
  status: AgentStatus
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface AgentConfiguration {
  provider: AIProvider
  model: string
  temperature: number
  maxTokens: number
  responseStyle: ResponseStyle
  tools: string[]
  knowledgeBase?: KnowledgeBase
}

export interface KnowledgeBase {
  id: string
  name: string
  documents: Document[]
  urls: string[]
  textContent: string
}

export interface Document {
  id: string
  name: string
  type: string
  size: number
  url: string
  processedAt?: Date
}

export enum AgentStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  INACTIVE = "inactive",
  ARCHIVED = "archived",
}

export enum AIProvider {
  OPENAI = "openai",
  ANTHROPIC = "anthropic",
  GOOGLE = "google",
  MISTRAL = "mistral",
}

export enum ResponseStyle {
  PROFESSIONAL = "professional",
  CASUAL = "casual",
  TECHNICAL = "technical",
  FRIENDLY = "friendly",
}

export interface CreateAgentRequest {
  name: string
  description: string
  systemPrompt: string
  configuration: Partial<AgentConfiguration>
}

export interface UpdateAgentRequest extends Partial<CreateAgentRequest> {
  status?: AgentStatus
}
