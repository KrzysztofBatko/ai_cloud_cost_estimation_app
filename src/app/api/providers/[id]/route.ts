import { supabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import {
  attachProviderRegions,
  toProviderDto,
  type ProviderRegionRow,
  type ProviderRow,
} from "@/lib/providers/regions";
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

    const { data: regions, error: regionsError } = await supabase
      .from("provider_regions")
      .select("id, provider_id, value, label, is_default")
      .eq("provider_id", id);

    if (regionsError) {
      return NextResponse.json({ error: regionsError.message }, { status: 500 });
    }

    const [providerWithRegions] = attachProviderRegions(
      [data as ProviderRow],
      (regions ?? []) as ProviderRegionRow[],
    );

    return NextResponse.json({
      data: providerWithRegions ? toProviderDto(providerWithRegions) : null,
    });
  } catch (error: unknown) {
    return commonErrorResponse(error);
  }
}
