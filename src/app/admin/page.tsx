"use client";
import { useEffect } from "react";
import { Shield, CheckCircle2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import EstimationDashboard from "@/app/admin/components/EstimationDashboard";
import CloudProviders from "@/app/admin/components/CloudProviders";
import UserManagement from "@/app/admin/components/UserManagement";
import PricingSnapshot from "@/app/admin/components/PricingSnapshot";

export default function Admin() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isAdmin =
    session?.user?.role === "admin" || session?.user?.role === "superadmin";
  const isSuperAdmin = session?.user?.role === "superadmin";

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
    <>
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-7 w-7 text-accent" />
          <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
        </div>
        <div className="mb-6 text-lg flex items-center gap-3">
          <span>Your access: {session?.user?.role}</span>
          <CheckCircle2
            className="h-5 w-5 text-emerald-500"
            aria-label="Access granted"
          />
        </div>

        <CloudProviders />
        <PricingSnapshot />

        {isSuperAdmin && <UserManagement />}
      </div>
      <div className="container mx-auto max-w-6xl px-4 pb-12">
        <EstimationDashboard />
      </div>
    </>
  );
}
