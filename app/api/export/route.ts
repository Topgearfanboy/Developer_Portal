import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { Block, ProjectSettings } from "@/types";
import { calculateBuildData } from "../build/helpers/buildData";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const blocks: Block[] = body.blocks || [];
    const projectSettings: ProjectSettings = body.projectSettings || {
      years: 30,
      cashStrategy: "profit",
      idealCashHoldingBalance: 0,
      estimatedHomeAppreciationRate: 0,
      purchaseDate: new Date().toISOString().split("T")[0],
    };

    // Always use 50 years for the export
    const exportSettings: ProjectSettings = {
      ...projectSettings,
      years: 50,
    };

    const result = await calculateBuildData(blocks, exportSettings);
    const { graphData } = result;

    const workbook = new ExcelJS.Workbook();

    // Summary sheet
    const summarySheet = workbook.addWorksheet("Summary");
    summarySheet.addRows([
      ["Financial Analysis Export"],
      [],
      ["Project Settings"],
      ["Years", 50],
      ["Cash Strategy", projectSettings.cashStrategy],
      ["Ideal Cash Holding Balance", projectSettings.idealCashHoldingBalance],
      [
        "Estimated Home Appreciation Rate",
        projectSettings.estimatedHomeAppreciationRate,
      ],
      ["Purchase Date", projectSettings.purchaseDate],
      [],
      ["Blocks", blocks.length],
      ["Monthly Payment", result.monthlyPayment],
      ["Total Months", graphData.length],
    ]);

    // Timeseries sheet — rows = metric types, columns = months
    const timeseriesSheet = workbook.addWorksheet("Timeseries");
    const headers = ["Metric", ...graphData.map((d) => d.date)];
    timeseriesSheet.addRow(headers);
    timeseriesSheet.addRow([
      "Cash on Hand",
      ...graphData.map((d) => d.cashOnHand),
    ]);
    timeseriesSheet.addRow(["Equity", ...graphData.map((d) => d.equity)]);
    timeseriesSheet.addRow([
      "Invested Capital",
      ...graphData.map((d) => d.investedCapital),
    ]);
    timeseriesSheet.addRow([
      "Remaining Loan Balance",
      ...graphData.map((d) => d.remainingLoanBalance),
    ]);
    timeseriesSheet.addRow([
      "Monthly Net",
      ...graphData.map((d) => d.monthlyNet),
    ]);

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="financial-analysis.xlsx"',
      },
    });
  } catch (error) {
    console.error("Error in /api/export:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
