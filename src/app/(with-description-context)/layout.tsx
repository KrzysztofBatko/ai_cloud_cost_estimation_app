import { DescriptionProvider } from "@/app/(with-description-context)/DescriptionContextProvider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DescriptionProvider>{children}</DescriptionProvider>;
}
