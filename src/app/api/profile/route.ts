import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api/apiAuth";
import { supabase } from "@/lib/supabase/server";

export async function DELETE() {
  const auth = await requireSession();

  if (auth.response) return auth.response;

  const email = auth.session.user?.email?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json(
      { error: "Signed-in user email is required to delete account" },
      { status: 400 },
    );
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .delete()
      .eq("email", email)
      .select("email");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data?.length) {
      return NextResponse.json(
        { error: "User account was not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      { error: "Failed to delete account", message },
      { status: 500 },
    );
  }
}
