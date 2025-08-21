export interface ChatMessage {
  id: string
  conversationId: string
  role: MessageRole
  content: string
  metadata?: MessageMetadata
  createdAt: Date
}

export interface Conversation {
  id: string
  agentId: string
  userId?: string
  sessionId: string
  status: ConversationStatus
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

export interface MessageMetadata {
  toolsUsed?: string[]
  processingTime?: number
  tokenCount?: number
  cost?: number
}

export enum MessageRole {
  USER = "user",
  ASSISTANT = "assistant",
  SYSTEM = "system",
}

export enum ConversationStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
  ARCHIVED = "archived",
}

export interface ChatRequest {
  message: string
  conversationId?: string
  sessionId?: string
}

export interface ChatResponse {
  message: ChatMessage
  conversation: Conversation
}

export interface StreamChunk {
  id: string
  content: string
  done: boolean
  metadata?: MessageMetadata
}
