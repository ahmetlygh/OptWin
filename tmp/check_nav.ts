import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function checkAboutKeys() {
  const language = await prisma.language.findUnique({ where: { code: 'tr' } });
  if (!language) { console.log("Language tr not found"); return; }
  const trans = language.translations as any;
  console.log("Nav Keys Status:", {
    "nav.about": trans["nav.about"],
    "nav.aboutOptwin": trans["nav.aboutOptwin"],
    "nav.contact": trans["nav.contact"]
  });
}

checkAboutKeys();
