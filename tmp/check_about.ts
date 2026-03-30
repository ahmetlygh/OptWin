import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function checkAboutKeys() {
  const language = await prisma.language.findUnique({ where: { code: 'tr' } });
  if (!language) { console.log("Language tr not found"); return; }
  const trans = language.translations as any;
  console.log("About Keys Status:", {
    "about.title": trans["about.title"] || "MISSING",
    "about.description": trans["about.description"] || "MISSING",
    "nav.about": trans["nav.about"] || "MISSING"
  });
}

checkAboutKeys();
