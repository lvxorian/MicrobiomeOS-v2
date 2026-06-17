import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
async function main() {
  await p.alertMatch.deleteMany();
  await p.collectionStudy.deleteMany();
  await p.studyTaxon.deleteMany();
  await p.dailyReport.deleteMany();
  await p.agentRun.deleteMany();
  await p.alert.deleteMany();
  await p.collection.deleteMany();
  await p.study.deleteMany();
  await p.taxon.deleteMany();
  await p.tag.deleteMany();
  console.log("DB smazána.");
  await p.$disconnect();
}
main();
