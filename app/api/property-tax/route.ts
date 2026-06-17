import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const zip = searchParams.get("zip");
    const county = searchParams.get("county");

    if (!zip || !county) {
      return NextResponse.json(
        { error: "zip and county query params are required" },
        { status: 400 },
      );
    }

    const apiKey = process.env.NINJA_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "NINJA_API_KEY is not configured" },
        { status: 500 },
      );
    }

    const countyUrl = `https://api.api-ninjas.com/v1/propertytax?county=${encodeURIComponent(county.toLowerCase())}&zip=${encodeURIComponent(zip)}`;

    const countyResponse = await fetch(countyUrl, {
      headers: { "X-Api-Key": apiKey },
    });

    if (!countyResponse.ok) {
      return NextResponse.json(
        { error: `API Ninjas request failed: ${countyResponse.statusText}` },
        { status: countyResponse.status },
      );
    }

    let data = await countyResponse.json();

    if (Array.isArray(data) && data.length === 0) {
      const cityUrl = `https://api.api-ninjas.com/v1/propertytax?city=${encodeURIComponent(county.toLowerCase())}&zip=${encodeURIComponent(zip)}`;
      const cityResponse = await fetch(cityUrl, {
        headers: { "X-Api-Key": apiKey },
      });
      if (cityResponse.ok) {
        data = await cityResponse.json();
      }
    }

    if (Array.isArray(data) && data.length > 0) {
      console.log(
        `[PROPERTY TAX] 50th percentile for ${county} ${zip}:`,
        data[0].property_tax_50th_percentile,
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Property tax lookup error:", error);
    return NextResponse.json(
      { error: "Failed to fetch property tax data" },
      { status: 500 },
    );
  }
}
