"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import PageContainer from "@/components/PageContainer";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") ?? "Default";

  return (
    <PageContainer>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="flex flex-col items-center gap-6 pt-8"
      >
        <div className="text-center">
          <h1>Failed to log in</h1>
          <h3>code: {error}</h3>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/signin">
            <Button size="lg">Try again</Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="lg">
              Go back to Homepage
            </Button>
          </Link>
        </div>
      </motion.div>
    </PageContainer>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense>
      <AuthErrorContent />
    </Suspense>
  );
}
