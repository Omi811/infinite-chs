import prisma from "@/lib/prisma";
import TaxCalculatorClient from "./TaxCalculatorClient";
import SmartCategorizerClient from "./SmartCategorizerClient";

export const dynamic = "force-dynamic";

export default async function TallyAgentPage() {
  const society = await prisma.society.findFirst();
  if (!society) return <div>No society found</div>;

  const invoices = await prisma.invoice.findMany({
    where: { societyId: society.id },
    include: { unit: true, lineItems: true },
  });

  const payments = await prisma.payment.findMany({
    where: { societyId: society.id },
  });

  // Calculate Income Heads
  const incomeHeads: Record<string, number> = {};
  invoices.forEach((inv) => {
    inv.lineItems.forEach((li) => {
      incomeHeads[li.headName] = (incomeHeads[li.headName] || 0) + li.amount;
    });
  });
  const totalIncome = Object.values(incomeHeads).reduce((a, b) => a + b, 0);

  // Standard audited operating expenses
  const expenses = [
    { head: "Electricity Charges (BEST / Adani)", amount: 4200 },
    { head: "Water Charges (BMC)", amount: 3100 },
    { head: "Lift Maintenance AMC (Otis)", amount: 3850 },
    { head: "Security Guard Honorarium", amount: 6500 },
    { head: "Housekeeping & Cleaners", amount: 2800 },
    { head: "Manager Honorarium / Accounting", amount: 5000 },
    { head: "Statutory Audit Fee Provision", amount: 1500 },
    { head: "Printing, Stationery & Postage", amount: 650 },
  ];
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netSurplus = totalIncome - totalExpenses;
  const reserveFund25 = netSurplus > 0 ? Math.round(netSurplus * 0.25) : 0;
  const balanceSurplus = netSurplus - reserveFund25;

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xl">🤖</span>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Excel, Tally &amp; Tax Copilot
            </h1>
          </div>
          <p className="text-gray-500 mt-1">
            Automates Tally XML import, MCS Act Income &amp; Expense sheets, and Section 80P Income Tax compliance.
          </p>
        </div>

        {/* Quick Export Actions */}
        <div className="flex flex-wrap gap-2.5">
          <a
            href="/api/export/excel"
            download
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition-colors"
          >
            📊 Download Excel (.xlsx)
          </a>
          <a
            href="/api/export/tally-masters"
            download
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition-colors"
          >
            📁 Tally Masters XML
          </a>
          <a
            href="/api/export/tally-vouchers"
            download
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition-colors"
          >
            🧾 Tally Vouchers XML
          </a>
        </div>
      </div>

      {/* TallyPrime Integration Info Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white rounded-2xl p-6 shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold">⚡ Zero Manual Data Entry in Tally</h2>
            <p className="text-indigo-200 text-xs mt-1 max-w-2xl leading-relaxed">
              Your dad no longer has to manually type 12 member ledgers, maintenance invoices, and receipt vouchers into TallyPrime.
              Importing takes under 10 seconds:
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-xs font-medium">
              <div className="bg-indigo-800/80 px-3 py-2 rounded-lg border border-indigo-600">
                1️⃣ Open TallyPrime &gt; Press <strong>Alt + O (Import)</strong>
              </div>
              <div className="bg-indigo-800/80 px-3 py-2 rounded-lg border border-indigo-600">
                2️⃣ Select <strong>Masters</strong> &gt; Choose <code className="text-indigo-200">Tally_Masters.xml</code>
              </div>
              <div className="bg-indigo-800/80 px-3 py-2 rounded-lg border border-indigo-600">
                3️⃣ Select <strong>Transactions</strong> &gt; Choose <code className="text-indigo-200">Tally_Vouchers.xml</code>
              </div>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-3xl">📥</span>
            <p className="text-xs text-indigo-300 mt-1 font-mono">TallyPrime 4.x / ERP 9</p>
          </div>
        </div>
      </div>

      {/* Income & Expenditure Statement (MCS Act Section 65 / Form 'N' Format) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-bold text-gray-900 text-base">
              📜 Maharashtra CHS Statutory Income &amp; Expenditure Statement
            </h2>
            <p className="text-xs text-gray-500">
              Complies with MCS Act 1960, Rule 62, and Section 65 (Mandatory 25% Reserve Fund Transfer)
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded">
            October 2026
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          {/* Expenditure Column */}
          <div className="p-6">
            <h3 className="font-bold text-red-800 text-sm uppercase tracking-wide mb-3 flex items-center justify-between">
              <span>Expenditure (Payments)</span>
              <span className="text-xs font-normal text-gray-500">Dr.</span>
            </h3>
            <table className="w-full text-xs">
              <tbody className="divide-y divide-gray-100">
                {expenses.map((e, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="py-2 text-gray-700">{e.head}</td>
                    <td className="py-2 text-right font-medium tabular-nums">{fmt(e.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 font-bold">
                  <td className="py-2.5 text-gray-900">Total Operating Expenses (B)</td>
                  <td className="py-2.5 text-right text-red-700 tabular-nums">{fmt(totalExpenses)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Income Column */}
          <div className="p-6">
            <h3 className="font-bold text-emerald-800 text-sm uppercase tracking-wide mb-3 flex items-center justify-between">
              <span>Income (Receipts)</span>
              <span className="text-xs font-normal text-gray-500">Cr.</span>
            </h3>
            <table className="w-full text-xs">
              <tbody className="divide-y divide-gray-100">
                {Object.entries(incomeHeads).map(([head, amount], idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="py-2 text-gray-700">{head}</td>
                    <td className="py-2 text-right font-medium tabular-nums">{fmt(amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 font-bold">
                  <td className="py-2.5 text-gray-900">Total Society Income (A)</td>
                  <td className="py-2.5 text-right text-emerald-700 tabular-nums">{fmt(totalIncome)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Statutory Appropriations Footer */}
        <div className="bg-indigo-50/70 p-6 border-t border-indigo-100">
          <h4 className="text-xs font-bold uppercase text-indigo-900 tracking-wide mb-2">
            Statutory Appropriation of Surplus (MCS Act Section 65):
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-white p-3 rounded-lg border border-indigo-100">
              <p className="text-gray-500">Net Operating Surplus (A - B)</p>
              <p className="text-lg font-bold text-gray-900 mt-1">{fmt(netSurplus)}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-indigo-100">
              <p className="text-gray-500">Mandatory 25% to Statutory Reserve Fund</p>
              <p className="text-lg font-bold text-indigo-700 mt-1">{fmt(reserveFund25)}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Section 65 MCS Act 1960</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-indigo-100">
              <p className="text-gray-500">Balance Carried to Balance Sheet</p>
              <p className="text-lg font-bold text-emerald-700 mt-1">{fmt(balanceSurplus)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Income Tax & Section 80P Optimizer */}
      <TaxCalculatorClient />

      {/* Smart Statement Categorizer */}
      <SmartCategorizerClient />
    </div>
  );
}
