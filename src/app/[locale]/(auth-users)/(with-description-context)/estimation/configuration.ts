import {
  BarChart2,
  Monitor,
  Server,
  Database,
  Shield,
  Layers,
  Zap,
} from "lucide-react";

export type UsageAnswers = Record<string, string>;

export type UsageQuestion = {
  id: string;
  label: string;
  options: string[] | ((answers: UsageAnswers) => string[]);
  category: string;
  showWhen?: (answers: UsageAnswers) => boolean;
};

export const usageQuestions: UsageQuestion[] = [
  // =========================
  // Application Usage
  // =========================
  {
    id: "MAU",
    label: "Monthly active users (MAU)",
    options: ["1_100", "100_1000", "1000_10000", "10000_50000", "50000_"],
    category: "ApplicationUsage",
  },
  {
    id: "outboundTraffic",
    label: "Outbound internet traffic (TB/month)",
    options: ["_1", "1_5", "5_10", "10_"],
    category: "ApplicationUsage",
  },

  // =========================
  // Frontend
  // =========================
  {
    id: "frontendType",
    label: "Frontend architecture",
    options: [
      "Static site (SSG) + CDN",
      "Server-side rendering (SSR)",
      "Hybrid (SSG + SSR)",
    ],
    category: "Frontend",
  },

  // =========================
  // Backend
  // =========================
  {
    id: "backendDeployment",
    label: "Backend deployment model",
    options: [
      "Single VM",
      "Multiple VMs with load balancer",
      "Containers (Kubernetes)",
      "Serverless functions",
    ],
    category: "Backend",
  },
  {
    id: "serverlessWorkloadType",
    label: "Serverless workload type",
    options: [
      "HTTP / light API",
      "Event-driven processing",
      "Background jobs / scheduled tasks",
    ],
    category: "Backend",
    showWhen: (answers) => answers.backendDeployment === "Serverless functions",
  },
  {
    id: "backendVmCount",
    label: "How many backend VMs do you want behind the load balancer?",
    options: ["2", "3", "4", "5", "6+"],
    category: "Backend",
    showWhen: (answers) =>
      answers.backendDeployment === "Multiple VMs with load balancer",
  },
  {
    id: "backendSize",
    label: "Backend instance size (per instance)",
    options: [
      "Small (1–2 vCPU, 2–4 GB RAM)",
      "Medium (2–4 vCPU, 4–8 GB RAM)",
      "Large (4+ vCPU, 8+ GB RAM)",
    ],
    category: "Backend",
    showWhen: (answers) => answers.backendDeployment !== "Serverless functions",
  },
  {
    id: "backendScaling",
    label: "Backend scaling strategy",
    options: (answers) => {
      if (answers.backendDeployment === "Single VM") {
        return ["Single instance only"];
      }

      if (answers.backendDeployment === "Multiple VMs with load balancer") {
        return ["Fixed number of instances", "Auto-scaling enabled"];
      }

      if (answers.backendDeployment === "Containers (Kubernetes)") {
        return ["Fixed number of instances", "Auto-scaling enabled"];
      }

      return [];
    },
    category: "Backend",
    showWhen: (answers) => answers.backendDeployment !== "Serverless functions",
  },

  // =========================
  // Database
  // =========================
  {
    id: "dbEngine",
    label: "Database engine",
    options: ["PostgreSQL", "MySQL", "MS SQL", "Oracle Database", "Other"],
    category: "Database",
  },
  {
    id: "dbSize",
    label: "Database storage size",
    options: ["_100", "100_1000", "1000_5000", "5000_10000", "10000_"],
    category: "Database",
  },
  {
    id: "dbHighAvailability",
    label: "Database high availability",
    options: ["Single instance", "Multi-zone (HA)"],
    category: "Database",
  },

  // =========================
  // Backup & DR
  // =========================
  {
    id: "backupRetention",
    label: "Backup retention period",
    options: ["7 days", "30 days", "90 days", "180+ days"],
    category: "BackupDR",
  },
  {
    id: "disasterRecovery",
    label: "Cross-region disaster recovery",
    options: ["No", "Backup only", "Active standby (warm replica)"],
    category: "BackupDR",
  },

  // =========================
  // Environments
  // =========================
  {
    id: "environments",
    label: "Environments required",
    options: [
      "Production only",
      "Prod + Dev",
      "Prod + Dev + Test",
      "Prod + Dev + Test + PreProd",
    ],
    category: "Environments",
  },
  {
    id: "nonProdScaling",
    label: "Non-production environment size",
    options: [
      "Same size as production",
      "50% of production",
      "30% of production",
      "Minimal (dev-sized only)",
    ],
    category: "Environments",
  },
  {
    id: "nonProdSchedule",
    label: "Non-production runtime",
    options: ["24/7", "Business hours only", "On-demand (manual start/stop)"],
    category: "Environments",
  },

  // =========================
  // Availability
  // =========================
  {
    id: "availability",
    label: "Target availability (SLA)",
    options: ["99", "99_9", "99_99"],
    category: "Availability",
  },
];

export function isQuestionVisible(
  question: UsageQuestion,
  answers: UsageAnswers,
) {
  return question.showWhen ? question.showWhen(answers) : true;
}

export function getQuestionOptions(
  question: UsageQuestion,
  answers: UsageAnswers,
) {
  return typeof question.options === "function"
    ? question.options(answers)
    : question.options;
}

export const categoryMeta: Record<
  string,
  { icon: React.ElementType; label: string }
> = {
  ApplicationUsage: {
    icon: BarChart2,
    label: "Application Usage",
  },
  Frontend: {
    icon: Monitor,
    label: "Frontend",
  },
  Backend: {
    icon: Server,
    label: "Backend",
  },
  Database: {
    icon: Database,
    label: "Database",
  },
  BackupDR: {
    icon: Shield,
    label: "Backup & DR",
  },
  Environments: {
    icon: Layers,
    label: "Environments",
  },
  Availability: {
    icon: Zap,
    label: "Availability",
  },
};
