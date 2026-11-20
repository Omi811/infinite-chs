"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clientStore } from "@/lib/store";

export default function AddMemberModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [wing, setWing] = useState("A");
  const [flatNumber, setFlatNumber] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [carpetAreaSqft, setCarpetAreaSqft] = useState(650);
  const [constructionCost, setConstructionCost] = useState(1800000);
  const [occupancy, setOccupancy] = useState("self_occupied");
  const [fourWheelerSlots, setFourWheelerSlots] = useState(1);
  const [nomineeName, setNomineeName] = useState("");
  const [nomineeRelation, setNomineeRelation] = useState("Wife");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flatNumber || !ownerName || !ownerPhone) return;
    setLoading(true);

    const unitPayload = {
      wing,
      flatNumber,
      ownerName,
      ownerPhone,
      carpetAreaSqft: Number(carpetAreaSqft),
      constructionCost: Number(constructionCost),
      occupancy,
      fourWheelerSlots: Number(fourWheelerSlots),
      nomineeName,
      nomineeRelation,
      shareCertificateNo: `SC-${wing}${flatNumber}`,
      shareDistinctiveFrom: 1,
      shareDistinctiveTo: 5,
      shareValue: 250,
      entranceFeePaid: 100,
      admissionDate: new Date().toISOString().split("T")[0],
    };

    // 1. Save directly to client store (guaranteed to work on GitHub Pages & offline)
    clientStore.addUnit(unitPayload);

    // 2. Try server if available
    try {
      await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(unitPayload),
      });
    } catch {
      // Safe to ignore on static GitHub Pages
    }

    setIsOpen(false);
    setFlatNumber("");
    setOwnerName("");
    setOwnerPhone("");
    setNomineeName("");
    setLoading(false);
    router.refresh();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
      >
        ➕ Add New Flat / Member
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 text-xs">
            <div className="flex justify-between items-start border-b pb-3 mb-4">
              <div>
                <h3 className="text-base font-black text-gray-900 uppercase">
                  Add New Flat / Unit Member
                </h3>
                <p className="text-[11px] text-gray-500">
                  Auto-allocates share certificate &amp; records Form 14 nominee into the database.
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Wing</label>
                  <select
                    value={wing}
                    onChange={(e) => setWing(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="A">Wing A</option>
                    <option value="B">Wing B</option>
                    <option value="C">Wing C</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Flat No.</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 401"
                    value={flatNumber}
                    onChange={(e) => setFlatNumber(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Owner Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Manoj Sharma"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Mobile Phone</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9820098200"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Carpet Area (sq.ft)</label>
                  <input
                    type="number"
                    value={carpetAreaSqft}
                    onChange={(e) => setCarpetAreaSqft(Number(e.target.value))}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Construction Cost (₹)</label>
                  <input
                    type="number"
                    value={constructionCost}
                    onChange={(e) => setConstructionCost(Number(e.target.value))}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Occupancy</label>
                  <select
                    value={occupancy}
                    onChange={(e) => setOccupancy(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="self_occupied">Self Occupied</option>
                    <option value="tenanted">Tenanted (10% NOC)</option>
                    <option value="vacant">Vacant</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Parking Slots (4W)</label>
                  <input
                    type="number"
                    value={fourWheelerSlots}
                    onChange={(e) => setFourWheelerSlots(Number(e.target.value))}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="border-t pt-2 grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Registered Nominee</label>
                  <input
                    type="text"
                    placeholder="Nominee Name (Form 14)"
                    value={nomineeName}
                    onChange={(e) => setNomineeName(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Relationship</label>
                  <input
                    type="text"
                    placeholder="e.g. Wife / Son"
                    value={nomineeRelation}
                    onChange={(e) => setNomineeRelation(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg disabled:opacity-50"
                >
                  {loading ? "Adding..." : "Save Member to DB ✓"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
