export interface UnitData {
  carpetAreaSqft: number;
  constructionCost: number;
  occupancy: string;
  tapCount: number;
  fourWheelerSlots: number;
}

export interface BillHeadData {
  id: string;
  name: string;
  calculationMethod: string;
  rate: number;
  isStatutory: boolean;
  appliesToTenantsOnly: boolean;
}

export interface LineItem {
  billHeadId: string;
  headName: string;
  amount: number;
}

export function calculateBillForUnit(unit: UnitData, billHeads: BillHeadData[]): LineItem[] {
  const lineItems: LineItem[] = [];
  let serviceChargesTotal = 0;

  for (const bh of billHeads) {
    if (bh.appliesToTenantsOnly && unit.occupancy !== "tenanted") continue;

    let amount = 0;

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

    lineItems.push({ billHeadId: bh.id, headName: bh.name, amount });
  }

  return lineItems;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
