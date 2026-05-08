import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { buildDeterministicEstimates } from "@/lib/pricing/deterministic-estimator";

const CURRENCY = "USD";

const SYSTEM_PROMPT = [
  "You are a cloud cost estimation assistant.",
  "Return ONLY valid JSON matching the requested schema.",
  "Do NOT include markdown, code fences, or extra text.",
  "You do NOT have access to live pricing. Clearly label prices as estimates.",
  "Keep estimates deterministic: for the same request payload and date, use the same assumptions and arithmetic so totals remain consistent across reruns.",
  "Include pricing page links for each provider (general official pricing pages).",
  "Any enforced architecture rules included in the request are mandatory and must be reflected in the estimate breakdown and assumptions.",
  "Use the explicitly provided provider region for each estimate. If a provider region is missing, fall back to that provider's default region.",
  "For each service component (compute, database, networking, and frontend runtime), evaluate available alternatives for the selected provider and region, then choose the most cost-optimal feasible option.",
  "Always include a short availability-check note and option comparison rationale in assumptions when selecting a service option.",
  "For MS SQL, evaluate managed and customer-managed options; choose the most cost-optimal option that is available in the selected provider region and explain the decision.",
  `Currency is always ${CURRENCY}.`,
].join(" ");

type EstimationRequestBody = {
  providers?: string[];
  usage?: Record<string, string>;
  notes?: string;
  providerRegions?: Record<string, string>;
  enforcedArchitectureRules?: string[];
};

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

function clarifyIaasDbWording(text: string) {
  return text
    .replace(
      /self-managed sql server on vm\/bare metal/gi,
      "customer-managed SQL Server on IaaS compute (VM/bare metal)",
    )
    .replace(
      /self-managed sql server on vm/gi,
      "customer-managed SQL Server on IaaS VM",
    )
    .replace(/self-managed sql server/gi, "customer-managed SQL Server on IaaS")
    .replace(/self-managed mssql/gi, "customer-managed MS SQL on IaaS")
    .replace(/self-managed ms sql/gi, "customer-managed MS SQL on IaaS")
    .replace(/self-managed/gi, "customer-managed on IaaS");
}

type UnknownRecord = Record<string, unknown>;

function normalizeEstimateWording<T>(json: T): T {
  if (!json || typeof json !== "object") {
    return json;
  }

  const root = json as UnknownRecord;
  if (!Array.isArray(root.estimates)) {
    return json;
  }

  const estimates = root.estimates as UnknownRecord[];
  const next = {
    ...root,
    estimates: estimates.map((est) => ({
      ...est,
      assumptions: Array.isArray(est.assumptions)
        ? est.assumptions.map((assumption) =>
            typeof assumption === "string"
              ? clarifyIaasDbWording(assumption)
              : String(assumption),
          )
        : est.assumptions,
      recommendation:
        typeof est.recommendation === "string"
          ? clarifyIaasDbWording(est.recommendation)
          : est.recommendation,
      breakdown: Array.isArray(est.breakdown)
        ? est.breakdown.map((breakdownItem) => {
            const itemRecord =
              breakdownItem && typeof breakdownItem === "object"
                ? (breakdownItem as UnknownRecord)
                : ({} as UnknownRecord);

            return {
              ...itemRecord,
              item:
                typeof itemRecord.item === "string"
                  ? clarifyIaasDbWording(itemRecord.item)
                  : itemRecord.item,
              notes:
                typeof itemRecord.notes === "string"
                  ? clarifyIaasDbWording(itemRecord.notes)
                  : itemRecord.notes,
            };
          })
        : est.breakdown,
    })),
  };

  return next as T;
}

function enrichEstimateMetadata<T>(
  json: T,
  metadata: { pricingAsOf: string; calculatedAt: string },
): T {
  if (!json || typeof json !== "object") {
    return json;
  }

  const root = json as UnknownRecord;
  const next = {
    ...root,
    asOf: metadata.pricingAsOf,
    pricingAsOf: metadata.pricingAsOf,
    calculatedAt: metadata.calculatedAt,
  };

  return next as T;
}

