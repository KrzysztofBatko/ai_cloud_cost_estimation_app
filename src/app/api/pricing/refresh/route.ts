import { NextRequest, NextResponse } from "next/server";
import {
  getDefaultPricingSnapshot,
  getLatestPricingSnapshot,
} from "@/lib/pricing/snapshots";
import { refreshPricingSnapshot } from "@/lib/pricing/refresh";
import { commonErrorResponse, requireSession } from "@/lib/api/apiAuth";

export async function GET() {
  const auth = await requireSession({
    allowedRoles: ["superadmin", "admin"],
    forbiddenMessage: "Only superadmins can perform this action ",
  });

  if (auth.response) return auth.response;

  try {
    const snapshot =
      (await getLatestPricingSnapshot()) ?? getDefaultPricingSnapshot();
    return NextResponse.json({ data: snapshot });
  } catch (error: unknown) {
    return commonErrorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireSession({
    allowedRoles: ["superadmin", "admin"],
    forbiddenMessage: "Only superadmins can perform this action ",
  });

  if (auth.response) return auth.response;

  const body = await req.json().catch(() => null);
  const force = body?.force === true;
  const createdBy =
    auth.session?.user?.email ??
    auth.session?.user?.name ??
    "admin-manual-refresh";

  try {
    const result = await refreshPricingSnapshot({
      createdBy,
      force,
    });

    return NextResponse.json({
      data: result.snapshot,
      skipped: result.skipped,
    });
  } catch (error: unknown) {
    return commonErrorResponse(error);
  }
}
