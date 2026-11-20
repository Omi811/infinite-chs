"use client";

import { useState, useEffect } from "react";

export default function WorkspaceClient() {
  const [activeTool, setActiveTool] = useState<"sheets" | "scratchpad" | "docs">("sheets");
  const [sheetUrl, setSheetUrl] = useState<string>("");
  const [inputUrl, setInputUrl] = useState<string>("");
  const [scratchContent, setScratchContent] = useState<string>("");

  useEffect(() => {
    const saved = localStorage.getItem("infinite_scratchpad");
    if (saved) {
      setScratchContent(saved);
    } else {
      setScratchContent(
`# 📝 Society Scratchpad & Working Canvas
Date: ${new Date().toLocaleDateString("en-IN")}

## Admin Tasks & Agenda:
- [ ] 
- [ ] 
- [ ] 

## Quick Calculations & Scratch:
`
      );
    }
  }, []);

  const handleScratchChange = (val: string) => {
    setScratchContent(val);
    localStorage.setItem("infinite_scratchpad", val);
  };

  const handleLoadSheet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl) return;
    let formatted = inputUrl;
    if (formatted.includes("docs.google.com/spreadsheets") && !formatted.includes("widget=true")) {
      formatted = formatted.replace(/\/edit.*$/, "/pubhtml?widget=true&headers=false");
    }
    setSheetUrl(formatted);
  };

  return (
    <div className="space-y-4">
      {/* Top Tool Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTool("sheets")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTool === "sheets"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            📊 Google Sheets
          </button>
          <button
            onClick={() => setActiveTool("scratchpad")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTool === "scratchpad"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            📝 Blank Scratchpad &amp; Notes
          </button>
          <button
            onClick={() => setActiveTool("docs")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTool === "docs"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            📄 Google Docs &amp; Drive
          </button>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://sheets.new"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1"
          >
            ➕ New Google Sheet ↗
          </a>
          <a
            href="https://docs.new"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 flex items-center gap-1"
          >
            ➕ New Google Doc ↗
          </a>
        </div>
      </div>

      {/* Tool 1: Google Sheets Workspace */}
      {activeTool === "sheets" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Google Sheets Embedded Workspace
              </h2>
              <p className="text-xs text-gray-500">
                Paste any shared Google Sheet link (e.g. Society Ledger or Excel sheet) to work directly inside Infinite.
              </p>
            </div>
          </div>

          {/* Paste URL Bar */}
          <form onSubmit={handleLoadSheet} className="flex gap-2 text-xs">
            <input
              type="url"
              placeholder="Paste Google Sheet URL here..."
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg transition-colors"
            >
              Embed Sheet
            </button>
          </form>

          {/* Frame Container */}
          <div className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden min-h-[580px] bg-gray-50 relative flex flex-col">
            {sheetUrl ? (
              <iframe
                src={sheetUrl}
                className="w-full flex-1 min-h-[600px] border-none"
                title="Embedded Google Sheet"
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                <span className="text-5xl">📊</span>
                <h3 className="text-base font-bold text-gray-800">
                  Ready to connect Google Sheets
                </h3>
                <p className="text-xs text-gray-500 max-w-md">
                  Paste a link to your Google Spreadsheet above, or open a fresh blank sheet:
                </p>
                <div className="flex gap-3 pt-2">
                  <a
                    href="https://sheets.new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm"
                  >
                    🚀 Open Blank Google Sheet
                  </a>
                  <a
                    href="https://drive.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold text-xs px-4 py-2.5 rounded-lg"
                  >
                    📁 Browse Google Drive
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tool 2: Scratchpad & Working Space */}
      {activeTool === "scratchpad" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                📝 Blank Working Scratchpad (Auto-Saved)
              </h2>
              <p className="text-xs text-gray-500">
                Jot down calculation scratch, pending calls, or committee meeting minutes. Stored automatically.
              </p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(scratchContent);
                alert("Copied to clipboard!");
              }}
              className="text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg"
            >
              📋 Copy Notes
            </button>
          </div>

          <textarea
            rows={22}
            value={scratchContent}
            onChange={(e) => handleScratchChange(e.target.value)}
            className="w-full border border-gray-300 rounded-xl p-4 font-mono text-xs text-gray-800 focus:ring-2 focus:ring-indigo-500 bg-amber-50/20 leading-relaxed"
            placeholder="Type your notes or rough calculations here..."
          />
        </div>
      )}

      {/* Tool 3: Google Docs & Drive */}
      {activeTool === "docs" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Google Docs &amp; Cloud Drive
              </h2>
              <p className="text-xs text-gray-500">
                Draft society circulars, AGM notices, and maintain society archives.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a
              href="https://docs.new"
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 transition-colors flex flex-col items-center text-center space-y-2"
            >
              <span className="text-4xl">📄</span>
              <p className="font-bold text-sm text-blue-950">Create Blank Doc</p>
              <p className="text-xs text-blue-800">For drafting society notices &amp; AGM minutes</p>
            </a>

            <a
              href="https://sheets.new"
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 transition-colors flex flex-col items-center text-center space-y-2"
            >
              <span className="text-4xl">📊</span>
              <p className="font-bold text-sm text-emerald-950">Create Blank Sheet</p>
              <p className="text-xs text-emerald-800">For rough ledgers &amp; quote comparisons</p>
            </a>

            <a
              href="https://drive.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/60 transition-colors flex flex-col items-center text-center space-y-2"
            >
              <span className="text-4xl">☁️</span>
              <p className="font-bold text-sm text-amber-950">Open Google Drive</p>
              <p className="text-xs text-amber-800">Store PDFs, audited balance sheets &amp; scans</p>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
