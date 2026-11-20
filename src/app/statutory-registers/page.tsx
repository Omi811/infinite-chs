import prisma from "@/lib/prisma";
import RegistersClient from "./RegistersClient";

export const dynamic = "force-dynamic";

export default async function StatutoryRegistersPage() {
  const society = await prisma.society.findFirst();
  if (!society) return <div>No society found</div>;

  const units = await prisma.unit.findMany({
    where: { societyId: society.id },
    orderBy: [{ wing: "asc" }, { flatNumber: "asc" }],
  });

  const memberUnits = units.map((u) => ({
    id: u.id,
    wing: u.wing,
    flatNumber: u.flatNumber,
    ownerName: u.ownerName,
    ownerPhone: u.ownerPhone,
    carpetAreaSqft: u.carpetAreaSqft,
    constructionCost: u.constructionCost,
    occupancy: u.occupancy,
    shareCertificateNo: u.shareCertificateNo || "SC-001",
    shareDistinctiveFrom: u.shareDistinctiveFrom || 1,
    shareDistinctiveTo: u.shareDistinctiveTo || 5,
    shareValue: u.shareValue || 250.0,
    entranceFeePaid: u.entranceFeePaid || 100.0,
    admissionDate: u.admissionDate.toISOString().split("T")[0],
    nomineeName: u.nomineeName || "Registered in Form 14",
    nomineeRelation: u.nomineeRelation || "Nominee",
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-3xl">🏛️</span>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Statutory Registers (Form &apos;I&apos; &amp; Form &apos;J&apos;)
          </h1>
        </div>
        <p className="text-gray-500 mt-1">
          Mandatory statutory records under Section 32 &amp; 33 of MCS Rules 1961 with real database share certificates and nominee records.
        </p>
      </div>

      <RegistersClient
        members={memberUnits}
        societyName={society.name}
        regNo={society.registrationNo}
      />
    </div>
  );
}
