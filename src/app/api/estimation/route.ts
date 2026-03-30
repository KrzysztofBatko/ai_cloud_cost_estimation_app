import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const CURRENCY = "USD";
const REGION = "EU-WEST-1";

const SYSTEM_PROMPT = [
  "You are a cloud cost estimation assistant.",
  "Return ONLY valid JSON matching the requested schema.",
  "Do NOT include markdown, code fences, or extra text.",
  "You do NOT have access to live pricing. Clearly label prices as estimates.",
  "Keep estimates deterministic: for the same request payload and date, use the same assumptions and arithmetic so totals remain consistent across reruns.",
  "Include pricing page links for each provider (general official pricing pages).",
  "Any enforced architecture rules included in the request are mandatory and must be reflected in the estimate breakdown and assumptions.",
  `Use region ${REGION} for all estimates.`,
  `Currency is always ${CURRENCY}.`,
].join(" ");

type EstimationRequestBody = {
  providers?: string[];
  usage?: Record<string, string>;
  notes?: string;
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

function isOracleProviderSelected(providers?: string[]) {
  return (providers ?? []).some((provider) =>
    provider.toLowerCase().includes("oracle"),
  );
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

function normalizeEstimateWording(json: any) {
  if (!json?.estimates || !Array.isArray(json.estimates)) {
    return json;
  }

  const next = {
    ...json,
    estimates: json.estimates.map((est: any) => ({
      ...est,
      assumptions: Array.isArray(est.assumptions)
        ? est.assumptions.map((a: string) => clarifyIaasDbWording(a))
        : est.assumptions,
      recommendation:
        typeof est.recommendation === "string"
          ? clarifyIaasDbWording(est.recommendation)
          : est.recommendation,
      breakdown: Array.isArray(est.breakdown)
        ? est.breakdown.map((b: any) => ({
            ...b,
            item: typeof b.item === "string" ? clarifyIaasDbWording(b.item) : b.item,
            notes:
              typeof b.notes === "string" ? clarifyIaasDbWording(b.notes) : b.notes,
          }))
        : est.breakdown,
    })),
  };

  return next;
}

function buildEstimationRequest(body: EstimationRequestBody): EstimationRequestBody {
  const usage = { ...(body.usage ?? {}) };
  const enforcedArchitectureRules = [...(body.enforcedArchitectureRules ?? [])];

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

  const isOracleWithMsSql =
    isOracleProviderSelected(body.providers) && usage.dbEngine === "MS SQL";

  if (isOracleWithMsSql) {
    enforcedArchitectureRules.push(
      "For Oracle Cloud with MS SQL, treat the database as self-managed SQL Server on VM or bare metal only (not a managed Oracle database service).",
      "Use explicit wording: 'customer-managed SQL Server on IaaS compute (VM/bare metal)' to avoid ambiguity.",
      "Reflect this Oracle+MS SQL constraint explicitly in assumptions and recommendation.",
      "In the cost breakdown, include OS/license and operational overhead consistent with self-managed SQL Server hosting.",
    );

    if (usage.dbHighAvailability === "Multi-zone (HA)") {
      enforcedArchitectureRules.push(
        "For Oracle Cloud + MS SQL + DB HA, include 2 SQL Server VMs minimum (primary + secondary) across different availability zones.",
      );
    }
  }

  const isMsSqlDbHa =
    usage.dbEngine === "MS SQL" && usage.dbHighAvailability === "Multi-zone (HA)";

  if (
    isMsSqlDbHa &&
    usage.backendDeployment === "Multiple VMs with load balancer" &&
    backendVmCountForRules
  ) {
    enforcedArchitectureRules.push(
      "Do not reuse backend VMs as database VMs for MS SQL HA; backend and DB must be separate compute pools.",
      `For this configuration, include ${backendVmCountForRules} backend VMs plus 2 dedicated SQL Server VMs (primary + secondary), i.e. at least ${backendVmCountForRules + 2} total VMs before any optional extras.`,
      "Show backend VM costs and DB VM costs as separate breakdown line items.",
      "In assumptions, explicitly state that backend VMs and DB VMs are not shared.",
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
  required: ["asOf", "estimates"],
  properties: {
    asOf: {
      type: "string",
      description: "Date of estimation in YYYY-MM-DD format",
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
  estimates: {
    provider: string;
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
    const estimationRequest = buildEstimationRequest(body as EstimationRequestBody);

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
    const normalizedJson = normalizeEstimateWording(json);

    return NextResponse.json(normalizedJson, {
      status: 200,
      headers: {
        // Optional: helps if you want the browser to download it as a file
        "Content-Disposition": `attachment; filename="cost-estimate-${today}.json"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Bad Request", message: err?.message ?? String(err) },
      { status: 400 },
    );
  }
}
