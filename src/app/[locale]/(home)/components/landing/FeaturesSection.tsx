"use client";

import { BarChart3, Brain, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const features = [
  {
    icon: BarChart3,
    key: "multiCloud",
  },
  {
    icon: Brain,
    key: "aiEstimation",
  },
  {
    icon: Layers,
    key: "architectureAnalysis",
  },
] as const;

export default function FeaturesSection() {
  const t = useTranslations("home.features");

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-3xl font-bold text-foreground md:text-4xl">
          {t("title")}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
          {t("description")}
        </p>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="group rounded-2xl border border-border bg-card p-8 shadow-card transition-all hover:shadow-card-hover hover:-translate-y-1"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <feature.icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-card-foreground">
                {t(`items.${feature.key}.title`)}
              </h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                {t(`items.${feature.key}.description`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
