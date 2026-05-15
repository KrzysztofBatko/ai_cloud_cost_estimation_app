import { NextIntlClientProvider } from "next-intl";

import AuthGuard from "@/app/[locale]/(auth-users)/AuthGuard";
import { routing } from "@/i18n/routing";

type Locale = (typeof routing.locales)[number];

type AuthUsersLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

function isSupportedLocale(locale: string): locale is Locale {
  return (routing.locales as readonly string[]).includes(locale);
}

export default async function Layout({
  children,
  params,
}: AuthUsersLayoutProps) {
  const { locale } = await params;
  const supportedLocale = isSupportedLocale(locale)
    ? locale
    : routing.defaultLocale;
  const messages = (
    await import(`../../../../messages/auth-user/${supportedLocale}.json`)
  ).default;

  return (
    <NextIntlClientProvider locale={supportedLocale} messages={messages}>
      <AuthGuard>{children}</AuthGuard>
    </NextIntlClientProvider>
  );
}
