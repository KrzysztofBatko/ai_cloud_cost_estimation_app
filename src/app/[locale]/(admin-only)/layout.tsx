"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isAdmin =
    session?.user?.role === "admin" || session?.user?.role === "superadmin";

  useEffect(() => {
    if (status === "loading") return;

    if (!isAdmin) {
      router.replace("/");
    }
  }, [status, isAdmin, router]);

  if (status === "loading" || !isAdmin) {
    return null;
  }
  return <>{children}</>;
}
