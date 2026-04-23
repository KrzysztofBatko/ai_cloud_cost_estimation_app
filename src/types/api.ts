import { type NextResponse } from "next/server";
import { type Session } from "next-auth";

export type SessionResult =
  | { session: Session; response?: never }
  | { session?: never; response: NextResponse };

export interface SessionGuardOptions {
  allowedRoles?: Role[];
  forbiddenMessage?: string;
  forbiddenStatus?: number;
}

export type Role = "user" | "admin" | "superadmin";

export const ROLES: Role[] = ["user", "admin", "superadmin"];

export const hasAllowedRole = (value: unknown): value is Role =>
  typeof value === "string" && ROLES.includes(value as Role);

export type User = {
  email: string;
  name: string | null;
  role: Role;
};

export type Provider = {
  id: string;
  name: string;
  isActive: boolean;
  defaultRegion?: string | null;
  regions?: ProviderRegion[];
};

export type ProviderKey = "aws" | "azure" | "gcp" | "oracle";

export type ProviderRegion = {
  id: string;
  value: string;
  label: string;
  isDefault: boolean;
};

export type ProviderPricing = {
  vmMonthly: {
    small: number;
    medium: number;
    large: number;
  };
  loadBalancerMonthly: number;
  outboundPerTbMonthly: number;
  staticCdnMonthly: number;
  ssrComputeMonthly: number;
  managedDbMonthly: {
    postgresql: number;
    mysql: number;
    other: number;
  };
  windowsLicenseMonthly: number;
  msSqlLicenseMonthly: number;
  opsOverheadMonthly: number;
  pricingLinks: string[];
};

export type ProviderRegionOption = {
  value: string;
  label: string;
};

export type ProviderRegionCatalog = {
  defaultRegion: string;
  regions: Record<string, { label: string; pricing: ProviderPricing }>;
};
export type LegacyPricingCatalog = Record<ProviderKey, ProviderPricing>;
export type PricingCatalog = Record<ProviderKey, ProviderRegionCatalog>;
export type StoredPricingCatalog = PricingCatalog | LegacyPricingCatalog;

export type PricingSnapshot = {
  id: string;
  region: string;
  pricingAsOf: string;
  source: string;
  catalog: StoredPricingCatalog;
  notes: string | null;
  createdAt: string;
  createdBy: string | null;
};

export type SingleStatistics = {
  provider: string;
  count: number;
};
