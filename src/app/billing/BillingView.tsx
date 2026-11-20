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

  const handleGenerateBillsForUnits = () => {
    const units = clientStore.getUnits([]);
    if (units.length === 0) {
      alert("Please add at least one flat in the Members tab before generating bills.");
      return;
    }

    const generated: StoredInvoice[] = units.map((u, index) => {
      // Bye-law calculations
      const sinkingFund = Math.round((u.constructionCost * 0.0025) / 12);
      const repairFund = Math.round((u.constructionCost * 0.0075) / 12);
      const propTax = Math.round(u.carpetAreaSqft * 8.5);
      const waterCharges = 250;
      const electricity = 400;
      const liftAMC = 350;
      const security = 600;
      const parking = (u.fourWheelerSlots || 0) * 150;
      const noc = u.occupancy === "tenanted" ? Math.round((sinkingFund + repairFund + propTax) * 0.1) : 0;
      const total = sinkingFund + repairFund + propTax + waterCharges + electricity + liftAMC + security + parking + noc;

      const billNo = `SG-2026-10-${String(index + 1).padStart(3, "0")}`;

      return {
        id: "inv_" + u.id,
        billNumber: billNo,
        unitId: u.id,
        wing: u.wing,
        flatNumber: u.flatNumber,
        ownerName: u.ownerName,
        ownerPhone: u.ownerPhone,
        billDate: "2026-10-01",
        dueDate: "2026-10-21",
        totalPayable: total,
        amountPaid: 0,
        isSettled: false,
        breakup: {
          maintenanceCharge: propTax + liftAMC + security,
          sinkingFund,
          repairFund,
          parkingCharges: parking,
          waterCharges,
          electricityCharges: electricity,
          interestArrears: 0,
        },
      };
    });

    generated.forEach((inv) => clientStore.addInvoice(inv));
    setInvoices(generated);
    alert(`✨ Generated ${generated.length} monthly maintenance bills for your registered flats!`);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-gray-900">Billing &amp; Invoices</h1>
            {isWiped && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                ✨ Blank Space Active
              </span>
            )}
          </div>
          <p className="text-gray-500 mt-1">
            {invoices.length} bills generated · Total: {fmt(totalBilled)} · Collected: {fmt(totalCollected)}
          </p>
        </div>

        {unitsCount > 0 && invoices.length === 0 && (
          <button
            onClick={handleGenerateBillsForUnits}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-colors self-start"
          >
            ⚡ Generate Oct 2026 Bills for {unitsCount} Flats
          </button>
        )}
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
          <div className="p-12 text-center space-y-4">
            <span className="text-5xl inline-block">🧾</span>
            <p className="font-bold text-gray-800 text-lg">No Invoices in Clean Blank Space</p>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              {unitsCount > 0
                ? `You have ${unitsCount} flat(s) registered in the Members Directory. Click below to generate monthly maintenance bills:`
                : "Your database is clean. First add your building flats in the Members tab, then you can generate bills here with 1 click."}
            </p>
            <div className="pt-2 flex justify-center gap-3">
              {unitsCount > 0 ? (
                <button
                  onClick={handleGenerateBillsForUnits}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-sm"
                >
                  ⚡ Generate Oct 2026 Bills ({unitsCount} Flats)
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
                      {inv.unit ? `${inv.unit.wing}-${inv.unit.flatNumber}` : `${inv.wing}-${inv.flatNumber}`}
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {inv.unit ? inv.unit.ownerName : inv.ownerName}
                    </td>
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
                        🖨️ View Bill
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
