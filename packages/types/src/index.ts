export * from "./auth"
export * from "./agents"
export * from "./chat"

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface APIError {
  code: string
  message: string
  details?: any
}
