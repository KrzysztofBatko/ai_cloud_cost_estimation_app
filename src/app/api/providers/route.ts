import { supabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { Provider } from "@/types/api";
import {
  commonErrorResponse,
  isAdmin,
  requireSession,
} from "@/lib/api/apiAuth";

export type ProviderRow = {
  id: string;
  name: string;
  is_active?: boolean;
};

export function toProviderDto(provider: ProviderRow): Provider {
  return {
    id: provider.id,
    name: provider.name,
    isActive: provider.is_active ?? false,
  };
}

export async function GET(req: Request) {
  const auth = await requireSession({
    allowedRoles: ["superadmin", "admin", "user"],
    forbiddenMessage: "Only superadmins can perform this action ",
  });

  if (auth.response) return auth.response;
  const { searchParams } = new URL(req.url);
  const includeInactive = searchParams.get("includeInactive") === "true";

  let query = supabase
    .from("providers")
    .select("id, name, is_active")
    .order("name", { ascending: true });

  if (!includeInactive || !isAdmin(auth.session)) {
    query = query.eq("is_active", true);
  }

  try {
    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        data: (data ?? []).map((provider) =>
          toProviderDto(provider as ProviderRow),
        ),
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    return commonErrorResponse(error);
  }
}

export async function POST(req: Request) {
  const auth = await requireSession({
    allowedRoles: ["superadmin", "admin"],
    forbiddenMessage: "Only admin can perform this action ",
  });

  if (auth.response) return auth.response;

  const body = await req.json().catch(() => null);
  const name = body?.name?.trim();

  if (!name) {
    return NextResponse.json({ error: "Missing name" }, { status: 400 });
  }
  try {
    const { data, error } = await supabase
      .from("providers")
      .insert({ name, is_active: true })
      .select("id, name, is_active")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { data: data ? toProviderDto(data as ProviderRow) : null },
      { status: 201 },
    );
  } catch (error: unknown) {
    return commonErrorResponse(error);
  }
}
