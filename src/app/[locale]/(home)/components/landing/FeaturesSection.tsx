import { BarChart3, Brain, Layers } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: BarChart3,
    title: "Multi-Cloud Comparison",
    description:
      "Compare costs across AWS, Azure, Google Cloud and more — side by side in a single view.",
  },
  {
    icon: Brain,
    title: "AI-Based Cost Estimation",
    description:
      "Leverage advanced AI to generate accurate, context-aware cost breakdowns for your workloads.",
  },
  {
    icon: Layers,
    title: "Architecture-Aware Analysis",
    description:
      "Provide your infrastructure details and get tailored estimates that match your real architecture.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-3xl font-bold text-foreground md:text-4xl">
          Why Choose Our Platform
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
          Everything you need to make data-driven cloud infrastructure
          decisions.
        </p>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="group rounded-2xl border border-border bg-card p-8 shadow-card transition-all hover:shadow-card-hover hover:-translate-y-1"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <f.icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-card-foreground">
                {f.title}
              </h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
