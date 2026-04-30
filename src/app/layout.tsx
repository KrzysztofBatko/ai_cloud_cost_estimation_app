import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "./AuthProvider";

import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/app/(home)/components/Navbar";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <TooltipProvider>
            <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
              <Navbar />
              {children}
            </div>
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
