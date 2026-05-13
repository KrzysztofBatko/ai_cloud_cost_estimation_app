"use client";

import {
  ArrowRight,
  Cloud,
  Server,
  Database,
  Sparkles,
  FileText,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function HeroSection() {
  const t = useTranslations("home.hero");

  return (
    <section className="relative overflow-hidden gradient-hero py-24 md:py-36">
      {/* Floating icons */}
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-[10%] opacity-10"
      >
        <Cloud className="h-20 w-20 text-primary-foreground" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute bottom-16 right-[15%] opacity-10"
      >
        <Server className="h-16 w-16 text-primary-foreground" />
      </motion.div>
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
        className="absolute top-32 right-[25%] opacity-10"
      >
        <Database className="h-14 w-14 text-primary-foreground" />
      </motion.div>

      <div className="container relative mx-auto px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-primary-foreground md:text-6xl"
        >
          {t("title")}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-primary-foreground/75"
        >
          {t("description")}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/estimation"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-white/90"
          >
            {t("startEstimating")}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <Link
            href="/description"
            className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
          >
            <Sparkles className="h-4 w-4" />
            {t("environmentDescription")}
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <div className="mx-auto  grid max-w-3xl gap-4 text-left sm:grid-cols-2">
            <div className="rounded-xl border border-white/15 bg-white/5 p-5 backdrop-blur">
              <div className="flex items-center gap-2 font-semibold  text-white">
                <ArrowRight className="h-4 w-4" />
                {t("guidedForm.title")}
              </div>
              <p className="mt-2 text-sm text-white/70">
                {t("guidedForm.description")}
              </p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 p-5 backdrop-blur">
              <div className="flex items-center gap-2 font-semibold  text-white">
                <FileText className="h-4 w-4" />
                {t("describeEnvironment.title")}
              </div>
              <p className="mt-2 text-sm text-white/70">
                {t("describeEnvironment.description")}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
