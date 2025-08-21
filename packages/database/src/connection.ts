import { Pool, type PoolClient } from "pg"
import { config } from "@axonstream/config"

class DatabaseConnection {
  private pool: Pool
  private static instance: DatabaseConnection

  private constructor() {
    this.pool = new Pool({
      connectionString: config.database.url,
      max: config.database.maxConnections,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })

    this.pool.on("error", (err) => {
      console.error("Unexpected error on idle client", err)
      process.exit(-1)
    })
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection()
    }
    return DatabaseConnection.instance
  }

  public async getClient(): Promise<PoolClient> {
    return this.pool.connect()
  }

  public async query(text: string, params?: any[]): Promise<any> {
    const client = await this.getClient()
    try {
      const result = await client.query(text, params)
      return result
    } finally {
      client.release()
    }
  }

  public async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getClient()
    try {
      await client.query("BEGIN")
      const result = await callback(client)
      await client.query("COMMIT")
      return result
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  }

  public async close(): Promise<void> {
    await this.pool.end()
  }
}

export const db = DatabaseConnection.getInstance()
