import { supabase } from "@/lib/supabase/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { getServerSession, Session } from "next-auth";
import { NextResponse } from "next/server";

type ProviderRow = {
  id: string;
  name: string;
  is_active?: boolean;
};

function toProviderDto(provider: ProviderRow) {
  return {
    id: provider.id,
    name: provider.name,
    isActive: provider.is_active ?? false,
  };
}

export async function GET(req: Request) {
  const session: Session | null = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const includeInactive = searchParams.get("includeInactive") === "true";
  const isAdmin =
    session.user?.role === "admin" || session.user?.role === "superadmin";

  let query = supabase
    .from("providers")
    .select("id, name, is_active")
    .order("name", { ascending: true });

  if (!includeInactive || !isAdmin) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const mappedData = (data ?? []).map((provider) =>
    toProviderDto(provider as ProviderRow),
  );

  return NextResponse.json({ data: mappedData });
}

export async function POST(req: Request) {
  const session: Session | null = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user?.role !== "admin" && session.user?.role !== "superadmin") {
    return NextResponse.json(
      { error: "Only admins can perform this action" },
      { status: 401 },
    );
  }

  const body = await req.json().catch(() => null);
  const name = body?.name?.trim();

  if (!name) {
    return NextResponse.json({ error: "Missing name" }, { status: 400 });
  }

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
}
