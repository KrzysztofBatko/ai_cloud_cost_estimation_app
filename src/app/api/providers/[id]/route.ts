import { supabase } from "@/lib/supabase/server";
import { getServerSession, Session } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

type ProviderRow = {
  id: string;
  name: string;
  is_active?: boolean;
};

function toProviderDto(provider: ProviderRow) {
  return {
    id: provider.id,
    name: provider.name,
    isActive: provider.is_active ?? true,
  };
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("providers")
    .delete()
    .eq("id", id)
    .select("id, name, is_active")
    .single();

  if (error) {
    if (error.code === "23503") {
      return NextResponse.json(
        {
          error:
            "Provider cannot be deleted because it was used in an estimations before.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: data ? toProviderDto(data as ProviderRow) : null,
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const isActive = body?.isActive;

  if (typeof isActive !== "boolean") {
    return NextResponse.json(
      { error: "isActive must be a boolean" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("providers")
    .update({ is_active: isActive })
    .eq("id", id)
    .select("id, name, is_active")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: data ? toProviderDto(data as ProviderRow) : null,
  });
}
