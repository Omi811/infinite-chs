import prisma from "@/lib/prisma";
import ExpensesClient from "./ExpensesClient";

export default async function ExpensesPage() {
  const society = await prisma.society.findFirst();
  const initialExpenses = society
    ? await prisma.expense.findMany({
        where: { societyId: society.id },
        orderBy: { invoiceDate: "desc" },
      })
    : [];

  const formattedExpenses = initialExpenses.map((e) => ({
    id: e.id,
    vendorName: e.vendorName,
    category: e.category,
    invoiceNo: e.invoiceNo,
    invoiceDate: e.invoiceDate.toISOString().split("T")[0],
    grossAmount: e.grossAmount,
    tdsSection: e.tdsSection as any,
    tdsRate: e.tdsRate,
    tdsAmount: e.tdsAmount,
    netPayable: e.netPayable,
    paymentMode: e.paymentMode as any,
    chequeNo: e.chequeNo || undefined,
    status: e.status as any,
  }));

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-3xl">🧾</span>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Vendor Expenses &amp; TDS Tracker
          </h1>
        </div>
        <p className="text-gray-500 mt-1">
          Record vendor bills with real database persistence, auto-compute TDS (Sec 194C / 194J), and generate payment vouchers.
        </p>
      </div>

      <ExpensesClient initialExpenses={formattedExpenses} />
    </div>
  );
}
