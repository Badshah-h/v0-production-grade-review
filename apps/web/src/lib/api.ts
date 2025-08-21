const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

interface ApiResponse<T> {
  data: T | null
  error?: string
  success: boolean
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          data: null,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
          success: false,
        }
      }

      return { data, success: true }
    } catch (error) {
      console.error("[API Client] Network error:", error)
      return {
        data: null,
        error: error instanceof Error ? error.message : "Network error",
        success: false,
      }
    }
  }

  // Auth methods
  async login(email: string, password: string) {
    return this.request<{ user: any; token: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async register(data: { email: string; password: string; name: string; organizationName: string }) {
    return this.request<{ user: any; organization: any }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getCurrentUser() {
    return this.request<{ user: any }>("/api/auth/me")
  }

  async logout() {
    return this.request<{ success: boolean }>("/api/auth/logout", { method: "POST" })
  }

  // Agent methods
  async getAgents() {
    return this.request<{ agents: any[] }>("/api/agents")
  }

  async createAgent(data: any) {
    return this.request<{ agent: any }>("/api/agents", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getAgent(id: string) {
    return this.request<{ agent: any }>(`/api/agents/${id}`)
  }

  async updateAgent(id: string, data: any) {
    return this.request<{ agent: any }>(`/api/agents/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteAgent(id: string) {
    return this.request<{ success: boolean }>(`/api/agents/${id}`, { method: "DELETE" })
  }

  // Chat methods
  async startChatSession(agentId: string) {
    return this.request<{ sessionId: string }>(`/api/chat/${agentId}/start`, { method: "POST" })
  }

  async sendMessage(agentId: string, sessionId: string, message: string) {
    return this.request<{ response: string; messageId: string }>(`/api/chat/${agentId}/message`, {
      method: "POST",
      body: JSON.stringify({ sessionId, message }),
    })
  }

  async getChatHistory(agentId: string, sessionId: string) {
    return this.request<{ messages: any[] }>(`/api/chat/${agentId}/history/${sessionId}`)
  }

  // User management methods
  async getUsers() {
    return this.request<{ users: any[] }>("/api/users")
  }

  async updateUserRole(userId: string, role: string) {
    return this.request<{ user: any }>("/api/users", {
      method: "PATCH",
      body: JSON.stringify({ userId, role }),
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
export type { ApiResponse }