function buildEstimationRequest(
  body: EstimationRequestBody,
): EstimationRequestBody {
  const usage = { ...(body.usage ?? {}) };
  const enforcedArchitectureRules = [
    ...(body.enforcedArchitectureRules ?? []),
    "For each major service component (compute, frontend runtime, database, network egress), evaluate at least two feasible options when available in the selected provider region.",
    "Use provider-region availability checks before selecting the service option.",
    "Choose the most cost-optimal feasible option and state in assumptions what was compared and why the selected option won.",
  ];

  if (usage.backendDeployment === "Serverless functions") {
    delete usage.backendSize;
    delete usage.backendScaling;
    delete usage.backendVmCount;
  }

  if (usage.backendDeployment === "Single VM") {
    usage.backendScaling = "Single instance only";
    delete usage.backendVmCount;
  }

  if (usage.backendDeployment === "Containers (Kubernetes)") {
    delete usage.backendVmCount;
    if (usage.backendScaling === "Single instance only") {
      usage.backendScaling = "Fixed number of instances";
    }
  }

  if (usage.backendDeployment === "Multiple VMs with load balancer") {
    const backendVmCount = normalizeBackendVmCount(usage.backendVmCount);
    if (usage.backendScaling === "Single instance only") {
      usage.backendScaling = "Fixed number of instances";
    }
    usage.backendVmCount = String(backendVmCount);

    enforcedArchitectureRules.push(
      `For 'Multiple VMs with load balancer', estimate a high-availability baseline with ${backendVmCount} backend VMs distributed across at least 2 different availability zones.`,
      `Apply the selected backend instance size to each of the ${backendVmCount} backend VMs.`,
      `Include the load balancer as a separate billed component in front of the ${backendVmCount} backend VMs.`,
    );
  }

  const backendVmCountForRules =
    usage.backendDeployment === "Multiple VMs with load balancer"
      ? normalizeBackendVmCount(usage.backendVmCount)
      : undefined;

  if (usage.dbHighAvailability === "Multi-zone (HA)") {
    enforcedArchitectureRules.push(
      "For database high availability, estimate at least 2 database instances/nodes distributed across at least 2 different availability zones.",
      "Do not price database HA as a single database instance; include replication/failover overhead in the breakdown.",
      "State explicitly in assumptions that DB HA uses primary + secondary topology.",
    );
  }

  if (usage.dbEngine === "MS SQL") {
    enforcedArchitectureRules.push(
      "For MS SQL, evaluate both managed and customer-managed deployment options where applicable.",
      "Perform service availability checks for the selected provider region before choosing an MS SQL deployment model.",
      "Choose the most cost-optimal MS SQL option among the available options and state why.",
    );
  }

  const isMsSqlDbHa =
    usage.dbEngine === "MS SQL" &&
    usage.dbHighAvailability === "Multi-zone (HA)";

  if (
    isMsSqlDbHa &&
    usage.backendDeployment === "Multiple VMs with load balancer" &&
    backendVmCountForRules
  ) {
    enforcedArchitectureRules.push(
      "If customer-managed SQL is chosen, do not reuse backend VMs as database VMs; backend and DB must be separate compute pools.",
      `If customer-managed SQL is chosen, include ${backendVmCountForRules} backend VMs plus 2 dedicated SQL Server VMs (primary + secondary), i.e. at least ${backendVmCountForRules + 2} total VMs before any optional extras.`,
      "If customer-managed SQL is chosen, show backend VM costs and DB VM costs as separate breakdown line items.",
      "If customer-managed SQL is chosen, explicitly state that backend VMs and DB VMs are not shared.",
    );
  }

  return {
    ...body,
    usage,
    enforcedArchitectureRules,
  };
}

