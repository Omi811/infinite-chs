"use client";

import { useState, useEffect } from "react";
import { clientStore } from "@/lib/store";

export interface MemberUnitRecord {
  id: string;
  wing: string;
  flatNumber: string;
  ownerName: string;
  ownerPhone: string;
  carpetAreaSqft: number;
  constructionCost: number;
  occupancy: string;
  shareCertificateNo: string;
  shareDistinctiveFrom: number;
  shareDistinctiveTo: number;
  shareValue: number;
  entranceFeePaid: number;
  admissionDate: string;
  nomineeName: string;
  nomineeRelation: string;
  createdAt: string;
}

export default function RegistersClient({
  members: initialMembers,
  societyName: initialSocietyName,
  regNo: initialRegNo,
}: {
  members: MemberUnitRecord[];
  societyName: string;
  regNo: string;
}) {
  const [activeTab, setActiveTab] = useState<"form_i" | "form_j">("form_i");
  const [members, setMembers] = useState<MemberUnitRecord[]>(initialMembers);
  const [societyName, setSocietyName] = useState(initialSocietyName);
  const [regNo, setRegNo] = useState(initialRegNo);

  const loadRegisters = () => {
    if (clientStore.isDataWiped()) {
      const units = clientStore.getUnits([]);
      const mapped: MemberUnitRecord[] = units.map((u, idx) => ({
        id: u.id,
        wing: u.wing,
        flatNumber: u.flatNumber,
        ownerName: u.ownerName,
        ownerPhone: u.ownerPhone,
        carpetAreaSqft: u.carpetAreaSqft,
        constructionCost: u.constructionCost,
        occupancy: u.occupancy,
        shareCertificateNo: u.shareCertificateNo || `SC-${u.wing}${u.flatNumber}`,
        shareDistinctiveFrom: (idx * 5) + 1,
        shareDistinctiveTo: (idx * 5) + 5,
        shareValue: 250,
        entranceFeePaid: 100,
        admissionDate: u.admissionDate || new Date().toISOString().split("T")[0],
        nomineeName: u.nomineeName || "Registered in Form 14",
        nomineeRelation: u.nomineeRelation || "Nominee",
        createdAt: u.createdAt,
      }));
      setMembers(mapped);

      const soc = clientStore.getSociety();
      if (soc) {
        setSocietyName(soc.name);
        setRegNo(soc.registrationNo);
      }
    } else {
      setMembers(initialMembers);
      setSocietyName(initialSocietyName);
      setRegNo(initialRegNo);
    }
  };

  useEffect(() => {
    loadRegisters();
    const unsub = clientStore.subscribe(loadRegisters);
    return () => unsub();
  }, []);

  return (
    <div className="space-y-6">
      {/* Tab Switcher & Print Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("form_i")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "form_i"
                ? "bg-white text-indigo-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            📋 Form &apos;I&apos; Register of Members (Rule 32)
          </button>
          <button
            onClick={() => setActiveTab("form_j")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "form_j"
                ? "bg-white text-indigo-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            📑 Form &apos;J&apos; List of Members (Rule 33)
          </button>
        </div>

        <button
          onClick={() => window.print()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 self-start"
        >
          🖨️ Print Official Register
        </button>
      </div>

      {/* Statutory Info Card */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 print:hidden">
        <p className="font-bold flex items-center gap-1.5">
          ⚖️ Mandatory Compliance under MCS Act 1960 (Bye-law No. 142)
        </p>
        <p className="mt-1 leading-relaxed">
          The <strong>Form &apos;I&apos; Register</strong> is the primary legal proof of membership in a Maharashtra Housing Society.
          It records share certificates issued (5 shares of ₹50 each = ₹250) and Form 14 registered nominees.
          The <strong>Form &apos;J&apos; List</strong> is mandatory for determining eligible voting rights during Annual General Meetings (AGM).
        </p>
      </div>

      {/* Official Register Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 print:border-none print:shadow-none print:p-0">
        <div className="text-center pb-4 border-b-2 border-indigo-950 mb-4">
          <h2 className="text-lg font-black text-indigo-950 uppercase tracking-wide">
            {societyName}
          </h2>
          <p className="text-xs text-gray-600">Registration No: {regNo}</p>
          <h3 className="text-sm font-extrabold text-gray-800 uppercase mt-2">
            {activeTab === "form_i"
              ? "FORM 'I' — REGISTER OF MEMBERS (Under Rule 32 of MCS Rules, 1961)"
              : "FORM 'J' — LIST OF MEMBERS (Under Rule 33 of MCS Rules, 1961)"}
          </h3>
        </div>

        {activeTab === "form_i" ? (
          /* FORM I TABLE */
          <div className="overflow-x-auto">
            <table className="w-full text-xs border border-gray-300">
              <thead className="bg-gray-100 text-gray-800 font-bold border-b border-gray-300 text-center">
                <tr>
                  <th className="p-2 border-r border-gray-300">Sr.</th>
                  <th className="p-2 border-r border-gray-300 text-left">Member Full Name</th>
                  <th className="p-2 border-r border-gray-300">Flat / Wing</th>
                  <th className="p-2 border-r border-gray-300">Admission Date</th>
                  <th className="p-2 border-r border-gray-300">Entrance Fee</th>
                  <th className="p-2 border-r border-gray-300">Share Cert No.</th>
                  <th className="p-2 border-r border-gray-300">Distinctive Share Nos.</th>
                  <th className="p-2 border-r border-gray-300">Share Value</th>
                  <th className="p-2 border-r border-gray-300 text-left">Registered Nominee (Form 14)</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {members.map((m, idx) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="p-2 text-center border-r border-gray-200 font-mono">{idx + 1}</td>
                    <td className="p-2 border-r border-gray-200 font-bold text-gray-900">
                      {m.ownerName}
                      <span className="block text-[10px] text-gray-500 font-normal">📱 {m.ownerPhone}</span>
                    </td>
                    <td className="p-2 text-center border-r border-gray-200 font-bold text-indigo-700">
                      {m.wing}-{m.flatNumber}
                    </td>
                    <td className="p-2 text-center border-r border-gray-200 text-gray-600">
                      {m.admissionDate}
                    </td>
                    <td className="p-2 text-center border-r border-gray-200 text-gray-700 font-mono">
                      ₹{m.entranceFeePaid}
                    </td>
                    <td className="p-2 text-center border-r border-gray-200 font-mono font-bold text-indigo-900">
                      {m.shareCertificateNo}
                    </td>
                    <td className="p-2 text-center border-r border-gray-200 font-mono text-gray-700">
                      {m.shareDistinctiveFrom} to {m.shareDistinctiveTo}
                    </td>
                    <td className="p-2 text-center border-r border-gray-200 text-gray-700 font-medium">
                      ₹{m.shareValue}
                    </td>
                    <td className="p-2 border-r border-gray-200 text-gray-800">
                      <strong>{m.nomineeName}</strong>
                      <span className="block text-[10px] text-gray-500">({m.nomineeRelation})</span>
                    </td>
                    <td className="p-2 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* FORM J TABLE */
          <div className="overflow-x-auto">
            <table className="w-full text-xs border border-gray-300">
              <thead className="bg-gray-100 text-gray-800 font-bold border-b border-gray-300 text-center">
                <tr>
                  <th className="p-2.5 border-r border-gray-300 w-16">Sr. No.</th>
                  <th className="p-2.5 border-r border-gray-300 text-left">Full Name of Member</th>
                  <th className="p-2.5 border-r border-gray-300 text-left">Residential Address / Flat Allotment</th>
                  <th className="p-2.5 border-r border-gray-300">Class of Member</th>
                  <th className="p-2.5 border-r border-gray-300">Date of Membership</th>
                  <th className="p-2.5 text-center">Voting Rights</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {members.map((m, idx) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="p-2.5 text-center border-r border-gray-200 font-mono">{idx + 1}</td>
                    <td className="p-2.5 border-r border-gray-200 font-bold text-gray-900">
                      {m.ownerName}
                    </td>
                    <td className="p-2.5 border-r border-gray-200 text-gray-700">
                      Flat {m.wing}-{m.flatNumber}, {societyName}, Navi Mumbai
                    </td>
                    <td className="p-2.5 text-center border-r border-gray-200">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-blue-100 text-blue-800 font-medium">
                        Original Member
                      </span>
                    </td>
                    <td className="p-2.5 text-center border-r border-gray-200 text-gray-600">
                      {m.admissionDate}
                    </td>
                    <td className="p-2.5 text-center text-emerald-700 font-bold">
                      ✓ Eligible (1 Vote)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Verification Footer for Registrar / Auditor */}
        <div className="mt-8 pt-6 border-t-2 border-gray-300 flex justify-between text-xs text-gray-700">
          <div>
            <p className="font-bold text-gray-900">Inspected &amp; Certified by:</p>
            <p className="text-[11px] text-gray-500 mt-1">Verified with share counterfoils and Form 14 registers.</p>
          </div>
          <div className="flex gap-12 text-center font-bold text-gray-900">
            <div>
              <div className="h-8"></div>
              <p className="border-t border-gray-400 pt-1">Hon. Secretary</p>
            </div>
            <div>
              <div className="h-8"></div>
              <p className="border-t border-gray-400 pt-1">Hon. Chairman</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
