"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { clientStore, StoredInvoice } from "@/lib/store";

export default function BillingView({
  initialInvoices,
  billHeads,
}: {
  initialInvoices: any[];
  billHeads: any[];
}) {
  const [invoices, setInvoices] = useState<any[]>(initialInvoices);
  const [unitsCount, setUnitsCount] = useState<number>(0);
  const [isWiped, setIsWiped] = useState<boolean>(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(10);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [viewingReceipt, setViewingReceipt] = useState<any | null>(null);

  const loadFromStore = () => {
    const wiped = clientStore.isDataWiped();
    setIsWiped(wiped);
    const units = clientStore.getUnits([]);
    setUnitsCount(units.length);

    if (wiped) {
      setInvoices(clientStore.getInvoices([]));
    } else {
      setInvoices(clientStore.getInvoices(initialInvoices));
    }
  };

  useEffect(() => {
    loadFromStore();
    const unsub = clientStore.subscribe(loadFromStore);
    return () => unsub();
  }, []);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(n);

  const totalBilled = invoices.reduce((s, i) => s + (i.totalPayable || 0), 0);
  const totalCollected = invoices.reduce((s, i) => s + (i.amountPaid || 0), 0);
  const unpaidCount = invoices.filter((i) => !i.isSettled).length;

  const handleAutoGenerateBills = () => {
    const units = clientStore.getUnits([]);
    if (units.length === 0) {
      alert("Please add at least one flat in the Members tab before generating bills.");
      return;
    }

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const generated = clientStore.autoGenerateMonthlyBills(selectedMonth, selectedYear, 21);
    alert(`✨ Auto-Generated ${generated.length} maintenance bills for ${monthNames[selectedMonth - 1]} ${selectedYear}!`);
  };

  const handleQuickAutoPay = (inv: any) => {
    const flatLabel = inv.unit ? `${inv.unit.wing}-${inv.unit.flatNumber}` : `${inv.wing}-${inv.flatNumber}`;
    const ownerName = inv.unit ? inv.unit.ownerName : inv.ownerName;
    const amount = inv.totalPayable - (inv.amountPaid || 0);

    const confirmed = confirm(
      `⚡ Auto-Record Payment:\nFlat: ${flatLabel} (${ownerName})\nAmount: ${fmt(amount)}\n\nMark this bill as PAID via UPI & generate an official numbered receipt?`
    );
    if (!confirmed) return;

    const receipt = clientStore.recordBillPayment(inv.id, {
      amount,
      mode: "UPI",
      referenceNo: `UPI-${Date.now().toString().slice(-6)}`,
    });

    if (receipt) {
      alert(`🎉 Payment settled! Receipt #${receipt.receiptNo} created.`);
    }
  };

  const handleAutoSettleAll = () => {
    if (unpaidCount === 0) {
      alert("All invoices are already paid!");
      return;
    }

    const confirmed = confirm(
      `⚡ Auto-Settle All Bills: Mark all ${unpaidCount} unpaid society bills as PAID via UPI and generate receipts?`
    );
    if (!confirmed) return;

    const settled = clientStore.autoSettleAllBills("UPI");
    alert(`🎉 Auto-settled ${settled} bills! Collection rate is now 100%.`);
  };

  return (
    <div className="space-y-8">
      {/* Page Title & Auto Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-gray-900">Billing &amp; Invoices</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              ⚡ Auto-Bill Engine
            </span>
          </div>
          <p className="text-gray-500 mt-1">
            {invoices.length} bills · Billed: {fmt(totalBilled)} · Collected: {fmt(totalCollected)} · Due:{" "}
            <span className="font-bold text-red-600">{fmt(totalBilled - totalCollected)}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start">
          {unpaidCount > 0 && (
            <button
              onClick={handleAutoSettleAll}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              ⚡ Auto-Settle All ({unpaidCount} Due)
            </button>
          )}

          {unitsCount > 0 && (
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="text-xs font-semibold text-gray-700 bg-transparent px-2 py-1 outline-none"
              >
                <option value={10}>Oct 2026</option>
                <option value={11}>Nov 2026</option>
                <option value={12}>Dec 2026</option>
                <option value={1}>Jan 2027</option>
              </select>
              <button
                onClick={handleAutoGenerateBills}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3 py-1.5 rounded-md transition-colors whitespace-nowrap"
              >
                ⚡ Auto-Generate Bills
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bill Heads Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
            </div>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="font-semibold text-gray-800">Generated Invoices</h2>
          <span className="text-xs text-gray-500 font-medium">
            {invoices.length} Bills
          </span>
        </div>

        {invoices.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <span className="text-5xl inline-block">🧾</span>
            <p className="font-bold text-gray-800 text-lg">No Invoices in Clean Blank Space</p>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              {unitsCount > 0
                ? `You have ${unitsCount} flat(s) registered in the Members Directory. Click below to auto-generate monthly maintenance bills:`
                : "Your database is clean. First add your building flats in the Members tab, then you can auto-generate bills here with 1 click."}
            </p>
            <div className="pt-2 flex justify-center gap-3">
              {unitsCount > 0 ? (
                <button
                  onClick={handleAutoGenerateBills}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-sm"
                >
                  ⚡ Auto-Generate Oct 2026 Bills ({unitsCount} Flats)
                </button>
              ) : (
                <Link
                  href="/members"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg inline-block shadow-sm"
                >
                  ➕ Go to Members &amp; Add Flats →
                </Link>
              )}
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
                  <th className="px-4 py-3 text-right">Total Payable</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Actions &amp; Auto-Pay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {invoices.map((inv) => {
                  const flatLabel = inv.unit ? `${inv.unit.wing}-${inv.unit.flatNumber}` : `${inv.wing}-${inv.flatNumber}`;
                  const ownerName = inv.unit ? inv.unit.ownerName : inv.ownerName;

                  return (
                    <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2.5 text-xs font-mono text-gray-500">
                        <Link href={`/billing/${inv.id}`} className="hover:underline text-indigo-600 font-semibold">
                          {inv.billNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 font-bold text-indigo-700">{flatLabel}</td>
                      <td className="px-4 py-2.5 text-gray-700">{ownerName}</td>
                      <td className="px-4 py-2.5 text-right font-bold text-gray-900 tabular-nums">
                        {fmt(inv.totalPayable)}
                      </td>
                      <td className="px-4 py-2.5 text-center">
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
                      <td className="px-4 py-2.5 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {!inv.isSettled ? (
                            <button
                              onClick={() => handleQuickAutoPay(inv)}
                              className="inline-flex items-center gap-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 rounded shadow-xs transition-colors"
                              title="1-Click Auto Settle via UPI"
                            >
                              ⚡ Auto-Pay
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                setViewingReceipt({
                                  receiptNo: `RCP-${inv.billNumber.replace("SG-", "")}`,
                                  flat: flatLabel,
                                  owner: ownerName,
                                  amount: inv.totalPayable,
                                  date: inv.billDate || new Date().toISOString().split("T")[0],
                                  mode: "UPI",
                                  referenceNo: `UPI-REC-${inv.id.slice(-6)}`,
                                })
                              }
                              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded transition-colors"
                            >
                              🧾 Receipt
                            </button>
                          )}

                          <Link
                            href={`/billing/${inv.id}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded transition-colors"
                          >
                            🖨️ Bill
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-indigo-50 font-bold text-sm">
                  <td className="px-4 py-3" colSpan={3}>
                    TOTAL
                  </td>
                  <td className="px-4 py-3 text-right text-indigo-900 tabular-nums">{fmt(totalBilled)}</td>
                  <td></td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Official Payment Receipt Modal */}
      {viewingReceipt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6">
            <button
              onClick={() => setViewingReceipt(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              ✕
            </button>

            <div className="border-2 border-indigo-900/30 p-6 rounded-xl bg-amber-50/20 space-y-4">
              <div className="text-center border-b pb-3 space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 block">
                  Official Co-operative Housing Society Receipt
                </span>
                <h3 className="text-xl font-black text-gray-900">
                  {clientStore.getSociety()?.name || "Shree Ganesh Co-operative Housing Society Ltd."}
                </h3>
                <p className="text-xs text-gray-500">
                  {clientStore.getSociety()?.address || "Plot No. 42, Sector 7, Vashi, Navi Mumbai"} · Reg:{" "}
                  {clientStore.getSociety()?.registrationNo || "MUM/HSG/TC/12345/2005"}
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
                  Flat No: <strong>{viewingReceipt.flat}</strong>
                </p>
                <p>
                  The sum of Rupees:{" "}
                  <strong className="text-emerald-700 text-sm font-bold">{fmt(viewingReceipt.amount)}</strong>
                </p>
                <p>
                  Payment Mode: <strong className="uppercase">{viewingReceipt.mode}</strong> · Ref:{" "}
                  <span className="font-mono text-gray-600">{viewingReceipt.referenceNo}</span>
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
