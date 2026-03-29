import { PrismaClient } from "@prisma/client";
import { categories } from "./seed-data/categories";
import { defaultSettings, defaultDnsProviders, defaultUiTranslations } from "./seed-data/settings";
import { scriptLabels } from "./seed-data/script-labels";
import { featuresP1 } from "./seed-data/features-p1";
import { featuresP2 } from "./seed-data/features-p2";
import { defaultLanguages } from "./seed-data/languages";
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding OptWin database...\n");

    let translatedData: any = null;
    const translatedPath = path.join(__dirname, 'seed-data', 'translated.json');
    if (fs.existsSync(translatedPath)) {
        translatedData = JSON.parse(fs.readFileSync(translatedPath, 'utf8'));
        console.log("Found translated.json! Will seed extra languages.");
    }
    const extraLangs = ['zh', 'es', 'hi', 'de', 'fr'];

    // 1. Categories
    console.log("📁 Creating categories...");
    const categoryMap: Record<string, string> = {};
    for (const cat of categories) {
        const created = await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: { slug: cat.slug, order: cat.order, enabled: true },
        });
        categoryMap[cat.slug] = created.id;
        await prisma.categoryTranslation.upsert({
            where: { categoryId_lang: { categoryId: created.id, lang: "en" } },
            update: { name: cat.en },
            create: { categoryId: created.id, lang: "en", name: cat.en },
        });
        await prisma.categoryTranslation.upsert({
            where: { categoryId_lang: { categoryId: created.id, lang: "tr" } },
            update: { name: cat.tr },
            create: { categoryId: created.id, lang: "tr", name: cat.tr },
        });

        if (translatedData && translatedData.categories[cat.slug]) {
            for (const lang of extraLangs) {
                const trName = translatedData.categories[cat.slug][lang];
                if (trName) {
                    await prisma.categoryTranslation.upsert({
                        where: { categoryId_lang: { categoryId: created.id, lang } },
                        update: { name: trName },
                        create: { categoryId: created.id, lang, name: trName },
                    });
                }
            }
        }
    }
    console.log(`  ✅ ${categories.length} categories created\n`);

    // 2. Features
    console.log("⚙️ Creating features...");
    const allFeatures = [...featuresP1, ...featuresP2];
    for (let i = 0; i < allFeatures.length; i++) {
        const [slug, catSlug, icon, risk, noRisk, enTitle, enDesc, trTitle, trDesc] = allFeatures[i];
        const categoryId = categoryMap[catSlug];
        if (!categoryId) { console.warn(`  ⚠️ Category not found: ${catSlug}`); continue; }

        const feature = await prisma.feature.upsert({
            where: { slug },
            update: {},
            create: { slug, categoryId, icon, risk, noRisk, order: i, enabled: true },
        });
        await prisma.featureTranslation.upsert({
            where: { featureId_lang: { featureId: feature.id, lang: "en" } },
            update: { title: enTitle, desc: enDesc },
            create: { featureId: feature.id, lang: "en", title: enTitle, desc: enDesc },
        });
        await prisma.featureTranslation.upsert({
            where: { featureId_lang: { featureId: feature.id, lang: "tr" } },
            update: { title: trTitle, desc: trDesc },
            create: { featureId: feature.id, lang: "tr", title: trTitle, desc: trDesc },
        });

        if (translatedData && translatedData.features[slug]) {
            for (const lang of extraLangs) {
                const trTitleExtra = translatedData.features[slug].title[lang];
                const trDescExtra = translatedData.features[slug].desc[lang];
                if (trTitleExtra && trDescExtra) {
                    await prisma.featureTranslation.upsert({
                        where: { featureId_lang: { featureId: feature.id, lang } },
                        update: { title: trTitleExtra, desc: trDescExtra },
                        create: { featureId: feature.id, lang, title: trTitleExtra, desc: trDescExtra },
                    });
                }
            }
        }
    }
    console.log(`  ✅ ${allFeatures.length} features created\n`);

    // 3. DNS Providers
    console.log("🌐 Creating DNS providers...");
    for (const dns of defaultDnsProviders) {
        await prisma.dnsProvider.upsert({
            where: { slug: dns.slug },
            update: {},
            create: dns,
        });
    }
    console.log(`  ✅ ${defaultDnsProviders.length} DNS providers created\n`);

    // 4. Site Settings
    console.log("⚙️ Creating site settings...");
    for (const setting of defaultSettings) {
        await prisma.siteSetting.upsert({
            where: { key: setting.key },
            update: { value: setting.value, type: setting.type, description: setting.description },
            create: setting,
        });
    }
    console.log(`  ✅ ${defaultSettings.length} settings created\n`);

    // 4b. Hero i18n SiteSettings Overrides (Complete 7 Language Fix)
    console.log("🗣️ Enforcing 7-Language Morphological Hero Mapping...");
    const heroMappings = {
        tr: { template: "{prefix} {highlight}", prefix: "Windows Deneyiminizi", highlight: "Hızlandırın" },
        en: { template: "{highlight} {prefix}", prefix: "your Windows Experience", highlight: "Optimize" },
        de: { template: "{highlight} {prefix}", prefix: "Sie Ihr Windows-Erlebnis", highlight: "Optimieren" },
        fr: { template: "{highlight} {prefix}", prefix: "votre expérience Windows", highlight: "Optimisez" },
        es: { template: "{highlight} {prefix}", prefix: "su experiencia con Windows", highlight: "Optimice" },
        zh: { template: "{highlight}{prefix}", prefix: "您的 Windows 体验", highlight: "优化", subtitle: "高级用户和玩家 professional 优化工具。仅需一个脚本，即可清理、优化并加速您的系统。" },
        hi: { template: "{prefix} {highlight}", prefix: "अपने Windows अनुभव को", highlight: "अनुकूलित करें" }
    };

    for (const [lang, vars] of Object.entries(heroMappings)) {
        for (const [keyRaw, value] of Object.entries(vars)) {
            // Map keys exactly as the Content Admin does
            const dbKey = keyRaw === "subtitle" 
                ? `optwin:setting:translations:hero.subtitle:${lang}`
                : `optwin:setting:translations:hero.title${keyRaw.charAt(0).toUpperCase() + keyRaw.slice(1)}:${lang}`;
                
            await prisma.siteSetting.upsert({
                where: { key: dbKey },
                update: { value },
                create: { key: dbKey, value, type: "string" },
            });
        }
    }
    console.log(`  ✅ Morphological structures enforced\n`);

    // 5. UI Translations
    console.log("🌍 Creating UI translations...");
    for (const t of defaultUiTranslations) {
        await prisma.uiTranslation.upsert({
            where: { key_lang: { key: t.key, lang: "en" } },
            update: { value: t.en },
            create: { key: t.key, lang: "en", value: t.en },
        });
        await prisma.uiTranslation.upsert({
            where: { key_lang: { key: t.key, lang: "tr" } },
            update: { value: t.tr },
            create: { key: t.key, lang: "tr", value: t.tr },
        });
    }
    console.log(`  ✅ ${defaultUiTranslations.length * 2} UI translations created\n`);

    // 6. Stats
    await prisma.siteStats.upsert({
        where: { id: "main" },
        update: {},
        create: { id: "main", totalVisits: 0, totalScripts: 0 },
    });
    console.log("📊 Stats initialized\n");

    // 6b. Languages
    console.log("🌍 Creating languages...");
    for (const lang of defaultLanguages) {
        await prisma.language.upsert({
            where: { code: lang.code },
            update: { name: lang.name, nativeName: lang.nativeName, flagSvg: lang.flagSvg, utcOffset: lang.utcOffset, isDefault: lang.isDefault, isActive: lang.isActive, sortOrder: lang.sortOrder, seoMetadata: lang.seoMetadata },
            create: lang,
        });
    }
    console.log(`  ✅ ${defaultLanguages.length} languages created\n`);

    // 7. Script Labels
    console.log("🏷️ Creating script labels...");
    for (const label of scriptLabels) {
        await prisma.scriptLabel.upsert({
            where: { lang_key: { lang: label.lang, key: label.key } },
            update: { value: label.value },
            create: { lang: label.lang, key: label.key, value: label.value },
        });
    }
    console.log(`  ✅ ${scriptLabels.length} script labels created\n`);

    // 8. Presets
    console.log("🎯 Creating presets...");
    const recommendedSlugs = ["cleanTemp", "cleanPrefetch", "recycleBin", "cleanEventLog", "clearIconCache", "clearThumbsCache", "systemFileCheck", "dismCheck", "highPerformance", "disableGameDVR", "disableStartupDelay", "disableSuperfetch", "showExtensions", "showHiddenFiles", "disableWallet", "disableMaps", "disableFax", "disableWer", "disableXbox", "disableRemoteAssistance", "disableDeliveryOptimization", "disableLocation", "disableClipboardHistory", "disableActivityHistory", "disableTimeline", "disableAdvertisingId", "flushDNS", "networkReset", "clearArpCache"];
    const gamerSlugs = ["highPerformance", "disableGameDVR", "disableGameBar", "disableStartupDelay", "disableSuperfetch", "disableAnimations", "disableTransparency", "disableWindowsTips", "disableLockScreenTips", "flushDNS", "disableThrottling", "clearArpCache", "enableQoS", "disableP2PUpdate", "networkReset", "disableNotifications", "disableNewsInterests", "disableMouseAccel", "disableSticky", "cleanTemp", "cleanPrefetch"];

    for (const preset of [
        { slug: "recommended", featureSlugs: recommendedSlugs, order: 0, en: "Recommended Settings", tr: "Önerilen Ayarlar" },
        { slug: "gamer", featureSlugs: gamerSlugs, order: 1, en: "Gaming Settings", tr: "Oyuncu Ayarları" },
    ]) {
        const created = await prisma.preset.upsert({
            where: { slug: preset.slug },
            update: {},
            create: { slug: preset.slug, featureSlugs: preset.featureSlugs, order: preset.order },
        });
        await prisma.presetTranslation.upsert({
            where: { presetId_lang: { presetId: created.id, lang: "en" } },
            update: { name: preset.en },
            create: { presetId: created.id, lang: "en", name: preset.en },
        });
        await prisma.presetTranslation.upsert({
            where: { presetId_lang: { presetId: created.id, lang: "tr" } },
            update: { name: preset.tr },
            create: { presetId: created.id, lang: "tr", name: preset.tr },
        });

        if (translatedData && translatedData.presets[preset.slug]) {
            for (const lang of extraLangs) {
                const trName = translatedData.presets[preset.slug][lang];
                if (trName) {
                    await prisma.presetTranslation.upsert({
                        where: { presetId_lang: { presetId: created.id, lang } },
                        update: { name: trName },
                        create: { presetId: created.id, lang, name: trName },
                    });
                }
            }
        }
    }
    console.log("  ✅ 2 presets created\n");

    console.log("🎉 Seeding complete!");
}

main()
    .catch((e) => {
        console.error("❌ Seed error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
