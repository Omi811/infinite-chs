import prisma from "@/lib/prisma";
import Link from "next/link";

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
  const defaulterCount = totalInvoices - settledInvoices;

  const invoices = await prisma.invoice.findMany({ where: { societyId: society.id } });
  const totalBilled = invoices.reduce((s, i) => s + i.totalPayable, 0);
  const totalCollected = invoices.reduce((s, i) => s + i.amountPaid, 0);
  const totalOutstanding = totalBilled - totalCollected;

  const payments = await prisma.payment.findMany({ where: { societyId: society.id } });
  const paymentsByMode: Record<string, number> = {};
  payments.forEach((p) => {
    paymentsByMode[p.mode] = (paymentsByMode[p.mode] || 0) + p.amount;
  });

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

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(n);

  const collectionPct = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

  // Blank State / Onboarding Screen if Admin has cleared data or starting fresh
  if (totalUnits === 0) {
    return (
      <div className="space-y-8 max-w-4xl">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-700 text-3xl">
            ♾️
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Welcome to Infinite! Your Blank Canvas is Ready.
          </h1>
          <p className="text-sm text-gray-500 max-w-lg mx-auto">
            All demo details have been cleared. Follow the 3 simple steps below to set up your real housing society:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
            <Link
              href="/settings"
              className="p-5 rounded-xl border border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50 transition-colors group"
            >
              <span className="text-xs font-bold uppercase text-indigo-700 block mb-1">Step 1</span>
              <h3 className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">
                🏢 Society Profile
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Enter your real Society Name, Registration No. &amp; Building Address.
              </p>
            </Link>

            <Link
              href="/members"
              className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 transition-colors group"
            >
              <span className="text-xs font-bold uppercase text-emerald-700 block mb-1">Step 2</span>
              <h3 className="font-bold text-gray-900 text-sm group-hover:text-emerald-600 transition-colors">
                🏠 Add Real Flats
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Add your building flat numbers, owners, phone numbers, and carpet areas.
              </p>
            </Link>

            <Link
              href="/expenses"
              className="p-5 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50 transition-colors group"
            >
              <span className="text-xs font-bold uppercase text-amber-700 block mb-1">Step 3</span>
              <h3 className="font-bold text-gray-900 text-sm group-hover:text-amber-600 transition-colors">
                💸 Record Expenses &amp; TDS
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Log vendor bills (Security, Lift AMC, Electrician) with auto-TDS computation.
              </p>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{society.name}</h1>
          <p className="text-gray-500 mt-1">{society.address} · Reg: {society.registrationNo}</p>
        </div>

        <Link
          href="/settings"
          className="text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 self-start"
        >
          ⚙️ Edit Society Details
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Flats</p>
          <p className="text-3xl font-bold text-indigo-700 mt-2">{totalUnits}</p>
          <p className="text-xs text-gray-400 mt-1">Configured Units</p>
        </div>
        <div className="stat-card">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Billed</p>
          <p className="text-3xl font-bold text-blue-700 mt-2">{fmt(totalBilled)}</p>
          <p className="text-xs text-gray-400 mt-1">{totalInvoices} invoices generated</p>
        </div>
        <div className="stat-card">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Collected</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">{fmt(totalCollected)}</p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${collectionPct}%` }}></div>
          </div>
          <p className="text-xs text-gray-400 mt-1">{collectionPct}% collection rate</p>
        </div>
        <div className="stat-card border-red-100">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Outstanding</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{fmt(totalOutstanding)}</p>
          <p className="text-xs text-red-400 mt-1">{defaulterCount} defaulter(s)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-800">Recent Payments</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {recentPayments.map((p) => (
              <div key={p.id} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800 text-sm">
                    {p.unit.wing}-{p.unit.flatNumber} · {p.unit.ownerName}
                  </p>
                  <p className="text-xs text-gray-400">{p.receiptNumber} · {p.mode.toUpperCase()}</p>
                </div>
                <span className="font-semibold text-emerald-600 text-sm">{fmt(p.amount)}</span>
              </div>
            ))}
            {recentPayments.length === 0 && (
              <p className="px-6 py-4 text-gray-400 text-sm">No payments recorded yet.</p>
            )}
          </div>
        </div>

        {/* Defaulters */}
        <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-red-100 bg-red-50">
            <h2 className="font-semibold text-red-800">⚠️ Defaulters — Outstanding Dues</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {defaulters.map((inv) => (
              <div key={inv.id} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800 text-sm">
                    {inv.unit.wing}-{inv.unit.flatNumber} · {inv.unit.ownerName}
                  </p>
                  <p className="text-xs text-gray-400">Bill: {inv.billNumber}</p>
                </div>
                <span className="font-bold text-red-600 text-sm">{fmt(inv.totalPayable - inv.amountPaid)}</span>
              </div>
            ))}
            {defaulters.length === 0 && (
              <p className="px-6 py-4 text-emerald-600 text-sm">🎉 All dues collected!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
