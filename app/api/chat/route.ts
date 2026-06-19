import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getCurrentUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";
import type { Block, ProjectSettings } from "@/types";

interface Metrics {
  roi: number;
  annualizedRoi: number;
  cashOnCashReturn: number;
  capRate: number;
  netOperatingIncome: number;
  netPresentValue: number;
  totalProfit: number;
  timeToPayOffLoan: number | null;
}

const BASE_SYSTEM_PROMPT = `You are a real estate investment analysis assistant embedded in a property analysis tool.
You have access to the user's current property setup (blocks, settings, and calculated metrics) shown below.
Use this context to give specific, actionable advice about their investment strategy.
Be extremely concise — 2 to 4 sentences maximum unless the user explicitly asks for more detail.
No bullet lists, no headers, no preamble. Get straight to the point.
When referencing numbers, use the exact values from the context provided.
Only discuss real estate investing topics.`;

function buildSystemPrompt(
  blocks: Block[],
  projectSettings: ProjectSettings,
  metrics: Metrics,
): string {
  const blockSummary = blocks
    .map((b, i) => {
      const data = b.data as unknown as Record<string, unknown>;
      const fields = Object.entries(data)
        .filter(
          ([, v]) =>
            v !== "" && v !== null && v !== undefined && typeof v !== "object",
        )
        .map(([k, v]) => `  ${k}: ${String(v)}`)
        .join("\n");
      return `Block ${i + 1} (${b.type}):\n${fields}`;
    })
    .join("\n\n");

  const settingsSummary = `Project Settings:
  Analysis years: ${projectSettings.years}
  Cash strategy: ${projectSettings.cashStrategy}
  Ideal cash holding balance: $${projectSettings.idealCashHoldingBalance}
  Estimated home appreciation rate: ${projectSettings.estimatedHomeAppreciationRate}%
  Purchase date: ${projectSettings.purchaseDate}`;

  const fmt = (n: number) => n.toFixed(2);
  const metricsSummary = `Calculated Metrics:
  ROI: ${fmt(metrics.roi)}%
  Annualized ROI: ${fmt(metrics.annualizedRoi)}%
  Cash-on-Cash Return: ${fmt(metrics.cashOnCashReturn)}%
  Cap Rate: ${fmt(metrics.capRate)}%
  Net Operating Income: $${fmt(metrics.netOperatingIncome)}
  Net Present Value: $${fmt(metrics.netPresentValue)}
  Total Profit: $${fmt(metrics.totalProfit)}
  Time to Pay Off Loan: ${metrics.timeToPayOffLoan !== null ? `${metrics.timeToPayOffLoan} months` : "N/A"}`;

  return `${BASE_SYSTEM_PROMPT}

--- CURRENT PROPERTY CONTEXT ---
${settingsSummary}

${blockSummary}

${metricsSummary}
--- END CONTEXT ---`;
}

const MAX_MESSAGE_LENGTH = 2000;
const USER_MAX_REQUESTS = 5;
const USER_WINDOW_MS = 60 * 1000;
const IP_MAX_REQUESTS = 10;
const IP_WINDOW_MS = 60 * 1000;

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  const ipLimit = checkRateLimit(`chat:ip:${ip}`, {
    maxRequests: IP_MAX_REQUESTS,
    windowMs: IP_WINDOW_MS,
  });
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(ipLimit.retryAfterMs / 1000)),
        },
      },
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userLimit = checkRateLimit(`chat:user:${user.id}`, {
    maxRequests: USER_MAX_REQUESTS,
    windowMs: USER_WINDOW_MS,
  });
  if (!userLimit.allowed) {
    const seconds = Math.ceil(userLimit.retryAfterMs / 1000);
    return NextResponse.json(
      { error: `Message limit reached. Try again in ${seconds}s.` },
      {
        status: 429,
        headers: { "Retry-After": String(seconds) },
      },
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI service is not configured" },
      { status: 503 },
    );
  }

  try {
    const body = await request.json();
    const { message, history, blocks, projectSettings, metrics } = body as {
      message: string;
      history: { role: "user" | "model"; text: string }[];
      blocks: Block[];
      projectSettings: ProjectSettings;
      metrics: Metrics;
    };

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        {
          error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters.`,
        },
        { status: 400 },
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const recentHistory = history.slice(-20);

    const contents = [
      ...recentHistory.map((h) => ({
        role: h.role,
        parts: [{ text: h.text }],
      })),
      {
        role: "user" as const,
        parts: [{ text: message }],
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: buildSystemPrompt(
          blocks ?? [],
          projectSettings ?? {
            years: 5,
            cashStrategy: "profit",
            idealCashHoldingBalance: 0,
            estimatedHomeAppreciationRate: 0,
            purchaseDate: "",
          },
          metrics ?? {
            roi: 0,
            annualizedRoi: 0,
            cashOnCashReturn: 0,
            capRate: 0,
            netOperatingIncome: 0,
            netPresentValue: 0,
            totalProfit: 0,
            timeToPayOffLoan: null,
          },
        ),
      },
    });

    return NextResponse.json({ reply: response.text });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 },
    );
  }
}
