import {
  normalizeProviderKey,
  resolveProviderPricing,
  type ProviderKey,
  type ProviderPricing,
} from "@/lib/pricing/catalog";
import {
  getDefaultPricingSnapshot,
  getLatestPricingSnapshot,
  type PricingSnapshot,
} from "@/lib/pricing/snapshots";

type UsageAnswers = Record<string, string>;

type EstimateBreakdown = {
  item: string;
  monthly: number;
  notes: string;
};

export type DeterministicEstimate = {
  provider: string;
  region: string;
  regionLabel: string;
  currency: string;
  monthlyTotal: number;
  dailyTotal: number;
  confidence: "low" | "medium" | "high";
  assumptions: string[];
  breakdown: EstimateBreakdown[];
  recommendation: string;
  pricingLinks: string[];
};

export type DeterministicEstimateResponse = {
  asOf: string;
  pricingAsOf: string;
  snapshotSource: string;
  estimates: DeterministicEstimate[];
};

type MsSqlDeploymentMode = "managed" | "iaas";

type ServiceOption = {
  id: string;
  label: string;
  monthly: number;
  available: boolean;
  notes: string;
  opsComplexity: number;
};

const MANAGED_MS_SQL_SERVICE_NAME: Record<ProviderKey, string> = {
  aws: "Amazon RDS for SQL Server",
  azure: "Azure SQL Managed Instance",
  gcp: "Cloud SQL for SQL Server",
  oracle: "Oracle managed SQL Server service",
};

const MANAGED_MS_SQL_AVAILABILITY: Record<ProviderKey, string[]> = {
  aws: [
    "eu-west-1",
    "eu-central-1",
    "us-east-1",
    "us-west-2",
    "ap-southeast-1",
    "ap-northeast-1",
  ],
  azure: [
    "westeurope",
    "northeurope",
    "eastus",
    "westus3",
    "southeastasia",
    "japaneast",
  ],
  gcp: [
    "europe-west1",
    "europe-west3",
    "us-east1",
    "us-west1",
    "asia-southeast1",
    "asia-northeast1",
  ],
  oracle: [],
};

const MANAGED_MS_SQL_COST_MULTIPLIER: Record<ProviderKey, number> = {
  aws: 1.55,
  azure: 1.45,
  gcp: 1.6,
  oracle: 1.7,
};

const MANAGED_ORACLE_DB_SERVICE_NAME: Record<ProviderKey, string> = {
  aws: "Amazon RDS for Oracle",
  azure: "Oracle Database@Azure",
  gcp: "Oracle Database service on Google Cloud",
  oracle: "Oracle Base Database Service",
};

const MANAGED_ORACLE_DB_AVAILABILITY: Record<ProviderKey, string[]> = {
  aws: ["eu-west-1", "eu-central-1", "us-east-1", "us-west-2", "ap-southeast-1", "ap-northeast-1"],
  azure: ["westeurope", "northeurope", "eastus", "westus3", "southeastasia", "japaneast"],
  gcp: [],
  oracle: ["eu-frankfurt-1", "eu-amsterdam-1", "us-ashburn-1", "us-phoenix-1", "ap-singapore-1", "ap-tokyo-1"],
};

const MANAGED_ORACLE_DB_COST_MULTIPLIER: Record<ProviderKey, number> = {
  aws: 1.6,
  azure: 1.65,
  gcp: 1.7,
  oracle: 1.35,
};

const MANAGED_APP_PLATFORM_AVAILABILITY: Record<ProviderKey, string[]> = {
  aws: ["eu-west-1", "eu-central-1", "us-east-1", "us-west-2", "ap-southeast-1", "ap-northeast-1"],
  azure: ["westeurope", "northeurope", "eastus", "westus3", "southeastasia", "japaneast"],
  gcp: ["europe-west1", "europe-west3", "us-east1", "us-west1", "asia-southeast1", "asia-northeast1"],
  oracle: [],
};

