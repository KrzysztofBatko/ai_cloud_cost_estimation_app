"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const steps = [
  {
    step: "01",
    key: "selectUsage",
  },
  {
    step: "02",
    key: "aiAnalysis",
  },
  {
    step: "03",
    key: "compareCosts",
  },
] as const;

export default function HowItWorksSection() {
  const t = useTranslations("home.howItWorks");

  return (
    <section className="py-24 bg-muted/40">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-3xl font-bold text-foreground md:text-4xl">
          {t("title")}
        </h2>
        <div className="mt-16 grid gap-10 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="text-center"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                {step.step}
              </div>
              <h3 className="mt-6 text-xl font-semibold text-foreground">
                {t(`steps.${step.key}.title`)}
              </h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                {t(`steps.${step.key}.description`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
