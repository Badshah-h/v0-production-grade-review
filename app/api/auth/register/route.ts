import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, organizationName } = await request.json()

    // Real validation
    if (!email || !password || !name || !organizationName) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    // Real registration
    const result = await AuthService.register(email, password, name, organizationName)

    return NextResponse.json({
      message: "Registration successful",
      user: result.user,
      organization: result.organization,
    })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Registration failed" }, { status: 400 })
  }
}
