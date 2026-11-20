import prisma from "@/lib/prisma";
import PaymentForm from "./PaymentForm";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const society = await prisma.society.findFirst();
  if (!society) return <div>No society found</div>;

  const payments = await prisma.payment.findMany({
    where: { societyId: society.id },
    include: { unit: true },
    orderBy: { createdAt: "desc" },
  });

  const unpaidInvoices = await prisma.invoice.findMany({
    where: { societyId: society.id, isSettled: false },
    include: { unit: true },
  });

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(n);

  const totalCollected = payments
    .filter((p) => p.status === "cleared")
    .reduce((s, p) => s + p.amount, 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Payments & Receipts</h1>
        <p className="text-gray-500 mt-1">
          {payments.length} receipts · Total Collected: {fmt(totalCollected)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Record Payment Form */}
        <div className="lg:col-span-1">
          <PaymentForm
            societyId={society.id}
            unpaidInvoices={unpaidInvoices.map((inv) => ({
              id: inv.id,
              unitId: inv.unitId,
              billNumber: inv.billNumber,
              flatLabel: `${inv.unit.wing}-${inv.unit.flatNumber} (${inv.unit.ownerName})`,
              outstanding: inv.totalPayable - inv.amountPaid,
            }))}
          />
        </div>

        {/* Payment History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="font-semibold text-gray-800">Payment History</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                  <th className="px-6 py-3">Receipt #</th>
                  <th className="px-6 py-3">Flat</th>
                  <th className="px-6 py-3">Owner</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Mode</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-mono text-xs text-gray-500">{p.receiptNumber}</td>
                    <td className="px-6 py-3 font-bold text-indigo-700">
                      {p.unit.wing}-{p.unit.flatNumber}
                    </td>
                    <td className="px-6 py-3 text-gray-700">{p.unit.ownerName}</td>
                    <td className="px-6 py-3 text-gray-600">
                      {new Date(p.paymentDate).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-0.5 text-xs font-medium rounded bg-indigo-100 text-indigo-700 uppercase">
                        {p.mode}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right font-semibold text-emerald-600 tabular-nums">
                      {fmt(p.amount)}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          p.status === "cleared"
                            ? "bg-green-100 text-green-700"
                            : p.status === "bounced"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
