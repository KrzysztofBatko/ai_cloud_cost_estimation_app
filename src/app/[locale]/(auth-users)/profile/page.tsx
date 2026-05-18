"use client";

import PageContainer from "@/components/PageContainer";
import ProfileDetails from "@/app/[locale]/(auth-users)/profile/components/ProfileDetails";
import { useTranslations } from "next-intl";

export default function ProfilePage() {
  const t = useTranslations("profile.page");

  return (
    <PageContainer
      pageTitle={t("title")}
      pageDescription={t("description")}
    >
      <div className="h-auto lg:h-165">
        <ProfileDetails />
      </div>
    </PageContainer>
  );
}
