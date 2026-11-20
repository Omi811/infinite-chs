/**
 * Infinite CHS - Client Data Store
 * Provides persistent offline/static storage for GitHub Pages and hybrid syncing with Node/Prisma API.
 * Made by Narendra Panchal.
 */

const WIPED_KEY = "infinite_chs_wiped_v1";
const SOCIETY_KEY = "infinite_chs_society_v1";
const UNITS_KEY = "infinite_chs_units_v1";
const INVOICES_KEY = "infinite_chs_invoices_v1";
const EXPENSES_KEY = "infinite_chs_expenses_v1";
const DOCUMENTS_KEY = "infinite_chs_documents_v1";
const PAYMENTS_KEY = "infinite_chs_payments_v1";

export interface StoredSociety {
  name: string;
  registrationNo: string;
  address: string;
  city: string;
  pincode: string;
  panNumber?: string | null;
  gstin?: string | null;
  interestRatePa: number;
}

export interface StoredUnit {
  id: string;
  wing: string;
  flatNumber: string;
  ownerName: string;
  ownerPhone: string;
  carpetAreaSqft: number;
  constructionCost: number;
  occupancy: string;
  fourWheelerSlots: number;
  shareCertificateNo?: string;
  shareDistinctiveFrom?: number;
  shareDistinctiveTo?: number;
  shareValue?: number;
  entranceFeePaid?: number;
  admissionDate?: string;
  nomineeName?: string;
  nomineeRelation?: string;
  createdAt: string;
}

export interface StoredInvoice {
  id: string;
  billNumber: string;
  unitId: string;
  wing: string;
  flatNumber: string;
  ownerName: string;
  ownerPhone: string;
  billDate: string;
  dueDate: string;
  totalPayable: number;
  amountPaid: number;
  isSettled: boolean;
  breakup?: {
    maintenanceCharge: number;
    sinkingFund: number;
    repairFund: number;
    parkingCharges: number;
    waterCharges: number;
    electricityCharges: number;
    interestArrears: number;
  };
}

export interface StoredExpense {
  id: string;
  vendorName: string;
  category: string;
  invoiceNo: string;
  invoiceDate: string;
  grossAmount: number;
  tdsSection: "194C_IND" | "194C_CO" | "194J" | "NONE";
  tdsRate: number;
  tdsAmount: number;
  netPayable: number;
  paymentMode: "Cheque" | "NEFT";
  chequeNo?: string;
  status: "Paid" | "Pending";
}

export interface StoredDocument {
  id: string;
  name: string;
  category: "Flat Document" | "Society Compliance" | "Audit & Bank" | "Vendor Contract";
  flatReference?: string;
  fileSize: string;
  uploadedDate: string;
  fileType: "pdf" | "xlsx" | "image";
}

export interface StoredPayment {
  id: string;
  receiptNo: string;
  paymentDate: string;
  amount: number;
  mode: string;
  referenceNo?: string;
  unitWing: string;
  unitFlat: string;
  ownerName: string;
}

class ClientStore {
  private isBrowser(): boolean {
    return typeof window !== "undefined" && typeof localStorage !== "undefined";
  }

  private notify() {
    if (this.isBrowser()) {
      window.dispatchEvent(new Event("infinite_chs_store_updated"));
    }
  }

  public subscribe(callback: () => void): () => void {
    if (!this.isBrowser()) return () => {};
    const handler = () => callback();
    window.addEventListener("infinite_chs_store_updated", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("infinite_chs_store_updated", handler);
      window.removeEventListener("storage", handler);
    };
  }

  public isDataWiped(): boolean {
    if (!this.isBrowser()) return false;
    return localStorage.getItem(WIPED_KEY) === "true";
  }

