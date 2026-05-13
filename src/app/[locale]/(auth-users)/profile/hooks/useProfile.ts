"use client";

import { ENDPOINTS } from "@/lib/api/utils";
import { signOut, useSession } from "next-auth/react";
import { useCallback, useState } from "react";

export function useProfile() {
  const { data: session, status } = useSession();
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const user = session?.user;

  const clearDeleteError = useCallback(() => {
    setDeleteError(null);
  }, []);

  const deleteAccount = useCallback(async () => {
    setDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(ENDPOINTS.PROFILE, {
        method: "DELETE",
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;

        throw new Error(body?.error ?? "Failed to delete account");
      }

      await signOut({ callbackUrl: "/" });
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete account",
      );
    } finally {
      setDeleting(false);
    }
  }, []);

  return {
    status,
    clearDeleteError,
    deleteAccount,
    deleteError,
    deleting,
    profile: {
      name: user?.name?.trim() || "Unknown user",
      email: user?.email?.trim() || "No email available",
      image: user?.image ?? null,
      role: user?.role ?? "user",
    },
  };
}
