"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface DocumentFile {
  id: string;
  name: string;
  category: "Flat Document" | "Society Compliance" | "Audit & Bank" | "Vendor Contract";
  flatReference?: string;
  fileSize: string;
  uploadedDate: string;
  fileType: "pdf" | "xlsx" | "image";
}

export default function DocumentVaultClient({
  initialFiles = [],
}: {
  initialFiles?: DocumentFile[];
}) {
  const router = useRouter();
  const [files, setFiles] = useState<DocumentFile[]>(initialFiles);
  const [filter, setFilter] = useState<string>("All");
  const [uploadCategory, setUploadCategory] = useState<DocumentFile["category"]>("Flat Document");
  const [flatRef, setFlatRef] = useState("");
  const [customName, setCustomName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const extension = file.name.split(".").pop()?.toLowerCase();
    const finalName = customName ? `${customName}.${extension}` : file.name;
    const fileSizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    const fType = extension === "xlsx" || extension === "xls" ? "xlsx" : extension === "png" || extension === "jpg" ? "image" : "pdf";

    setLoading(true);
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: finalName,
          category: uploadCategory,
          flatReference: uploadCategory === "Flat Document" ? (flatRef || "General Unit") : null,
          fileSize: fileSizeStr,
          fileType: fType,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const savedDoc: DocumentFile = {
          id: data.document.id,
          name: data.document.name,
          category: data.document.category,
          flatReference: data.document.flatReference || undefined,
          fileSize: data.document.fileSize,
          uploadedDate: new Date(data.document.createdAt).toISOString().split("T")[0],
          fileType: data.document.fileType,
        };

        setFiles([savedDoc, ...files]);
        setCustomName("");
        setFlatRef("");
        router.refresh();
      } else {
        alert("Failed to save file metadata to database.");
      }
    } catch {
      alert("Network error uploading document.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = files.filter((f) => filter === "All" || f.category === filter);

  return (
    <div className="space-y-6">
      {/* Upload Handler Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-900 mb-4 flex items-center gap-2">
          <span>📁</span> Adder &amp; File Handler (Upload Documents &amp; Flat Archives)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Document Category</label>
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value as any)}
              className="w-full border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Flat Document">Flat Document (Index II / Share Cert / Nominee)</option>
              <option value="Society Compliance">Society Compliance (Fire NOC / BMC Tax)</option>
              <option value="Audit & Bank">Audit &amp; Bank Statements</option>
              <option value="Vendor Contract">Vendor Contract &amp; AMC</option>
            </select>
          </div>

          {uploadCategory === "Flat Document" && (
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Flat / Owner Reference</label>
              <input
                type="text"
                placeholder="e.g. A-101 (Rajesh Sharma)"
                value={flatRef}
                onChange={(e) => setFlatRef(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Select File to Upload</label>
            <input
              type="file"
              disabled={loading}
              onChange={handleUpload}
              className="w-full border rounded-lg p-1.5 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50"
            />
            {loading && <p className="text-[10px] text-indigo-600 mt-1">Saving to database...</p>}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {["All", "Flat Document", "Society Compliance", "Audit & Bank", "Vendor Contract"].map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === c ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-500">{filtered.length} files stored in database</span>
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((file) => (
          <div
            key={file.id}
            className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-3"
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">
                {file.fileType === "pdf" ? "📕" : file.fileType === "xlsx" ? "📊" : "🖼️"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs text-gray-900 truncate" title={file.name}>
                  {file.name}
                </p>
                <span className="inline-block px-2 py-0.5 mt-1 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                  {file.category}
                </span>
                {file.flatReference && (
                  <p className="text-[11px] text-gray-500 mt-1 font-medium">
                    Unit: {file.flatReference}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t text-[11px] text-gray-400">
              <span>{file.fileSize} · {file.uploadedDate}</span>
              <button
                onClick={() => alert(`Downloading ${file.name} from secure vault...`)}
                className="text-indigo-600 hover:text-indigo-800 font-bold"
              >
                Download ↓
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
