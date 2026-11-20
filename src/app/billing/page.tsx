import prisma from "@/lib/prisma";
import BillingView from "./BillingView";

export default async function BillingPage() {
  const society = await prisma.society.findFirst();

  let invoices: any[] = [];
  let billHeads: any[] = [];

  if (society) {
    invoices = await prisma.invoice.findMany({
      where: { societyId: society.id },
      include: {
        unit: true,
        lineItems: { include: { billHead: true } },
      },
      orderBy: [{ unit: { wing: "asc" } }, { unit: { flatNumber: "asc" } }],
    });

    billHeads = await prisma.billHead.findMany({
      where: { societyId: society.id },
      orderBy: { name: "asc" },
    });
  }

  const serializedInvoices = invoices.map((inv) => ({
    id: inv.id,
    billNumber: inv.billNumber,
    totalPayable: inv.totalPayable,
    amountPaid: inv.amountPaid,
    isSettled: inv.isSettled,
    dueDate: inv.dueDate.toISOString(),
    unit: {
      wing: inv.unit.wing,
      flatNumber: inv.unit.flatNumber,
      ownerName: inv.unit.ownerName,
      ownerPhone: inv.unit.ownerPhone,
    },
    lineItems: inv.lineItems.map((li: any) => ({
      billHeadId: li.billHeadId,
      amount: li.amount,
    })),
  }));

  const serializedBillHeads = billHeads.map((bh) => ({
    id: bh.id,
    name: bh.name,
    calculationMethod: bh.calculationMethod,
    rate: bh.rate,
    isStatutory: bh.isStatutory,
    appliesToTenantsOnly: bh.appliesToTenantsOnly,
  }));

  return <BillingView initialInvoices={serializedInvoices} billHeads={serializedBillHeads} />;
}
