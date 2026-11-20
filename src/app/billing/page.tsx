import prisma from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const society = await prisma.society.findFirst();
  if (!society) return <div>No society found</div>;

  const invoices = await prisma.invoice.findMany({
    where: { societyId: society.id },
    include: {
      unit: true,
      lineItems: { include: { billHead: true } },
    },
    orderBy: [{ unit: { wing: "asc" } }, { unit: { flatNumber: "asc" } }],
  });

  const billHeads = await prisma.billHead.findMany({
    where: { societyId: society.id },
    orderBy: { name: "asc" },
  });

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(n);

  const totalBilled = invoices.reduce((s, i) => s + i.totalPayable, 0);
  const totalCollected = invoices.reduce((s, i) => s + i.amountPaid, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing &amp; Invoices</h1>
          <p className="text-gray-500 mt-1">
            {invoices.length} bills generated · Total: {fmt(totalBilled)} · Collected: {fmt(totalCollected)}
          </p>
        </div>
      </div>

      {/* Bill Heads Configuration */}
      <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-semibold text-gray-800">Billing Heads (Bye-law 67 &amp; 68 Compliant)</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-6">
          {billHeads.map((bh) => (
            <div
              key={bh.id}
              className={`rounded-lg p-3 text-sm border ${
                bh.isStatutory ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"
              }`}
            >
              <p className="font-semibold text-gray-800">{bh.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                {bh.calculationMethod === "construction_cost_percent"
                  ? `${bh.rate}% p.a. of cost`
                  : bh.calculationMethod === "per_sqft"
                  ? `₹${bh.rate}/sq.ft`
                  : bh.calculationMethod === "per_tap"
                  ? `₹${bh.rate}/tap`
                  : bh.calculationMethod === "parking_slot"
                  ? `₹${bh.rate}/slot`
                  : bh.rate > 0
                  ? `₹${bh.rate}/flat`
                  : "10% of service charges"}
              </p>
              {bh.isStatutory && (
                <span className="mt-1 inline-block px-1.5 py-0.5 text-xs bg-blue-200 text-blue-800 rounded">
                  Statutory
                </span>
              )}
              {bh.appliesToTenantsOnly && (
                <span className="mt-1 inline-block px-1.5 py-0.5 text-xs bg-amber-200 text-amber-800 rounded ml-1">
                  Tenant Only
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="font-semibold text-gray-800">Generated Invoices</h2>
        </div>

        {invoices.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <span className="text-4xl">🧾</span>
            <p className="font-bold text-gray-800 text-sm">No Invoices Generated Yet</p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Once you add building flats from the Members tab, bills will appear here automatically.
            </p>
            <div className="pt-2">
              <Link
                href="/members"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg inline-block"
              >
                Go to Members &amp; Flats →
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Bill #</th>
                  <th className="px-4 py-3">Flat</th>
                  <th className="px-4 py-3">Owner</th>
                  {billHeads.filter(bh => !bh.appliesToTenantsOnly || bh.name === "Non-Occupancy Charges (NOC)").map((bh) => (
                    <th key={bh.id} className="px-3 py-3 text-right whitespace-nowrap">
                      {bh.name.replace("Repair & Maintenance", "R&M").replace(" (AMC)", "").replace("Non-Occupancy Charges ", "").replace("Security & Housekeeping", "Security")}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2 text-xs font-mono text-gray-500">
                      <Link href={`/billing/${inv.id}`} className="hover:underline text-indigo-600 font-semibold">
                        {inv.billNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-2 font-bold text-indigo-700">
                      {inv.unit.wing}-{inv.unit.flatNumber}
                    </td>
                    <td className="px-4 py-2 text-gray-700">{inv.unit.ownerName}</td>
                    {billHeads.filter(bh => !bh.appliesToTenantsOnly || bh.name === "Non-Occupancy Charges (NOC)").map((bh) => {
                      const li = inv.lineItems.find((l) => l.billHeadId === bh.id);
                      return (
                        <td key={bh.id} className="px-3 py-2 text-right text-gray-600 tabular-nums">
                          {li ? `₹${Math.round(li.amount).toLocaleString("en-IN")}` : "—"}
                        </td>
                      );
                    })}
                    <td className="px-4 py-2 text-right font-bold text-gray-900 tabular-nums">
                      {fmt(inv.totalPayable)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {inv.isSettled ? (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                          ✅ Paid
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">
                          ⏳ Due
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center whitespace-nowrap">
                      <Link
                        href={`/billing/${inv.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded transition-colors"
                      >
                        🖨️ Bill
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-indigo-50 font-bold text-sm">
                  <td className="px-4 py-3" colSpan={3}>
                    TOTAL
                  </td>
                  {billHeads.filter(bh => !bh.appliesToTenantsOnly || bh.name === "Non-Occupancy Charges (NOC)").map((bh) => {
                    const total = invoices.reduce((sum, inv) => {
                      const li = inv.lineItems.find((l) => l.billHeadId === bh.id);
                      return sum + (li ? li.amount : 0);
                    }, 0);
                    return (
                      <td key={bh.id} className="px-3 py-3 text-right text-indigo-700 tabular-nums">
                        {total > 0 ? fmt(total) : "—"}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-right text-indigo-900 tabular-nums">{fmt(totalBilled)}</td>
                  <td></td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
