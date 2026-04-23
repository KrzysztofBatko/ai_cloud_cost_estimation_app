import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable.");
}

if (!supabaseKey) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable.");
}

function getJwtRole(token: string): string | null {
  const parts = token.split(".");

  if (parts.length !== 3) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf8"),
    ) as { role?: unknown };

    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

function assertServerSupabaseKey(key: string): void {
  // New Supabase key format: only secret keys are valid on the server.
  if (key.startsWith("sb_publishable_")) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is using a publishable key. Use a service role JWT or sb_secret key.",
    );
  }

  if (key.startsWith("sb_secret_")) {
    return;
  }

  // Legacy JWT key format: role must be service_role.
  const keyRole = getJwtRole(key);
  if (keyRole && keyRole !== "service_role") {
    throw new Error(
      `SUPABASE_SERVICE_ROLE_KEY must be a service role key, but got role '${keyRole}'.`,
    );
  }

  // If role cannot be decoded, fail fast to avoid silent RLS breakage.
  if (!keyRole) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY has an unknown format. Use a service role JWT or sb_secret key.",
    );
  }
}

assertServerSupabaseKey(supabaseKey);

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
