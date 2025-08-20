import { NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Real user lookup
    const user = await AuthService.getCurrentUser(token)

    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
  }
}
