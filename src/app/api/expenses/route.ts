import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const society = await prisma.society.findFirst();
    if (!society) return NextResponse.json([], { status: 200 });

    const expenses = await prisma.expense.findMany({
      where: { societyId: society.id },
      orderBy: { invoiceDate: "desc" },
    });

    return NextResponse.json(expenses);
  } catch (err) {
    console.error("Failed to fetch expenses:", err);
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const society = await prisma.society.findFirst();
    if (!society) return NextResponse.json({ error: "No society found" }, { status: 404 });

    const body = await req.json();
    const {
      vendorName,
      category,
      invoiceNo,
      invoiceDate,
      grossAmount,
      tdsSection,
      paymentMode,
      chequeNo,
    } = body;

    let tdsRate = 0;
    if (tdsSection === "194C_IND") tdsRate = 1.0;
    else if (tdsSection === "194C_CO") tdsRate = 2.0;
    else if (tdsSection === "194J") tdsRate = 10.0;

    const gross = Number(grossAmount);
    const tdsAmount = Math.round((gross * tdsRate) / 100);
    const netPayable = gross - tdsAmount;

    const expense = await prisma.expense.create({
      data: {
        societyId: society.id,
        vendorName,
        category,
        invoiceNo: invoiceNo || `INV-${Date.now().toString().slice(-4)}`,
        invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
        grossAmount: gross,
        tdsSection: tdsSection || "NONE",
        tdsRate,
        tdsAmount,
        netPayable,
        paymentMode: paymentMode || "Cheque",
        chequeNo: chequeNo || null,
        status: "Paid",
      },
    });

    return NextResponse.json({ success: true, expense });
  } catch (err) {
    console.error("Failed to create expense:", err);
    return NextResponse.json({ error: "Failed to record expense" }, { status: 500 });
  }
}
