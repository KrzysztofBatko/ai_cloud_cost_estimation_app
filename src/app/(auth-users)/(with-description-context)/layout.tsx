import { DescriptionProvider } from "@/app/(auth-users)/(with-description-context)/DescriptionProvider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DescriptionProvider>{children}</DescriptionProvider>;
}
