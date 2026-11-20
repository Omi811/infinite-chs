import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateSocietyExcelWorkbook } from "@/lib/tally-excel-agent";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const society = await prisma.society.findFirst();
    if (!society) {
      return NextResponse.json({ error: "No society found" }, { status: 404 });
    }

    const buffer = await generateSocietyExcelWorkbook(society.id);
    const uint8Array = new Uint8Array(buffer);

    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="ShreeGaneshCHS_Financials_Oct2026.xlsx"',
      },
    });
  } catch (error) {
    console.error("Error generating Excel:", error);
    return NextResponse.json({ error: "Failed to generate Excel workbook" }, { status: 500 });
  }
}
