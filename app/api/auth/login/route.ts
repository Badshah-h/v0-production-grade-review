import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Real login
    const result = await AuthService.login(email, password)

    // Set real HTTP-only cookie
    const cookieStore = cookies()
    cookieStore.set("auth-token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return NextResponse.json({
      message: "Login successful",
      user: result.user,
    })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Login failed" }, { status: 401 })
  }
}
