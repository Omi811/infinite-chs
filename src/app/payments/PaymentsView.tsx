"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { clientStore, StoredPayment } from "@/lib/store";

export default function PaymentsView({
  initialPayments,
  initialUnpaidInvoices,
}: {
  initialPayments: any[];
  initialUnpaidInvoices: any[];
}) {
  const [payments, setPayments] = useState<any[]>(initialPayments);
  const [unpaidInvoices, setUnpaidInvoices] = useState<any[]>(initialUnpaidInvoices);
  const [society, setSociety] = useState<any>({
    name: "Shree Ganesh Co-operative Housing Society Ltd.",
    registrationNo: "MUM/HSG/TC/12345/2005",
    address: "Plot No. 42, Sector 7, Vashi, Navi Mumbai",
  });

  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [paymentMode, setPaymentMode] = useState<"UPI" | "NEFT" | "Cheque" | "Cash">("UPI");
  const [transactionRef, setTransactionRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState<any | null>(null);

  const loadFromStore = () => {
    const soc = clientStore.getSociety();
    if (soc) setSociety(soc);

    if (clientStore.isDataWiped()) {
      setPayments(clientStore.getPayments([]));
      const invs = clientStore.getInvoices([]);
      setUnpaidInvoices(
        invs
          .filter((i) => !i.isSettled)
          .map((i) => ({
            id: i.id,
            billNumber: i.billNumber,
            flatLabel: `${i.wing}-${i.flatNumber} (${i.ownerName})`,
            outstanding: i.totalPayable - i.amountPaid,
          }))
      );
    } else {
      setPayments(clientStore.getPayments(initialPayments));
      const invs = clientStore.getInvoices([]);
      if (invs.length > 0) {
        setUnpaidInvoices(
          invs
            .filter((i) => !i.isSettled)
            .map((i) => ({
              id: i.id,
              billNumber: i.billNumber,
              flatLabel: `${i.wing}-${i.flatNumber} (${i.ownerName})`,
              outstanding: i.totalPayable - i.amountPaid,
            }))
        );
      } else {
        setUnpaidInvoices(initialUnpaidInvoices);
      }
    }
  };

  useEffect(() => {
    loadFromStore();
    const unsub = clientStore.subscribe(loadFromStore);
    return () => unsub();
  }, []);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(n);

  const totalCollected = payments.reduce((s, p) => s + (p.amount || 0), 0);

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId) return;

    setLoading(true);
    const selectedInv = unpaidInvoices.find((i) => i.id === selectedInvoiceId);
    if (!selectedInv) {
      setLoading(false);
      return;
    }

    const receipt = clientStore.recordBillPayment(selectedInvoiceId, {
      amount: selectedInv.outstanding,
      mode: paymentMode,
      referenceNo: transactionRef || `UPI-${Date.now().toString().slice(-6)}`,
    });

    if (receipt) {
      alert(`✅ Payment of ${fmt(receipt.amount)} recorded! Receipt: ${receipt.receiptNo}`);
      setSelectedInvoiceId("");
      setTransactionRef("");
    }
    setLoading(false);
  };

  const handleAutoSettleAll = () => {
    if (unpaidInvoices.length === 0) {
      alert("All invoices are already settled! No dues remaining.");
      return;
    }

    const confirmed = confirm(
      `⚡ Auto-Settle All Payments: This will mark all ${unpaidInvoices.length} outstanding dues as PAID via UPI and generate official payment receipts. Continue?`
    );
    if (!confirmed) return;

    const count = clientStore.autoSettleAllBills("UPI");
    alert(`🎉 Successfully auto-settled ${count} society bills! All receipts generated.`);
  };

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-gray-900">Payments &amp; Receipts</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
              ⚡ Auto-Bill Pay Active
            </span>
          </div>
          <p className="text-gray-500 mt-1">
            {payments.length} receipts recorded · Total Collections: {fmt(totalCollected)}
          </p>
        </div>

        {unpaidInvoices.length > 0 && (
          <button
            onClick={handleAutoSettleAll}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5 self-start"
          >
            ⚡ Auto-Settle All {unpaidInvoices.length} Dues (Bulk Pay)
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Record Payment Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <div className="border-b pb-3">
              <h2 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                <span>💰</span> Auto-Record Bill Payment
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Select an outstanding flat bill to log payment and auto-generate an official receipt.
              </p>
            </div>

            {unpaidInvoices.length === 0 ? (
              <div className="p-6 bg-emerald-50 rounded-xl text-center space-y-2 border border-emerald-100">
                <span className="text-3xl">🎉</span>
                <p className="font-bold text-emerald-800 text-sm">All Bills Fully Settled!</p>
                <p className="text-xs text-emerald-600">
                  There are currently no unpaid bills in the system.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Select Flat &amp; Bill</label>
                  <select
                    required
                    value={selectedInvoiceId}
                    onChange={(e) => setSelectedInvoiceId(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-xs font-medium text-gray-800 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Choose Flat Due --</option>
                    {unpaidInvoices.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.flatLabel} — {fmt(inv.outstanding)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Payment Mode</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(["UPI", "NEFT", "Cheque", "Cash"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPaymentMode(m)}
                        className={`py-1.5 text-center font-bold rounded text-xs transition-colors border ${
                          paymentMode === m
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Transaction Ref / UTR / Cheque No.
                  </label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder={paymentMode === "UPI" ? "e.g. UPI-9847123984" : "e.g. CHQ-000124"}
                    className="w-full border rounded-lg px-3 py-2 text-xs text-gray-800 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !selectedInvoiceId}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg shadow-sm transition-colors text-xs disabled:opacity-50"
                >
                  {loading ? "Recording..." : "⚡ Settle Bill & Generate Receipt"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Payment History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h2 className="font-semibold text-gray-800">Payment &amp; Receipt Ledger</h2>
              <span className="text-xs text-gray-500 font-medium">
                {payments.length} Transactions
              </span>
            </div>

            {payments.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <span className="text-4xl inline-block">💰</span>
                <p className="font-bold text-gray-800 text-sm">No Payments Recorded Yet</p>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  When payments are logged or auto-settled, official numbered society receipts will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                      <th className="px-4 py-3">Receipt #</th>
                      <th className="px-4 py-3">Flat</th>
                      <th className="px-4 py-3">Owner</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Mode</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm">
                    {payments.map((p) => {
                      const wing = p.unitWing || p.unit?.wing || "A";
                      const flat = p.unitFlat || p.unit?.flatNumber || "101";
                      const owner = p.ownerName || p.unit?.ownerName || "Member";
                      const rcNo = p.receiptNo || p.receiptNumber || `RCP-${p.id}`;

                      return (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs font-bold text-indigo-700">
                            {rcNo}
                          </td>
                          <td className="px-4 py-3 font-bold text-gray-900">
                            {wing}-{flat}
                          </td>
                          <td className="px-4 py-3 text-gray-700">{owner}</td>
                          <td className="px-4 py-3 text-gray-600 text-xs">
                            {p.paymentDate ? p.paymentDate.split("T")[0] : new Date().toISOString().split("T")[0]}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-indigo-50 text-indigo-700 uppercase">
                              {p.mode}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-emerald-600 tabular-nums">
                            {fmt(p.amount)}
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <button
                              onClick={() =>
                                setViewingReceipt({
                                  receiptNo: rcNo,
                                  wing,
                                  flat,
                                  owner,
                                  amount: p.amount,
                                  date: p.paymentDate ? p.paymentDate.split("T")[0] : new Date().toISOString().split("T")[0],
                                  mode: p.mode,
                                  referenceNo: p.referenceNo,
                                })
                              }
                              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded transition-colors"
                            >
                              🖨️ Receipt
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Official Co-operative Housing Society Payment Receipt Modal */}
      {viewingReceipt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6">
            <button
              onClick={() => setViewingReceipt(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              ✕
            </button>

            {/* Printable Receipt Paper */}
            <div className="border-2 border-indigo-900/30 p-6 rounded-xl bg-amber-50/20 space-y-4">
              <div className="text-center border-b pb-3 space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 block">
                  Official Co-operative Housing Society Receipt
                </span>
                <h3 className="text-xl font-black text-gray-900">{society.name}</h3>
                <p className="text-xs text-gray-500">
                  {society.address} · Reg. No: {society.registrationNo}
                </p>
              </div>

              <div className="flex justify-between text-xs font-semibold text-gray-700">
                <p>
                  Receipt No: <span className="font-mono font-bold text-indigo-900">{viewingReceipt.receiptNo}</span>
                </p>
                <p>
                  Date: <span className="font-bold">{viewingReceipt.date}</span>
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg border text-xs space-y-2 text-gray-800 leading-relaxed">
                <p>
                  Received with thanks from:{" "}
                  <strong className="text-indigo-900 font-bold">{viewingReceipt.owner}</strong>
                </p>
                <p>
                  Flat No:{" "}
                  <strong>
                    {viewingReceipt.wing}-{viewingReceipt.flat}
                  </strong>
                </p>
                <p>
                  The sum of Rupees:{" "}
                  <strong className="text-emerald-700 text-sm font-bold">
                    {fmt(viewingReceipt.amount)}
                  </strong>
                </p>
                <p>
                  Payment Mode: <strong className="uppercase">{viewingReceipt.mode}</strong> · Ref:{" "}
                  <span className="font-mono text-gray-600">{viewingReceipt.referenceNo || "Direct Credit"}</span>
                </p>
                <p className="text-gray-500 text-[11px] pt-1 border-t">
                  On account of: Monthly Maintenance &amp; Statutory Society Sinking/Repair Funds.
                </p>
              </div>

              <div className="pt-8 flex justify-between items-end text-xs text-gray-500">
                <div className="text-center">
                  <div className="w-24 border-b border-gray-400 mb-1"></div>
                  <span>Member Signature</span>
                </div>
                <div className="text-center">
                  <div className="w-32 border-b border-indigo-900 mb-1"></div>
                  <span className="font-bold text-indigo-950">Hon. Secretary / Treasurer</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 print:hidden">
              <button
                onClick={() => window.print()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-sm flex items-center gap-1.5"
              >
                🖨️ Print Official Receipt
              </button>
              <button
                onClick={() => setViewingReceipt(null)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs px-4 py-2.5 rounded-lg"
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