const MANAGED_SSR_AVAILABILITY: Record<ProviderKey, string[]> = {
  aws: MANAGED_APP_PLATFORM_AVAILABILITY.aws,
  azure: MANAGED_APP_PLATFORM_AVAILABILITY.azure,
  gcp: MANAGED_APP_PLATFORM_AVAILABILITY.gcp,
  oracle: [],
};

const EGRESS_OPTIMIZATION_AVAILABILITY: Record<ProviderKey, string[]> = {
  aws: MANAGED_APP_PLATFORM_AVAILABILITY.aws,
  azure: MANAGED_APP_PLATFORM_AVAILABILITY.azure,
  gcp: MANAGED_APP_PLATFORM_AVAILABILITY.gcp,
  oracle: [],
};

const MANAGED_GENERIC_DB_AVAILABILITY: Record<ProviderKey, string[]> = {
  aws: MANAGED_APP_PLATFORM_AVAILABILITY.aws,
  azure: MANAGED_APP_PLATFORM_AVAILABILITY.azure,
  gcp: MANAGED_APP_PLATFORM_AVAILABILITY.gcp,
  oracle: ["eu-frankfurt-1", "eu-amsterdam-1", "us-ashburn-1", "us-phoenix-1", "ap-singapore-1", "ap-tokyo-1"],
};

function isAvailable(availability: Record<ProviderKey, string[]>, providerKey: ProviderKey, region: string) {
  return availability[providerKey].includes(region);
}

function optionScore(monthly: number, opsComplexity: number, pricing: ProviderPricing) {
  return round2(monthly + opsComplexity * pricing.opsOverheadMonthly * 0.5);
}

function selectMostOptimalOption(input: {
  serviceName: string;
  options: ServiceOption[];
  assumptions: string[];
  pricing: ProviderPricing;
}) {
  const availableOptions = input.options.filter((option) => option.available);
  if (availableOptions.length === 0) {
    const fallback = input.options[0];
    input.assumptions.push(
      `${input.serviceName} availability check: no preferred managed options available, fallback to ${fallback.label}.`,
    );
    return fallback;
  }

  const ranked = [...availableOptions].sort((a, b) => {
    const scoreA = optionScore(a.monthly, a.opsComplexity, input.pricing);
    const scoreB = optionScore(b.monthly, b.opsComplexity, input.pricing);
    return scoreA - scoreB;
  });

  const selected = ranked[0];
  const comparison = ranked
    .map((option) => {
      const score = optionScore(option.monthly, option.opsComplexity, input.pricing);
      return `${option.label}: ${round2(option.monthly)} USD (score ${score})`;
    })
    .join("; ");

  input.assumptions.push(
    `${input.serviceName} availability check: ${availableOptions.map((option) => option.label).join(", ")} available.`,
    `${input.serviceName} optimization: ${comparison}. Selected ${selected.label}.`,
  );

  return selected;
}

function hasManagedMsSql(providerKey: ProviderKey, region: string) {
  return MANAGED_MS_SQL_AVAILABILITY[providerKey].includes(region);
}

function hasManagedOracleDb(providerKey: ProviderKey, region: string) {
  return MANAGED_ORACLE_DB_AVAILABILITY[providerKey].includes(region);
}

function getManagedMsSqlMonthly(
  providerKey: ProviderKey,
  pricing: ProviderPricing,
  dbHa: boolean,
) {
  const base = pricing.managedDbMonthly.other * MANAGED_MS_SQL_COST_MULTIPLIER[providerKey];
  const haMultiplier = dbHa ? 2 : 1;
  return round2(base * haMultiplier);
}

function getIaasMsSqlMonthly(pricing: ProviderPricing, vmUnitMonthly: number, dbHa: boolean) {
  const dbVmCount = dbHa ? 2 : 1;
  const dbVmMonthly = vmUnitMonthly + pricing.windowsLicenseMonthly + pricing.msSqlLicenseMonthly;
  const dbVmTotal = dbVmMonthly * dbVmCount;
  const opsTotal = pricing.opsOverheadMonthly * dbVmCount;
  return {
    dbVmCount,
    dbVmTotal: round2(dbVmTotal),
    opsTotal: round2(opsTotal),
    combinedTotal: round2(dbVmTotal + opsTotal),
  };
}

