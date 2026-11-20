"use client";

import { useState, useEffect } from "react";
import AddMemberModal from "./AddMemberModal";
import { clientStore, StoredUnit } from "@/lib/store";

export default function MembersView({ initialUnits }: { initialUnits: any[] }) {
  const [units, setUnits] = useState<any[]>(initialUnits);
  const [isWiped, setIsWiped] = useState(false);

  const loadFromStore = () => {
    const wiped = clientStore.isDataWiped();
    setIsWiped(wiped);
    if (wiped) {
      setUnits(clientStore.getUnits([]));
    } else {
      const stored = clientStore.getUnits(initialUnits);
      setUnits(stored);
    }
  };

  useEffect(() => {
    loadFromStore();
    const unsub = clientStore.subscribe(loadFromStore);
    return () => unsub();
  }, []);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(n);

  const occupancyBadge = (status: string) => {
    switch (status) {
      case "self_occupied":
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">Self</span>;
      case "tenanted":
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-700">Rented</span>;
      case "vacant":
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-500">Vacant</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">Self</span>;
    }
  };

  const wings = units.reduce((acc, unit) => {
    const w = unit.wing || "A";
    if (!acc[w]) acc[w] = [];
    acc[w].push(unit);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-gray-900">Members &amp; Flats Directory</h1>
            {isWiped && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                ✨ Blank Space Mode
              </span>
            )}
          </div>
          <p className="text-gray-500 mt-1">
            Total: {units.length} flats · {units.filter((u) => u.occupancy === "self_occupied").length} self-occupied ·{" "}
            {units.filter((u) => u.occupancy === "tenanted").length} rented ·{" "}
            {units.filter((u) => u.occupancy === "vacant").length} vacant
          </p>
        </div>

        <AddMemberModal />
      </div>

      {units.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-indigo-200 text-center space-y-4 max-w-2xl mx-auto my-6 shadow-sm">
          <div className="text-5xl">🏠</div>
          <h2 className="text-xl font-bold text-gray-900">Clean Blank Space Ready</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            All demo flats have been wiped clean. You now have a fresh slate to add your building&apos;s real flats, owners, phone numbers, and share certificate details.
          </p>
          <div className="pt-2 flex justify-center">
            <AddMemberModal />
          </div>
        </div>
      ) : (
        Object.entries(wings).map(([wing, wingUnits]) => (
          <div key={wing} className="mb-8">
            <h2 className="text-lg font-bold text-indigo-800 mb-3">🏢 Wing {wing}</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3">Flat</th>
                    <th className="px-6 py-3">Owner</th>
                    <th className="px-6 py-3">Phone</th>
                    <th className="px-6 py-3">Carpet Area</th>
                    <th className="px-6 py-3">Construction Cost</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Share Cert.</th>
                    <th className="px-6 py-3 text-center">Parking (4W)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {wingUnits.map((unit) => (
                    <tr key={unit.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 font-bold text-indigo-700">
                        {wing}-{unit.flatNumber}
                      </td>
                      <td className="px-6 py-3 font-medium text-gray-800">{unit.ownerName}</td>
                      <td className="px-6 py-3 text-gray-600 text-sm">{unit.ownerPhone}</td>
                      <td className="px-6 py-3 text-gray-600 text-sm">{unit.carpetAreaSqft} sq.ft</td>
                      <td className="px-6 py-3 text-gray-600 text-sm">{fmt(unit.constructionCost)}</td>
                      <td className="px-6 py-3">{occupancyBadge(unit.occupancy)}</td>
                      <td className="px-6 py-3 font-mono text-xs text-indigo-900 font-semibold">
                        {unit.shareCertificateNo || `SC-${wing}${unit.flatNumber}`}
                      </td>
                      <td className="px-6 py-3 text-gray-600 text-sm text-center">{unit.fourWheelerSlots || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      {/* Statutory Calculation Reference */}
      <div className="mt-8 bg-indigo-50 rounded-xl p-6 border border-indigo-100">
        <h3 className="font-semibold text-indigo-900 mb-3">📐 Bye-law 67 &amp; 68 — Calculation Reference</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-indigo-800">
          <div className="bg-white rounded-lg p-4">
            <p className="font-bold">Sinking Fund</p>
            <p className="text-indigo-600">0.25% × Construction Cost ÷ 12 months</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="font-bold">Repair &amp; Maintenance Fund</p>
            <p className="text-indigo-600">0.75% × Construction Cost ÷ 12 months</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="font-bold">Property Tax</p>
            <p className="text-indigo-600">₹8.50 × Carpet Area (sq.ft)</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="font-bold">Non-Occupancy Charges</p>
            <p className="text-indigo-600">10% of Service Charges (tenanted flats only)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
