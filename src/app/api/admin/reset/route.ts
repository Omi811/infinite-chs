import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const society = await prisma.society.findFirst();
    if (!society) {
      return NextResponse.json({ error: "No society found" }, { status: 404 });
    }

    // Delete all transactional and member data
    await prisma.document.deleteMany({ where: { societyId: society.id } });
    await prisma.expense.deleteMany({ where: { societyId: society.id } });
    await prisma.payment.deleteMany({ where: { societyId: society.id } });
    await prisma.invoiceLineItem.deleteMany();
    await prisma.invoice.deleteMany({ where: { societyId: society.id } });
    await prisma.unit.deleteMany({ where: { societyId: society.id } });

    // Reset society name to blank placeholder ready for Admin entry
    await prisma.society.update({
      where: { id: society.id },
      data: {
        name: "My Co-operative Housing Society Ltd.",
        registrationNo: "MUM/HSG/TC/____/2026",
        address: "Enter Society Building Address, Mumbai",
        city: "Mumbai",
        pincode: "400001",
        panNumber: null,
        gstin: null,
        interestRatePa: 21.0,
      },
    });

    return NextResponse.json({
      success: true,
      message: "All demo data removed. Canvas is now 100% blank for Admin entry.",
    });
  } catch (err: any) {
    console.error("Failed to reset database:", err);
    return NextResponse.json({ error: err.message || "Reset failed" }, { status: 500 });
  }
}
