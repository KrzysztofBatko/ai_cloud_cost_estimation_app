import { NextResponse } from "next/server";
import { getServerSession, type Session } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Role, SessionGuardOptions, SessionResult } from "@/types/api";

export async function requireSession(
  options?: SessionGuardOptions,
): Promise<SessionResult> {
  const session: Session | null = await getServerSession(authOptions);

  if (!session) {
    return {
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const allowedRoles = options?.allowedRoles;
  if (
    allowedRoles &&
    (!session.user?.role || !allowedRoles.includes(session.user.role as Role))
  ) {
    return {
      response: NextResponse.json(
        { error: options?.forbiddenMessage ?? "Forbidden" },
        { status: options?.forbiddenStatus ?? 401 },
      ),
    };
  }

  return { session };
}

export function isAdmin(session: Session): boolean {
  return session.user?.role === "admin" || session.user?.role === "superadmin";
}

export function commonErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return NextResponse.json(
    { error: "Failed to delete provider", message },
    { status: 500 },
  );
}
