"use client";
import { useSession } from "next-auth/react";
import PageContainer from "@/components/PageContainer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings2, Users } from "lucide-react";
import CloudProvidersList from "@/app/(admin-only)/admin/components/CloudProvidersList";
import PricingSnapshot from "@/app/(admin-only)/admin/components/PricingSnapshot";
import UserManagement from "@/app/(admin-only)/admin/components/UserManagement";

export default function Admin() {
  const { data: session } = useSession();

  const isSuperAdmin = session?.user?.role === "superadmin";

  return (
    <PageContainer
      pageTitle="Admin Panel"
      pageDescription={`Your access: ${session?.user?.role}`}
    >
      <Tabs defaultValue="estimation-configs" className="mt-2">
        <TabsList className="h-10">
          <TabsTrigger value="estimation-configs" className="p-4">
            <Settings2 />
            Estimation configs
          </TabsTrigger>
          <TabsTrigger
            value="user-management"
            disabled={!isSuperAdmin}
            className="p-4"
          >
            <Users />
            User management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="estimation-configs">
          <CloudProvidersList />
          <PricingSnapshot />
        </TabsContent>

        {isSuperAdmin && (
          <TabsContent value="user-management">
            <UserManagement />
          </TabsContent>
        )}
      </Tabs>
    </PageContainer>
  );
}
