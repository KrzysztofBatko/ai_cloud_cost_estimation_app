import { supabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { hasAllowedRole, ROLES, User, Role } from "@/types/api";
import { commonErrorResponse, requireSession } from "@/lib/api/apiAuth";

type UserRow = {
  email: string;
  name: string;
  role: string;
};

function toUserDto(user: UserRow): User {
  return {
    email: user.email,
    name: user.name,
    role: user.role as Role,
  };
}

export async function GET() {
  const auth = await requireSession({
    allowedRoles: ["superadmin"],
    forbiddenMessage: "Only superadmins can perform this action ",
  });

  if (auth.response) return auth.response;

  try {
    const { data, error } = await supabase
      .from("users")
      .select("email, name, role")
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { data: (data ?? []).map((user) => toUserDto(user)) },
      { status: 200 },
    );
  } catch (error: unknown) {
    return commonErrorResponse(error);
  }
}

export async function PUT(req: Request) {
  const auth = await requireSession({
    allowedRoles: ["superadmin"],
    forbiddenMessage: "Only superadmins can perform this action ",
  });

  if (auth.response) return auth.response;

  const body = await req.json().catch(() => null);
  const emailRaw = body?.email?.trim();
  const role = body?.role?.trim();

  if (!emailRaw) {
    return NextResponse.json(
      { error: "Email is required to update user role" },
      { status: 400 },
    );
  }

  const email = emailRaw.toLowerCase();
  const requesterEmail = auth.session.user?.email?.toLowerCase();

  if (requesterEmail && email === requesterEmail) {
    return NextResponse.json(
      { error: "You cannot change your own role" },
      { status: 403 },
    );
  }

  if (!hasAllowedRole(role)) {
    return NextResponse.json(
      { error: `Role must be one of: ${ROLES.join(", ")}` },
      { status: 400 },
    );
  }
  try {
    const { data, error } = await supabase
      .from("users")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("email", email)
      .select("email, name, role")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "User not found for the provided email" },
          { status: 404 },
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { data: data ? toUserDto(data as UserRow) : null },
      { status: 200 },
    );
  } catch (error: unknown) {
    return commonErrorResponse(error);
  }
}
