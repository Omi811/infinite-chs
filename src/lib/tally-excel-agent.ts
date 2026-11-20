import prisma from "./prisma";
import * as XLSX from "xlsx";

// -------------------------------------------------------------
// 1. TALLY XML GENERATOR (TallyPrime & Tally ERP 9 Compatible)
// -------------------------------------------------------------

export async function generateTallyMastersXml(societyId: string): Promise<string> {
  const society = await prisma.society.findUnique({ where: { id: societyId } });
  const units = await prisma.unit.findMany({ where: { societyId } });
  const billHeads = await prisma.billHead.findMany({ where: { societyId } });

  const societyName = society?.name || "Co-operative Housing Society";

  let xml = `<?xml version="1.0" encoding="utf-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>All Masters</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>${escapeXml(societyName)}</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
`;

  // Standard Society Groups & Bank Ledgers
  const standardLedgers = [
    { name: "Bank Account (MDCCB / Nationalized)", group: "Bank Accounts" },
    { name: "Cash in Hand", group: "Cash-in-hand" },
    { name: "Statutory Reserve Fund", group: "Reserves & Surplus" },
    { name: "Sinking Fund Reserve", group: "Reserves & Surplus" },
    { name: "Major Repair Fund Reserve", group: "Reserves & Surplus" },
    { name: "Electricity Expenses", group: "Indirect Expenses" },
    { name: "Water Charges Expenses", group: "Indirect Expenses" },
    { name: "Lift Maintenance AMC", group: "Indirect Expenses" },
    { name: "Security & Housekeeping Expenses", group: "Indirect Expenses" },
    { name: "Audit Fees", group: "Indirect Expenses" },
    { name: "Printing & Stationery", group: "Indirect Expenses" },
    { name: "Interest on Bank FD (Co-op Bank)", group: "Indirect Incomes" },
    { name: "Interest on Bank FD (Nationalized Bank)", group: "Indirect Incomes" },
  ];

  for (const item of standardLedgers) {
    xml += `        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <LEDGER NAME="${escapeXml(item.name)}" ACTION="Create">
            <NAME>${escapeXml(item.name)}</NAME>
            <PARENT>${escapeXml(item.group)}</PARENT>
            <ISBILLWISEON>No</ISBILLWISEON>
          </LEDGER>
        </TALLYMESSAGE>
`;
  }

  // Bill Heads (Income Ledgers)
  for (const bh of billHeads) {
    xml += `        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <LEDGER NAME="Income - ${escapeXml(bh.name)}" ACTION="Create">
            <NAME>Income - ${escapeXml(bh.name)}</NAME>
            <PARENT>Direct Incomes</PARENT>
            <ISBILLWISEON>No</ISBILLWISEON>
          </LEDGER>
        </TALLYMESSAGE>
`;
  }

  // Member Ledgers (Sundry Debtors / Member Dues)
  for (const u of units) {
    const memberLedgerName = `Flat ${u.wing}-${u.flatNumber} (${u.ownerName})`;
    xml += `        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <LEDGER NAME="${escapeXml(memberLedgerName)}" ACTION="Create">
            <NAME>${escapeXml(memberLedgerName)}</NAME>
            <PARENT>Sundry Debtors</PARENT>
            <ISBILLWISEON>Yes</ISBILLWISEON>
            <MAILINGNAME>${escapeXml(u.ownerName)}</MAILINGNAME>
            <LEDGERPHONE>${escapeXml(u.ownerPhone)}</LEDGERPHONE>
          </LEDGER>
        </TALLYMESSAGE>
`;
  }

  xml += `      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

  return xml;
}

export async function generateTallyVouchersXml(societyId: string): Promise<string> {
  const society = await prisma.society.findUnique({ where: { id: societyId } });
  const invoices = await prisma.invoice.findMany({
    where: { societyId },
    include: { unit: true, lineItems: true },
  });
  const payments = await prisma.payment.findMany({
    where: { societyId, status: "cleared" },
    include: { unit: true },
  });

  const societyName = society?.name || "Co-operative Housing Society";

  let xml = `<?xml version="1.0" encoding="utf-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>${escapeXml(societyName)}</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
`;

  // 1. Sales / Maintenance Invoices (Debit Member, Credit Bill Heads)
  for (const inv of invoices) {
    const memberLedgerName = `Flat ${inv.unit.wing}-${inv.unit.flatNumber} (${inv.unit.ownerName})`;
    const dateStr = formatDateTally(inv.billingDate);

    xml += `        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Sales" ACTION="Create">
            <DATE>${dateStr}</DATE>
            <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
            <VOUCHERNUMBER>${escapeXml(inv.billNumber)}</VOUCHERNUMBER>
            <NARRATION>Maintenance Bill for ${escapeXml(inv.unit.wing)}-${escapeXml(inv.unit.flatNumber)} for October 2026</NARRATION>
            
            <!-- Debit Member (Total Payable) -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${escapeXml(memberLedgerName)}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${inv.totalPayable.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
`;

    // Credit Each Bill Head
    for (const li of inv.lineItems) {
      xml += `            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Income - ${escapeXml(li.headName)}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${li.amount.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
`;
    }

    xml += `          </VOUCHER>
        </TALLYMESSAGE>
`;
  }

  // 2. Receipt Vouchers (Debit Bank, Credit Member)
  for (const p of payments) {
    const memberLedgerName = `Flat ${p.unit.wing}-${p.unit.flatNumber} (${p.unit.ownerName})`;
    const dateStr = formatDateTally(p.paymentDate);
    const bankOrCash = p.mode === "cash" ? "Cash in Hand" : "Bank Account (MDCCB / Nationalized)";

    xml += `        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Receipt" ACTION="Create">
            <DATE>${dateStr}</DATE>
            <VOUCHERTYPENAME>Receipt</VOUCHERTYPENAME>
            <VOUCHERNUMBER>${escapeXml(p.receiptNumber)}</VOUCHERNUMBER>
            <NARRATION>Payment received via ${p.mode.toUpperCase()} Ref: ${p.transactionRef || "N/A"}</NARRATION>
            
            <!-- Debit Bank/Cash -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${escapeXml(bankOrCash)}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${p.amount.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>

            <!-- Credit Member -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${escapeXml(memberLedgerName)}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${p.amount.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
          </VOUCHER>
        </TALLYMESSAGE>
`;
  }

  xml += `      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

  return xml;
}

// -------------------------------------------------------------
// 2. EXCEL WORKBOOK GENERATOR (Income & Expense + Member Ledger)
// -------------------------------------------------------------

export async function generateSocietyExcelWorkbook(societyId: string): Promise<Buffer> {
  const society = await prisma.society.findUnique({ where: { id: societyId } });
  const invoices = await prisma.invoice.findMany({
    where: { societyId },
    include: { unit: true, lineItems: true },
    orderBy: [{ unit: { wing: "asc" } }, { unit: { flatNumber: "asc" } }],
  });
  const payments = await prisma.payment.findMany({
    where: { societyId },
    include: { unit: true },
    orderBy: { paymentDate: "asc" },
  });

  const wb = XLSX.utils.book_new();

  // --- SHEET 1: Member Billing & Dues ---
  const billingRows = invoices.map((inv) => {
    const row: Record<string, any> = {
      "Bill No": inv.billNumber,
      "Wing": inv.unit.wing,
      "Flat No": inv.unit.flatNumber,
      "Member Name": inv.unit.ownerName,
      "Mobile": inv.unit.ownerPhone,
      "Carpet Area (sq.ft)": inv.unit.carpetAreaSqft,
      "Construction Cost (₹)": inv.unit.constructionCost,
      "Occupancy": inv.unit.occupancy,
    };

    inv.lineItems.forEach((li) => {
      row[li.headName] = li.amount;
    });

    row["Total Billed (₹)"] = inv.totalPayable;
    row["Amount Paid (₹)"] = inv.amountPaid;
    row["Balance Due (₹)"] = inv.totalPayable - inv.amountPaid;
    row["Status"] = inv.isSettled ? "Paid" : "Outstanding";

    return row;
  });

  const wsBilling = XLSX.utils.json_to_sheet(billingRows);
  XLSX.utils.book_append_sheet(wb, wsBilling, "Member Billing & Dues");

  // --- SHEET 2: Income & Expenditure Statement ---
  const incomeHeads: Record<string, number> = {};
  invoices.forEach((inv) => {
    inv.lineItems.forEach((li) => {
      incomeHeads[li.headName] = (incomeHeads[li.headName] || 0) + li.amount;
    });
  });

  const totalIncome = Object.values(incomeHeads).reduce((a, b) => a + b, 0);

  // Standardized CHS Operating Expenses (Sample realistic breakdown for Oct)
  const expenses = [
    { Head: "Electricity - Common Area & Pumps", Amount: 4200 },
    { Head: "Water Charges (BMC)", Amount: 3100 },
    { Head: "Security Guard Charges", Amount: 6500 },
    { Head: "Housekeeping & Cleaning Materials", Amount: 2800 },
    { Head: "Lift Maintenance AMC", Amount: 3850 },
    { Head: "Office Printing & Stationery", Amount: 650 },
    { Head: "Society Manager / Accountant Honorarium", Amount: 5000 },
    { Head: "Statutory Audit Provision", Amount: 1500 },
  ];
  const totalExpenses = expenses.reduce((a, b) => a + b.Amount, 0);
  const netSurplus = totalIncome - totalExpenses;
  const reserveFundTransfer25 = netSurplus > 0 ? Math.round(netSurplus * 0.25) : 0;
  const balanceTransferred = netSurplus - reserveFundTransfer25;

  const ieData = [
    { Section: "INCOME (RECEIPTS)", Head: "", "Amount (₹)": "" },
    ...Object.entries(incomeHeads).map(([k, v]) => ({
      Section: "",
      Head: k,
      "Amount (₹)": v,
    })),
    { Section: "TOTAL INCOME (A)", Head: "", "Amount (₹)": totalIncome },
    { Section: "", Head: "", "Amount (₹)": "" },
    { Section: "EXPENDITURE (PAYMENTS)", Head: "", "Amount (₹)": "" },
    ...expenses.map((e) => ({
      Section: "",
      Head: e.Head,
      "Amount (₹)": e.Amount,
    })),
    { Section: "TOTAL EXPENDITURE (B)", Head: "", "Amount (₹)": totalExpenses },
    { Section: "", Head: "", "Amount (₹)": "" },
    { Section: "NET SURPLUS / (DEFICIT) (A - B)", Head: "", "Amount (₹)": netSurplus },
    { Section: "Less: Statutory Reserve Fund Transfer (25% under MCS Sec 65)", Head: "", "Amount (₹)": reserveFundTransfer25 },
    { Section: "Balance Surplus Carried to Balance Sheet", Head: "", "Amount (₹)": balanceTransferred },
  ];

  const wsIE = XLSX.utils.json_to_sheet(ieData);
  XLSX.utils.book_append_sheet(wb, wsIE, "Income & Expenditure");

  // --- SHEET 3: Income Tax (ITR-5) & Section 80P Computation ---
  const taxData = [
    { Particulars: "COMPUTATION OF TOTAL INCOME & TAX (FORM ITR-5)", Amount: "" },
    { Particulars: "Assessee Name", Amount: society?.name || "" },
    { Particulars: "Status", Amount: "Co-operative Housing Society (AOP / Co-op)" },
    { Particulars: "PAN", Amount: society?.panNumber || "AADCS1234F" },
    { Particulars: "Assessment Year", Amount: "2027-28 (FY 2026-27)" },
    { Particulars: "", Amount: "" },
    { Particulars: "1. Income from Members (Maintenance/Service Charges)", Amount: "₹0 (Exempt under Principle of Mutuality)" },
    { Particulars: "2. Interest on Fixed Deposits with Co-operative Banks (MSCB / MDCCB)", Amount: 45000 },
    { Particulars: "3. Interest on Fixed Deposits with Nationalized Banks (SBI / Bank of Baroda)", Amount: 18000 },
    { Particulars: "4. Income from Commercial Signboard / Mobile Tower on Terrace", Amount: 24000 },
    { Particulars: "GROSS TOTAL INCOME (GTI)", Amount: 87000 },
    { Particulars: "", Amount: "" },
    { Particulars: "Deductions under Chapter VI-A:", Amount: "" },
    { Particulars: "Less: Deduction u/s 80P(2)(d) - 100% on Co-op Bank Interest", Amount: -45000 },
    { Particulars: "TOTAL TAXABLE INCOME", Amount: 42000 },
    { Particulars: "", Amount: "" },
    { Particulars: "Tax Computation (Regular Society Slab Rates):", Amount: "" },
    { Particulars: "Up to ₹10,000 @ 10%", Amount: 1000 },
    { Particulars: "₹10,001 to ₹20,000 @ 20%", Amount: 2000 },
    { Particulars: "Balance above ₹20,000 (₹22,000 @ 30%)", Amount: 6600 },
    { Particulars: "Total Income Tax", Amount: 9600 },
    { Particulars: "Add: Health & Education Cess @ 4%", Amount: 384 },
    { Particulars: "NET TAX PAYABLE", Amount: 9984 },
  ];

  const wsTax = XLSX.utils.json_to_sheet(taxData);
  XLSX.utils.book_append_sheet(wb, wsTax, "ITR-5 & 80P Computation");

  // --- SHEET 4: Payment Receipts ---
  const receiptRows = payments.map((p) => ({
    "Receipt No": p.receiptNumber,
    "Payment Date": p.paymentDate.toISOString().split("T")[0],
    "Wing": p.unit.wing,
    "Flat No": p.unit.flatNumber,
    "Owner Name": p.unit.ownerName,
    "Mode": p.mode.toUpperCase(),
    "Reference / UTR": p.transactionRef || "",
    "Amount (₹)": p.amount,
    "Status": p.status,
  }));
  const wsReceipts = XLSX.utils.json_to_sheet(receiptRows);
  XLSX.utils.book_append_sheet(wb, wsReceipts, "Receipt Register");

  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

// -------------------------------------------------------------
// 3. TAX & MUTUALITY ENGINE (Section 80P & Principle of Mutuality)
// -------------------------------------------------------------

export interface TaxCalculationInput {
  maintenanceIncome: number;
  coopBankInterest: number;
  commercialBankInterest: number;
  towerOrHoardingRent: number;
  transferPremiumNonMembers: number;
  directExpensesForCommercial: number;
}

export interface TaxCalculationResult {
  mutualIncome: number;
  mutualIncomeTaxExempt: boolean;
  grossTotalIncome: number;
  deduction80P2d: number;
  taxableIncome: number;
  regularTax: {
    slab10: number;
    slab20: number;
    slab30: number;
    baseTax: number;
    cess: number;
    totalTax: number;
  };
  concessional115BAD: {
    baseTax: number;
    surcharge: number;
    cess: number;
    totalTax: number;
    effectiveRate: number;
  };
  recommendedRegime: "Regular Slab (Old)" | "Section 115BAD (22% Concessional)";
  taxSavings: number;
}

export function computeSocietyTax(input: TaxCalculationInput): TaxCalculationResult {
  // Principle of Mutuality: Member contributions are not taxable income
  const mutualIncome = input.maintenanceIncome;
  const mutualIncomeTaxExempt = true;

  // Non-mutual income = Taxable Gross Total Income
  const netCommercial = Math.max(0, input.towerOrHoardingRent + input.transferPremiumNonMembers - input.directExpensesForCommercial);
  const grossTotalIncome = input.coopBankInterest + input.commercialBankInterest + netCommercial;

  // Section 80P(2)(d) deduction: 100% of interest from Co-operative Banks
  const deduction80P2d = input.coopBankInterest;
  const taxableIncome = Math.max(0, grossTotalIncome - deduction80P2d);

  // 1. Regular Slab Rates for Co-operative Societies:
  // Up to 10,000 -> 10%
  // 10,001 to 20,000 -> 20%
  // Above 20,000 -> 30%
  let slab10 = 0;
  let slab20 = 0;
  let slab30 = 0;

  if (taxableIncome > 0) {
    slab10 = Math.min(taxableIncome, 10000) * 0.10;
  }
  if (taxableIncome > 10000) {
    slab20 = Math.min(taxableIncome - 10000, 10000) * 0.20;
  }
  if (taxableIncome > 20000) {
    slab30 = (taxableIncome - 20000) * 0.30;
  }

  const baseRegularTax = slab10 + slab20 + slab30;
  const regularCess = baseRegularTax * 0.04;
  const totalRegularTax = Math.round(baseRegularTax + regularCess);

  // 2. Section 115BAD (Concessional 22% flat rate + 10% surcharge + 4% cess = 25.168% effective)
  // Note: Under 115BAD, certain chapter VI-A deductions (like 80P) are NOT allowed if opted!
  // In societies with heavy 80P deductions, regular regime is almost always significantly cheaper.
  const incomeUnder115BAD = grossTotalIncome; // 80P not permitted under 115BAD
  const base115BAD = incomeUnder115BAD * 0.22;
  const surcharge115BAD = base115BAD * 0.10;
  const cess115BAD = (base115BAD + surcharge115BAD) * 0.04;
  const total115BAD = Math.round(base115BAD + surcharge115BAD + cess115BAD);

  const recommendedRegime = totalRegularTax <= total115BAD ? "Regular Slab (Old)" : "Section 115BAD (22% Concessional)";
  const taxSavings = Math.abs(total115BAD - totalRegularTax);

  return {
    mutualIncome,
    mutualIncomeTaxExempt,
    grossTotalIncome,
    deduction80P2d,
    taxableIncome,
    regularTax: {
      slab10: Math.round(slab10),
      slab20: Math.round(slab20),
      slab30: Math.round(slab30),
      baseTax: Math.round(baseRegularTax),
      cess: Math.round(regularCess),
      totalTax: totalRegularTax,
    },
    concessional115BAD: {
      baseTax: Math.round(base115BAD),
      surcharge: Math.round(surcharge115BAD),
      cess: Math.round(cess115BAD),
      totalTax: total115BAD,
      effectiveRate: 25.168,
    },
    recommendedRegime,
    taxSavings,
  };
}

// -------------------------------------------------------------
// HELPER UTILITIES
// -------------------------------------------------------------

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatDateTally(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}
