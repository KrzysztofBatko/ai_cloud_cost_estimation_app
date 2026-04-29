import { FeatureDescriptionProvider } from "@/app/(with-description-context)/DescriptionContextProvider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <FeatureDescriptionProvider>{children}</FeatureDescriptionProvider>;
}
