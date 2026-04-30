import AuthGuard from "@/app/(auth-users)/AuthGuard";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
