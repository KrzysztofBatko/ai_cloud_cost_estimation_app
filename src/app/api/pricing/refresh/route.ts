import { NextRequest, NextResponse } from "next/server";
import { getServerSession, type Session } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getDefaultPricingSnapshot,
  getLatestPricingSnapshot,
} from "@/lib/pricing/snapshots";
import { refreshPricingSnapshot } from "@/lib/pricing/refresh";

function isAdminSession(session: Session | null) {
  return session?.user?.role === "admin" || session?.user?.role === "superadmin";
}

function hasCronAccess(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return false;
  }

  const authHeader = req.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;
  const headerToken = req.headers.get("x-cron-secret");

  return bearerToken === cronSecret || headerToken === cronSecret;
}

function toResponsePayload(snapshot: {
  id: string;
  region: string;
  pricingAsOf: string;
  source: string;
  notes: string | null;
  createdAt: string;
  createdBy: string | null;
}) {
  return {
    id: snapshot.id,
    region: snapshot.region,
    pricingAsOf: snapshot.pricingAsOf,
    source: snapshot.source,
    notes: snapshot.notes,
    createdAt: snapshot.createdAt,
    createdBy: snapshot.createdBy,
  };
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session) && !hasCronAccess(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const snapshot = (await getLatestPricingSnapshot()) ?? getDefaultPricingSnapshot();
    return NextResponse.json({ data: toResponsePayload(snapshot) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to load pricing snapshot", message },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const cronAccess = hasCronAccess(req);

  if (!isAdminSession(session) && !cronAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const force = body?.force === true;
  const createdBy = cronAccess
    ? "cron"
    : (session?.user?.email ?? session?.user?.name ?? "admin-manual-refresh");

  try {
    const result = await refreshPricingSnapshot({
      createdBy,
      force,
    });

    return NextResponse.json({
      data: toResponsePayload(result.snapshot),
      skipped: result.skipped,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to refresh pricing snapshot", message },
      { status: 500 },
    );
  }
}
