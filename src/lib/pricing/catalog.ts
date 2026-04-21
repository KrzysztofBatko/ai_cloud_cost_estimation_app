import {
  PricingCatalog,
  ProviderKey,
  ProviderPricing,
  ProviderRegionCatalog,
  ProviderRegionOption,
  StoredPricingCatalog,
} from "@/types/api";

export const DEFAULT_SNAPSHOT_REGION = "MULTI-REGION";
export const DEFAULT_CATALOG_AS_OF = "2026-03-30";

export const PROVIDER_REGION_OPTIONS: Record<
  ProviderKey,
  ProviderRegionOption[]
> = {
  aws: [
    { value: "eu-west-1", label: "Europe (Ireland)" },
    { value: "eu-central-1", label: "Europe (Frankfurt)" },
    { value: "us-east-1", label: "US East (N. Virginia)" },
    { value: "us-west-2", label: "US West (Oregon)" },
    { value: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
    { value: "ap-northeast-1", label: "Asia Pacific (Tokyo)" },
  ],
  azure: [
    { value: "westeurope", label: "West Europe" },
    { value: "northeurope", label: "North Europe" },
    { value: "eastus", label: "East US" },
    { value: "westus3", label: "West US 3" },
    { value: "southeastasia", label: "Southeast Asia" },
    { value: "japaneast", label: "Japan East" },
  ],
  gcp: [
    { value: "europe-west1", label: "Europe West 1 (Belgium)" },
    { value: "europe-west3", label: "Europe West 3 (Frankfurt)" },
    { value: "us-east1", label: "US East 1 (South Carolina)" },
    { value: "us-west1", label: "US West 1 (Oregon)" },
    { value: "asia-southeast1", label: "Asia Southeast 1 (Singapore)" },
    { value: "asia-northeast1", label: "Asia Northeast 1 (Tokyo)" },
  ],
  oracle: [
    { value: "eu-frankfurt-1", label: "Europe (Frankfurt)" },
    { value: "eu-amsterdam-1", label: "Europe (Amsterdam)" },
    { value: "us-ashburn-1", label: "US East (Ashburn)" },
    { value: "us-phoenix-1", label: "US West (Phoenix)" },
    { value: "ap-singapore-1", label: "Asia Pacific (Singapore)" },
    { value: "ap-tokyo-1", label: "Asia Pacific (Tokyo)" },
  ],
};

export const DEFAULT_PROVIDER_REGION_BY_PROVIDER: Record<ProviderKey, string> =
  {
    aws: "eu-west-1",
    azure: "westeurope",
    gcp: "europe-west1",
    oracle: "eu-frankfurt-1",
  };

const AWS_LINKS = [
  "https://aws.amazon.com/pricing/",
  "https://aws.amazon.com/ec2/pricing/on-demand/",
  "https://aws.amazon.com/elasticloadbalancing/pricing/",
];

const AZURE_LINKS = [
  "https://azure.microsoft.com/pricing/",
  "https://azure.microsoft.com/pricing/details/virtual-machines/",
  "https://azure.microsoft.com/pricing/details/load-balancer/",
];

const GCP_LINKS = [
  "https://cloud.google.com/pricing",
  "https://cloud.google.com/compute/all-pricing",
  "https://cloud.google.com/load-balancing/pricing",
];

const ORACLE_LINKS = [
  "https://www.oracle.com/cloud/pricing/",
  "https://www.oracle.com/cloud/compute/pricing.html",
  "https://www.oracle.com/cloud/networking/load-balancing/pricing/",
];

export const DEFAULT_PRICING_CATALOG: PricingCatalog = {
  aws: {
    defaultRegion: DEFAULT_PROVIDER_REGION_BY_PROVIDER.aws,
    regions: {
      "eu-west-1": {
        label: "Europe (Ireland)",
        pricing: {
          vmMonthly: { small: 38, medium: 76, large: 152 },
          loadBalancerMonthly: 25,
          outboundPerTbMonthly: 91,
          staticCdnMonthly: 10,
          ssrComputeMonthly: 35,
          managedDbMonthly: { postgresql: 70, mysql: 68, other: 64 },
          windowsLicenseMonthly: 35,
          msSqlLicenseMonthly: 125,
          opsOverheadMonthly: 18,
          pricingLinks: AWS_LINKS,
        },
      },
      "eu-central-1": {
        label: "Europe (Frankfurt)",
        pricing: {
          vmMonthly: { small: 41, medium: 82, large: 164 },
          loadBalancerMonthly: 27,
          outboundPerTbMonthly: 94,
          staticCdnMonthly: 11,
          ssrComputeMonthly: 37,
          managedDbMonthly: { postgresql: 75, mysql: 72, other: 69 },
          windowsLicenseMonthly: 36,
          msSqlLicenseMonthly: 129,
          opsOverheadMonthly: 18,
          pricingLinks: AWS_LINKS,
        },
      },
      "us-east-1": {
        label: "US East (N. Virginia)",
        pricing: {
          vmMonthly: { small: 34, medium: 68, large: 136 },
          loadBalancerMonthly: 22,
          outboundPerTbMonthly: 84,
          staticCdnMonthly: 9,
          ssrComputeMonthly: 31,
          managedDbMonthly: { postgresql: 64, mysql: 61, other: 58 },
          windowsLicenseMonthly: 33,
          msSqlLicenseMonthly: 118,
          opsOverheadMonthly: 17,
          pricingLinks: AWS_LINKS,
        },
      },
      "us-west-2": {
        label: "US West (Oregon)",
        pricing: {
          vmMonthly: { small: 35, medium: 70, large: 140 },
          loadBalancerMonthly: 23,
          outboundPerTbMonthly: 86,
          staticCdnMonthly: 9,
          ssrComputeMonthly: 32,
          managedDbMonthly: { postgresql: 66, mysql: 63, other: 60 },
          windowsLicenseMonthly: 33,
          msSqlLicenseMonthly: 119,
          opsOverheadMonthly: 17,
          pricingLinks: AWS_LINKS,
        },
      },
      "ap-southeast-1": {
        label: "Asia Pacific (Singapore)",
        pricing: {
          vmMonthly: { small: 40, medium: 80, large: 160 },
          loadBalancerMonthly: 26,
          outboundPerTbMonthly: 93,
          staticCdnMonthly: 10,
          ssrComputeMonthly: 36,
          managedDbMonthly: { postgresql: 73, mysql: 70, other: 67 },
          windowsLicenseMonthly: 35,
          msSqlLicenseMonthly: 126,
          opsOverheadMonthly: 18,
          pricingLinks: AWS_LINKS,
        },
      },
      "ap-northeast-1": {
        label: "Asia Pacific (Tokyo)",
        pricing: {
          vmMonthly: { small: 44, medium: 88, large: 176 },
          loadBalancerMonthly: 29,
          outboundPerTbMonthly: 101,
          staticCdnMonthly: 12,
          ssrComputeMonthly: 40,
          managedDbMonthly: { postgresql: 80, mysql: 77, other: 74 },
          windowsLicenseMonthly: 37,
          msSqlLicenseMonthly: 134,
          opsOverheadMonthly: 19,
          pricingLinks: AWS_LINKS,
        },
      },
    },
  },
  azure: {
    defaultRegion: DEFAULT_PROVIDER_REGION_BY_PROVIDER.azure,
    regions: {
      westeurope: {
        label: "West Europe",
        pricing: {
          vmMonthly: { small: 44, medium: 88, large: 176 },
          loadBalancerMonthly: 28,
          outboundPerTbMonthly: 95,
          staticCdnMonthly: 12,
          ssrComputeMonthly: 40,
          managedDbMonthly: { postgresql: 78, mysql: 75, other: 70 },
          windowsLicenseMonthly: 38,
          msSqlLicenseMonthly: 130,
          opsOverheadMonthly: 20,
          pricingLinks: AZURE_LINKS,
        },
      },
      northeurope: {
        label: "North Europe",
        pricing: {
          vmMonthly: { small: 46, medium: 92, large: 184 },
          loadBalancerMonthly: 29,
          outboundPerTbMonthly: 97,
          staticCdnMonthly: 12,
          ssrComputeMonthly: 41,
          managedDbMonthly: { postgresql: 80, mysql: 77, other: 72 },
          windowsLicenseMonthly: 39,
          msSqlLicenseMonthly: 132,
          opsOverheadMonthly: 20,
          pricingLinks: AZURE_LINKS,
        },
      },
      eastus: {
        label: "East US",
        pricing: {
          vmMonthly: { small: 39, medium: 78, large: 156 },
          loadBalancerMonthly: 24,
          outboundPerTbMonthly: 89,
          staticCdnMonthly: 10,
          ssrComputeMonthly: 34,
          managedDbMonthly: { postgresql: 69, mysql: 66, other: 62 },
          windowsLicenseMonthly: 35,
          msSqlLicenseMonthly: 121,
          opsOverheadMonthly: 18,
          pricingLinks: AZURE_LINKS,
        },
      },
      westus3: {
        label: "West US 3",
        pricing: {
          vmMonthly: { small: 40, medium: 80, large: 160 },
          loadBalancerMonthly: 25,
          outboundPerTbMonthly: 90,
          staticCdnMonthly: 10,
          ssrComputeMonthly: 35,
          managedDbMonthly: { postgresql: 70, mysql: 67, other: 63 },
          windowsLicenseMonthly: 35,
          msSqlLicenseMonthly: 122,
          opsOverheadMonthly: 18,
          pricingLinks: AZURE_LINKS,
        },
      },
      southeastasia: {
        label: "Southeast Asia",
        pricing: {
          vmMonthly: { small: 43, medium: 86, large: 172 },
          loadBalancerMonthly: 27,
          outboundPerTbMonthly: 94,
          staticCdnMonthly: 11,
          ssrComputeMonthly: 38,
          managedDbMonthly: { postgresql: 75, mysql: 72, other: 68 },
          windowsLicenseMonthly: 37,
          msSqlLicenseMonthly: 127,
          opsOverheadMonthly: 19,
          pricingLinks: AZURE_LINKS,
        },
      },
      japaneast: {
        label: "Japan East",
        pricing: {
          vmMonthly: { small: 48, medium: 96, large: 192 },
          loadBalancerMonthly: 31,
          outboundPerTbMonthly: 103,
          staticCdnMonthly: 13,
          ssrComputeMonthly: 43,
          managedDbMonthly: { postgresql: 84, mysql: 81, other: 76 },
          windowsLicenseMonthly: 40,
          msSqlLicenseMonthly: 135,
          opsOverheadMonthly: 21,
          pricingLinks: AZURE_LINKS,
        },
      },
    },
  },
  gcp: {
    defaultRegion: DEFAULT_PROVIDER_REGION_BY_PROVIDER.gcp,
    regions: {
      "europe-west1": {
        label: "Europe West 1 (Belgium)",
        pricing: {
          vmMonthly: { small: 36, medium: 72, large: 144 },
          loadBalancerMonthly: 27,
          outboundPerTbMonthly: 88,
          staticCdnMonthly: 11,
          ssrComputeMonthly: 34,
          managedDbMonthly: { postgresql: 74, mysql: 72, other: 68 },
          windowsLicenseMonthly: 34,
          msSqlLicenseMonthly: 122,
          opsOverheadMonthly: 18,
          pricingLinks: GCP_LINKS,
        },
      },
      "europe-west3": {
        label: "Europe West 3 (Frankfurt)",
        pricing: {
          vmMonthly: { small: 38, medium: 75, large: 150 },
          loadBalancerMonthly: 28,
          outboundPerTbMonthly: 90,
          staticCdnMonthly: 11,
          ssrComputeMonthly: 35,
          managedDbMonthly: { postgresql: 76, mysql: 74, other: 70 },
          windowsLicenseMonthly: 35,
          msSqlLicenseMonthly: 124,
          opsOverheadMonthly: 18,
          pricingLinks: GCP_LINKS,
        },
      },
      "us-east1": {
        label: "US East 1 (South Carolina)",
        pricing: {
          vmMonthly: { small: 33, medium: 66, large: 132 },
          loadBalancerMonthly: 24,
          outboundPerTbMonthly: 82,
          staticCdnMonthly: 9,
          ssrComputeMonthly: 30,
          managedDbMonthly: { postgresql: 66, mysql: 64, other: 60 },
          windowsLicenseMonthly: 32,
          msSqlLicenseMonthly: 116,
          opsOverheadMonthly: 17,
          pricingLinks: GCP_LINKS,
        },
      },
      "us-west1": {
        label: "US West 1 (Oregon)",
        pricing: {
          vmMonthly: { small: 34, medium: 68, large: 136 },
          loadBalancerMonthly: 25,
          outboundPerTbMonthly: 84,
          staticCdnMonthly: 9,
          ssrComputeMonthly: 31,
          managedDbMonthly: { postgresql: 67, mysql: 65, other: 61 },
          windowsLicenseMonthly: 32,
          msSqlLicenseMonthly: 117,
          opsOverheadMonthly: 17,
          pricingLinks: GCP_LINKS,
        },
      },
      "asia-southeast1": {
        label: "Asia Southeast 1 (Singapore)",
        pricing: {
          vmMonthly: { small: 38, medium: 76, large: 152 },
          loadBalancerMonthly: 27,
          outboundPerTbMonthly: 90,
          staticCdnMonthly: 10,
          ssrComputeMonthly: 35,
          managedDbMonthly: { postgresql: 73, mysql: 71, other: 67 },
          windowsLicenseMonthly: 34,
          msSqlLicenseMonthly: 123,
          opsOverheadMonthly: 18,
          pricingLinks: GCP_LINKS,
        },
      },
      "asia-northeast1": {
        label: "Asia Northeast 1 (Tokyo)",
        pricing: {
          vmMonthly: { small: 42, medium: 84, large: 168 },
          loadBalancerMonthly: 30,
          outboundPerTbMonthly: 98,
          staticCdnMonthly: 12,
          ssrComputeMonthly: 39,
          managedDbMonthly: { postgresql: 79, mysql: 76, other: 72 },
          windowsLicenseMonthly: 36,
          msSqlLicenseMonthly: 129,
          opsOverheadMonthly: 19,
          pricingLinks: GCP_LINKS,
        },
      },
    },
  },
  oracle: {
    defaultRegion: DEFAULT_PROVIDER_REGION_BY_PROVIDER.oracle,
    regions: {
      "eu-frankfurt-1": {
        label: "Europe (Frankfurt)",
        pricing: {
          vmMonthly: { small: 35, medium: 70, large: 140 },
          loadBalancerMonthly: 22,
          outboundPerTbMonthly: 40,
          staticCdnMonthly: 10,
          ssrComputeMonthly: 30,
          managedDbMonthly: { postgresql: 65, mysql: 62, other: 58 },
          windowsLicenseMonthly: 34,
          msSqlLicenseMonthly: 120,
          opsOverheadMonthly: 22,
          pricingLinks: ORACLE_LINKS,
        },
      },
      "eu-amsterdam-1": {
        label: "Europe (Amsterdam)",
        pricing: {
          vmMonthly: { small: 36, medium: 72, large: 144 },
          loadBalancerMonthly: 23,
          outboundPerTbMonthly: 42,
          staticCdnMonthly: 10,
          ssrComputeMonthly: 31,
          managedDbMonthly: { postgresql: 67, mysql: 64, other: 60 },
          windowsLicenseMonthly: 34,
          msSqlLicenseMonthly: 121,
          opsOverheadMonthly: 22,
          pricingLinks: ORACLE_LINKS,
        },
      },
      "us-ashburn-1": {
        label: "US East (Ashburn)",
        pricing: {
          vmMonthly: { small: 31, medium: 62, large: 124 },
          loadBalancerMonthly: 20,
          outboundPerTbMonthly: 35,
          staticCdnMonthly: 9,
          ssrComputeMonthly: 27,
          managedDbMonthly: { postgresql: 58, mysql: 55, other: 52 },
          windowsLicenseMonthly: 31,
          msSqlLicenseMonthly: 112,
          opsOverheadMonthly: 20,
          pricingLinks: ORACLE_LINKS,
        },
      },
      "us-phoenix-1": {
        label: "US West (Phoenix)",
        pricing: {
          vmMonthly: { small: 30, medium: 60, large: 120 },
          loadBalancerMonthly: 19,
          outboundPerTbMonthly: 34,
          staticCdnMonthly: 9,
          ssrComputeMonthly: 26,
          managedDbMonthly: { postgresql: 56, mysql: 54, other: 50 },
          windowsLicenseMonthly: 30,
          msSqlLicenseMonthly: 110,
          opsOverheadMonthly: 20,
          pricingLinks: ORACLE_LINKS,
        },
      },
      "ap-singapore-1": {
        label: "Asia Pacific (Singapore)",
        pricing: {
          vmMonthly: { small: 34, medium: 68, large: 136 },
          loadBalancerMonthly: 21,
          outboundPerTbMonthly: 39,
          staticCdnMonthly: 10,
          ssrComputeMonthly: 29,
          managedDbMonthly: { postgresql: 63, mysql: 60, other: 56 },
          windowsLicenseMonthly: 33,
          msSqlLicenseMonthly: 118,
          opsOverheadMonthly: 21,
          pricingLinks: ORACLE_LINKS,
        },
      },
      "ap-tokyo-1": {
        label: "Asia Pacific (Tokyo)",
        pricing: {
          vmMonthly: { small: 38, medium: 76, large: 152 },
          loadBalancerMonthly: 24,
          outboundPerTbMonthly: 45,
          staticCdnMonthly: 11,
          ssrComputeMonthly: 33,
          managedDbMonthly: { postgresql: 70, mysql: 67, other: 63 },
          windowsLicenseMonthly: 35,
          msSqlLicenseMonthly: 124,
          opsOverheadMonthly: 22,
          pricingLinks: ORACLE_LINKS,
        },
      },
    },
  },
};

function isProviderPricing(value: unknown): value is ProviderPricing {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ProviderPricing>;
  return !!candidate.vmMonthly && Array.isArray(candidate.pricingLinks);
}

function isProviderRegionCatalog(
  value: unknown,
): value is ProviderRegionCatalog {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ProviderRegionCatalog>;
  return typeof candidate.defaultRegion === "string" && !!candidate.regions;
}

export function getDefaultProviderRegion(providerKey: ProviderKey) {
  return DEFAULT_PROVIDER_REGION_BY_PROVIDER[providerKey];
}

export function getProviderRegionLabel(
  providerKey: ProviderKey,
  region: string,
) {
  return (
    PROVIDER_REGION_OPTIONS[providerKey].find(
      (option) => option.value === region,
    )?.label ?? region
  );
}

export function getProviderRegionOptions(providerKey: ProviderKey) {
  return PROVIDER_REGION_OPTIONS[providerKey];
}

export function resolveProviderPricing(
  catalog: StoredPricingCatalog,
  providerKey: ProviderKey,
  requestedRegion?: string,
) {
  const entry = catalog[providerKey];

  if (isProviderPricing(entry)) {
    const fallbackRegion = getDefaultProviderRegion(providerKey);
    return {
      pricing: entry,
      region: fallbackRegion,
      regionLabel: getProviderRegionLabel(providerKey, fallbackRegion),
    };
  }

  if (!isProviderRegionCatalog(entry)) {
    return null;
  }

  const region =
    (requestedRegion && entry.regions[requestedRegion]
      ? requestedRegion
      : undefined) ?? entry.defaultRegion;
  const regionEntry = entry.regions[region];

  if (!regionEntry) {
    return null;
  }

  return {
    pricing: regionEntry.pricing,
    region,
    regionLabel: regionEntry.label,
  };
}

export function isProviderKey(value: string): value is ProviderKey {
  return (
    value === "aws" ||
    value === "azure" ||
    value === "gcp" ||
    value === "oracle"
  );
}

export function normalizeProviderKey(providerName: string): ProviderKey | null {
  const name = providerName.toLowerCase();

  if (name.includes("aws") || name.includes("amazon")) {
    return "aws";
  }
  if (name.includes("azure")) {
    return "azure";
  }
  if (name.includes("google") || name.includes("gcp")) {
    return "gcp";
  }
  if (name.includes("oracle")) {
    return "oracle";
  }

  return null;
}
