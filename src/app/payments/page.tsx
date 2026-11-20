import prisma from "@/lib/prisma";
import PaymentsView from "./PaymentsView";

export default async function PaymentsPage() {
  const society = await prisma.society.findFirst();

  let payments: any[] = [];
  let unpaidInvoices: any[] = [];

  if (society) {
    payments = await prisma.payment.findMany({
      where: { societyId: society.id },
      include: { unit: true },
      orderBy: { createdAt: "desc" },
    });

    const invs = await prisma.invoice.findMany({
      where: { societyId: society.id, isSettled: false },
      include: { unit: true },
    });

    unpaidInvoices = invs.map((inv) => ({
      id: inv.id,
      unitId: inv.unitId,
      billNumber: inv.billNumber,
      flatLabel: `${inv.unit.wing}-${inv.unit.flatNumber} (${inv.unit.ownerName})`,
      outstanding: inv.totalPayable - inv.amountPaid,
    }));
  }

  const serializedPayments = payments.map((p) => ({
    id: p.id,
    receiptNo: p.receiptNumber,
    paymentDate: p.paymentDate.toISOString(),
    amount: p.amount,
    mode: p.mode,
    referenceNo: p.transactionRef,
    unitWing: p.unit.wing,
    unitFlat: p.unit.flatNumber,
    ownerName: p.unit.ownerName,
    status: p.status,
  }));

  return (
    <PaymentsView
      initialPayments={serializedPayments}
      initialUnpaidInvoices={unpaidInvoices}
    />
  );
}
