import { supabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import {
  attachProviderRegions,
  toProviderDto,
  type ProviderRegionRow,
  type ProviderRow,
  type ProviderWithRegionRows,
} from "@/lib/providers/regions";
import {
  commonErrorResponse,
  isAdmin,
  requireSession,
} from "@/lib/api/apiAuth";

async function loadProvidersWithRegions(input?: {
  providerId?: string;
  includeInactive?: boolean;
}) {
  let providersQuery = supabase
    .from("providers")
    .select("id, name, is_active")
    .order("name", { ascending: true });

  if (!input?.includeInactive) {
    providersQuery = providersQuery.eq("is_active", true);
  }

  if (input?.providerId) {
    providersQuery = providersQuery.eq("id", input.providerId);
  }

  const { data: providers, error: providersError } = await providersQuery;

  if (providersError) {
    throw providersError;
  }

  const providerRows = (providers ?? []) as ProviderRow[];

  if (providerRows.length === 0) {
    return [];
  }

  const providerIds = providerRows.map((provider) => provider.id);
  const { data: regions, error: regionsError } = await supabase
    .from("provider_regions")
    .select("id, provider_id, value, label, is_default")
    .in("provider_id", providerIds);

  if (regionsError) {
    throw regionsError;
  }

  return attachProviderRegions(
    providerRows,
    (regions ?? []) as ProviderRegionRow[],
  );
}

export async function GET(req: Request) {
  const auth = await requireSession({
    allowedRoles: ["superadmin", "admin", "user"],
    forbiddenMessage: "Only superadmins can perform this action ",
  });

  if (auth.response) return auth.response;
  const { searchParams } = new URL(req.url);
  const includeInactive = searchParams.get("includeInactive") === "true";

  try {
    const data = await loadProvidersWithRegions({
      includeInactive: includeInactive && isAdmin(auth.session),
    });

    return NextResponse.json(
      {
        data: (data ?? []).map((provider) =>
          toProviderDto(provider as ProviderWithRegionRows),
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
      {
        data: toProviderDto({
          ...(data as ProviderRow),
          provider_regions: [],
        }),
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    return commonErrorResponse(error);
  }
}
