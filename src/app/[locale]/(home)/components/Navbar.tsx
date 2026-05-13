"use client";
import { signOut, useSession } from "next-auth/react";
import { Cloud, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, usePathname } from "@/i18n/navigation";
import LanguageSwitcher from "@/app/[locale]/(home)/components/LanguageSwitcher";
import { useLocale, useTranslations } from "next-intl";

export default function Navbar() {
  const t = useTranslations("home.navbar");
  const currentLocale = useLocale();
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isAuthRoute = pathname?.startsWith("/auth");
  const isAdminActive = pathname === "/admin";
  const isStatisticsActive = pathname === "/statistics";
  const isEstimationActive = pathname?.startsWith("/estimation");
  const isProfileActive = pathname === "/profile";

  const isAdmin =
    session?.user?.role === "admin" || session?.user?.role === "superadmin";

  return (
    <nav className="sticky top-0 z-50 border-b border-border/60 bg-card/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Cloud className="h-7 w-7 text-accent" />
          <span className="text-lg font-bold text-foreground hidden sm:inline">
            AI Cloud Cost Estimation
          </span>
        </Link>
        <div className="flex items-center gap-3">
          {isAuthRoute ? (
            <Link href="/">
              <Button variant="ghost" size="sm">
                Home
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              {isAdmin && session?.user && (
                <>
                  <Link href="/admin">
                    <Button
                      variant={isAdminActive ? "outline" : "ghost"}
                      size="sm"
                    >
                      Admin
                    </Button>
                  </Link>
                  <Link href="/statistics">
                    <Button
                      variant={isStatisticsActive ? "outline" : "ghost"}
                      size="sm"
                    >
                      Statistics
                    </Button>
                  </Link>
                </>
              )}

              {session?.user ? (
                <div className="flex items-center gap-3">
                  <Link href="/estimation">
                    <Button
                      variant={isEstimationActive ? "outline" : "ghost"}
                      size="sm"
                    >
                      Estimation
                    </Button>
                  </Link>
                  <Link
                    href="/profile"
                    className={`flex items-center gap-2 rounded-md px-1.5 py-1 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      isProfileActive ? "bg-muted" : ""
                    }`}
                    aria-label="View profile"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session?.user?.image ?? undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {session?.user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden text-sm font-medium text-foreground sm:inline">
                      {session?.user?.name}
                    </span>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      signOut({ callbackUrl: `/${currentLocale}` })
                    }
                  >
                    <LogOut className="mr-1.5 h-4 w-4" />
                    {t("logout")}
                  </Button>
                </div>
              ) : (
                <Link href="/auth/signin">
                  <Button size="sm" disabled={status === "loading"}>
                    {t("login")}
                  </Button>
                </Link>
              )}
            </div>
          )}
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
}
