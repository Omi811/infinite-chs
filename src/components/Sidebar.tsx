"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

const navItems = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/members", label: "Members & Flats", icon: "🏠" },
  { href: "/billing", label: "Billing & Invoices", icon: "🧾" },
  { href: "/whatsapp", label: "WhatsApp Dispatch", icon: "💬" },
  { href: "/payments", label: "Payments & Receipts", icon: "💰" },
  { href: "/statutory-registers", label: "I & J Registers", icon: "🏛️" },
  { href: "/expenses", label: "Expenses & TDS", icon: "💸" },
  { href: "/documents", label: "Document Vault", icon: "🗄️" },
  { href: "/workspace", label: "Google Workspace", icon: "📑" },
  { href: "/tally-agent", label: "Excel, Tally & Tax", icon: "🤖" },
  { href: "/reports", label: "Financial Reports", icon: "📋" },
  { href: "/settings", label: "Society Settings", icon: "⚙️" },
];

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-indigo-950 via-indigo-900 to-indigo-950 text-white flex flex-col shadow-2xl z-50 print:hidden">
      {/* Brand Header */}
      <div className="p-5 border-b border-indigo-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-indigo-400">♾️</span>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white font-sans">
                Infinite
              </h1>
            </div>
          </div>
          <Link
            href="/login"
            className="text-[10px] font-bold px-2 py-1 bg-indigo-800 hover:bg-indigo-700 rounded text-indigo-200 transition-colors"
          >
            {user.isLoggedIn ? "Account" : "Login"}
          </Link>
        </div>
        <p className="text-indigo-300 text-[11px] font-medium mt-1 leading-snug">
          Simplified Co-operative Accounting
        </p>

        {/* Dad Login Badge */}
        {user.isLoggedIn && (
          <div className="mt-3 bg-indigo-900/80 border border-indigo-700/60 rounded-lg p-2 flex items-center gap-2 text-xs">
            <span className="text-base">{user.avatar}</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-[11px] truncate">{user.name}</p>
              <p className="text-[10px] text-emerald-400 font-semibold truncate">Chief Accountant</p>
            </div>
          </div>
        )}
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-5 py-2 text-xs font-semibold text-indigo-200 hover:bg-indigo-800/60 hover:text-white transition-colors"
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Society Meta Footer */}
      <div className="p-4 border-t border-indigo-800/80 bg-indigo-950/60">
        <Link href="/settings" className="block text-[11px] text-indigo-300 hover:text-white group">
          <p className="font-bold text-white text-xs group-hover:text-indigo-300 transition-colors">
            Configure Society →
          </p>
          <div className="flex items-center justify-between mt-1 text-[10px]">
            <span className="text-emerald-400 font-bold">● Active Portal</span>
            <span className="text-indigo-300 font-mono">FY 2026-27</span>
          </div>
        </Link>
        <div className="mt-3 pt-2 border-t border-indigo-800/40 text-center">
          <p className="text-[10px] text-indigo-400 font-medium tracking-wide">
            Made by <span className="text-indigo-200 font-bold">Narendra Panchal</span>
          </p>
        </div>
      </div>
    </aside>
  );
}