function getManagedOracleDbMonthly(
  providerKey: ProviderKey,
  pricing: ProviderPricing,
  dbHa: boolean,
) {
  const base = pricing.managedDbMonthly.other * MANAGED_ORACLE_DB_COST_MULTIPLIER[providerKey];
  const haMultiplier = dbHa ? 2 : 1;
  return round2(base * haMultiplier);
}

function getIaasOracleDbMonthly(pricing: ProviderPricing, vmUnitMonthly: number, dbHa: boolean) {
  const dbVmCount = dbHa ? 2 : 1;
  const oracleLicenseMonthly = round2(pricing.msSqlLicenseMonthly * 0.75);
  const dbVmMonthly = vmUnitMonthly + oracleLicenseMonthly;
  const dbVmTotal = dbVmMonthly * dbVmCount;
  const opsTotal = pricing.opsOverheadMonthly * dbVmCount;
  return {
    dbVmCount,
    dbVmTotal: round2(dbVmTotal),
    opsTotal: round2(opsTotal),
    combinedTotal: round2(dbVmTotal + opsTotal),
  };
}

function normalizeBackendVmCount(rawBackendVmCount?: string) {
  if (!rawBackendVmCount) {
    return 2;
  }

  if (rawBackendVmCount === "6+") {
    return 6;
  }

  const parsedCount = Number.parseInt(rawBackendVmCount, 10);
  if (Number.isNaN(parsedCount)) {
    return 2;
  }

  return Math.max(2, parsedCount);
}

function getSizeTier(usage: UsageAnswers): keyof ProviderPricing["vmMonthly"] {
  if (usage.backendSize?.startsWith("Large")) {
    return "large";
  }
  if (usage.backendSize?.startsWith("Small")) {
    return "small";
  }
  return "medium";
}

function outboundTb(usage: UsageAnswers) {
  switch (usage.outboundTraffic) {
    case "<1 TB":
      return 1;
    case "1–5 TB":
      return 3;
    case "5–10 TB":
      return 7.5;
    case "10+ TB":
      return 12;
    default:
      return 1;
  }
}

function nonProdEnvironmentCount(usage: UsageAnswers) {
  switch (usage.environments) {
    case "Prod + Dev":
      return 1;
    case "Prod + Dev + Test":
      return 2;
    case "Prod + Dev + Test + PreProd":
      return 3;
    default:
      return 0;
  }
}

function nonProdScale(usage: UsageAnswers) {
  switch (usage.nonProdScaling) {
    case "Same size as production":
      return 1;
    case "50% of production":
      return 0.5;
    case "30% of production":
      return 0.3;
    case "Minimal (dev-sized only)":
      return 0.15;
    default:
      return 0.3;
  }
}

function nonProdRuntimeFactor(usage: UsageAnswers) {
  switch (usage.nonProdSchedule) {
    case "24/7":
      return 1;
    case "Business hours only":
      return 0.35;
    case "On-demand (manual start/stop)":
      return 0.15;
    default:
      return 0.35;
  }
}

