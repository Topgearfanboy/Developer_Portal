import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { Property, Block, ProjectSettings } from "@/types";

// GET /api/properties - List all properties for the current user
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbProperties = await prisma.property.findMany({
      where: { userId: user.userId },
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
    const { name } = body;
    const zipCode = body.zipCode?.trim().toLowerCase() || "";
    const county = body.county?.trim().toLowerCase() || "";

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Property name is required" },
        { status: 400 },
      );
    }

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
