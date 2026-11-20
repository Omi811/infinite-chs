"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { clientStore } from "@/lib/store";

export interface SocietyData {
  id: string;
  name: string;
  registrationNo: string;
  address: string;
  city: string;
  pincode: string;
  panNumber?: string | null;
  gstin?: string | null;
  interestRatePa: number;
}

export default function SettingsClient({
  society: initialSociety,
  stats: initialStats,
}: {
  society: SocietyData;
  stats: { unitsCount: number; invoicesCount: number; expensesCount: number; docsCount: number };
}) {
  const router = useRouter();

  const [society, setSociety] = useState(initialSociety);
  const [stats, setStats] = useState(initialStats);
  const [isWiped, setIsWiped] = useState(false);

  const [name, setName] = useState(initialSociety.name);
  const [registrationNo, setRegistrationNo] = useState(initialSociety.registrationNo);
  const [address, setAddress] = useState(initialSociety.address);
  const [city, setCity] = useState(initialSociety.city || "Mumbai");
  const [pincode, setPincode] = useState(initialSociety.pincode || "400001");
  const [panNumber, setPanNumber] = useState(initialSociety.panNumber || "");
  const [gstin, setGstin] = useState(initialSociety.gstin || "");
  const [interestRatePa, setInterestRatePa] = useState(initialSociety.interestRatePa || 21.0);

  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState("");

  const refreshFromStore = () => {
    const wiped = clientStore.isDataWiped();
    setIsWiped(wiped);

    if (wiped) {
      const storedSoc = clientStore.getSociety();
      if (storedSoc) {
        setName(storedSoc.name);
        setRegistrationNo(storedSoc.registrationNo);
        setAddress(storedSoc.address);
        setCity(storedSoc.city);
        setPincode(storedSoc.pincode);
        setPanNumber(storedSoc.panNumber || "");
        setGstin(storedSoc.gstin || "");
        setInterestRatePa(storedSoc.interestRatePa);
      }
      setStats({
        unitsCount: clientStore.getUnits().length,
        invoicesCount: clientStore.getInvoices().length,
        expensesCount: clientStore.getExpenses().length,
        docsCount: clientStore.getDocuments().length,
      });
    } else {
      const storedSoc = clientStore.getSociety();
      if (storedSoc) {
        setName(storedSoc.name);
        setRegistrationNo(storedSoc.registrationNo);
        setAddress(storedSoc.address);
      }
      setStats(initialStats);
    }
  };

  useEffect(() => {
    refreshFromStore();
    const unsubscribe = clientStore.subscribe(refreshFromStore);
    return () => unsubscribe();
  }, []);

  const handleSaveSociety = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const updatedData = {
      name,
      registrationNo,
      address,
      city,
      pincode,
      panNumber,
      gstin,
      interestRatePa: Number(interestRatePa),
    };

    // 1. Save to Client Store (always works offline & on GitHub Pages)
    clientStore.saveSociety(updatedData);

    // 2. Try server API if available
    try {
      await fetch("/api/society", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
    } catch {
      // Safe to ignore on static GitHub Pages
    }

    setMessage("✅ Society details saved successfully!");
    setSaving(false);
  };

  const handleClearDemoData = async () => {
    const confirmed = confirm(
      "Are you sure you want to remove all beta/demo flats, bills, and expenses? This will make the database 100% blank for your real society data."
    );
    if (!confirmed) return;

    setResetting(true);
    try {
      // 1. Wipe client store immediately (works 100% on GitHub Pages & offline)
      clientStore.wipeAllData();

      // 2. Try backend API silently if running full server
      try {
        await fetch("/api/admin/reset", { method: "POST" });
      } catch {
        // Safe to ignore on static GitHub Pages
      }

      refreshFromStore();
      alert("✨ All beta details removed! You now have a clean blank space to add your real flats.");
      router.push("/members/");
    } catch (err) {
      console.error(err);
      alert("Demo data wiped in local storage!");
    } finally {
      setResetting(false);
    }
  };

  const handleRestoreDemoData = () => {
    const confirmed = confirm("Restore sample demo flats and bills for previewing?");
    if (!confirmed) return;

    clientStore.restoreDemoData();
    refreshFromStore();
    alert("🔄 Demo data restored for preview.");
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Current Database Status */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs uppercase font-bold text-gray-500 tracking-wide">
            📊 Current System Records
          </h2>
          {isWiped && (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              ✨ Clean Blank Space Active
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-indigo-50/60 rounded-lg">
            <p className="text-2xl font-black text-indigo-900">{stats.unitsCount}</p>
            <p className="text-xs text-indigo-700 font-semibold mt-0.5">Flats / Units</p>
          </div>
          <div className="p-3 bg-blue-50/60 rounded-lg">
            <p className="text-2xl font-black text-blue-900">{stats.invoicesCount}</p>
            <p className="text-xs text-blue-700 font-semibold mt-0.5">Bills Generated</p>
          </div>
          <div className="p-3 bg-amber-50/60 rounded-lg">
            <p className="text-2xl font-black text-amber-900">{stats.expensesCount}</p>
            <p className="text-xs text-amber-700 font-semibold mt-0.5">Vendor Bills</p>
          </div>
          <div className="p-3 bg-emerald-50/60 rounded-lg">
            <p className="text-2xl font-black text-emerald-900">{stats.docsCount}</p>
            <p className="text-xs text-emerald-700 font-semibold mt-0.5">Stored Files</p>
          </div>
        </div>
      </div>

      {/* Society Details Form (Admin Fills Real Data) */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="pb-4 border-b mb-4">
          <h2 className="text-base font-bold text-gray-900">
            🏢 Society Profile &amp; Legal Details
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Fill in your actual society name and registration number. This will appear on all bills, receipts, and statutory registers.
          </p>
        </div>

        <form onSubmit={handleSaveSociety} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Society Legal Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sea View Co-operative Housing Society Ltd."
                className="w-full border rounded-lg px-3 py-2 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Registration Number</label>
              <input
                type="text"
                required
                value={registrationNo}
                onChange={(e) => setRegistrationNo(e.target.value)}
                placeholder="e.g. MUM/HSG/TC/12345/2012"
                className="w-full border rounded-lg px-3 py-2 text-xs font-mono font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Building Address &amp; Sector</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Plot No. 12, Sector 19, Sanpada, Navi Mumbai"
              className="w-full border rounded-lg px-3 py-2 text-xs text-gray-800 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Pincode</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Late Interest Rate (% p.a.)</label>
              <input
                type="number"
                step="0.5"
                value={interestRatePa}
                onChange={(e) => setInterestRatePa(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2 text-xs font-bold"
              />
              <span className="text-[10px] text-gray-400">Max 21% as per Bye-law 72</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Society PAN (Optional)</label>
              <input
                type="text"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value)}
                placeholder="e.g. AADCS1234F"
                className="w-full border rounded-lg px-3 py-2 text-xs font-mono uppercase"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Society GSTIN (Optional)</label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="e.g. 27AADCS1234F1Z5"
                className="w-full border rounded-lg px-3 py-2 text-xs font-mono uppercase"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-lg shadow-sm transition-colors text-xs disabled:opacity-50"
            >
              {saving ? "Saving Details..." : "💾 Save Society Profile"}
            </button>

            {message && <span className="text-xs font-bold">{message}</span>}
          </div>
        </form>
      </div>

      {/* Danger Zone: Blank Space / Wipe Beta Data */}
      <div className="bg-red-50/70 rounded-xl border border-red-200 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h3 className="font-bold text-red-900 text-sm flex items-center gap-1.5">
              <span>⚠️</span> Blank Space / Wipe Demo &amp; Beta Data
            </h3>
            <p className="text-xs text-red-800 mt-1 max-w-xl leading-relaxed">
              Clicking this will remove all sample/demo flats, bills, and payments from the system.
              It gives Dad a <strong>completely clean, blank space</strong> so he can enter your real society members from scratch.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleClearDemoData}
              disabled={resetting}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {resetting ? "Clearing..." : "🗑️ Wipe Demo Data (Blank Space)"}
            </button>

            {isWiped && (
              <button
                onClick={handleRestoreDemoData}
                type="button"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs px-3 py-2 rounded-lg transition-colors"
              >
                🔄 Restore Sample Data
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
