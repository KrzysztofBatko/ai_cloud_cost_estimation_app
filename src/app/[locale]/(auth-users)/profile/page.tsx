import PageContainer from "@/components/PageContainer";
import ProfileDetails from "@/app/[locale]/(auth-users)/profile/components/ProfileDetails";

export default function ProfilePage() {
  return (
    <PageContainer
      pageTitle="My Profile"
      pageDescription="Your signed-in account details"
    >
      <div className="h-auto lg:h-165">
        <ProfileDetails />
      </div>
    </PageContainer>
  );
}
