import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";
import { commonErrorResponse, requireSession } from "@/lib/api/apiAuth";
import {
  mapProviderRegionRow,
  type ProviderRegionRow,
} from "@/lib/providers/regions";

async function promoteNextDefaultRegion(
  providerId: string,
  excludeRegionId: string,
) {
  const { data: nextDefault, error: nextDefaultError } = await supabase
    .from("provider_regions")
    .select("id")
    .eq("provider_id", providerId)
    .neq("id", excludeRegionId)
    .order("label", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (nextDefaultError) {
    throw nextDefaultError;
  }

  if (!nextDefault?.id) {
    return;
  }

  const { error: promoteError } = await supabase
    .from("provider_regions")
    .update({ is_default: true })
    .eq("id", nextDefault.id);

  if (promoteError) {
    throw promoteError;
  }
}

export async function PATCH(
  req: Request,
  {
    params,
  }: { params: Promise<{ id: string; regionId: string }> },
) {
  const auth = await requireSession({
    allowedRoles: ["superadmin", "admin"],
    forbiddenMessage: "Only admin can perform this action ",
  });

  if (auth.response) return auth.response;

  const { id: providerId, regionId } = await params;
  if (!providerId || !regionId) {
    return NextResponse.json(
      { error: "Missing provider id or region id" },
      { status: 400 },
    );
  }

  const body = await req.json().catch(() => null);
  const nextValue =
    typeof body?.value === "string" ? body.value.trim() : undefined;
  const nextLabel =
    typeof body?.label === "string" ? body.label.trim() : undefined;
  const setAsDefault = body?.isDefault === true;

  if (nextValue !== undefined && !nextValue) {
    return NextResponse.json(
      { error: "value cannot be empty" },
      { status: 400 },
    );
  }

  if (nextLabel !== undefined && !nextLabel) {
    return NextResponse.json(
      { error: "label cannot be empty" },
      { status: 400 },
    );
  }

  if (
    nextValue === undefined &&
    nextLabel === undefined &&
    !setAsDefault
  ) {
    return NextResponse.json(
      { error: "No valid region fields provided" },
      { status: 400 },
    );
  }

  try {
    const { error: existingError } = await supabase
      .from("provider_regions")
      .select("id, provider_id, value, label, is_default")
      .eq("id", regionId)
      .eq("provider_id", providerId)
      .single();

    if (existingError) {
      const status = existingError.code === "PGRST116" ? 404 : 500;
      return NextResponse.json({ error: existingError.message }, { status });
    }

    if (setAsDefault) {
      const { error: clearDefaultError } = await supabase
        .from("provider_regions")
        .update({ is_default: false })
        .eq("provider_id", providerId)
        .eq("is_default", true);

      if (clearDefaultError) {
        return NextResponse.json(
          { error: clearDefaultError.message },
          { status: 500 },
        );
      }
    }

    const updates: Record<string, string | boolean> = {};
    if (nextValue !== undefined) {
      updates.value = nextValue;
    }
    if (nextLabel !== undefined) {
      updates.label = nextLabel;
    }
    if (setAsDefault) {
      updates.is_default = true;
    }

    const { data, error } = await supabase
      .from("provider_regions")
      .update(updates)
      .eq("id", regionId)
      .eq("provider_id", providerId)
      .select("id, provider_id, value, label, is_default")
      .single();

    if (error) {
      const status = error.code === "23505" ? 409 : 500;
      return NextResponse.json({ error: error.message }, { status });
    }

    return NextResponse.json({
      data: data ? mapProviderRegionRow(data as ProviderRegionRow) : null,
    });
  } catch (error: unknown) {
    return commonErrorResponse(error);
  }
}

export async function DELETE(
  _req: Request,
  {
    params,
  }: { params: Promise<{ id: string; regionId: string }> },
) {
  const auth = await requireSession({
    allowedRoles: ["superadmin", "admin"],
    forbiddenMessage: "Only admin can perform this action ",
  });

  if (auth.response) return auth.response;

  const { id: providerId, regionId } = await params;
  if (!providerId || !regionId) {
    return NextResponse.json(
      { error: "Missing provider id or region id" },
      { status: 400 },
    );
  }

  try {
    const { data: existing, error: existingError } = await supabase
      .from("provider_regions")
      .select("id, provider_id, is_default")
      .eq("id", regionId)
      .eq("provider_id", providerId)
      .single();

    if (existingError) {
      const status = existingError.code === "PGRST116" ? 404 : 500;
      return NextResponse.json({ error: existingError.message }, { status });
    }

    const { error: deleteError } = await supabase
      .from("provider_regions")
      .delete()
      .eq("id", regionId)
      .eq("provider_id", providerId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    if ((existing as ProviderRegionRow).is_default) {
      await promoteNextDefaultRegion(providerId, regionId);
    }

    return NextResponse.json(
      { message: "Provider region deleted successfully" },
      { status: 200 },
    );
  } catch (error: unknown) {
    return commonErrorResponse(error);
  }
}
