import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateTallyVouchersXml } from "@/lib/tally-excel-agent";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const society = await prisma.society.findFirst();
    if (!society) {
      return NextResponse.json({ error: "No society found" }, { status: 404 });
    }

    const xml = await generateTallyVouchersXml(society.id);

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Content-Disposition": 'attachment; filename="Tally_Vouchers_Oct2026.xml"',
      },
    });
  } catch (error) {
    console.error("Error generating Tally Vouchers XML:", error);
    return NextResponse.json({ error: "Failed to generate Tally Vouchers XML" }, { status: 500 });
  }
}
