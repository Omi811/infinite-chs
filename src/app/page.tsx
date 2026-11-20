import prisma from "@/lib/prisma";
import DashboardView from "./DashboardView";

export default async function Dashboard() {
  let society = await prisma.society.findFirst();

  if (!society) {
    society = await prisma.society.create({
      data: {
        name: "My Co-operative Housing Society Ltd.",
        registrationNo: "MUM/HSG/TC/____/2026",
        address: "Enter Society Building Address, Mumbai",
        city: "Mumbai",
        pincode: "400001",
        interestRatePa: 21.0,
      },
    });
  }

  const totalUnits = await prisma.unit.count({ where: { societyId: society.id } });
  const totalInvoices = await prisma.invoice.count({ where: { societyId: society.id } });
  const settledInvoices = await prisma.invoice.count({ where: { societyId: society.id, isSettled: true } });

  const invoices = await prisma.invoice.findMany({ where: { societyId: society.id } });
  const totalBilled = invoices.reduce((s, i) => s + i.totalPayable, 0);
  const totalCollected = invoices.reduce((s, i) => s + i.amountPaid, 0);

  const recentPayments = await prisma.payment.findMany({
    where: { societyId: society.id },
    include: { unit: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const defaulters = await prisma.invoice.findMany({
    where: { societyId: society.id, isSettled: false },
    include: { unit: true },
    orderBy: { totalPayable: "desc" },
  });

  const serializedSociety = {
    id: society.id,
    name: society.name,
    registrationNo: society.registrationNo,
    address: society.address,
    city: society.city,
    pincode: society.pincode,
    panNumber: society.panNumber,
    gstin: society.gstin,
    interestRatePa: society.interestRatePa,
  };

  const serializedPayments = recentPayments.map((p) => ({
    id: p.id,
    receiptNumber: p.receiptNumber,
    amount: p.amount,
    mode: p.mode,
    unit: {
      wing: p.unit.wing,
      flatNumber: p.unit.flatNumber,
      ownerName: p.unit.ownerName,
    },
  }));

  const serializedDefaulters = defaulters.map((d) => ({
    id: d.id,
    billNumber: d.billNumber,
    totalPayable: d.totalPayable,
    amountPaid: d.amountPaid,
    unit: {
      wing: d.unit.wing,
      flatNumber: d.unit.flatNumber,
      ownerName: d.unit.ownerName,
    },
  }));

  return (
    <DashboardView
      initialSociety={serializedSociety}
      initialUnitsCount={totalUnits}
      initialTotalBilled={totalBilled}
      initialTotalCollected={totalCollected}
      initialInvoicesCount={totalInvoices}
      initialRecentPayments={serializedPayments}
      initialDefaulters={serializedDefaulters}
    />
  );
}
