import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const society = await prisma.society.findFirst();
    return NextResponse.json(society || null);
  } catch (err) {
    console.error("Failed to fetch society:", err);
    return NextResponse.json({ error: "Failed to fetch society" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      registrationNo,
      address,
      city,
      pincode,
      panNumber,
      gstin,
      interestRatePa,
    } = body;

    let society = await prisma.society.findFirst();

    if (society) {
      society = await prisma.society.update({
        where: { id: society.id },
        data: {
          name: name || society.name,
          registrationNo: registrationNo || society.registrationNo,
          address: address || society.address,
          city: city || "Mumbai",
          pincode: pincode || society.pincode,
          panNumber: panNumber || null,
          gstin: gstin || null,
          interestRatePa: Number(interestRatePa) || 21.0,
        },
      });
    } else {
      society = await prisma.society.create({
        data: {
          name: name || "My Co-operative Housing Society Ltd.",
          registrationNo: registrationNo || "MUM/HSG/TC/00000/2026",
          address: address || "Mumbai",
          city: city || "Mumbai",
          pincode: pincode || "400001",
          panNumber: panNumber || null,
          gstin: gstin || null,
          interestRatePa: Number(interestRatePa) || 21.0,
        },
      });
    }

    return NextResponse.json({ success: true, society });
  } catch (err: any) {
    console.error("Failed to update society:", err);
    return NextResponse.json({ error: err.message || "Failed to update society" }, { status: 500 });
  }
}
