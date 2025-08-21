import { z } from "zod"

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().default("your-super-secret-jwt-key-change-in-production"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  NEXT_PUBLIC_API_URL: z.string().default("http://localhost:3001"),
})

const env = envSchema.parse(process.env)

export const config = {
  env: env.NODE_ENV,
  database: {
    url: env.DATABASE_URL,
    maxConnections: 20,
  },
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },
  api: {
    url: env.NEXT_PUBLIC_API_URL,
  },
} as const

export type Config = typeof config
