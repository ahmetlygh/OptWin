import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function audit() {
    console.log("--- OptWin Global Language Audit ---");
    const languages = await prisma.language.findMany();
    const defaultLang = languages.find(l => l.isDefault) || languages[0];

    if (!defaultLang) {
        console.error("ERROR: No default language found.");
        return;
    }

    const defaultKeys = Object.keys(defaultLang.translations as Record<string, string> || {});
    console.log(`Default Language: ${defaultLang.name} (${defaultLang.code})`);
    console.log(`Total Expected Keys: ${defaultKeys.length}`);
    console.log("-----------------------------------");

    for (const lang of languages) {
        const trans = lang.translations as Record<string, string> || {};
        const langKeys = Object.keys(trans);
        const missing = defaultKeys.filter(k => !trans[k] || trans[k] === "");
        const extra = langKeys.filter(k => !defaultKeys.includes(k));

        console.log(`Language: ${lang.name} (${lang.code})`);
        console.log(`- Status: ${lang.isActive ? 'Active' : 'Inactive'}${lang.isDefault ? ' (DEFAULT)' : ''}`);
        console.log(`- Keys Found: ${langKeys.length}`);
        console.log(`- Missing Keys: ${missing.length}`);
        if (missing.length > 0) {
            console.log(`  (Sample missing: ${missing.slice(0, 3).join(", ")}...)`);
        }
        if (extra.length > 0) {
            console.log(`- Extra Keys (Not in default): ${extra.length}`);
        }
        
        const completion = Math.round(((defaultKeys.length - missing.length) / defaultKeys.length) * 100);
        console.log(`- Completion Rate: ${completion}%`);
        console.log("---");
    }

    // Structural Review
    console.log("Structural Audit:");
    const hasDuplicateCodes = new Set(languages.map(l => l.code)).size !== languages.length;
    console.log(`- Unique Code Constraints: ${hasDuplicateCodes ? 'VIOLATED' : 'PASSED'}`);
    
    const hasMissingSeo = languages.filter(l => !l.seoMetadata);
    console.log(`- SEO Metadata Presence: ${hasMissingSeo.length === 0 ? 'PASSED' : `FAILED (${hasMissingSeo.length} languages missing null checks)`}`);
    
    console.log("Audit Finished.");
}

audit().finally(() => prisma.$disconnect());
