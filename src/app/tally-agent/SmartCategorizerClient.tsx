"use client";

import { useState } from "react";

interface CategorizedItem {
  id: string;
  rawText: string;
  amount: number;
  type: "Dr" | "Cr";
  suggestedLedger: string;
  group: string;
  statutoryHead: string;
  confidence: number;
}

const SAMPLE_ENTRIES = [
  "UPI/239482/Adani Electricity Mumbai Ltd/Pump & Compound - INR 4,250.00 DR",
  "NEFT/CITI0021/Kavita Nair Maint Oct26 - INR 8,175.00 CR",
  "CHQ CLG/992812/OTIS ELEVATOR CO INDIA LTD AMC Q3 - INR 11,550.00 DR",
  "UPI/492019/BMC WATER CHARGES WARD K WEST - INR 3,100.00 DR",
  "INT CLG/MDCCB VASHI BR FD INT 6.75PCT - INR 12,450.00 CR",
  "NEFT/Priya Desai Rent NOC Oct - INR 8,825.00 CR",
  "CHQ/491022/Nitin Joshi Security Services Sept26 - INR 18,000.00 DR",
];

export default function SmartCategorizerClient() {
  const [inputText, setInputText] = useState(SAMPLE_ENTRIES.join("\n"));
  const [results, setResults] = useState<CategorizedItem[]>([]);
  const [hasRun, setHasRun] = useState(false);

  const runClassifier = () => {
    const lines = inputText.split("\n").filter((l) => l.trim().length > 0);
    const parsed: CategorizedItem[] = lines.map((line, idx) => {
      const lower = line.toLowerCase();
      let type: "Dr" | "Cr" = lower.includes("cr") ? "Cr" : "Dr";
      let amount = 0;
      const amtMatch = line.match(/(?:INR|RS\.?|₹)?\s*([\d,]+(?:\.\d{2})?)/i);
      if (amtMatch) {
        amount = parseFloat(amtMatch[1].replace(/,/g, ""));
      }

      let ledger = "Suspense Account";
      let group = "Current Liabilities";
      let statutoryHead = "General";
      let confidence = 0.95;

      if (lower.includes("adani") || lower.includes("tata power") || lower.includes("best") || lower.includes("electric")) {
        ledger = "Electricity Expenses (Common)";
        group = "Indirect Expenses";
        statutoryHead = "Bye-law 68(iii) Electricity";
      } else if (lower.includes("bmc") || lower.includes("water")) {
        ledger = "Water Charges Expenses";
        group = "Indirect Expenses";
        statutoryHead = "Bye-law 68(ii) Water";
      } else if (lower.includes("otis") || lower.includes("schindler") || lower.includes("lift") || lower.includes("elevator")) {
        ledger = "Lift Maintenance AMC";
        group = "Indirect Expenses";
        statutoryHead = "Bye-law 68(v) Lift AMC";
      } else if (lower.includes("security") || lower.includes("housekeeping") || lower.includes("guard")) {
        ledger = "Security & Housekeeping Agency";
        group = "Indirect Expenses";
        statutoryHead = "Bye-law 68(vi) Service Charges";
      } else if (lower.includes("mdccb") || lower.includes("mscb") || lower.includes("fd int")) {
        ledger = "Interest on FD (Co-op Bank)";
        group = "Indirect Incomes";
        statutoryHead = "Section 80P(2)(d) Tax-Exempt";
        type = "Cr";
      } else if (lower.includes("kavita") || lower.includes("priya") || lower.includes("maint") || lower.includes("noc")) {
        ledger = "Member Maintenance Collections";
        group = "Direct Incomes";
        statutoryHead = "Principle of Mutuality (Exempt)";
        type = "Cr";
      } else {
        confidence = 0.70;
      }

      return {
        id: String(idx + 1),
        rawText: line,
        amount,
        type,
        suggestedLedger: ledger,
        group,
        statutoryHead,
        confidence,
      };
    });

    setResults(parsed);
    setHasRun(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            📑 Smart Excel &amp; Bank Statement Classifier
          </h2>
          <p className="text-sm text-gray-500">
            Paste raw bank narrations or Excel rows — the agent auto-maps them to Tally ledgers &amp; CHS statutory heads.
          </p>
        </div>
        <button
          onClick={runClassifier}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-colors text-sm"
        >
          ⚡ Auto-Categorize Entries
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
          Paste Bank Statement / Excel Rows:
        </label>
        <textarea
          rows={5}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 text-xs font-mono text-gray-800 focus:ring-2 focus:ring-indigo-500"
          placeholder="Paste transaction text here..."
        />
      </div>

      {hasRun && (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-gray-600 uppercase font-semibold">
              <tr>
                <th className="px-4 py-2.5 text-left">Original Bank Narration</th>
                <th className="px-3 py-2.5 text-right">Amount</th>
                <th className="px-2 py-2.5 text-center">Type</th>
                <th className="px-4 py-2.5 text-left">Tally Ledger Mapped</th>
                <th className="px-3 py-2.5 text-left">Tally Group</th>
                <th className="px-3 py-2.5 text-left">Statutory CHS Head</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {results.map((r) => (
                <tr key={r.id} className="hover:bg-indigo-50/40">
                  <td className="px-4 py-2 font-mono text-gray-700">{r.rawText}</td>
                  <td className="px-3 py-2 text-right font-bold tabular-nums">
                    ₹{r.amount.toLocaleString("en-IN")}
                  </td>
                  <td className="px-2 py-2 text-center">
                    <span
                      className={`px-1.5 py-0.5 rounded font-bold ${
                        r.type === "Cr" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {r.type}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-semibold text-indigo-900">{r.suggestedLedger}</td>
                  <td className="px-3 py-2 text-gray-600">{r.group}</td>
                  <td className="px-3 py-2">
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                      {r.statutoryHead}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
