import { NextIntlClientProvider } from "next-intl";

import AdminGuard from "@/app/[locale]/(admin-only)/AdminGuard";
import { routing } from "@/i18n/routing";

type Locale = (typeof routing.locales)[number];

type AdminLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

function isSupportedLocale(locale: string): locale is Locale {
  return (routing.locales as readonly string[]).includes(locale);
}

export default async function Layout({ children, params }: AdminLayoutProps) {
  const { locale } = await params;
  const supportedLocale = isSupportedLocale(locale)
    ? locale
    : routing.defaultLocale;
  const messages = (
    await import(`../../../../messages/admin/${supportedLocale}.json`)
  ).default;

  return (
    <NextIntlClientProvider locale={supportedLocale} messages={messages}>
      <AdminGuard>{children}</AdminGuard>
    </NextIntlClientProvider>
  );
}
