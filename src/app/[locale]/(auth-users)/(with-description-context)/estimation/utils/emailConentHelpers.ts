import type { EstimateResponse } from "@/app/api/estimation/route";

type EmailContentLabels = {
  title: string;
  pricingSnapshot: string;
  calculatedAt: string;
  region: string;
  monthly: string;
  daily: string;
  assumptions: string;
  breakdown: string;
  pricingLinks: string;
  notes: string;
  generatedBy: string;
  confidence: Record<string, string>;
};

export function createEmailContent(
  results: EstimateResponse,
  notes: string,
  labels: EmailContentLabels,
) {
  const lines: string[] = [];

  lines.push(labels.title);
  lines.push(`${labels.pricingSnapshot}: ${results.pricingAsOf}`);
  lines.push(`${labels.calculatedAt}: ${results.calculatedAt}`);
  lines.push("--------------------------------------------------");

  results.estimates.forEach((est) => {
    const confidence =
      labels.confidence[est.confidence] ?? est.confidence.toUpperCase();

    lines.push(`${est.provider} (${confidence})`);
    if (est.regionLabel || est.region) {
      lines.push(`  ${labels.region}:  ${est.regionLabel ?? est.region}`);
    }
    lines.push(`  ${labels.monthly}: ${est.monthlyTotal} ${est.currency}`);
    lines.push(`  ${labels.daily}:   ${est.dailyTotal} ${est.currency}`);

    if (est.assumptions.length) {
      lines.push(`  ${labels.assumptions}:`);
      est.assumptions.forEach((assumption) =>
        lines.push(`    - ${assumption}`),
      );
    }

    if (est.breakdown.length) {
      lines.push(`  ${labels.breakdown}:`);
      est.breakdown.forEach((breakdown) =>
        lines.push(
          `    - ${breakdown.item}: ${breakdown.monthly} ${est.currency} (${breakdown.notes})`,
        ),
      );
    }

    if (est.pricingLinks.length) {
      lines.push(`  ${labels.pricingLinks}:`);
      est.pricingLinks.forEach((link) => lines.push(`    - ${link}`));
    }

    lines.push("--------------------------------------------------");
  });

  if (notes) {
    lines.push(`${labels.notes}:`);
    lines.push(notes);
    lines.push("--------------------------------------------------");
  }

  lines.push(labels.generatedBy);
  return lines.join("\r\n");
}
