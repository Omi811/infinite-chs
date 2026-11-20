"use client";

import { useState } from "react";

export default function TaxCalculatorClient() {
  const [coopInterest, setCoopInterest] = useState<number>(45000);
  const [commInterest, setCommInterest] = useState<number>(18000);
  const [towerRent, setTowerRent] = useState<number>(24000);
  const [expenses, setExpenses] = useState<number>(3000);

  // Maintenance income is exempt under Principle of Mutuality
  const netCommercial = Math.max(0, towerRent - expenses);
  const grossTotalIncome = coopInterest + commInterest + netCommercial;

  // Sec 80P(2)(d) deduction: 100% of co-op bank interest
  const deduction80P = coopInterest;
  const taxableIncomeOld = Math.max(0, grossTotalIncome - deduction80P);

  // Slab tax calculation:
  // Up to 10k -> 10%
  // 10k to 20k -> 20%
  // Above 20k -> 30%
  let slab10 = 0;
  let slab20 = 0;
  let slab30 = 0;

  if (taxableIncomeOld > 0) slab10 = Math.min(taxableIncomeOld, 10000) * 0.10;
  if (taxableIncomeOld > 10000) slab20 = Math.min(taxableIncomeOld - 10000, 10000) * 0.20;
  if (taxableIncomeOld > 20000) slab30 = (taxableIncomeOld - 20000) * 0.30;

  const baseOldTax = slab10 + slab20 + slab30;
  const cessOld = baseOldTax * 0.04;
  const totalOldTax = Math.round(baseOldTax + cessOld);

  // 115BAD (22% + 10% surcharge + 4% cess = 25.168%, but NO 80P deduction permitted!)
  const base115 = grossTotalIncome * 0.22;
  const surcharge115 = base115 * 0.10;
  const cess115 = (base115 + surcharge115) * 0.04;
  const total115 = Math.round(base115 + surcharge115 + cess115);

  const savings = Math.abs(total115 - totalOldTax);
  const isOldBetter = totalOldTax <= total115;

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(n);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            ⚖️ Society Income Tax (ITR-5) & Section 80P Optimizer
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Real-time tax calculation using the <strong>Principle of Mutuality</strong> &amp; Chapter VI-A deductions
          </p>
        </div>
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
          FY 2026-27 (AY 2027-28)
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Inputs */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
            1. Income Heads (Annual / Audited)
          </h3>

          <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-blue-900">Member Maintenance Collections</span>
              <span className="font-bold text-emerald-700">₹4,80,000</span>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              ✅ <strong>100% Tax Exempt</strong> under Supreme Court <em>Principle of Mutuality</em> (No person can trade with himself).
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Interest on FDs in Co-operative Banks (MSCB / MDCCB / Saraswat)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500 text-sm">₹</span>
              <input
                type="number"
                value={coopInterest}
                onChange={(e) => setCoopInterest(Number(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 border rounded-lg text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <p className="text-xs text-emerald-600 mt-1 font-medium">
              👉 Eligible for 100% deduction under Section 80P(2)(d).
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Interest on FDs in Nationalized / Private Banks (SBI, HDFC, BoB)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500 text-sm">₹</span>
              <input
                type="number"
                value={commInterest}
                onChange={(e) => setCommInterest(Number(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 border rounded-lg text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <p className="text-xs text-amber-700 mt-1">
              ⚠️ Taxable income (Not eligible for 80P as per ITAT Mumbai rulings).
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Terrace Mobile Tower / Commercial Hoarding Rent
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500 text-sm">₹</span>
              <input
                type="number"
                value={towerRent}
                onChange={(e) => setTowerRent(Number(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 border rounded-lg text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Direct Expenses Incurred for Commercial Rent
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500 text-sm">₹</span>
              <input
                type="number"
                value={expenses}
                onChange={(e) => setExpenses(Number(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 border rounded-lg text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Right Computation & Advice */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
            2. Tax Computation Summary
          </h3>

          <div className="bg-gray-50 rounded-xl p-4 space-y-2.5 text-sm border border-gray-200">
            <div className="flex justify-between">
              <span className="text-gray-600">Gross Total Income (GTI):</span>
              <span className="font-bold text-gray-900">{fmt(grossTotalIncome)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-medium">
              <span>Less: Deduction u/s 80P(2)(d):</span>
              <span>- {fmt(deduction80P)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-bold text-indigo-900">
              <span>Net Taxable Income (Old Slab):</span>
              <span>{fmt(taxableIncomeOld)}</span>
            </div>
          </div>

          {/* Regime Comparison */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className={`p-3.5 rounded-xl border ${
                isOldBetter ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400" : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold uppercase text-gray-700">Regular Slabs</span>
                {isOldBetter && <span className="text-xs bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold">BEST</span>}
              </div>
              <p className="text-2xl font-extrabold text-emerald-800">{fmt(totalOldTax)}</p>
              <div className="text-xs text-gray-500 mt-2 space-y-0.5">
                <p>10% on first ₹10k: {fmt(slab10)}</p>
                <p>20% on next ₹10k: {fmt(slab20)}</p>
                <p>30% on balance: {fmt(slab30)}</p>
                <p>Cess 4%: {fmt(cessOld)}</p>
              </div>
            </div>

            <div
              className={`p-3.5 rounded-xl border ${
                !isOldBetter ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400" : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold uppercase text-gray-700">Section 115BAD</span>
                {!isOldBetter && <span className="text-xs bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold">BEST</span>}
              </div>
              <p className="text-2xl font-extrabold text-gray-800">{fmt(total115)}</p>
              <div className="text-xs text-gray-500 mt-2 space-y-0.5">
                <p>Flat 22% rate</p>
                <p>10% Surcharge mandatory</p>
                <p>Effective rate: 25.17%</p>
                <p className="text-red-500 font-semibold">❌ Sec 80P NOT allowed</p>
              </div>
            </div>
          </div>

          {/* AI Recommendation Alert */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-sm text-indigo-950">
            <p className="font-bold flex items-center gap-1.5">
              🤖 Copilot Recommendation:
            </p>
            <p className="mt-1 text-xs text-indigo-900 leading-relaxed">
              File under <strong>{isOldBetter ? "Regular Society Slabs (Old Regime)" : "Section 115BAD"}</strong>. 
              {isOldBetter && (
                <> Because your society holds FDs in co-operative banks, claiming <strong>Section 80P(2)(d)</strong> deduction saves your society <strong>{fmt(savings)}</strong> in taxes compared to Section 115BAD!</>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
