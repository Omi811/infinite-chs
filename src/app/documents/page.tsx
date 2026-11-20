import prisma from "@/lib/prisma";
import DocumentVaultClient from "./DocumentVaultClient";

export default async function DocumentsPage() {
  const society = await prisma.society.findFirst();
  const dbDocs = society
    ? await prisma.document.findMany({
        where: { societyId: society.id },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const initialFiles = dbDocs.map((d) => ({
    id: d.id,
    name: d.name,
    category: d.category as any,
    flatReference: d.flatReference || undefined,
    fileSize: d.fileSize,
    uploadedDate: d.createdAt.toISOString().split("T")[0],
    fileType: d.fileType as any,
  }));

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-3xl">🗄️</span>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Document Vault &amp; File Handler
          </h1>
        </div>
        <p className="text-gray-500 mt-1">
          Store, attach, and archive flat Index II copies, share certificates, and audit statements with real database persistence.
        </p>
      </div>

      <DocumentVaultClient initialFiles={initialFiles} />
    </div>
  );
}
