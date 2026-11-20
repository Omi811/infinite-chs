import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const society = await prisma.society.findFirst();
    if (!society) return NextResponse.json([], { status: 200 });

    const documents = await prisma.document.findMany({
      where: { societyId: society.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(documents);
  } catch (err) {
    console.error("Failed to fetch documents:", err);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const society = await prisma.society.findFirst();
    if (!society) return NextResponse.json({ error: "No society found" }, { status: 404 });

    const body = await req.json();
    const { name, category, flatReference, fileSize, fileType } = body;

    const doc = await prisma.document.create({
      data: {
        societyId: society.id,
        name,
        category: category || "Flat Document",
        flatReference: flatReference || null,
        fileSize: fileSize || "1.2 MB",
        fileType: fileType || "pdf",
      },
    });

    return NextResponse.json({ success: true, document: doc });
  } catch (err) {
    console.error("Failed to create document:", err);
    return NextResponse.json({ error: "Failed to save document" }, { status: 500 });
  }
}
