import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { toTitleCase } from "@/utils/formatting";
import type { Property, Block, ProjectSettings } from "@/types";

// Validation schema for property creation
const createPropertySchema = z.object({
  name: z
    .string()
    .min(1, "Property name is required")
    .max(100, "Property name too long"),
  zipCode: z
    .string()
    .regex(
      /^\d{5}(-\d{4})?$/,
      "Zip code must be 5 digits (e.g., 90210) or 5+4 format (e.g., 90210-1234)",
    )
    .optional()
    .or(z.literal("")),
  county: z
    .string()
    .max(100, "County name too long")
    .optional()
    .or(z.literal("")),
});

// GET /api/properties - List all properties for the current user
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbProperties = await prisma.property.findMany({
      where: { userId: user.userId, isActive: true },
      orderBy: { createdAt: "desc" },
    });

    // Transform DB properties to match our Property type
    const properties: Property[] = dbProperties.map(
      (dbProp: Record<string, unknown>) => ({
        id: dbProp.id as string,
        name: dbProp.name as string,
        zipCode: (dbProp.zipCode as string) || "",
        county: (dbProp.county as string) || "",
        propertyTaxRate: (dbProp.propertyTaxRate as number) ?? null,
        isActive: (dbProp.isActive as boolean) ?? true,
        blocks: (dbProp.blocks as Block[]) || [],
        projectSettings: {
          years: 30,
          cashStrategy: "profit",
          idealCashHoldingBalance: 10000,
          estimatedHomeAppreciationRate: 3,
          purchaseDate: new Date().toISOString().split("T")[0],
          ...(dbProp.projectSettings as Partial<ProjectSettings>),
        },
        createdAt: (dbProp.createdAt as Date).toISOString(),
        updatedAt: (dbProp.updatedAt as Date).toISOString(),
      }),
    );

    return NextResponse.json({ properties });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 },
    );
  }
}

// POST /api/properties - Create a new property
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input with Zod
    const validationResult = createPropertySchema.safeParse(body);
    if (!validationResult.success) {
      const formatted = validationResult.error.flatten();
      const fieldErrors = formatted.fieldErrors;
      const firstError =
        Object.values(fieldErrors).flat()[0] || "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const {
      name,
      zipCode: rawZipCode,
      county: rawCounty,
    } = validationResult.data;
    const zipCode = rawZipCode?.trim().toLowerCase() || "";
    const county = rawCounty ? toTitleCase(rawCounty) : "";

    let propertyTaxRate: number | null = null;
    const apiKey = process.env.NINJA_API_KEY;
    if (zipCode && county && apiKey) {
      try {
        const countyRes = await fetch(
          `https://api.api-ninjas.com/v1/propertytax?county=${encodeURIComponent(county.toLowerCase())}&zip=${encodeURIComponent(zipCode)}`,
          { headers: { "X-Api-Key": apiKey } },
        );
        if (countyRes.ok) {
          let taxData = await countyRes.json();
          if (Array.isArray(taxData) && taxData.length === 0) {
            const cityRes = await fetch(
              `https://api.api-ninjas.com/v1/propertytax?city=${encodeURIComponent(county.toLowerCase())}&zip=${encodeURIComponent(zipCode)}`,
              { headers: { "X-Api-Key": apiKey } },
            );
            if (cityRes.ok) taxData = await cityRes.json();
          }
          if (Array.isArray(taxData) && taxData.length > 0) {
            propertyTaxRate = taxData[0].property_tax_50th_percentile ?? null;
            console.log(
              `[PROPERTY TAX] 50th percentile for ${county} ${zipCode}:`,
              propertyTaxRate,
            );
          }
        }
      } catch (err) {
        console.error("[PROPERTY TAX] Lookup failed:", err);
      }
    }

    const dbProperty = await prisma.property.create({
      data: {
        name: name.trim(),
        zipCode: zipCode || null,
        county: county || null,
        propertyTaxRate,
        userId: user.userId,
        blocks: [],
        projectSettings: {
          years: 30,
          cashStrategy: "profit",
          idealCashHoldingBalance: 10000,
          estimatedHomeAppreciationRate: 3,
          purchaseDate: new Date().toISOString().split("T")[0],
        },
      },
    });

    const property: Property = {
      id: dbProperty.id,
      name: dbProperty.name,
      zipCode: dbProperty.zipCode || "",
      county: dbProperty.county || "",
      propertyTaxRate: dbProperty.propertyTaxRate ?? null,
      isActive: dbProperty.isActive ?? true,
      blocks: [],
      projectSettings: {
        years: 30,
        cashStrategy: "profit",
        idealCashHoldingBalance: 10000,
        estimatedHomeAppreciationRate: 3,
        purchaseDate: new Date().toISOString().split("T")[0],
      },
      createdAt: dbProperty.createdAt.toISOString(),
      updatedAt: dbProperty.updatedAt.toISOString(),
    };

    return NextResponse.json({ property }, { status: 201 });
  } catch (error) {
    console.error("Error creating property:", error);
    return NextResponse.json(
      { error: "Failed to create property" },
      { status: 500 },
    );
  }
}
