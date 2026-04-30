"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import CloudProvidersList from "@/app/admin/components/CloudProvidersList";
import UserManagement from "@/app/admin/components/UserManagement";
import PricingSnapshot from "@/app/admin/components/PricingSnapshot";
import PageContainer from "@/components/PageContaner";

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
    <PageContainer
      pageTitle="Admin Panel"
      pageDescription={`Your access: ${session?.user?.role}`}
    >
      <CloudProvidersList />
      <PricingSnapshot />

      {isSuperAdmin && <UserManagement />}
    </PageContainer>
  );
}
