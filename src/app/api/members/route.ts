import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const society = await prisma.society.findFirst();
    if (!society) return NextResponse.json({ error: "No society found" }, { status: 404 });

    const body = await req.json();
    const {
      wing,
      flatNumber,
      ownerName,
      ownerPhone,
      carpetAreaSqft,
      constructionCost,
      occupancy,
      tapCount,
      fourWheelerSlots,
      nomineeName,
      nomineeRelation,
    } = body;

    const totalUnits = await prisma.unit.count({ where: { societyId: society.id } });
    const nextIdx = totalUnits + 1;

    const unit = await prisma.unit.create({
      data: {
        societyId: society.id,
        wing: wing.toUpperCase(),
        flatNumber: String(flatNumber),
        ownerName,
        ownerPhone,
        carpetAreaSqft: Number(carpetAreaSqft) || 600,
        constructionCost: Number(constructionCost) || 1600000,
        occupancy: occupancy || "self_occupied",
        tapCount: Number(tapCount) || 1,
        fourWheelerSlots: Number(fourWheelerSlots) || 0,
        shareCertificateNo: `SC-${String(nextIdx).padStart(3, "0")}`,
        shareDistinctiveFrom: (nextIdx - 1) * 5 + 1,
        shareDistinctiveTo: nextIdx * 5,
        shareValue: 250.0,
        entranceFeePaid: 100.0,
        admissionDate: new Date(),
        nomineeName: nomineeName || null,
        nomineeRelation: nomineeRelation || null,
      },
    });

    return NextResponse.json({ success: true, unit });
  } catch (err: any) {
    console.error("Failed to add unit:", err);
    return NextResponse.json({ error: err.message || "Failed to create flat" }, { status: 500 });
  }
}
