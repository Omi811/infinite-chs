"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface UnpaidInvoice {
  id: string;
  unitId: string;
  billNumber: string;
  flatLabel: string;
  outstanding: number;
}

export default function PaymentForm({
  societyId,
  unpaidInvoices,
}: {
  societyId: string;
  unpaidInvoices: UnpaidInvoice[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState("");
  const [mode, setMode] = useState("upi");
  const [transactionRef, setTransactionRef] = useState("");
  const [message, setMessage] = useState("");

  const selected = unpaidInvoices.find((i) => i.id === selectedInvoice);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          societyId,
          unitId: selected.unitId,
          invoiceId: selected.id,
          amount: selected.outstanding,
          mode,
          transactionRef,
        }),
      });

      if (res.ok) {
        setMessage("✅ Payment recorded successfully!");
        setSelectedInvoice("");
        setTransactionRef("");
        router.refresh();
      } else {
        setMessage("❌ Error recording payment");
      }
    } catch {
      setMessage("❌ Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="font-semibold text-gray-800 mb-4">Record New Payment</h2>

      {unpaidInvoices.length === 0 ? (
        <p className="text-emerald-600 text-sm">🎉 All dues collected! No outstanding invoices.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Flat (Outstanding)</label>
            <select
              value={selectedInvoice}
              onChange={(e) => setSelectedInvoice(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">— Select —</option>
              {unpaidInvoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.flatLabel} — ₹{Math.round(inv.outstanding).toLocaleString("en-IN")}
                </option>
              ))}
            </select>
          </div>

          {selected && (
            <>
              <div className="bg-indigo-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Amount to Collect</p>
                <p className="text-2xl font-bold text-indigo-700">
                  ₹{Math.round(selected.outstanding).toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-gray-500 mt-1">Bill: {selected.billNumber}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  {["upi", "neft", "cheque", "cash"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                        mode === m
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {m === "upi" ? "📱 UPI" : m === "neft" ? "🏦 NEFT" : m === "cheque" ? "📝 Cheque" : "💵 Cash"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {mode === "cheque" ? "Cheque Number" : "Transaction Reference (UTR)"}
                </label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder={mode === "cheque" ? "Cheque No." : "UTR / Reference"}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? "Recording..." : "Record Payment ✓"}
              </button>
            </>
          )}

          {message && <p className="text-sm font-medium mt-2">{message}</p>}
        </form>
      )}
    </div>
  );
}
