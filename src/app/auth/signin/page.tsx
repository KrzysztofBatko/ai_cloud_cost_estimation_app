"use client";

import { useEffect, useState } from "react";
import { getProviders, signIn } from "next-auth/react";
import type { ClientSafeProvider } from "next-auth/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import PageContainer from "@/components/PageContainer";

export default function SignInPage() {
  const [providers, setProviders] = useState<Record<
    string,
    ClientSafeProvider
  > | null>(null);

  useEffect(() => {
    getProviders().then((res) => setProviders(res));
  }, []);

  return (
    <PageContainer>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="flex flex-col items-center gap-6 pt-8"
      >
        <div className="text-center">
          <h1>Sign in</h1>
          <h3>
            Choose your preferred sign in method to continue to the dashboard.
          </h3>
        </div>
        <div>
          {providers
            ? Object.values(providers).map((provider) => (
                <Button
                  key={provider.id}
                  size="lg"
                  onClick={() => signIn(provider.id, { callbackUrl: "/" })}
                >
                  Sign in with {provider.name}
                </Button>
              ))
            : null}
        </div>
      </motion.div>
    </PageContainer>
  );
}
