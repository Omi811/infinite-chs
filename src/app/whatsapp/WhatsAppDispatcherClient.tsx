"use client";

import { useState, useEffect } from "react";
import { clientStore } from "@/lib/store";

interface MemberBill {
  id: string;
  wing: string;
  flatNumber: string;
  ownerName: string;
  ownerPhone: string;
  billNumber: string;
  totalPayable: number;
  amountPaid: number;
  isSettled: boolean;
  dueDate: string;
}

export default function WhatsAppDispatcherClient({
  bills: initialBills,
  baseUrl,
}: {
  bills: MemberBill[];
  baseUrl: string;
}) {
  const [bills, setBills] = useState<MemberBill[]>(initialBills);
  const [templateType, setTemplateType] = useState<"bill" | "reminder" | "urgent">("bill");
  const [filter, setFilter] = useState<"all" | "defaulters" | "paid">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadBills = () => {
    if (clientStore.isDataWiped()) {
      const invs = clientStore.getInvoices([]);
      setBills(
        invs.map((i) => ({
          id: i.id,
          wing: i.wing,
          flatNumber: i.flatNumber,
          ownerName: i.ownerName,
          ownerPhone: i.ownerPhone,
          billNumber: i.billNumber,
          totalPayable: i.totalPayable,
          amountPaid: i.amountPaid,
          isSettled: i.isSettled,
          dueDate: i.dueDate,
        }))
      );
    } else {
      setBills(initialBills);
    }
  };

  useEffect(() => {
    loadBills();
    const unsub = clientStore.subscribe(loadBills);
    return () => unsub();
  }, []);

  const filteredBills = bills.filter((b) => {
    if (filter === "defaulters") return !b.isSettled;
    if (filter === "paid") return b.isSettled;
    return true;
  });

  const getMessageText = (b: MemberBill) => {
    const dueAmount = b.totalPayable - b.amountPaid;
    const billUrl = `${baseUrl}/billing/${b.id}`;

    if (templateType === "bill") {
      return `Dear ${b.ownerName} ji,

Your Maintenance Bill for Flat ${b.wing}-${b.flatNumber} (Shree Ganesh CHS Ltd) for October 2026 has been generated.

Amount Due: ₹${Math.round(dueAmount).toLocaleString("en-IN")}
Due Date: 15-Oct-2026
Bill No: ${b.billNumber}

📲 Pay instantly via UPI: shreeganeshchs@sbi
📄 View & Download Official Bill: ${billUrl}

Thank you,
Managing Committee
Shree Ganesh CHS Ltd.`;
    } else if (templateType === "reminder") {
      return `Dear ${b.ownerName} ji,

This is a gentle reminder that the maintenance dues of ₹${Math.round(dueAmount).toLocaleString("en-IN")} for Flat ${b.wing}-${b.flatNumber} are pending for October 2026.

Kindly clear the dues at your earliest convenience to avoid late payment interest under society bye-laws.

📲 UPI ID: shreeganeshchs@sbi
📄 View Bill: ${billUrl}

Regards,
Hon. Treasurer / Secretary
Shree Ganesh CHS Ltd.`;
    } else {
      return `⚠️ URGENT REMINDER NOTICE

Flat: ${b.wing}-${b.flatNumber} (${b.ownerName})
Society: Shree Ganesh CHS Ltd., Navi Mumbai

Your maintenance payment of ₹${Math.round(dueAmount).toLocaleString("en-IN")} is OVERDUE.

As per Maharashtra Co-operative Societies Bye-law No. 72, simple interest @ 21% p.a. is applicable on delayed payments. Please clear the outstanding dues immediately to avoid Section 101 recovery proceedings.

📲 Pay via UPI: shreeganeshchs@sbi
📄 View Bill Details: ${billUrl}

Hon. Secretary / Managing Committee`;
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Template Selector & Filters */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
            1. Select WhatsApp Message Template
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setTemplateType("bill")}
              className={`p-3 text-left rounded-lg border text-xs transition-all ${
                templateType === "bill"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500"
                  : "border-gray-200 hover:bg-gray-50 text-gray-700"
              }`}
            >
              <span className="block text-sm mb-0.5">📨 Monthly Bill Notice</span>
              Standard bill notification with amount and bill link.
            </button>

            <button
              onClick={() => setTemplateType("reminder")}
              className={`p-3 text-left rounded-lg border text-xs transition-all ${
                templateType === "reminder"
                  ? "border-blue-600 bg-blue-50 text-blue-950 font-bold ring-2 ring-blue-500"
                  : "border-gray-200 hover:bg-gray-50 text-gray-700"
              }`}
            >
              <span className="block text-sm mb-0.5">🔔 Gentle Follow-up</span>
              Courteous reminder for upcoming due date.
            </button>

            <button
              onClick={() => setTemplateType("urgent")}
              className={`p-3 text-left rounded-lg border text-xs transition-all ${
                templateType === "urgent"
                  ? "border-red-600 bg-red-50 text-red-950 font-bold ring-2 ring-red-500"
                  : "border-gray-200 hover:bg-gray-50 text-gray-700"
              }`}
            >
              <span className="block text-sm mb-0.5">⚠️ 21% Interest &amp; Overdue</span>
              Formal warning quoting Bye-law 72 &amp; MCS Act.
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 font-medium">Filter Flats:</span>
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-full font-medium ${
                filter === "all" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All ({bills.length})
            </button>
            <button
              onClick={() => setFilter("defaulters")}
              className={`px-3 py-1 rounded-full font-medium ${
                filter === "defaulters" ? "bg-red-600 text-white" : "bg-red-50 text-red-700 hover:bg-red-100"
              }`}
            >
              Defaulters ({bills.filter((b) => !b.isSettled).length})
            </button>
            <button
              onClick={() => setFilter("paid")}
              className={`px-3 py-1 rounded-full font-medium ${
                filter === "paid" ? "bg-green-600 text-white" : "bg-green-50 text-green-700 hover:bg-green-100"
              }`}
            >
              Paid ({bills.filter((b) => b.isSettled).length})
            </button>
          </div>
        </div>
      </div>

      {/* Member Bills Dispatch List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
          <h2 className="font-bold text-gray-900 text-sm">
            Dispatched to Flat Owners ({filteredBills.length} flats)
          </h2>
          <span className="text-xs text-gray-500">
            Clicking &quot;Send WhatsApp&quot; opens chat directly with phone number
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredBills.map((b) => {
            const dueAmount = b.totalPayable - b.amountPaid;
            const message = getMessageText(b);
            const waUrl = `https://wa.me/91${b.ownerPhone}?text=${encodeURIComponent(message)}`;

            return (
              <div key={b.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/60 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-indigo-900 text-sm">
                      {b.wing}-{b.flatNumber}
                    </span>
                    <span className="font-bold text-gray-900 text-sm">{b.ownerName}</span>
                    {b.isSettled ? (
                      <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full">
                        PAID
                      </span>
                    ) : (
                      <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full">
                        DUE: ₹{Math.round(dueAmount).toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 font-mono">
                    📱 +91 {b.ownerPhone} · Bill: {b.billNumber}
                  </p>
                  <p className="text-xs text-gray-600 mt-2 line-clamp-1 italic bg-gray-50 p-1.5 rounded border border-gray-200">
                    &ldquo;{message.split("\n\n")[1] || message.substring(0, 80)}...&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => copyToClipboard(b.id, message)}
                    className="px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {copiedId === b.id ? "✓ Copied!" : "📋 Copy"}
                  </button>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition-colors"
                  >
                    <span>💬</span> Send WhatsApp
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
