import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data in correct dependency order
  await prisma.document.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.invoiceLineItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.billHead.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.society.deleteMany();

  // 1. Create Society
  const society = await prisma.society.create({
    data: {
      name: "Shree Ganesh Co-operative Housing Society Ltd.",
      registrationNo: "MUM/HSG/TC/12345/2005",
      address: "Plot No. 42, Sector 7, Vashi, Navi Mumbai",
      city: "Mumbai",
      pincode: "400703",
      panNumber: "AADCS1234F",
      gstin: "27AADCS1234F1Z5",
      interestRatePa: 21.0,
    },
  });

  // 2. Create Bill Heads (Bye-laws 67 & 68 Compliant)
  const billHeads = await Promise.all([
    prisma.billHead.create({
      data: {
        societyId: society.id,
        name: "Sinking Fund",
        calculationMethod: "construction_cost_percent",
        rate: 0.25,
        isStatutory: true,
      },
    }),
    prisma.billHead.create({
      data: {
        societyId: society.id,
        name: "Repair & Maintenance Fund",
        calculationMethod: "construction_cost_percent",
        rate: 0.75,
        isStatutory: true,
      },
    }),
    prisma.billHead.create({
      data: {
        societyId: society.id,
        name: "Property Tax",
        calculationMethod: "per_sqft",
        rate: 8.5,
        isStatutory: true,
      },
    }),
    prisma.billHead.create({
      data: {
        societyId: society.id,
        name: "Water Charges",
        calculationMethod: "per_tap",
        rate: 250,
        isStatutory: true,
      },
    }),
    prisma.billHead.create({
      data: {
        societyId: society.id,
        name: "Common Electricity",
        calculationMethod: "fixed_equal",
        rate: 400,
        isStatutory: false,
      },
    }),
    prisma.billHead.create({
      data: {
        societyId: society.id,
        name: "Lift Maintenance (AMC)",
        calculationMethod: "fixed_equal",
        rate: 350,
        isStatutory: false,
      },
    }),
    prisma.billHead.create({
      data: {
        societyId: society.id,
        name: "Security & Housekeeping",
        calculationMethod: "fixed_equal",
        rate: 600,
        isStatutory: false,
      },
    }),
    prisma.billHead.create({
      data: {
        societyId: society.id,
        name: "Non-Occupancy Charges (NOC)",
        calculationMethod: "fixed_equal",
        rate: 0,
        isStatutory: true,
        appliesToTenantsOnly: true,
      },
    }),
    prisma.billHead.create({
      data: {
        societyId: society.id,
        name: "Education Fund",
        calculationMethod: "fixed_equal",
        rate: 10,
        isStatutory: true,
      },
    }),
    prisma.billHead.create({
      data: {
        societyId: society.id,
        name: "Parking Charges (4W)",
        calculationMethod: "parking_slot",
        rate: 500,
        isStatutory: false,
      },
    }),
  ]);

  // 3. Create Units (Flats) with Real Statutory MCS Act Details
  const flatsData = [
    { wing: "A", flatNumber: "101", ownerName: "Rajesh Sharma", ownerPhone: "9820012345", carpetAreaSqft: 650, constructionCost: 1800000, occupancy: "self_occupied", tapCount: 2, fourWheelerSlots: 1, nomineeName: "Sunita Sharma", nomineeRelation: "Wife" },
    { wing: "A", flatNumber: "102", ownerName: "Priya Desai", ownerPhone: "9820012346", carpetAreaSqft: 550, constructionCost: 1500000, occupancy: "tenanted", tapCount: 1, fourWheelerSlots: 0, nomineeName: "Rohit Desai", nomineeRelation: "Son" },
    { wing: "A", flatNumber: "201", ownerName: "Suresh Patil", ownerPhone: "9820012347", carpetAreaSqft: 650, constructionCost: 1800000, occupancy: "self_occupied", tapCount: 2, fourWheelerSlots: 1, nomineeName: "Anjali Patil", nomineeRelation: "Wife" },
    { wing: "A", flatNumber: "202", ownerName: "Meena Joshi", ownerPhone: "9820012348", carpetAreaSqft: 550, constructionCost: 1500000, occupancy: "self_occupied", tapCount: 1, fourWheelerSlots: 1, nomineeName: "Aditya Joshi", nomineeRelation: "Son" },
    { wing: "A", flatNumber: "301", ownerName: "Amit Kulkarni", ownerPhone: "9820012349", carpetAreaSqft: 650, constructionCost: 1800000, occupancy: "tenanted", tapCount: 2, fourWheelerSlots: 0, nomineeName: "Neha Kulkarni", nomineeRelation: "Wife" },
    { wing: "A", flatNumber: "302", ownerName: "Kavita Nair", ownerPhone: "9820012350", carpetAreaSqft: 550, constructionCost: 1500000, occupancy: "self_occupied", tapCount: 1, fourWheelerSlots: 1, nomineeName: "Ramesh Nair", nomineeRelation: "Brother" },
    { wing: "B", flatNumber: "101", ownerName: "Dinesh Mehta", ownerPhone: "9820012351", carpetAreaSqft: 750, constructionCost: 2100000, occupancy: "self_occupied", tapCount: 2, fourWheelerSlots: 1, nomineeName: "Geeta Mehta", nomineeRelation: "Wife" },
    { wing: "B", flatNumber: "102", ownerName: "Sunita Rane", ownerPhone: "9820012352", carpetAreaSqft: 600, constructionCost: 1650000, occupancy: "self_occupied", tapCount: 2, fourWheelerSlots: 0, nomineeName: "Rahul Rane", nomineeRelation: "Son" },
    { wing: "B", flatNumber: "201", ownerName: "Vikram Thakur", ownerPhone: "9820012353", carpetAreaSqft: 750, constructionCost: 2100000, occupancy: "tenanted", tapCount: 2, fourWheelerSlots: 1, nomineeName: "Varun Thakur", nomineeRelation: "Son" },
    { wing: "B", flatNumber: "202", ownerName: "Anil Gupta", ownerPhone: "9820012354", carpetAreaSqft: 600, constructionCost: 1650000, occupancy: "self_occupied", tapCount: 1, fourWheelerSlots: 1, nomineeName: "Kiran Gupta", nomineeRelation: "Wife" },
    { wing: "B", flatNumber: "301", ownerName: "Pooja Sawant", ownerPhone: "9820012355", carpetAreaSqft: 750, constructionCost: 2100000, occupancy: "self_occupied", tapCount: 2, fourWheelerSlots: 0, nomineeName: "Sanjay Sawant", nomineeRelation: "Husband" },
    { wing: "B", flatNumber: "302", ownerName: "Nitin Pawar", ownerPhone: "9820012356", carpetAreaSqft: 600, constructionCost: 1650000, occupancy: "vacant", tapCount: 1, fourWheelerSlots: 1, nomineeName: "Archana Pawar", nomineeRelation: "Wife" },
  ];

  const units = await Promise.all(
    flatsData.map((flat, idx) =>
      prisma.unit.create({
        data: {
          societyId: society.id,
          wing: flat.wing,
          flatNumber: flat.flatNumber,
          ownerName: flat.ownerName,
          ownerPhone: flat.ownerPhone,
          carpetAreaSqft: flat.carpetAreaSqft,
          constructionCost: flat.constructionCost,
          occupancy: flat.occupancy,
          tapCount: flat.tapCount,
          twoWheelerSlots: 0,
          fourWheelerSlots: flat.fourWheelerSlots,
          shareCertificateNo: `SC-${String(idx + 1).padStart(3, "0")}`,
          shareDistinctiveFrom: idx * 5 + 1,
          shareDistinctiveTo: (idx + 1) * 5,
          shareValue: 250.0,
          entranceFeePaid: 100.0,
          admissionDate: new Date("2005-06-15"),
          nomineeName: flat.nomineeName,
          nomineeRelation: flat.nomineeRelation,
        },
      })
    )
  );

  // 4. Generate Invoices for October 2026
  const billingDate = new Date("2026-10-01");
  const dueDate = new Date("2026-10-15");
  const periodStart = new Date("2026-10-01");
  const periodEnd = new Date("2026-10-31");

  let billCounter = 1;
  for (const unit of units) {
    const lineItems: { billHeadId: string; headName: string; amount: number }[] = [];
    let serviceChargesTotal = 0;

    for (const bh of billHeads) {
      let amount = 0;
      if (bh.appliesToTenantsOnly && unit.occupancy !== "tenanted") continue;

      switch (bh.calculationMethod) {
        case "construction_cost_percent":
          amount = (bh.rate / 100) * unit.constructionCost / 12;
          break;
        case "per_sqft":
          amount = bh.rate * unit.carpetAreaSqft;
          break;
        case "per_tap":
          amount = bh.rate * unit.tapCount;
          break;
        case "fixed_equal":
          if (bh.name === "Non-Occupancy Charges (NOC)") {
            amount = serviceChargesTotal * 0.10;
          } else {
            amount = bh.rate;
          }
          break;
        case "parking_slot":
          amount = bh.rate * unit.fourWheelerSlots;
          break;
      }

      amount = Math.round(amount * 100) / 100;
      if (amount <= 0) continue;

      if (["Common Electricity", "Lift Maintenance (AMC)", "Security & Housekeeping", "Education Fund"].includes(bh.name)) {
        serviceChargesTotal += amount;
      }

      lineItems.push({
        billHeadId: bh.id,
        headName: bh.name,
        amount,
      });
    }

    const principalAmount = lineItems.reduce((sum, li) => sum + li.amount, 0);
    const totalPayable = Math.round(principalAmount * 100) / 100;
    const billNumber = `SG-2026-10-${String(billCounter).padStart(3, "0")}`;
    billCounter++;

    await prisma.invoice.create({
      data: {
        societyId: society.id,
        unitId: unit.id,
        billNumber,
        billingDate,
        dueDate,
        periodStart,
        periodEnd,
        principalAmount,
        totalPayable,
        lineItems: {
          create: lineItems,
        },
      },
    });
  }

  // 5. Add Payments for First 7 Units
  const paidUnits = units.slice(0, 7);
  let receiptCounter = 1;
  for (const unit of paidUnits) {
    const invoice = await prisma.invoice.findFirst({ where: { unitId: unit.id } });
    if (!invoice) continue;

    const receiptNumber = `RCP-2026-10-${String(receiptCounter).padStart(3, "0")}`;
    receiptCounter++;

    await prisma.payment.create({
      data: {
        societyId: society.id,
        unitId: unit.id,
        receiptNumber,
        paymentDate: new Date("2026-10-10"),
        amount: invoice.totalPayable,
        mode: receiptCounter % 3 === 0 ? "cheque" : receiptCounter % 2 === 0 ? "neft" : "upi",
        transactionRef: `TXN${Date.now()}${receiptCounter}`,
        status: "cleared",
      },
    });

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { amountPaid: invoice.totalPayable, isSettled: true },
    });
  }

  // 6. Real Vendor Expenses & TDS Records (Section 194C / 194J)
  await prisma.expense.createMany({
    data: [
      {
        societyId: society.id,
        vendorName: "Nitin Joshi Security & Facility Services",
        category: "Security & Housekeeping",
        invoiceNo: "NJ/2026/091",
        invoiceDate: new Date("2026-10-02"),
        grossAmount: 18000,
        tdsSection: "194C_IND",
        tdsRate: 1.0,
        tdsAmount: 180,
        netPayable: 17820,
        paymentMode: "Cheque",
        chequeNo: "491022",
        status: "Paid",
      },
      {
        societyId: society.id,
        vendorName: "Otis Elevator Co. India Ltd.",
        category: "Lift Maintenance AMC",
        invoiceNo: "OTIS/MUM/8821",
        invoiceDate: new Date("2026-10-05"),
        grossAmount: 11550,
        tdsSection: "194C_CO",
        tdsRate: 2.0,
        tdsAmount: 231,
        netPayable: 11319,
        paymentMode: "NEFT",
        chequeNo: "NEFT-992812",
        status: "Paid",
      },
      {
        societyId: society.id,
        vendorName: "CA Ramesh Shah & Associates",
        category: "Statutory Audit & Tax Filing",
        invoiceNo: "RS/26-27/42",
        invoiceDate: new Date("2026-10-10"),
        grossAmount: 15000,
        tdsSection: "194J",
        tdsRate: 10.0,
        tdsAmount: 1500,
        netPayable: 13500,
        paymentMode: "Cheque",
        chequeNo: "491025",
        status: "Pending",
      },
      {
        societyId: society.id,
        vendorName: "Adani Electricity Mumbai Ltd.",
        category: "Common Area & Water Pump Power",
        invoiceNo: "ADANI-1092842",
        invoiceDate: new Date("2026-10-08"),
        grossAmount: 4250,
        tdsSection: "NONE",
        tdsRate: 0,
        tdsAmount: 0,
        netPayable: 4250,
        paymentMode: "NEFT",
        chequeNo: "ONLINE-29104",
        status: "Paid",
      },
      {
        societyId: society.id,
        vendorName: "Municipal Corporation of Greater Mumbai (BMC)",
        category: "Water Supply Charges",
        invoiceNo: "BMC-KW-99120",
        invoiceDate: new Date("2026-10-09"),
        grossAmount: 3100,
        tdsSection: "NONE",
        tdsRate: 0,
        tdsAmount: 0,
        netPayable: 3100,
        paymentMode: "NEFT",
        chequeNo: "ONLINE-29105",
        status: "Paid",
      },
    ],
  });

  // 7. Real Document Vault Records
  await prisma.document.createMany({
    data: [
      {
        societyId: society.id,
        name: "Index_II_Registration_Flat_A101.pdf",
        category: "Flat Document",
        flatReference: "A-101 (Rajesh Sharma)",
        fileSize: "2.4 MB",
        fileType: "pdf",
      },
      {
        societyId: society.id,
        name: "Share_Certificate_SC002_Flat_A102.pdf",
        category: "Flat Document",
        flatReference: "A-102 (Priya Desai)",
        fileSize: "1.1 MB",
        fileType: "pdf",
      },
      {
        societyId: society.id,
        name: "Otis_Lift_AMC_Agreement_FY26-27.pdf",
        category: "Vendor Contract",
        fileSize: "4.8 MB",
        fileType: "pdf",
      },
      {
        societyId: society.id,
        name: "MDCCB_Bank_Statement_Sept_2026.xlsx",
        category: "Audit & Bank",
        fileSize: "850 KB",
        fileType: "xlsx",
      },
      {
        societyId: society.id,
        name: "BMC_Property_Tax_Assessment_Order.pdf",
        category: "Society Compliance",
        fileSize: "3.2 MB",
        fileType: "pdf",
      },
      {
        societyId: society.id,
        name: "Fire_Safety_NOC_Certificate_2026.pdf",
        category: "Society Compliance",
        fileSize: "1.7 MB",
        fileType: "pdf",
      },
    ],
  });

  console.log("✅ Production database initialized successfully!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
