import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";
import { commonErrorResponse, requireSession } from "@/lib/api/apiAuth";
import { mapProviderRegionRow, type ProviderRegionRow } from "@/lib/providers/regions";

async function ensureProviderExists(providerId: string) {
  const { data, error } = await supabase
    .from("providers")
    .select("id")
    .eq("id", providerId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return !!data;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireSession({
    allowedRoles: ["superadmin", "admin"],
    forbiddenMessage: "Only admin can perform this action ",
  });

  if (auth.response) return auth.response;

  const { id: providerId } = await params;
  if (!providerId) {
    return NextResponse.json({ error: "Missing provider id" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const value = body?.value?.trim();
  const label = body?.label?.trim();
  const requestedDefault = body?.isDefault === true;

  if (!value || !label) {
    return NextResponse.json(
      { error: "value and label are required" },
      { status: 400 },
    );
  }

  try {
    const providerExists = await ensureProviderExists(providerId);
    if (!providerExists) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }

    const { data: existingDefault, error: existingDefaultError } = await supabase
      .from("provider_regions")
      .select("id")
      .eq("provider_id", providerId)
      .eq("is_default", true)
      .maybeSingle();

    if (existingDefaultError) {
      return NextResponse.json(
        { error: existingDefaultError.message },
        { status: 500 },
      );
    }

    const shouldBeDefault = requestedDefault || !existingDefault;

    if (shouldBeDefault) {
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

    const { data, error } = await supabase
      .from("provider_regions")
      .insert({
        provider_id: providerId,
        value,
        label,
        is_default: shouldBeDefault,
      })
      .select("id, provider_id, value, label, is_default")
      .single();

    if (error) {
      const status = error.code === "23505" ? 409 : 500;
      return NextResponse.json({ error: error.message }, { status });
    }

    return NextResponse.json(
      { data: data ? mapProviderRegionRow(data as ProviderRegionRow) : null },
      { status: 201 },
    );
  } catch (error: unknown) {
    return commonErrorResponse(error);
  }
}
