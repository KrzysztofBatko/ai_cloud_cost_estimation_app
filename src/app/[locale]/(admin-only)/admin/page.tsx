"use client";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import PageContainer from "@/components/PageContainer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings2, Users } from "lucide-react";
import CloudProvidersList from "@/app/[locale]/(admin-only)/admin/components/CloudProvidersList";
import PricingSnapshot from "@/app/[locale]/(admin-only)/admin/components/PricingSnapshot";
import UserManagement from "@/app/[locale]/(admin-only)/admin/components/UserManagement";

export default function Admin() {
  const { data: session } = useSession();
  const t = useTranslations("admin");
  const role = session?.user?.role;

  const isSuperAdmin = session?.user?.role === "superadmin";
  const accessRole = role ? t(`users.roles.${role}`) : "-";

  return (
    <PageContainer
      pageTitle={t("page.title")}
      pageDescription={t("page.access", { role: accessRole })}
    >
      <Tabs defaultValue="estimation-configs" className="mt-2">
        <TabsList className="h-10">
          <TabsTrigger value="estimation-configs" className="p-4">
            <Settings2 />
            {t("tabs.estimationConfigs")}
          </TabsTrigger>
          <TabsTrigger
            value="user-management"
            disabled={!isSuperAdmin}
            className="p-4"
          >
            <Users />
            {t("tabs.userManagement")}
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
