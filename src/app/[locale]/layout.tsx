import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";

import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/app/[locale]/(home)/components/Navbar";
import AuthProvider from "@/app/[locale]/AuthProvider";
import { routing } from "@/i18n/routing";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Cloud Cost Estimation",
  description:
    "Get accurate cloud cost estimates with AI-powered insights. Optimize your cloud spending and make informed decisions with our user-friendly platform.",
};

type Locale = (typeof routing.locales)[number];

function isLocale(value: string): value is Locale {
  return (routing.locales as readonly string[]).includes(value);
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            <TooltipProvider>
              <Navbar />
              {children}
            </TooltipProvider>
          </AuthProvider>
          <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
            © 2026 AI Cloud Cost Estimation. All rights reserved.
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
