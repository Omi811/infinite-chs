"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg text-sm shadow transition-colors print:hidden"
    >
      🖨️ Print / Save as PDF
    </button>
  );
}
