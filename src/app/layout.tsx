import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "Infinite — Simplified Co-operative Accounting",
  description: "B2B SaaS & Managed Accounting Platform for Mumbai Co-operative Housing Societies. Made by Narendra Panchal.",
  authors: [{ name: "Narendra Panchal" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen bg-gray-50 flex-col">
        <AuthProvider>
          <div className="flex flex-1">
            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col min-h-screen print:ml-0">
              <main className="flex-1 p-8 print:p-0">{children}</main>
              <footer className="py-4 text-center text-xs text-gray-500 border-t border-gray-200/80 bg-white/50 print:hidden">
                <p>
                  <strong>Infinite</strong> — Simplified Co-operative Accounting · Made by{" "}
                  <span className="font-semibold text-indigo-700">Narendra Panchal</span>
                </p>
              </footer>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
