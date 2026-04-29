import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { usageQuestions } from "@/app/(with-description-context)/estimation/configuration";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const SYSTEM_PROMPT = [
  "You turn application environment descriptions into pre-fill data for a cloud cost estimation form.",
  "Return ONLY valid JSON matching the requested schema.",
  "Use only option labels that are available in the provided usage questions.",
  "If the description does not clearly answer a question, omit that usage key instead of guessing.",
  "Put useful infrastructure details that do not map to a usage option into notes.",
].join(" ");

export const SCHEMA_OPEN_AI = {
  type: "object",
  additionalProperties: false,
  required: [
    "usage",
    "notes",
    "providers",
    "providerRegions",
    "confidence",
    "sourceSummary",
    "missingDetails",
  ],
  properties: {
    usage: {
      type: "object",
      description:
        "Map of estimation usage question ids to exact UI option labels.",
      additionalProperties: {
        type: "string",
      },
    },
    notes: {
      type: "string",
      description:
        "Infrastructure notes from the source that do not fit a usage option.",
    },
    providers: {
      type: "array",
      description: "Cloud provider names mentioned by the user.",
      items: {
        type: "string",
      },
    },
    providerRegions: {
      type: "object",
      description:
        "Provider region hints keyed by provider name when explicitly mentioned.",
      additionalProperties: {
        type: "string",
      },
    },
    confidence: {
      type: "string",
      enum: ["low", "medium", "high"],
    },
    sourceSummary: {
      type: "string",
      description: "Brief summary of the environment source.",
    },
    missingDetails: {
      type: "array",
      description: "Important estimation details missing from the source.",
      items: {
        type: "string",
      },
    },
  },
};

type DescriptionInput = {
  description: string;
  file?: {
    dataUrl: string;
    name: string;
    size: number;
    type: string;
  };
};

type UserContent =
  | {
      type: "input_text";
      text: string;
    }
  | {
      type: "input_file";
      filename: string;
      file_data: string;
    };

function getUsageQuestionContext() {
  const backendDeploymentSamples = [
    undefined,
    "Single VM",
    "Multiple VMs with load balancer",
    "Containers (Kubernetes)",
    "Serverless functions",
  ];

  return usageQuestions.map((question) => {
    const questionOptions = question.options;
    const options =
      typeof questionOptions === "function"
        ? Array.from(
            new Set(
              backendDeploymentSamples.flatMap((backendDeployment) =>
                questionOptions(backendDeployment ? { backendDeployment } : {}),
              ),
            ),
          )
        : questionOptions;

    return {
      id: question.id,
      label: question.label,
      category: question.category,
      options,
    };
  });
}

function isMultipartRequest(req: NextRequest) {
  return req.headers
    .get("content-type")
    ?.toLowerCase()
    .includes("multipart/form-data");
}

function getStringFormValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

async function fileToDataUrl(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const mediaType = file.type || "application/octet-stream";

  return `data:${mediaType};base64,${buffer.toString("base64")}`;
}

async function readDescriptionInput(
  req: NextRequest,
): Promise<DescriptionInput> {
  if (!isMultipartRequest(req)) {
    const body = (await req.json()) as { description?: unknown };
    const description =
      typeof body.description === "string" ? body.description.trim() : "";

    return { description };
  }

  const formData = await req.formData();
  const description = getStringFormValue(formData.get("description"));
  const fileValue = formData.get("file");

  if (!(fileValue instanceof File) || fileValue.size === 0) {
    return { description };
  }

  if (fileValue.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("File must be 10MB or smaller.");
  }

  return {
    description,
    file: {
      dataUrl: await fileToDataUrl(fileValue),
      name: fileValue.name,
      size: fileValue.size,
      type: fileValue.type || "application/octet-stream",
    },
  };
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const input = await readDescriptionInput(req);

    if (!input.description && !input.file) {
      return NextResponse.json(
        { error: "Bad Request", message: "Description or file is required." },
        { status: 400 },
      );
    }

    const userContent: UserContent[] = [
      {
        type: "input_text",
        text: JSON.stringify({
          task: "Extract cost-estimation pre-fill values from the provided environment source.",
          usageQuestions: getUsageQuestionContext(),
          description: input.description || undefined,
          file: input.file
            ? {
                name: input.file.name,
                type: input.file.type,
                size: input.file.size,
              }
            : undefined,
        }),
      },
    ];

    if (input.file) {
      userContent.push({
        type: "input_file",
        filename: input.file.name,
        file_data: input.file.dataUrl,
      });
    }

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
          content: userContent,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "description_prefill",
          strict: false,
          schema: SCHEMA_OPEN_AI,
        },
      },
    });

    if (!response.output_text) {
      return NextResponse.json(
        { error: "OpenAI returned empty output." },
        { status: 502 },
      );
    }

    return NextResponse.json(
      {
        ...JSON.parse(response.output_text),
        source: input.file
          ? {
              type: "file",
              name: input.file.name,
              size: input.file.size,
              contentType: input.file.type,
            }
          : { type: "description" },
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Bad Request", message },
      { status: 400 },
    );
  }
}
