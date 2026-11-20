"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { clientStore, StoredExpense } from "@/lib/store";

export interface VendorExpense {
  id: string;
  vendorName: string;
  category: string;
  invoiceNo: string;
  invoiceDate: string;
  grossAmount: number;
  tdsSection: "194C_IND" | "194C_CO" | "194J" | "NONE";
  tdsRate: number;
  tdsAmount: number;
  netPayable: number;
  paymentMode: "Cheque" | "NEFT";
  chequeNo?: string;
  status: "Paid" | "Pending";
}

export default function ExpensesClient({
  initialExpenses = [],
}: {
  initialExpenses?: VendorExpense[];
}) {
  const router = useRouter();
  const [expenses, setExpenses] = useState<VendorExpense[]>(initialExpenses);
  const [vendorName, setVendorName] = useState("");
  const [category, setCategory] = useState("Repairs & Maintenance");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [grossAmount, setGrossAmount] = useState<number | "">("");
  const [tdsSection, setTdsSection] = useState<"194C_IND" | "194C_CO" | "194J" | "NONE">("194C_IND");
  const [paymentMode, setPaymentMode] = useState<"Cheque" | "NEFT">("Cheque");
  const [chequeNo, setChequeNo] = useState("");
  const [showVoucher, setShowVoucher] = useState<VendorExpense | null>(null);
  const [loading, setLoading] = useState(false);

  const loadExpenses = () => {
    if (clientStore.isDataWiped()) {
      setExpenses(clientStore.getExpenses([]));
    } else {
      setExpenses(clientStore.getExpenses(initialExpenses));
    }
  };

  useEffect(() => {
    loadExpenses();
    const unsub = clientStore.subscribe(loadExpenses);
    return () => unsub();
  }, []);

  const getTdsRate = (sec: string) => {
    if (sec === "194C_IND") return 1.0;
    if (sec === "194C_CO") return 2.0;
    if (sec === "194J") return 10.0;
    return 0;
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName || !grossAmount) return;
    setLoading(true);

    const gross = Number(grossAmount);
    const rate = getTdsRate(tdsSection);
    const tds = Math.round((gross * rate) / 100);
    const net = gross - tds;
    const invNumber = invoiceNo || `INV-${Date.now().toString().slice(-4)}`;

    const newExp: StoredExpense = {
      id: "exp_" + Math.random().toString(36).substring(2, 9),
      vendorName,
      category,
      invoiceNo: invNumber,
      invoiceDate: new Date().toISOString().split("T")[0],
      grossAmount: gross,
      tdsSection,
      tdsRate: rate,
      tdsAmount: tds,
      netPayable: net,
      paymentMode,
      chequeNo: chequeNo || undefined,
      status: "Paid",
    };

    // 1. Save directly to client store (guaranteed offline/GitHub Pages support)
    clientStore.addExpense(newExp);
    setExpenses((prev) => [newExp, ...prev]);

    // 2. Try server if available
    try {
      await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorName,
          category,
          invoiceNo: invNumber,
          grossAmount: gross,
          tdsSection,
          paymentMode,
          chequeNo,
        }),
      });
    } catch {
      // Safe to ignore on static GitHub Pages
    }

    setVendorName("");
    setGrossAmount("");
    setInvoiceNo("");
    setChequeNo("");
    setLoading(false);
  };

  const totalGross = expenses.reduce((s, e) => s + e.grossAmount, 0);
  const totalTds = expenses.reduce((s, e) => s + e.tdsAmount, 0);
  const totalNet = expenses.reduce((s, e) => s + e.netPayable, 0);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs uppercase font-bold text-gray-500">Total Vendor Invoices</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{fmt(totalGross)}</p>
          <p className="text-xs text-gray-400 mt-0.5">{expenses.length} bills in database</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-amber-200 bg-amber-50/40 shadow-sm">
          <p className="text-xs uppercase font-bold text-amber-800">TDS Deducted (Sec 194C / 194J)</p>
          <p className="text-2xl font-black text-amber-800 mt-1">{fmt(totalTds)}</p>
          <p className="text-xs text-amber-700 mt-0.5 font-medium">Due by 7th of next month (Challan 281)</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm">
          <p className="text-xs uppercase font-bold text-gray-500">Net Paid to Vendors</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">{fmt(totalNet)}</p>
          <p className="text-xs text-gray-400 mt-0.5">Via Cheque / RTGS / NEFT</p>
        </div>
      </div>

      {/* Main Grid: Form + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Record Vendor Bill Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-4">
            ➕ Record Vendor Bill &amp; TDS
          </h2>

          <form onSubmit={handleAddExpense} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Vendor / Agency Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Sterling Electricals"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Expense Head</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="Security & Housekeeping">Security &amp; Housekeeping</option>
                <option value="Lift Maintenance AMC">Lift Maintenance AMC</option>
                <option value="Repairs & Maintenance">Repairs &amp; Maintenance</option>
                <option value="Statutory Audit & Tax Filing">Statutory Audit &amp; Legal</option>
                <option value="Water Charges (BMC)">Water Tanker / BMC Water</option>
                <option value="Electricity Charges">Electricity Charges</option>
                <option value="Printing & Stationery">Printing &amp; Stationery</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Bill / Invoice No.</label>
                <input
                  type="text"
                  placeholder="INV-102"
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Gross Bill Amount (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="₹ Amount"
                  value={grossAmount}
                  onChange={(e) => setGrossAmount(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">TDS Section</label>
              <select
                value={tdsSection}
                onChange={(e) => setTdsSection(e.target.value as any)}
                className="w-full border rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="194C_IND">Sec 194C: Contractors - Individual / HUF (1%)</option>
                <option value="194C_CO">Sec 194C: Contractors - Private / Public Co. (2%)</option>
                <option value="194J">Sec 194J: Professional / Legal / Auditor (10%)</option>
                <option value="NONE">No TDS (Exempt / Below Limit / Municipal)</option>
              </select>
            </div>

            {grossAmount !== "" && Number(grossAmount) > 0 && (
              <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 space-y-1">
                <div className="flex justify-between text-indigo-900">
                  <span>Gross:</span>
                  <span className="font-bold">{fmt(Number(grossAmount))}</span>
                </div>
                <div className="flex justify-between text-amber-800">
                  <span>TDS ({getTdsRate(tdsSection)}%):</span>
                  <span className="font-bold">
                    - {fmt(Math.round((Number(grossAmount) * getTdsRate(tdsSection)) / 100))}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-800 font-extrabold border-t border-indigo-200 pt-1">
                  <span>Net Cheque / NEFT:</span>
                  <span>
                    {fmt(Number(grossAmount) - Math.round((Number(grossAmount) * getTdsRate(tdsSection)) / 100))}
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as any)}
                  className="w-full border rounded-lg px-3 py-2 text-xs bg-white"
                >
                  <option value="Cheque">Cheque</option>
                  <option value="NEFT">NEFT / RTGS</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Cheque No / UTR</label>
                <input
                  type="text"
                  placeholder="Cheque No."
                  value={chequeNo}
                  onChange={(e) => setChequeNo(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg shadow-sm transition-colors text-xs disabled:opacity-50"
            >
              {loading ? "Saving to Database..." : "✓ Save Vendor Bill (DB Persist)"}
            </button>
          </form>
        </div>

        {/* Right: Vendor Expenses Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
            <h2 className="font-bold text-gray-900 text-sm">Recorded Expenses &amp; TDS Register</h2>
            <span className="text-xs text-gray-500">Live Database Records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 text-gray-600 font-semibold uppercase border-b">
                <tr>
                  <th className="py-2.5 px-3 text-left">Vendor &amp; Invoice</th>
                  <th className="py-2.5 px-3 text-left">Head</th>
                  <th className="py-2.5 px-3 text-right">Gross (₹)</th>
                  <th className="py-2.5 px-3 text-right">TDS (₹)</th>
                  <th className="py-2.5 px-3 text-right">Net Paid (₹)</th>
                  <th className="py-2.5 px-3 text-center">Payment</th>
                  <th className="py-2.5 px-3 text-center">Voucher</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-gray-50">
                    <td className="py-2.5 px-3">
                      <p className="font-bold text-gray-900">{exp.vendorName}</p>
                      <p className="text-[10px] text-gray-400 font-mono">
                        {exp.invoiceNo} · {exp.invoiceDate}
                      </p>
                    </td>
                    <td className="py-2.5 px-3 text-gray-600">{exp.category}</td>
                    <td className="py-2.5 px-3 text-right font-medium tabular-nums">
                      {exp.grossAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-amber-700 tabular-nums">
                      {exp.tdsAmount > 0 ? (
                        <span>
                          ₹{exp.tdsAmount}{" "}
                          <span className="text-[10px] font-normal text-gray-500">
                            ({exp.tdsRate}%)
                          </span>
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700 tabular-nums">
                      ₹{exp.netPayable.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-gray-100 text-gray-800">
                        {exp.paymentMode} {exp.chequeNo ? `#${exp.chequeNo}` : ""}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => setShowVoucher(exp)}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded transition-colors"
                      >
                        📄 Voucher
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal / Printable Payment Voucher */}
      {showVoucher && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <p className="text-[11px] uppercase font-bold tracking-wider text-indigo-800">
                  Shree Ganesh Co-op Housing Society Ltd.
                </p>
                <h3 className="text-lg font-black text-gray-900 uppercase">PAYMENT VOUCHER</h3>
              </div>
              <button
                onClick={() => setShowVoucher(null)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="my-4 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">Voucher No:</span>
                <span className="font-mono font-bold">{showVoucher.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">Date:</span>
                <span className="font-bold">{showVoucher.invoiceDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">Paid To:</span>
                <span className="font-bold text-gray-900">{showVoucher.vendorName}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">Debit Head:</span>
                <span className="font-bold text-indigo-700">{showVoucher.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">Gross Invoice Amount:</span>
                <span className="font-bold">{fmt(showVoucher.grossAmount)}</span>
              </div>
              {showVoucher.tdsAmount > 0 && (
                <div className="flex justify-between py-1 border-b text-amber-800">
                  <span>Less: TDS Deducted ({showVoucher.tdsRate}%):</span>
                  <span className="font-bold">- {fmt(showVoucher.tdsAmount)}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 bg-emerald-50 px-2 rounded text-emerald-900 font-black text-sm">
                <span>Net Amount Paid:</span>
                <span>{fmt(showVoucher.netPayable)}</span>
              </div>
              <div className="flex justify-between py-1 text-gray-600">
                <span>Mode of Payment:</span>
                <span className="font-mono">{showVoucher.paymentMode} ({showVoucher.chequeNo})</span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t flex justify-between text-center text-xs text-gray-600">
              <div>
                <div className="h-6"></div>
                <p className="border-t border-gray-400 pt-1 font-semibold">Prepared By</p>
              </div>
              <div>
                <div className="h-6"></div>
                <p className="border-t border-gray-400 pt-1 font-semibold">Hon. Treasurer</p>
              </div>
              <div>
                <div className="h-6"></div>
                <p className="border-t border-gray-400 pt-1 font-semibold">Hon. Secretary</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg"
              >
                🖨️ Print Voucher
              </button>
              <button
                onClick={() => setShowVoucher(null)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
