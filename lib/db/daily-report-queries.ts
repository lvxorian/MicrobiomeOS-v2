import { prisma } from "@/lib/db/prisma";

export async function getLatestDailyReport() {
  return prisma.dailyReport.findFirst({
    orderBy: { date: "desc" },
  });
}
