import prisma from "@/lib/prisma";
import WhatsAppDispatcherClient from "./WhatsAppDispatcherClient";
import { headers } from "next/headers";

export default async function WhatsAppPage() {
  const society = await prisma.society.findFirst();
  if (!society) return <div>No society found</div>;

  const invoices = await prisma.invoice.findMany({
    where: { societyId: society.id },
    include: { unit: true },
    orderBy: [{ unit: { wing: "asc" } }, { unit: { flatNumber: "asc" } }],
  });

  let baseUrl = "https://omi811.github.io/infinite-chs";
  try {
    const headersList = headers();
    const host = headersList.get("host");
    if (host) {
      const protocol = host.includes("trycloudflare.com") || host.includes("https") ? "https" : "http";
      baseUrl = `${protocol}://${host}`;
    }
  } catch {}

  const bills = invoices.map((inv) => ({
    id: inv.id,
    wing: inv.unit.wing,
    flatNumber: inv.unit.flatNumber,
    ownerName: inv.unit.ownerName,
    ownerPhone: inv.unit.ownerPhone,
    billNumber: inv.billNumber,
    totalPayable: inv.totalPayable,
    amountPaid: inv.amountPaid,
    isSettled: inv.isSettled,
    dueDate: inv.dueDate.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xl">💬</span>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              WhatsApp 1-Click Dispatcher
            </h1>
          </div>
          <p className="text-gray-500 mt-1">
            Send customized monthly bills and statutory overdue reminders to flat owners in one click.
          </p>
        </div>
      </div>

      <WhatsAppDispatcherClient bills={bills} baseUrl={baseUrl} />
    </div>
  );
}
