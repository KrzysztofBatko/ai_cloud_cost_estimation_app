import { supabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { ProviderRow, toProviderDto } from "@/app/api/providers/route";
import { commonErrorResponse, requireSession } from "@/lib/api/apiAuth";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireSession({
    allowedRoles: ["superadmin", "admin"],
    forbiddenMessage: "Only admin can perform this action ",
  });

  if (auth.response) return auth.response;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const { error } = await supabase
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

    return NextResponse.json(
      { message: "Provider deleted successfully" },
      { status: 200 },
    );
  } catch (error: unknown) {
    return commonErrorResponse(error);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireSession({
    allowedRoles: ["superadmin", "admin"],
    forbiddenMessage: "Only admin can perform this action ",
  });

  if (auth.response) return auth.response;

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
  try {
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
  } catch (error: unknown) {
    return commonErrorResponse(error);
  }
}
