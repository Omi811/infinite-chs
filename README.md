# ♾️ Infinite — Simplified Co-operative Accounting

> **Author**: Made by **Narendra Panchal**  
> **Platform**: B2B SaaS & Managed Accounting System for Maharashtra Co-operative Housing Societies (CHS)

---

## 📌 Overview
**Infinite** is a full-stack housing society management and accounting platform engineered specifically around the **Maharashtra Co-operative Societies (MCS) Act, 1960**, **MCS Rules, 1961**, and **Model Bye-laws of Co-operative Housing Societies (Bye-laws 67 & 68)**.

It eliminates manual book entry, automates statutory maintenance billing with dynamic UPI QR codes, enables 1-click WhatsApp bill dispatching, generates legal Form 'I' and 'J' registers, tracks vendor TDS (Sections 194C / 194J), and provides direct 1-click export to **TallyPrime XML** (zero manual typing in Tally).

---

## 🚀 Key Features

* **📊 Executive Dashboard (`/`)**: Financial health snapshot, collection rates, active defaulters, payment mode breakdowns.
* **🏠 Members & Flats Directory (`/members`)**: Flat directory by Wing, built-up/carpet area, flat construction cost, occupancy status (Self/Tenanted/Vacant), share certificate allocations, and Form 14 Nominees.
* **🧾 Bye-law 67 & 68 Billing (`/billing`)**:
  * Sinking Fund (0.25% p.a. of construction cost)
  * Repair & Maintenance Fund (0.75% p.a. of construction cost)
  * Service Charges & Municipal Property Taxes
  * BMC Water Charges & Common Electricity
  * Non-Occupancy Charges (NOC capped at 10% of service charges)
  * **Dynamic UPI QR Code**: Built-in `upi://pay` generation for instant scan & pay via GPay / PhonePe / Paytm.
  * **Printable A4 PDF Bill**: Formatted for print or PDF export.
* **💬 WhatsApp 1-Click Dispatcher (`/whatsapp`)**: Instant deep links (`wa.me`) with 3 pre-configured templates (New Bill, Friendly Due Reminder, and Bye-law 72 21% Interest Overdue Notice).
* **💰 Payments & Receipts Register (`/payments`)**: Record NEFT/Cheque/UPI receipts, auto-reconcile invoices, and print receipts.
* **🏛️ Statutory Form 'I' & 'J' Registers (`/statutory-registers`)**:
  * **Form 'I' (Rule 32)**: Official member register with share certificate serials, distinctive share numbers, entrance fee ₹100, and Form 14 Nominees.
  * **Form 'J' (Rule 33)**: Official list of members with voting eligibility for AGMs.
* **💸 Vendor Expenses & TDS Tracker (`/expenses`)**: Record contractor invoices with automatic TDS deductions under **Section 194C** (1% / 2%) and **Section 194J** (10%), with printable payment vouchers.
* **🗄️ Document Vault & File Handler (`/documents`)**: Archive flat Index II sales deeds, fire safety NOCs, lift licenses, and audit statements.
* **📑 Google Workspace & Working Canvas (`/workspace`)**: Embedded Google Sheets, direct launchers (`sheets.new`, `docs.new`, Google Drive), and auto-saving scratchpad.
* **🤖 Excel, Tally & Section 80P Tax Copilot (`/tally-agent`)**:
  * **Tally Masters XML**: Imports all member ledgers, expense heads, and bank accounts directly into TallyPrime.
  * **Tally Vouchers XML**: Imports all sales invoices and receipt vouchers in seconds.
  * **Section 80P(2)(d) Optimizer**: Computes 100% tax deduction on co-op bank FD interest vs commercial bank interest.
  * **Multi-Sheet Excel Workbook**: Downloadable `.xlsx` covering all financial statements.
* **⚙️ Society Settings & Setup (`/settings`)**: Customize building name, registration number, PAN, GSTIN, or reset to a clean blank slate.
* **🔑 Dad's Easy Login (`/login`)**: Google 1-Click access and 4-digit quick PIN bypass (`1234`).

---

## 🛠️ Tech Stack
* **Framework**: Next.js 14 (App Router)
* **Language**: TypeScript
* **Database**: SQLite (via Prisma ORM) — easily switches to PostgreSQL (Supabase / Neon)
* **Styling**: Tailwind CSS
* **Export Engines**: `xlsx` (Excel), `qrcode` (UPI QR code), Custom Tally XML Generator

---

## 💻 Local Setup & Development

```bash
# 1. Clone the repository
git clone https://github.com/Omi811/infinite-chs.git
cd infinite-chs

# 2. Install dependencies
npm install

# 3. Setup database
npx prisma db push
npx tsx prisma/seed.ts

# 4. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Credits & License
Developed with ❤️ by **Narendra Panchal**.  
Licensed under the MIT License.
