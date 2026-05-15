"use client";

import { ENDPOINTS } from "@/lib/api/utils";
import { useLocale, useTranslations } from "next-intl";
import { signOut, useSession } from "next-auth/react";
import { useCallback, useState } from "react";

export function useProfile() {
  const locale = useLocale();
  const t = useTranslations("profile");
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

        throw new Error(body?.error ?? t("deleteAccount.error"));
      }

      await signOut({ callbackUrl: `/${locale}` });
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : t("deleteAccount.error"),
      );
    } finally {
      setDeleting(false);
    }
  }, [locale, t]);

  return {
    status,
    clearDeleteError,
    deleteAccount,
    deleteError,
    deleting,
    profile: {
      name: user?.name?.trim() || t("details.unknownUser"),
      email: user?.email?.trim() || t("details.noEmail"),
      image: user?.image ?? null,
      role: user?.role ?? "user",
    },
  };
}