export const SCHEMA_OPEN_AI = {
  type: "object",
  additionalProperties: false,
  required: ["asOf", "pricingAsOf", "calculatedAt", "estimates"],
  properties: {
    asOf: {
      type: "string",
      description: "Legacy alias for pricingAsOf in YYYY-MM-DD format",
    },
    pricingAsOf: {
      type: "string",
      description: "Date of the pricing snapshot in YYYY-MM-DD format",
    },
    calculatedAt: {
      type: "string",
      description:
        "Timestamp when the estimate was generated in ISO-8601 format",
    },
    estimates: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "provider",
          "currency",
          "monthlyTotal",
          "dailyTotal",
          "confidence",
          "assumptions",
          "breakdown",
          "recommendation",
          "pricingLinks",
        ],
        properties: {
          provider: {
            type: "string",
            description: "Cloud provider name",
          },
          region: {
            type: "string",
            description: "Provider-specific region identifier",
          },
          regionLabel: {
            type: "string",
            description: "Human-readable provider region label",
          },
          currency: {
            type: "string",
            description: "Currency code, default USD",
          },
          monthlyTotal: {
            type: "number",
            minimum: 0,
          },
          dailyTotal: {
            type: "number",
            minimum: 0,
          },
          confidence: {
            type: "string",
            enum: ["low", "medium", "high"],
          },
          assumptions: {
            type: "array",
            items: {
              type: "string",
            },
          },
          breakdown: {
            type: "array",
            minItems: 1,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["item", "monthly", "notes"],
              properties: {
                item: {
                  type: "string",
                },
                monthly: {
                  type: "number",
                  minimum: 0,
                },
                notes: {
                  type: "string",
                },
              },
            },
          },
          recommendation: {
            type: "string",
          },
          pricingLinks: {
            type: "array",
            minItems: 1,
            items: {
              type: "string",
              format: "uri",
            },
          },
        },
      },
    },
  },
};
export interface EstimateResponse {
  asOf: string;
  pricingAsOf: string;
  calculatedAt: string;
  snapshotSource?: string;
  estimates: {
    provider: string;
    region?: string;
    regionLabel?: string;
    currency: string;
    monthlyTotal: number;
    dailyTotal: number;
    confidence: "low" | "medium" | "high";
    assumptions: string[];
    breakdown: {
      item: string;
      monthly: number;
      notes: string;
    }[];
    recommendation: string;
    pricingLinks: string[];
  }[];
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { body } = await req.json();
    const estimationRequest = buildEstimationRequest(
      body as EstimationRequestBody,
    );
    const calculatedAt = new Date().toISOString();

    // const deterministicResponse = await buildDeterministicEstimates(estimationRequest);
    // if (deterministicResponse) {
    //   const normalizedDeterministic = enrichEstimateMetadata(
    //     normalizeEstimateWording(deterministicResponse),
    //     {
    //       pricingAsOf: deterministicResponse.pricingAsOf,
    //       calculatedAt,
    //     },
    //   );
    //   return NextResponse.json(normalizedDeterministic, {
    //     status: 200,
    //     headers: {
    //       "Content-Disposition": `attachment; filename="cost-estimate-${deterministicResponse.pricingAsOf}.json"`,
    //     },
    //   });
    // }

    const today = new Date().toISOString().slice(0, 10);

    // Tell the model EXACTLY what JSON to output
    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      temperature: 0,
      input: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: JSON.stringify({
            task: "Estimate infrastructure costs for the given project for each selected provider.",
            asOf: today,
            pricingAsOf: today,
            calculatedAt,
            request: estimationRequest,
          }),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "spec_draft",
          strict: false, // allow the model some flexibility, but it should still try to follow the schema
          schema: SCHEMA_OPEN_AI,
        },
      },
    });

    const text = response.output_text;
    if (!text) {
      return NextResponse.json(
        { error: "OpenAI returned empty output." },
        { status: 502 },
      );
    }

    // Ensure we return JSON (and fail loudly if the model didn't comply)
    const json = JSON.parse(text);
    const normalizedJson = enrichEstimateMetadata(
      normalizeEstimateWording(json),
      {
        pricingAsOf: today,
        calculatedAt,
      },
    );

    return NextResponse.json(normalizedJson, {
      status: 200,
      headers: {
        // Optional: helps if you want the browser to download it as a file
        "Content-Disposition": `attachment; filename="cost-estimate-${today}.json"`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Bad Request", message },
      { status: 400 },
    );
  }
}
