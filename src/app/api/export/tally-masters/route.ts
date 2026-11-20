import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateTallyMastersXml } from "@/lib/tally-excel-agent";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const society = await prisma.society.findFirst();
    if (!society) {
      return NextResponse.json({ error: "No society found" }, { status: 404 });
    }

    const xml = await generateTallyMastersXml(society.id);

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Content-Disposition": 'attachment; filename="Tally_Masters_ShreeGaneshCHS.xml"',
      },
    });
  } catch (error) {
    console.error("Error generating Tally Masters XML:", error);
    return NextResponse.json({ error: "Failed to generate Tally Masters XML" }, { status: 500 });
  }
}