  public wipeAllData(): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(WIPED_KEY, "true");
    localStorage.setItem(UNITS_KEY, JSON.stringify([]));
    localStorage.setItem(INVOICES_KEY, JSON.stringify([]));
    localStorage.setItem(EXPENSES_KEY, JSON.stringify([]));
    localStorage.setItem(DOCUMENTS_KEY, JSON.stringify([]));
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify([]));
    localStorage.setItem(
      SOCIETY_KEY,
      JSON.stringify({
        name: "My Co-operative Housing Society Ltd.",
        registrationNo: "MUM/HSG/TC/____/2026",
        address: "Enter Society Building Address, Mumbai",
        city: "Mumbai",
        pincode: "400001",
        panNumber: "",
        gstin: "",
        interestRatePa: 21.0,
      })
    );
    this.notify();
  }

  public restoreDemoData(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem(WIPED_KEY);
    localStorage.removeItem(UNITS_KEY);
    localStorage.removeItem(INVOICES_KEY);
    localStorage.removeItem(EXPENSES_KEY);
    localStorage.removeItem(DOCUMENTS_KEY);
    localStorage.removeItem(PAYMENTS_KEY);
    localStorage.removeItem(SOCIETY_KEY);
    this.notify();
  }

  // --- Society ---
  public getSociety(fallback?: StoredSociety): StoredSociety | undefined {
    if (!this.isBrowser()) return fallback;
    const raw = localStorage.getItem(SOCIETY_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    return fallback;
  }

  public saveSociety(society: StoredSociety): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(SOCIETY_KEY, JSON.stringify(society));
    this.notify();
  }

  // --- Units ---
  public getUnits(fallback: StoredUnit[] = []): StoredUnit[] {
    if (!this.isBrowser()) return fallback;
    if (this.isDataWiped()) {
      const raw = localStorage.getItem(UNITS_KEY);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {}
      }
      return [];
    }
    const raw = localStorage.getItem(UNITS_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    return fallback;
  }

  public addUnit(unit: Omit<StoredUnit, "id" | "createdAt">): StoredUnit {
    const current = this.getUnits([]);
    const newUnit: StoredUnit = {
      ...unit,
      id: "u_" + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    };
    const updated = [...current, newUnit];
    if (this.isBrowser()) {
      localStorage.setItem(UNITS_KEY, JSON.stringify(updated));
      this.notify();
    }
    return newUnit;
  }

  public deleteUnit(id: string): void {
    const current = this.getUnits([]);
    const updated = current.filter((u) => u.id !== id);
    if (this.isBrowser()) {
      localStorage.setItem(UNITS_KEY, JSON.stringify(updated));
      this.notify();
    }
  }

  // --- Invoices ---
  public getInvoices(fallback: StoredInvoice[] = []): StoredInvoice[] {
    if (!this.isBrowser()) return fallback;
    if (this.isDataWiped()) {
      const raw = localStorage.getItem(INVOICES_KEY);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {}
      }
      return [];
    }
    const raw = localStorage.getItem(INVOICES_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    return fallback;
  }

  public addInvoice(invoice: StoredInvoice): void {
    const current = this.getInvoices([]);
    const updated = [invoice, ...current];
    if (this.isBrowser()) {
      localStorage.setItem(INVOICES_KEY, JSON.stringify(updated));
      this.notify();
    }
  }

  // --- Expenses ---
  public getExpenses(fallback: StoredExpense[] = []): StoredExpense[] {
    if (!this.isBrowser()) return fallback;
    if (this.isDataWiped()) {
      const raw = localStorage.getItem(EXPENSES_KEY);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {}
      }
      return [];
    }
    const raw = localStorage.getItem(EXPENSES_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    return fallback;
  }

  public addExpense(expense: StoredExpense): void {
    const current = this.getExpenses([]);
    const updated = [expense, ...current];
    if (this.isBrowser()) {
      localStorage.setItem(EXPENSES_KEY, JSON.stringify(updated));
      this.notify();
    }
  }

  // --- Documents ---
  public getDocuments(fallback: StoredDocument[] = []): StoredDocument[] {
    if (!this.isBrowser()) return fallback;
    if (this.isDataWiped()) {
      const raw = localStorage.getItem(DOCUMENTS_KEY);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {}
      }
      return [];
    }
    const raw = localStorage.getItem(DOCUMENTS_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    return fallback;
  }

  public addDocument(doc: StoredDocument): void {
    const current = this.getDocuments([]);
    const updated = [doc, ...current];
    if (this.isBrowser()) {
      localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(updated));
      this.notify();
    }
  }

  // --- Payments ---
  public getPayments(fallback: StoredPayment[] = []): StoredPayment[] {
    if (!this.isBrowser()) return fallback;
    if (this.isDataWiped()) {
      const raw = localStorage.getItem(PAYMENTS_KEY);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {}
      }
      return [];
    }
    const raw = localStorage.getItem(PAYMENTS_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    return fallback;
  }

  public addPayment(payment: StoredPayment): void {
    const current = this.getPayments([]);
    const updated = [payment, ...current];
    if (this.isBrowser()) {
      localStorage.setItem(PAYMENTS_KEY, JSON.stringify(updated));
      this.notify();
    }
  }
}

export const clientStore = new ClientStore();
