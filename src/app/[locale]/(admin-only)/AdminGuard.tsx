"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const locale = useLocale();
  const router = useRouter();

  const isAdmin =
    session?.user?.role === "admin" || session?.user?.role === "superadmin";

  useEffect(() => {
    if (status === "loading") return;

    if (!isAdmin) {
      router.replace(`/${locale}`);
    }
  }, [status, isAdmin, locale, router]);

  if (status === "loading" || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
