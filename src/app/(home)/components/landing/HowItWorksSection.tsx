import { motion } from "framer-motion";

const steps = [
  {
    step: "01",
    title: "Select providers & usage",
    description:
      "Choose cloud providers, specify your workload, and define usage ranges.",
  },
  {
    step: "02",
    title: "AI analyzes your infrastructure",
    description:
      "Our AI engine processes your requirements and builds detailed cost models.",
  },
  {
    step: "03",
    title: "Compare estimated costs instantly",
    description:
      "Review structured cost breakdowns and choose the best option for you.",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-24 bg-muted/40">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-3xl font-bold text-foreground md:text-4xl">
          How It Works
        </h2>
        <div className="mt-16 grid gap-10 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="text-center"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                {s.step}
              </div>
              <h3 className="mt-6 text-xl font-semibold text-foreground">
                {s.title}
              </h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                {s.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
