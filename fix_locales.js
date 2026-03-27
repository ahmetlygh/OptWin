const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src', 'i18n', 'locales');
const files = ['en.ts', 'tr.ts', 'de.ts', 'fr.ts', 'es.ts', 'zh.ts', 'hi.ts'];

const mappings = {
    "tr": { template: "{prefix} {highlight}", highlight: "Hızlandırın", prefix: "Windows Deneyiminizi" },
    "en": { template: "{highlight} {prefix}", highlight: "Optimize", prefix: "your Windows Experience" },
    "de": { template: "{highlight} {prefix}", highlight: "Optimieren", prefix: "Sie Ihr Windows-Erlebnis" },
    "fr": { template: "{highlight} {prefix}", highlight: "Optimisez", prefix: "votre expérience Windows" },
    "es": { template: "{highlight} {prefix}", highlight: "Optimice", prefix: "su experiencia con Windows" },
    "zh": { template: "{highlight}{prefix}", highlight: "优化", prefix: "您的 Windows 体验" },
    "hi": { template: "{prefix} {highlight}", highlight: "अनुकूलित करें", prefix: "अपने Windows अनुभव को" }
};

for (const file of files) {
    const lang = file.replace('.ts', '');
    if (!mappings[lang]) continue;

    const data = mappings[lang];
    const filePath = path.join(localesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Purge any line containing "hero.title" completely
    const lines = content.split('\n');
    const newLines = [];
    let inserted = false;

    for (const line of lines) {
        if (line.includes('"hero.title')) {
            // Drop it. But the first time we drop, we inject the new block
            if (!inserted) {
                newLines.push(`    "hero.titleTemplate": "${data.template}",`);
                newLines.push(`    "hero.titleHighlight": "${data.highlight}",`);
                newLines.push(`    "hero.titlePrefix": "${data.prefix}",`);
                inserted = true;
            }
        } else {
            newLines.push(line);
        }
    }
    
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
    console.log(`Updated ${file}`);
}
