"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { clientStore } from "@/lib/store";

export default function DashboardView({
  initialSociety,
  initialUnitsCount,
  initialTotalBilled,
  initialTotalCollected,
  initialInvoicesCount,
  initialRecentPayments,
  initialDefaulters,
}: {
  initialSociety: any;
  initialUnitsCount: number;
  initialTotalBilled: number;
  initialTotalCollected: number;
  initialInvoicesCount: number;
  initialRecentPayments: any[];
  initialDefaulters: any[];
}) {
  const [society, setSociety] = useState(initialSociety);
  const [unitsCount, setUnitsCount] = useState(initialUnitsCount);
  const [totalBilled, setTotalBilled] = useState(initialTotalBilled);
  const [totalCollected, setTotalCollected] = useState(initialTotalCollected);
  const [invoicesCount, setInvoicesCount] = useState(initialInvoicesCount);
  const [recentPayments, setRecentPayments] = useState(initialRecentPayments);
  const [defaulters, setDefaulters] = useState(initialDefaulters);
  const [isWiped, setIsWiped] = useState(false);

  const loadFromStore = () => {
    const wiped = clientStore.isDataWiped();
    setIsWiped(wiped);

    if (wiped) {
      const units = clientStore.getUnits([]);
      setUnitsCount(units.length);

      const soc = clientStore.getSociety(initialSociety);
      if (soc) setSociety(soc);

      const invoices = clientStore.getInvoices([]);
      setInvoicesCount(invoices.length);

      const billed = invoices.reduce((s, i) => s + (i.totalPayable || 0), 0);
      const collected = invoices.reduce((s, i) => s + (i.amountPaid || 0), 0);
      setTotalBilled(billed);
      setTotalCollected(collected);

      const unpaid = invoices.filter((i) => !i.isSettled);
      setDefaulters(
        unpaid.map((u) => ({
          id: u.id,
          billNumber: u.billNumber,
          totalPayable: u.totalPayable,
          amountPaid: u.amountPaid,
          unit: {
            wing: u.wing,
            flatNumber: u.flatNumber,
            ownerName: u.ownerName,
          },
        }))
      );

      const payments = clientStore.getPayments([]);
      setRecentPayments(
        payments.map((p) => ({
          id: p.id,
          receiptNumber: p.receiptNo,
          amount: p.amount,
          mode: p.mode,
          unit: {
            wing: p.unitWing,
            flatNumber: p.unitFlat,
            ownerName: p.ownerName,
          },
        }))
      );
    } else {
      const soc = clientStore.getSociety(initialSociety);
      if (soc) setSociety(soc);
      setUnitsCount(initialUnitsCount);
      setTotalBilled(initialTotalBilled);
      setTotalCollected(initialTotalCollected);
      setInvoicesCount(initialInvoicesCount);
      setRecentPayments(initialRecentPayments);
      setDefaulters(initialDefaulters);
    }
  };

  useEffect(() => {
    loadFromStore();
    const unsub = clientStore.subscribe(loadFromStore);
    return () => unsub();
  }, []);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(n);

  const collectionPct = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;
  const totalOutstanding = totalBilled - totalCollected;
  const defaulterCount = defaulters.length;

  // Blank State / Onboarding Screen if Admin has cleared data or starting fresh
  if (unitsCount === 0) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto py-6">
        <div className="bg-white p-8 sm:p-12 rounded-2xl border-2 border-dashed border-indigo-200 shadow-sm text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-700 text-3xl">
            ♾️
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Welcome to Infinite! Your Blank Canvas is Ready.
          </h1>
          <p className="text-sm text-gray-600 max-w-lg mx-auto">
            All sample demo details have been removed. Follow the 3 simple steps below to set up your real housing society:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
            <Link
              href="/settings"
              className="p-5 rounded-xl border border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50 transition-colors group"
            >
              <span className="text-xs font-bold uppercase text-indigo-700 block mb-1">Step 1</span>
              <h3 className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">
                🏢 Society Profile
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Enter your real Society Name, Registration No. &amp; Building Address.
              </p>
            </Link>

            <Link
              href="/members"
              className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 transition-colors group"
            >
              <span className="text-xs font-bold uppercase text-emerald-700 block mb-1">Step 2</span>
              <h3 className="font-bold text-gray-900 text-sm group-hover:text-emerald-600 transition-colors">
                🏠 Add Real Flats
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Add your building flat numbers, owners, phone numbers, and carpet areas.
              </p>
            </Link>

            <Link
              href="/expenses"
              className="p-5 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50 transition-colors group"
            >
              <span className="text-xs font-bold uppercase text-amber-700 block mb-1">Step 3</span>
              <h3 className="font-bold text-gray-900 text-sm group-hover:text-amber-600 transition-colors">
                💸 Record Expenses &amp; TDS
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Log vendor bills (Security, Lift AMC, Electrician) with auto-TDS computation.
              </p>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-gray-900">{society.name}</h1>
            {isWiped && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                ✨ Blank Space Active
              </span>
            )}
          </div>
          <p className="text-gray-500 mt-1">
            {society.address} · Reg: {society.registrationNo}
          </p>
        </div>

        <Link
          href="/settings"
          className="text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 self-start"
        >
          ⚙️ Edit Society Details
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Flats</p>
          <p className="text-3xl font-bold text-indigo-700 mt-2">{unitsCount}</p>
          <p className="text-xs text-gray-400 mt-1">Configured Units</p>
        </div>
        <div className="stat-card">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Billed</p>
          <p className="text-3xl font-bold text-blue-700 mt-2">{fmt(totalBilled)}</p>
          <p className="text-xs text-gray-400 mt-1">{invoicesCount} invoices generated</p>
        </div>
        <div className="stat-card">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Collected</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">{fmt(totalCollected)}</p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${collectionPct}%` }}></div>
          </div>
          <p className="text-xs text-gray-400 mt-1">{collectionPct}% collection rate</p>
        </div>
        <div className="stat-card border-red-100">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Outstanding</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{fmt(totalOutstanding)}</p>
          <p className="text-xs text-red-400 mt-1">{defaulterCount} defaulter(s)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-800">Recent Payments</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {recentPayments.map((p) => (
              <div key={p.id} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800 text-sm">
                    {p.unit.wing}-{p.unit.flatNumber} · {p.unit.ownerName}
                  </p>
                  <p className="text-xs text-gray-400">{p.receiptNumber} · {p.mode.toUpperCase()}</p>
                </div>
                <span className="font-semibold text-emerald-600 text-sm">{fmt(p.amount)}</span>
              </div>
            ))}
            {recentPayments.length === 0 && (
              <p className="px-6 py-4 text-gray-400 text-sm">No payments recorded yet.</p>
            )}
          </div>
        </div>

        {/* Defaulters */}
        <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-red-100 bg-red-50">
            <h2 className="font-semibold text-red-800">⚠️ Defaulters — Outstanding Dues</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {defaulters.map((inv) => (
              <div key={inv.id} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800 text-sm">
                    {inv.unit.wing}-{inv.unit.flatNumber} · {inv.unit.ownerName}
                  </p>
                  <p className="text-xs text-gray-400">Bill: {inv.billNumber}</p>
                </div>
                <span className="font-bold text-red-600 text-sm">{fmt(inv.totalPayable - inv.amountPaid)}</span>
              </div>
            ))}
            {defaulters.length === 0 && (
              <p className="px-6 py-4 text-emerald-600 text-sm">🎉 All dues collected!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
