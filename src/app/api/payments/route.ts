import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { societyId, unitId, invoiceId, amount, mode, transactionRef } = body;

    // Generate receipt number
    const count = await prisma.payment.count({ where: { societyId } });
    const receiptNumber = `RCP-2026-10-${String(count + 1).padStart(3, "0")}`;

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        societyId,
        unitId,
        receiptNumber,
        paymentDate: new Date(),
        amount,
        mode,
        transactionRef: transactionRef || null,
        status: "cleared",
      },
    });

    // Update invoice
    if (invoiceId) {
      const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
      if (invoice) {
        const newAmountPaid = invoice.amountPaid + amount;
        await prisma.invoice.update({
          where: { id: invoiceId },
          data: {
            amountPaid: newAmountPaid,
            isSettled: newAmountPaid >= invoice.totalPayable,
          },
        });
      }
    }

    return NextResponse.json({ success: true, payment });
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 });
  }
}
