import prisma from "@/lib/prisma";
import MembersView from "./MembersView";

export default async function MembersPage() {
  const society = await prisma.society.findFirst();

  let units: any[] = [];
  if (society) {
    units = await prisma.unit.findMany({
      where: { societyId: society.id },
      orderBy: [{ wing: "asc" }, { flatNumber: "asc" }],
    });
  }

  const serializedUnits = units.map((u) => ({
    id: u.id,
    wing: u.wing,
    flatNumber: u.flatNumber,
    ownerName: u.ownerName,
    ownerPhone: u.ownerPhone,
    carpetAreaSqft: u.carpetAreaSqft,
    constructionCost: u.constructionCost,
    occupancy: u.occupancy,
    fourWheelerSlots: u.fourWheelerSlots,
    shareCertificateNo: u.shareCertificateNo || `SC-${u.wing}${u.flatNumber}`,
    createdAt: u.createdAt.toISOString(),
  }));

  return <MembersView initialUnits={serializedUnits} />;
}
