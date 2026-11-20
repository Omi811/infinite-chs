import prisma from "@/lib/prisma";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
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

  const unitsCount = await prisma.unit.count({ where: { societyId: society.id } });
  const invoicesCount = await prisma.invoice.count({ where: { societyId: society.id } });
  const expensesCount = await prisma.expense.count({ where: { societyId: society.id } });
  const docsCount = await prisma.document.count({ where: { societyId: society.id } });

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-3xl">⚙️</span>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Society Settings &amp; Setup
          </h1>
        </div>
        <p className="text-gray-500 mt-1">
          Configure real society profile, manage building parameters, or reset to a clean blank slate.
        </p>
      </div>

      <SettingsClient
        society={{
          id: society.id,
          name: society.name,
          registrationNo: society.registrationNo,
          address: society.address,
          city: society.city,
          pincode: society.pincode,
          panNumber: society.panNumber,
          gstin: society.gstin,
          interestRatePa: society.interestRatePa,
        }}
        stats={{ unitsCount, invoicesCount, expensesCount, docsCount }}
      />
    </div>
  );
}
