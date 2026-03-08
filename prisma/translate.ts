import fs from 'fs';
import path from 'path';
import { categories } from './seed-data/categories';
import { featuresP1 } from './seed-data/features-p1';
import { featuresP2 } from './seed-data/features-p2';

async function translateText(text: string, lang: string): Promise<string> {
    if (!text) return text;
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data[0].map((item: any) => item[0]).join('');
    } catch (e) {
        console.error(`Translation failed for: ${text} -> ${lang}`, e);
        return text; // fallback to english
    }
}

// Ensure delay between Google Translate requests
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function main() {
    const langs = ['zh', 'es', 'hi', 'de', 'fr'];
    const output: any = {
        categories: {},
        features: {},
        presets: {}
    };

    console.log("Starting translations...");

    // 1. Categories
    for (const cat of categories) {
        output.categories[cat.slug] = {};
        for (const lang of langs) {
            output.categories[cat.slug][lang] = await translateText(cat.en, lang);
            await delay(100);
        }
    }

    // 2. Presets
    const presets = [
        { slug: "recommended", en: "Recommended Settings" },
        { slug: "gamer", en: "Gaming Settings" }
    ];
    for (const p of presets) {
        output.presets[p.slug] = {};
        for (const lang of langs) {
            output.presets[p.slug][lang] = await translateText(p.en, lang);
            await delay(100);
        }
    }

    // 3. Features
    const allFeatures = [...featuresP1, ...featuresP2];
    for (const f of allFeatures) {
        const slug = f[0] as string;
        const enTitle = f[5] as string;
        const enDesc = f[6] as string;

        output.features[slug] = { title: {}, desc: {} };
        for (const lang of langs) {
            output.features[slug].title[lang] = await translateText(enTitle, lang);
            await delay(50);
            output.features[slug].desc[lang] = await translateText(enDesc, lang);
            await delay(50);
        }
        console.log(`Translated feature: ${slug}`);
    }

    fs.writeFileSync(path.join(__dirname, 'seed-data', 'translated.json'), JSON.stringify(output, null, 2));
    console.log("Done. Saved to translated.json");
}

main().catch(console.error);
