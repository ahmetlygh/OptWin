const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.siteSetting.findMany().then(r => {
    console.log("ALL SETTING KEYS:");
    console.log(r.map(t=>`${t.key}: ${t.value}`).join('\n'));
}).finally(() => prisma.$disconnect());
