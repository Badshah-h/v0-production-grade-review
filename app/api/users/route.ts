import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const currentUser = await AuthService.getCurrentUser(token)
    if (!currentUser) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    // Real RBAC check
    if (!AuthService.hasPermission(currentUser, "manage_users")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Real organization scoping
    const users = await AuthService.getOrganizationUsers(currentUser.organizationId)

    return NextResponse.json({ users })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId, role } = await request.json()
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const currentUser = await AuthService.getCurrentUser(token)
    if (!currentUser) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    // Real role update with RBAC and organization scoping
    const updatedUser = await AuthService.updateUserRole(userId, role, currentUser.id)

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update user" },
      { status: 400 },
    )
  }
}
