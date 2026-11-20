import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { generateUpiQrDataUrl } from "@/lib/upi-qr";
import PrintButton from "./PrintButton";

export const dynamic = "force-dynamic";

export default async function ViewBillPage({ params }: { params: { id: string } }) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: {
      society: true,
      unit: true,
      lineItems: true,
    },
  });

  if (!invoice) return notFound();

  const society = invoice.society;
  const unit = invoice.unit;

  // Generate UPI QR Code
  const upiQr = await generateUpiQrDataUrl({
    payeeVpa: "shreeganeshchs@sbi",
    payeeName: society.name,
    amount: invoice.totalPayable,
    transactionNote: `Bill-${invoice.billNumber}-Flat-${unit.wing}${unit.flatNumber}`,
  });

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(n);

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Top Action Bar (Hidden when printed) */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <Link
          href="/billing"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
        >
          ← Back to All Bills
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/whatsapp"
            className="text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5"
          >
            💬 Send via WhatsApp
          </Link>
          <PrintButton />
        </div>
      </div>

      {/* Official Printable Bill Canvas */}
      <div className="bg-white border-2 border-gray-300 rounded-xl p-8 shadow-sm print:border-none print:shadow-none print:p-0">
        {/* Society Header */}
        <div className="border-b-2 border-indigo-900 pb-5 text-center">
          <span className="text-xs font-semibold tracking-wider uppercase text-indigo-800">
            Co-operative Housing Society (Regd. Under MCS Act, 1960)
          </span>
          <h1 className="text-2xl font-black text-indigo-950 uppercase mt-1 tracking-tight">
            {society.name}
          </h1>
          <p className="text-xs text-gray-600 mt-1">
            {society.address}, {society.city} - {society.pincode}
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-gray-700 mt-2 font-mono">
            <span><strong>Reg. No:</strong> {society.registrationNo}</span>
            {society.panNumber && <span><strong>PAN:</strong> {society.panNumber}</span>}
            {society.gstin && <span><strong>GSTIN:</strong> {society.gstin}</span>}
          </div>
        </div>

        {/* Bill Title & Status Banner */}
        <div className="flex items-center justify-between py-3 px-4 bg-indigo-50 border-y border-indigo-200 my-4 text-xs">
          <div>
            <span className="font-bold text-indigo-900 uppercase">
              MAINTENANCE BILL FOR: {new Date(invoice.periodStart).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-gray-700 font-bold">Bill No: {invoice.billNumber}</span>
            {invoice.isSettled ? (
              <span className="px-2.5 py-0.5 rounded-full font-bold bg-green-200 text-green-900">PAID</span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full font-bold bg-amber-200 text-amber-900">PAYMENT DUE</span>
            )}
          </div>
        </div>

        {/* Member & Flat Details */}
        <div className="grid grid-cols-2 gap-4 text-xs mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div>
            <p className="text-gray-500">Member / Flat Owner:</p>
            <p className="text-base font-bold text-gray-900">{unit.ownerName}</p>
            <p className="text-gray-600 mt-0.5">Mobile: {unit.ownerPhone}</p>
            <p className="text-gray-600">
              Occupancy: <strong className="capitalize">{unit.occupancy.replace("_", " ")}</strong>
            </p>
          </div>
          <div className="text-right sm:text-right">
            <p className="text-gray-500">Flat / Unit Number:</p>
            <p className="text-lg font-black text-indigo-900">
              Wing {unit.wing} — Flat {unit.flatNumber}
            </p>
            <p className="text-gray-600 mt-0.5">
              Carpet Area: <strong>{unit.carpetAreaSqft} sq.ft</strong>
            </p>
            <p className="text-gray-600">
              Construction Cost: <strong>{fmt(unit.constructionCost)}</strong>
            </p>
          </div>
        </div>

        {/* Important Dates */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs mb-5 py-2 px-3 bg-gray-100 rounded border border-gray-300">
          <div>
            <span className="text-gray-500 block">Bill Date</span>
            <span className="font-bold text-gray-800">{new Date(invoice.billingDate).toLocaleDateString("en-IN")}</span>
          </div>
          <div>
            <span className="text-gray-500 block">Billing Period</span>
            <span className="font-bold text-gray-800">
              01-Oct-2026 to 31-Oct-2026
            </span>
          </div>
          <div>
            <span className="text-red-700 block font-semibold">Payment Due Date</span>
            <span className="font-black text-red-700 text-sm">{new Date(invoice.dueDate).toLocaleDateString("en-IN")}</span>
          </div>
        </div>

        {/* Itemized Table of Particulars (Model Bye-law 67 & 68) */}
        <table className="w-full text-xs border border-gray-300 mb-4">
          <thead className="bg-gray-200 text-gray-800 font-bold border-b border-gray-300">
            <tr>
              <th className="py-2 px-3 text-center w-12 border-r border-gray-300">Sr.</th>
              <th className="py-2 px-4 text-left border-r border-gray-300">Particulars / Statutory Head</th>
              <th className="py-2 px-4 text-left border-r border-gray-300">Calculation Basis (Model Bye-laws)</th>
              <th className="py-2 px-4 text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoice.lineItems.map((li, idx) => (
              <tr key={li.id} className="hover:bg-gray-50">
                <td className="py-2 px-3 text-center border-r border-gray-200">{idx + 1}</td>
                <td className="py-2 px-4 font-semibold text-gray-900 border-r border-gray-200">
                  {li.headName}
                </td>
                <td className="py-2 px-4 text-gray-500 border-r border-gray-200">
                  {li.headName === "Sinking Fund"
                    ? "0.25% p.a. of flat construction cost"
                    : li.headName === "Repair & Maintenance Fund"
                    ? "0.75% p.a. of flat construction cost"
                    : li.headName === "Property Tax"
                    ? "As levied / area proportional"
                    : li.headName === "Water Charges"
                    ? `Per tap (${unit.tapCount} inlet/tap)`
                    : li.headName.includes("NOC")
                    ? "10% of Service Charges (Tenanted)"
                    : li.headName.includes("Parking")
                    ? "Allotted slot charges"
                    : "Shared equally by members"}
                </td>
                <td className="py-2 px-4 text-right font-medium tabular-nums">
                  {li.amount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-gray-400 bg-gray-50 font-bold">
            <tr>
              <td colSpan={3} className="py-2 px-4 text-right border-r border-gray-300">
                Current Month Charges (A):
              </td>
              <td className="py-2 px-4 text-right tabular-nums text-gray-900">
                {fmt(invoice.principalAmount)}
              </td>
            </tr>
            {invoice.arrearsAmount > 0 && (
              <tr>
                <td colSpan={3} className="py-1.5 px-4 text-right border-r border-gray-300 text-red-700">
                  Previous Arrears Balance (B):
                </td>
                <td className="py-1.5 px-4 text-right tabular-nums text-red-700">
                  {fmt(invoice.arrearsAmount)}
                </td>
              </tr>
            )}
            {invoice.interestAmount > 0 && (
              <tr>
                <td colSpan={3} className="py-1.5 px-4 text-right border-r border-gray-300 text-red-700">
                  Simple Interest @ 21% p.a. on Arrears (C):
                </td>
                <td className="py-1.5 px-4 text-right tabular-nums text-red-700">
                  {fmt(invoice.interestAmount)}
                </td>
              </tr>
            )}
            <tr className="bg-indigo-100 text-indigo-950 text-sm">
              <td colSpan={3} className="py-3 px-4 text-right border-r border-indigo-200 font-black">
                TOTAL NET PAYABLE:
              </td>
              <td className="py-3 px-4 text-right tabular-nums font-black text-indigo-950">
                {fmt(invoice.totalPayable)}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Bottom Section: Payment Modes + UPI QR + Signatures */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-3 border-t-2 border-gray-200">
          {/* Dynamic UPI QR Code */}
          <div className="text-center sm:text-left flex flex-col items-center sm:items-start">
            <span className="text-[11px] font-bold uppercase text-indigo-900 tracking-wider">
              📲 Scan &amp; Pay Instantly
            </span>
            {upiQr ? (
              <img
                src={upiQr}
                alt="UPI QR Code"
                className="w-36 h-36 border border-gray-300 p-1 rounded mt-1 bg-white shadow-sm"
              />
            ) : (
              <div className="w-36 h-36 bg-gray-100 border flex items-center justify-center text-xs">
                QR Code
              </div>
            )}
            <span className="text-[10px] text-gray-500 mt-1 font-mono">
              UPI ID: shreeganeshchs@sbi
            </span>
          </div>

          {/* Bank Transfer Details */}
          <div className="text-xs text-gray-700">
            <span className="text-[11px] font-bold uppercase text-indigo-900 tracking-wider block mb-1">
              🏦 Bank Transfer Details
            </span>
            <p><strong>Bank:</strong> Mumbai District Central Co-op Bank Ltd.</p>
            <p><strong>Branch:</strong> Vashi Sector 17, Navi Mumbai</p>
            <p><strong>A/C No:</strong> 01421000049281</p>
            <p><strong>IFSC:</strong> MDCC0000014</p>
            <p className="mt-2 text-[10px] text-gray-500 italic">
              Please mention Flat No. &amp; Bill No. in remarks.
            </p>
          </div>

          {/* Official Signatures */}
          <div className="flex flex-col justify-between text-right text-xs">
            <div className="text-[10px] text-gray-500 italic">
              * Under Bye-law 72, late payment interest @ 21% p.a. simple interest will apply if paid after due date.
            </div>
            <div className="mt-12 pt-3 border-t border-gray-400 flex justify-between text-center text-[11px] font-bold text-gray-800">
              <span>Hon. Treasurer</span>
              <span>Hon. Secretary</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
