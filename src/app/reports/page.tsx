import prisma from "@/lib/prisma";

export default async function ReportsPage() {
  const society = await prisma.society.findFirst();
  if (!society) return <div>No society found</div>;

  const invoices = await prisma.invoice.findMany({
    where: { societyId: society.id },
    include: { unit: true, lineItems: true },
    orderBy: [{ unit: { wing: "asc" } }, { unit: { flatNumber: "asc" } }],
  });

  const payments = await prisma.payment.findMany({
    where: { societyId: society.id, status: "cleared" },
  });

  const billHeads = await prisma.billHead.findMany({
    where: { societyId: society.id },
  });

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(n);

  // Head-wise income summary
  const headWiseTotals: Record<string, number> = {};
  invoices.forEach((inv) => {
    inv.lineItems.forEach((li) => {
      headWiseTotals[li.headName] = (headWiseTotals[li.headName] || 0) + li.amount;
    });
  });

  const totalBilled = invoices.reduce((s, i) => s + i.totalPayable, 0);
  const totalCollected = invoices.reduce((s, i) => s + i.amountPaid, 0);
  const totalOutstanding = totalBilled - totalCollected;

  // Defaulter aging
  const defaulters = invoices.filter((i) => !i.isSettled);
  const today = new Date();

  // Fund accumulation (Annual projections)
  const sinkingFundMonthly = invoices.reduce((s, inv) => {
    const sf = inv.lineItems.find((li) => li.headName === "Sinking Fund");
    return s + (sf ? sf.amount : 0);
  }, 0);

  const repairFundMonthly = invoices.reduce((s, inv) => {
    const rf = inv.lineItems.find((li) => li.headName === "Repair & Maintenance Fund");
    return s + (rf ? rf.amount : 0);
  }, 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
        <p className="text-gray-500 mt-1">October 2026 — {society.name}</p>
      </div>

      {/* Income & Expenditure Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-emerald-50">
            <h2 className="font-semibold text-emerald-900">📊 Head-Wise Income (Billed)</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {Object.entries(headWiseTotals)
              .sort((a, b) => b[1] - a[1])
              .map(([head, total]) => (
                <div key={head} className="px-6 py-3 flex justify-between items-center">
                  <span className="text-sm text-gray-700">{head}</span>
                  <span className="font-semibold text-gray-900 tabular-nums">{fmt(total)}</span>
                </div>
              ))}
            <div className="px-6 py-3 flex justify-between items-center bg-emerald-50 font-bold">
              <span className="text-emerald-900">Total Billed</span>
              <span className="text-emerald-900 tabular-nums">{fmt(totalBilled)}</span>
            </div>
          </div>
        </div>

        {/* Collection Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-blue-50">
            <h2 className="font-semibold text-blue-900">💰 Collection Summary</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Billed</span>
              <span className="font-bold text-gray-900">{fmt(totalBilled)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Collected</span>
              <span className="font-bold text-emerald-600">{fmt(totalCollected)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Outstanding</span>
              <span className="font-bold text-red-600">{fmt(totalOutstanding)}</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">Collection Rate</span>
                <span className="font-bold text-blue-700">
                  {totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-emerald-500 h-3 rounded-full transition-all"
                  style={{
                    width: `${totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <h3 className="font-semibold text-gray-800 text-sm">Statutory Fund Projections (Annual)</h3>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Sinking Fund (This Year)</p>
                <p className="font-bold text-blue-800">{fmt(sinkingFundMonthly * 12)}</p>
                <p className="text-xs text-gray-400">Monthly: {fmt(sinkingFundMonthly)}</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Repair & Maintenance Fund (This Year)</p>
                <p className="font-bold text-amber-800">{fmt(repairFundMonthly * 12)}</p>
                <p className="text-xs text-gray-400">Monthly: {fmt(repairFundMonthly)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Defaulter Report with Aging */}
      <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-red-100 bg-red-50">
          <h2 className="font-semibold text-red-900">
            ⚠️ Defaulter Report — {defaulters.length} unit(s) outstanding
          </h2>
        </div>
        {defaulters.length === 0 ? (
          <p className="px-6 py-6 text-emerald-600 font-medium">🎉 All dues cleared! No defaulters.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                <th className="px-6 py-3">Flat</th>
                <th className="px-6 py-3">Owner</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Bill #</th>
                <th className="px-6 py-3 text-right">Billed</th>
                <th className="px-6 py-3 text-right">Paid</th>
                <th className="px-6 py-3 text-right">Outstanding</th>
                <th className="px-6 py-3">Overdue (Days)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {defaulters.map((inv) => {
                const daysDue = Math.floor(
                  (today.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24)
                );
                const outstanding = inv.totalPayable - inv.amountPaid;
                return (
                  <tr key={inv.id} className="hover:bg-red-50/50">
                    <td className="px-6 py-3 font-bold text-indigo-700">
                      {inv.unit.wing}-{inv.unit.flatNumber}
                    </td>
                    <td className="px-6 py-3 text-gray-700">{inv.unit.ownerName}</td>
                    <td className="px-6 py-3 text-gray-600">{inv.unit.ownerPhone}</td>
                    <td className="px-6 py-3 font-mono text-xs text-gray-500">{inv.billNumber}</td>
                    <td className="px-6 py-3 text-right tabular-nums">{fmt(inv.totalPayable)}</td>
                    <td className="px-6 py-3 text-right tabular-nums text-emerald-600">{fmt(inv.amountPaid)}</td>
                    <td className="px-6 py-3 text-right font-bold text-red-600 tabular-nums">
                      {fmt(outstanding)}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          daysDue > 60
                            ? "bg-red-200 text-red-800"
                            : daysDue > 30
                            ? "bg-orange-200 text-orange-800"
                            : daysDue > 0
                            ? "bg-yellow-200 text-yellow-800"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {daysDue > 0 ? `${daysDue} days` : "Not yet due"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-red-50 font-bold text-sm">
                <td className="px-6 py-3" colSpan={6}>
                  Total Outstanding
                </td>
                <td className="px-6 py-3 text-right text-red-700 tabular-nums">
                  {fmt(defaulters.reduce((s, i) => s + (i.totalPayable - i.amountPaid), 0))}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {/* Society Info Footer */}
      <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
        <h3 className="font-semibold text-indigo-900 mb-3">Society Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Registration No.</p>
            <p className="font-medium text-indigo-800">{society.registrationNo}</p>
          </div>
          <div>
            <p className="text-gray-500">PAN</p>
            <p className="font-medium text-indigo-800">{society.panNumber || "—"}</p>
          </div>
          <div>
            <p className="text-gray-500">GSTIN</p>
            <p className="font-medium text-indigo-800">{society.gstin || "—"}</p>
          </div>
          <div>
            <p className="text-gray-500">Interest Rate (Late Fees)</p>
            <p className="font-medium text-indigo-800">{society.interestRatePa}% p.a. (Simple)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
