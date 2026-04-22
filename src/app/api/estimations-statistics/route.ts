import { supabase } from "@/lib/supabase/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { Session, getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api/apiAuth";

type Body = {
  providerIds: string[];
};

const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_PATTERN = /^\d{4}-\d{2}$/;

function getRangeFromQuery(day: string | null, month: string | null) {
  if ((day && month) || (!day && !month)) {
    return {
      error:
        "Pass exactly one query parameter: day=YYYY-MM-DD or month=YYYY-MM",
    };
  }

  if (day) {
    if (!DAY_PATTERN.test(day)) {
      return { error: "Invalid day format. Use YYYY-MM-DD" };
    }

    const start = new Date(`${day}T00:00:00.000Z`);
    if (Number.isNaN(start.getTime())) {
      return { error: "Invalid day value" };
    }

    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);

    return { start: start.toISOString(), end: end.toISOString() };
  }

  if (!month || !MONTH_PATTERN.test(month)) {
    return { error: "Invalid month format. Use YYYY-MM" };
  }

  const [yearStr, monthStr] = month.split("-");
  const year = Number(yearStr);
  const monthIndex = Number(monthStr) - 1;

  const start = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0, 0));
  if (Number.isNaN(start.getTime())) {
    return { error: "Invalid month value" };
  }

  const end = new Date(Date.UTC(year, monthIndex + 1, 1, 0, 0, 0, 0));

  return { start: start.toISOString(), end: end.toISOString() };
}

export async function GET(req: Request) {
  const auth = await requireSession({
    allowedRoles: ["superadmin", "admin"],
    forbiddenMessage: "Only admins can perform this action ",
  });
  if (auth.response) return auth.response;

  const { searchParams } = new URL(req.url);
  const day = searchParams.get("day");
  const month = searchParams.get("month");

  const range = getRangeFromQuery(day, month);
  if ("error" in range) {
    return NextResponse.json({ error: range.error }, { status: 400 });
  }

  const { data, error } = await supabase.rpc(
    "get_estimation_statistics_by_provider",
    {
      p_start: range.start,
      p_end: range.end,
    },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const response = (data ?? [])
    .map((row: unknown) => {
      const typedRow = row as { provider?: string; count?: number | string };
      return {
        provider: typedRow.provider ?? "",
        count: Number(typedRow.count ?? 0),
      };
    })
    .filter((row: { provider: string; count: number }) => row.provider);

  return NextResponse.json({ data: response });
}

export async function POST(req: Request) {
  const session: Session | null = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body: Body = await req.json();
  const { providerIds } = body;

  if (!Array.isArray(providerIds) || providerIds.length === 0) {
    return NextResponse.json(
      { error: "providerIds must be a non-empty array" },
      { status: 400 },
    );
  }

  const uniqueProviderIds = Array.from(new Set(providerIds));

  // Create estimation_statistics row
  const { data: estimation, error: estErr } = await supabase
    .from("estimations_statistics")
    .insert({})
    .select("id")
    .single();

  if (estErr || !estimation) {
    return NextResponse.json(
      { error: estErr?.message ?? "Failed to create estimation" },
      { status: 500 },
    );
  }

  const joinRows = uniqueProviderIds.map((providerId) => ({
    estimation_id: estimation.id,
    provider_id: providerId,
  }));

  const { error: joinErr } = await supabase
    .from("estimations_statistics_providers")
    .insert(joinRows);

  if (joinErr) {
    // Optional cleanup: delete the estimation row if join insert fails
    await supabase
      .from("estimations_statistics")
      .delete()
      .eq("id", estimation.id);

    return NextResponse.json(
      { error: joinErr.message ?? "Failed to link providers" },
      { status: 500 },
    );
  }

  return NextResponse.json({ estimationId: estimation.id }, { status: 201 });
}