function dbManagedBase(dbEngine?: string): keyof ProviderPricing["managedDbMonthly"] {
  if (dbEngine === "PostgreSQL") {
    return "postgresql";
  }
  if (dbEngine === "MySQL") {
    return "mysql";
  }
  return "other";
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function confidenceFromUsage(usage: UsageAnswers): "low" | "medium" | "high" {
  const answered = Object.keys(usage).length;
  if (answered >= 10) {
    return "high";
  }
  if (answered >= 6) {
    return "medium";
  }
  return "low";
}

function multiplyInfraForNonProd(monthly: number, usage: UsageAnswers) {
  const envCount = nonProdEnvironmentCount(usage);
  if (envCount === 0) {
    return monthly;
  }

  const factor = 1 + envCount * nonProdScale(usage) * nonProdRuntimeFactor(usage);
  return monthly * factor;
}

function estimateForProvider(
  providerName: string,
  usage: UsageAnswers,
  snapshot: PricingSnapshot,
  providerRegions?: Record<string, string>,
): DeterministicEstimate | null {
  const providerKey = normalizeProviderKey(providerName);
  if (!providerKey) {
    return null;
  }

  const resolvedPricing = resolveProviderPricing(
    snapshot.catalog,
    providerKey,
    providerRegions?.[providerKey],
  );

  if (!resolvedPricing) {
    return null;
  }

  const { pricing, region, regionLabel } = resolvedPricing;

  const sizeTier = getSizeTier(usage);
  const vmUnitMonthly = pricing.vmMonthly[sizeTier];
  const breakdown: EstimateBreakdown[] = [];
  const assumptions: string[] = [];
  let recommendation = "Use managed database services where available to reduce operations overhead.";

  const backendDeployment = usage.backendDeployment;

  if (backendDeployment === "Serverless functions") {
    const selected = selectMostOptimalOption({
      serviceName: "Backend compute",
      pricing,
      assumptions,
      options: [
        {
          id: "serverless-functions",
          label: "Serverless functions",
          monthly: round2(pricing.ssrComputeMonthly * 0.8),
          available: true,
          notes: "Estimated baseline for light API/events workload.",
          opsComplexity: 1,
        },
        {
          id: "managed-app-runtime",
          label: "Managed app runtime",
          monthly: round2(pricing.ssrComputeMonthly * 0.9),
          available: isAvailable(MANAGED_APP_PLATFORM_AVAILABILITY, providerKey, region),
          notes: "Managed application runtime with integrated scaling and operations.",
          opsComplexity: 0.5,
        },
      ],
    });

    breakdown.push({
      item: selected.id === "managed-app-runtime" ? "Managed backend runtime" : "Serverless backend compute",
      monthly: round2(selected.monthly),
      notes: selected.notes,
    });
    assumptions.push("Backend deployment is serverless-oriented; VM backend costs are not included.");
  } else if (backendDeployment === "Containers (Kubernetes)") {
    const nodeCount = usage.backendScaling === "Auto-scaling enabled" ? 4 : 3;
    const selected = selectMostOptimalOption({
      serviceName: "Container platform",
      pricing,
      assumptions,
      options: [
        {
          id: "managed-kubernetes",
          label: "Managed Kubernetes",
          monthly: round2(vmUnitMonthly * nodeCount),
          available: true,
          notes: "Baseline node pool for container orchestration.",
          opsComplexity: 1.8,
        },
        {
          id: "managed-container-runtime",
          label: "Managed container runtime",
          monthly: round2(vmUnitMonthly * nodeCount * 0.85),
          available: isAvailable(MANAGED_APP_PLATFORM_AVAILABILITY, providerKey, region),
          notes: "Managed container service with lower operations overhead.",
          opsComplexity: 0.8,
        },
      ],
    });

    breakdown.push({
      item:
        selected.id === "managed-kubernetes"
          ? `${nodeCount}x Kubernetes worker VMs (${sizeTier})`
          : "Managed container runtime",
      monthly: round2(selected.monthly),
      notes: selected.notes,
    });
    assumptions.push(`Container baseline evaluates around ${nodeCount} worker-equivalent capacity.`);
  } else {
    const backendVmCount =
      backendDeployment === "Multiple VMs with load balancer"
        ? normalizeBackendVmCount(usage.backendVmCount)
        : 1;

    const iaasBackendMonthly =
      round2(vmUnitMonthly * backendVmCount) +
      (backendDeployment === "Multiple VMs with load balancer" ? round2(pricing.loadBalancerMonthly) : 0);

    const selected = selectMostOptimalOption({
      serviceName: "Application hosting",
      pricing,
      assumptions,
      options: [
        {
          id: "iaas-vm-pool",
          label: "Customer-managed VM pool",
          monthly: iaasBackendMonthly,
          available: true,
          notes: "Application backend compute pool.",
          opsComplexity: 2,
        },
        {
          id: "managed-app-platform",
          label: "Managed app platform",
          monthly: round2(iaasBackendMonthly * 0.9),
          available: isAvailable(MANAGED_APP_PLATFORM_AVAILABILITY, providerKey, region),
          notes: "Managed compute platform with built-in scaling and patching.",
          opsComplexity: 0.9,
        },
      ],
    });

    if (selected.id === "iaas-vm-pool") {
      const backendMonthly = round2(vmUnitMonthly * backendVmCount);
      breakdown.push({
        item: `${backendVmCount}x Backend VMs (${sizeTier})`,
        monthly: backendMonthly,
        notes: "Application backend compute pool.",
      });

      if (backendDeployment === "Multiple VMs with load balancer") {
        const lbMonthly = round2(pricing.loadBalancerMonthly);
        breakdown.push({
          item: "Load balancer",
          monthly: lbMonthly,
          notes: "Dedicated load balancer in front of backend VMs.",
        });
      }
    } else {
      breakdown.push({
        item: "Managed application platform",
        monthly: round2(selected.monthly),
        notes: selected.notes,
      });
    }

    breakdown.push({
      item: "Backend operations baseline",
      monthly: 0,
      notes: "Operations overhead is modeled in optimization scoring, not as direct line-item charge.",
    });

    if (backendDeployment === "Multiple VMs with load balancer") {
      assumptions.push(
        `Backend HA target uses ${backendVmCount} worker-equivalent capacity across at least 2 availability zones.`,
      );
    }
  }

  if (usage.frontendType === "Static site (SSG) + CDN" || usage.frontendType === "Hybrid (SSG + SSR)") {
    const cdnMultiplier = usage.frontendType === "Hybrid (SSG + SSR)" ? 1.5 : 1;
    const selected = selectMostOptimalOption({
      serviceName: "Frontend static delivery",
      pricing,
      assumptions,
      options: [
        {
          id: "cdn-storage",
          label: "Object storage + CDN",
          monthly: round2(pricing.staticCdnMonthly * cdnMultiplier),
          available: true,
          notes: "Static content delivery and object storage.",
          opsComplexity: 0.8,
        },
        {
          id: "managed-static-hosting",
          label: "Managed static hosting",
          monthly: round2(pricing.staticCdnMonthly * cdnMultiplier * 0.9),
          available: true,
          notes: "Managed static hosting with integrated CDN.",
          opsComplexity: 0.4,
        },
      ],
    });

    breakdown.push({
      item:
        selected.id === "managed-static-hosting"
          ? "Managed static hosting + CDN"
          : "Static frontend CDN/object storage",
      monthly: round2(selected.monthly),
      notes: selected.notes,
    });
  }

  if (usage.frontendType === "Server-side rendering (SSR)" || usage.frontendType === "Hybrid (SSG + SSR)") {
    const ssrBaseline = usage.frontendType === "Hybrid (SSG + SSR)"
      ? round2(pricing.ssrComputeMonthly * 0.7)
      : round2(pricing.ssrComputeMonthly);

    const selected = selectMostOptimalOption({
      serviceName: "SSR runtime",
      pricing,
      assumptions,
      options: [
        {
          id: "managed-ssr-runtime",
          label: "Managed SSR runtime",
          monthly: ssrBaseline,
          available: isAvailable(MANAGED_SSR_AVAILABILITY, providerKey, region),
          notes: "Compute baseline for server-side rendering paths.",
          opsComplexity: 0.9,
        },
        {
          id: "vm-ssr-runtime",
          label: "VM-based SSR runtime",
          monthly: round2(Math.max(ssrBaseline * 1.2, vmUnitMonthly * 0.8)),
          available: true,
          notes: "SSR hosted on customer-managed VM runtime.",
          opsComplexity: 1.8,
        },
      ],
    });

    breakdown.push({
      item: selected.id === "vm-ssr-runtime" ? "Frontend SSR compute (VM runtime)" : "Frontend SSR compute",
      monthly: round2(selected.monthly),
      notes: selected.notes,
    });
  }

  const dbHa = usage.dbHighAvailability === "Multi-zone (HA)";
  if (usage.dbEngine === "Oracle Database") {
    const managedAvailable = hasManagedOracleDb(providerKey, region);
    const managedServiceName = MANAGED_ORACLE_DB_SERVICE_NAME[providerKey];
    const managedMonthly = managedAvailable
      ? getManagedOracleDbMonthly(providerKey, pricing, dbHa)
      : null;
    const iaas = getIaasOracleDbMonthly(pricing, vmUnitMonthly, dbHa);

    const useManaged = managedAvailable && managedMonthly !== null && managedMonthly <= iaas.combinedTotal;

    if (useManaged && managedMonthly !== null) {
      breakdown.push({
        item: dbHa ? "Managed Oracle database (HA)" : "Managed Oracle database",
        monthly: managedMonthly,
        notes: dbHa
          ? `${managedServiceName} selected as the most cost-optimal available option with HA.`
          : `${managedServiceName} selected as the most cost-optimal available option.`,
      });

      recommendation =
        "Use managed Oracle Database where available in the selected region to reduce operational overhead and simplify HA.";
      assumptions.push(
        `Oracle DB availability check: ${managedServiceName} is available in ${region}.`,
        `Oracle DB option comparison (monthly): managed ${managedMonthly} USD vs customer-managed IaaS ${iaas.combinedTotal} USD. Managed selected as cost-optimal.`,
      );
      if (dbHa) {
        assumptions.push("Managed Oracle DB HA pricing assumes primary + standby topology across zones.");
      }
    } else {
      breakdown.push({
        item: `${iaas.dbVmCount}x Customer-managed Oracle DB on IaaS VM`,
        monthly: iaas.dbVmTotal,
        notes: "Includes estimated Oracle database licensing baseline.",
      });

      breakdown.push({
        item: "Operational overhead for customer-managed Oracle DB",
        monthly: iaas.opsTotal,
        notes: "Patching, backup operations, monitoring, and failover runbooks.",
      });

      recommendation =
        "Use customer-managed Oracle DB on IaaS when managed Oracle DB is unavailable or not cost-optimal in the selected region.";
      if (managedAvailable && managedMonthly !== null) {
        assumptions.push(
          `Oracle DB availability check: ${managedServiceName} is available in ${region}.`,
          `Oracle DB option comparison (monthly): managed ${managedMonthly} USD vs customer-managed IaaS ${iaas.combinedTotal} USD. IaaS selected as cost-optimal.`,
        );
      } else {
        assumptions.push(
          `Oracle DB availability check: ${managedServiceName} is not available in ${region}; fallback to customer-managed Oracle DB on IaaS.`,
        );
      }
      if (dbHa) {
        assumptions.push("Oracle DB HA on IaaS uses 2 dedicated DB VMs (primary + secondary) in separate zones.");
      }

      if (usage.backendDeployment === "Multiple VMs with load balancer") {
        assumptions.push("Backend VM pool and Oracle DB VM pool are separate and not shared.");
      }
    }
  } else if (usage.dbEngine === "MS SQL") {
    const managedAvailable = hasManagedMsSql(providerKey, region);
    const managedServiceName = MANAGED_MS_SQL_SERVICE_NAME[providerKey];
    const managedMonthly = managedAvailable
      ? getManagedMsSqlMonthly(providerKey, pricing, dbHa)
      : null;
    const iaas = getIaasMsSqlMonthly(pricing, vmUnitMonthly, dbHa);

    const selectedMode: MsSqlDeploymentMode =
      managedAvailable && managedMonthly !== null && managedMonthly <= iaas.combinedTotal
        ? "managed"
        : "iaas";

    if (selectedMode === "managed" && managedMonthly !== null) {
      breakdown.push({
        item: dbHa ? "Managed MS SQL database (HA)" : "Managed MS SQL database",
        monthly: managedMonthly,
        notes: dbHa
          ? `${managedServiceName} selected as the most cost-optimal available option with HA.`
          : `${managedServiceName} selected as the most cost-optimal available option.`,
      });

      recommendation =
        "Use managed MS SQL where available in the selected region to reduce operational overhead and simplify HA.";
      assumptions.push(
        `MS SQL service availability check: ${managedServiceName} is available in ${region}.`,
        `MS SQL option comparison (monthly): managed ${managedMonthly} USD vs customer-managed IaaS ${iaas.combinedTotal} USD. Managed selected as cost-optimal.`,
      );
      if (dbHa) {
        assumptions.push("Managed SQL HA pricing assumes primary + standby topology across zones.");
      }
    } else {
      breakdown.push({
        item: `${iaas.dbVmCount}x Customer-managed MS SQL on IaaS VM`,
        monthly: iaas.dbVmTotal,
        notes: "Includes Windows Server and SQL Server licensing.",
      });

      breakdown.push({
        item: "Operational overhead for customer-managed SQL",
        monthly: iaas.opsTotal,
        notes: "Patching, backups, monitoring, and failover operations.",
      });

      recommendation =
        "Use customer-managed SQL Server on IaaS only when managed MS SQL is unavailable or not cost-optimal in the selected region.";
      if (managedAvailable && managedMonthly !== null) {
        assumptions.push(
          `MS SQL service availability check: ${managedServiceName} is available in ${region}.`,
          `MS SQL option comparison (monthly): managed ${managedMonthly} USD vs customer-managed IaaS ${iaas.combinedTotal} USD. IaaS selected as cost-optimal.`,
        );
      } else {
        assumptions.push(
          `MS SQL service availability check: ${managedServiceName} is not available in ${region}; fallback to customer-managed SQL on IaaS.`,
        );
      }
      if (dbHa) {
        assumptions.push("Database HA uses 2 dedicated SQL VMs (primary + secondary) in separate zones.");
      }

      if (usage.backendDeployment === "Multiple VMs with load balancer") {
        assumptions.push("Backend VM pool and DB VM pool are separate and not shared.");
      }
    }
  } else {
    const dbBase = pricing.managedDbMonthly[dbManagedBase(usage.dbEngine)];
    const haMultiplier = dbHa ? 2 : 1;
    const managedMonthly = round2(dbBase * haMultiplier);
    const iaasVmCount = dbHa ? 2 : 1;
    const iaasMonthly = round2(vmUnitMonthly * iaasVmCount + pricing.opsOverheadMonthly * iaasVmCount);

    const selected = selectMostOptimalOption({
      serviceName: "Database engine",
      pricing,
      assumptions,
      options: [
        {
          id: "managed-db",
          label: "Managed database service",
          monthly: managedMonthly,
          available: isAvailable(MANAGED_GENERIC_DB_AVAILABILITY, providerKey, region),
          notes: dbHa
            ? "Primary + standby topology across availability zones."
            : "Single managed database instance.",
          opsComplexity: 0.8,
        },
        {
          id: "iaas-db",
          label: "Customer-managed database on IaaS",
          monthly: iaasMonthly,
          available: true,
          notes: "Database hosted on customer-managed VMs with operational overhead.",
          opsComplexity: 2,
        },
      ],
    });

    if (selected.id === "managed-db") {
      breakdown.push({
        item: dbHa ? "Managed database (HA)" : "Managed database",
        monthly: round2(selected.monthly),
        notes: selected.notes,
      });
    } else {
      breakdown.push({
        item: `${iaasVmCount}x Customer-managed database VMs`,
        monthly: round2(vmUnitMonthly * iaasVmCount),
        notes: "Database compute on customer-managed virtual machines.",
      });
      breakdown.push({
        item: "Operational overhead for customer-managed database",
        monthly: round2(pricing.opsOverheadMonthly * iaasVmCount),
        notes: "Patching, backup operations, and high-availability runbooks.",
      });
    }
  }

  const outboundBase = round2(pricing.outboundPerTbMonthly * outboundTb(usage));
  const outboundSelected = selectMostOptimalOption({
    serviceName: "Outbound network",
    pricing,
    assumptions,
    options: [
      {
        id: "standard-egress",
        label: "Standard outbound internet",
        monthly: outboundBase,
        available: true,
        notes: `Estimated from ${usage.outboundTraffic ?? "<1 TB"} pricing tier.`,
        opsComplexity: 0.6,
      },
      {
        id: "egress-optimized",
        label: "Egress optimization package",
        monthly: round2(outboundBase * 0.88),
        available: isAvailable(EGRESS_OPTIMIZATION_AVAILABILITY, providerKey, region),
        notes: "Estimated with routing and transfer optimization features.",
        opsComplexity: 1,
      },
    ],
  });

  breakdown.push({
    item:
      outboundSelected.id === "egress-optimized"
        ? "Outbound internet data transfer (optimized)"
        : "Outbound internet data transfer",
    monthly: round2(outboundSelected.monthly),
    notes: outboundSelected.notes,
  });

  const infraItems = new Set([
    "Serverless backend compute",
    "Managed backend runtime",
    "Load balancer",
    "Operational overhead for customer-managed SQL",
    "Operational overhead for customer-managed Oracle DB",
    "Operational overhead for customer-managed database",
    "Managed database",
    "Managed database (HA)",
    "Managed MS SQL database",
    "Managed MS SQL database (HA)",
    "Managed Oracle database",
    "Managed Oracle database (HA)",
    "Managed application platform",
    "Managed static hosting + CDN",
    "Frontend SSR compute (VM runtime)",
    "Frontend SSR compute",
    "Backend operations baseline",
  ]);

  const adjustedBreakdown = breakdown.map((line) => {
    const shouldScaleForNonProd =
      infraItems.has(line.item) ||
      line.item.includes("Backend VMs") ||
      line.item.includes("Kubernetes") ||
      line.item.includes("MS SQL");

    if (!shouldScaleForNonProd) {
      return line;
    }

    return {
      ...line,
      monthly: round2(multiplyInfraForNonProd(line.monthly, usage)),
    };
  });

  const monthlyTotal = round2(
    adjustedBreakdown.reduce((acc, line) => acc + line.monthly, 0),
  );

  assumptions.push(
    `Selected provider region: ${regionLabel} (${region}).`,
    `Prices are snapshot-based estimates (pricing snapshot ${snapshot.pricingAsOf}, source: ${snapshot.source}) and may differ from real-time billing.`,
  );

  return {
    provider: providerName,
    region,
    regionLabel,
    currency: "USD",
    monthlyTotal,
    dailyTotal: round2(monthlyTotal / 30),
    confidence: confidenceFromUsage(usage),
    assumptions,
    breakdown: adjustedBreakdown,
    recommendation,
    pricingLinks: pricing.pricingLinks,
  };
}

async function resolvePricingSnapshot() {
  try {
    const latestSnapshot = await getLatestPricingSnapshot();
    return latestSnapshot ?? getDefaultPricingSnapshot();
  } catch {
    return getDefaultPricingSnapshot();
  }
}

export async function buildDeterministicEstimates(input: {
  providers?: string[];
  usage?: UsageAnswers;
  providerRegions?: Record<string, string>;
}): Promise<DeterministicEstimateResponse | null> {
  const providers = input.providers ?? [];
  if (providers.length === 0) {
    return null;
  }

  const usage = input.usage ?? {};
  const snapshot = await resolvePricingSnapshot();
  const providerRegions = input.providerRegions ?? {};
  const estimates = providers
    .map((providerName) =>
      estimateForProvider(providerName, usage, snapshot, providerRegions),
    )
    .filter((estimate): estimate is DeterministicEstimate => estimate !== null);

  if (estimates.length === 0) {
    return null;
  }

  return {
    asOf: snapshot.pricingAsOf,
    pricingAsOf: snapshot.pricingAsOf,
    snapshotSource: snapshot.source,
    estimates,
  };
}
