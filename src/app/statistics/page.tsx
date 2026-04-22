"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import EstimationDashboard from "@/app/statistics/components/EstimationDashboard";

export default function Statistics() {
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

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <EstimationDashboard />
    </div>
  );
}
