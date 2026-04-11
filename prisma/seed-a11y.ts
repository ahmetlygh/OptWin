import { PrismaClient } from '@prisma/client';
import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const redisClient = new Redis(REDIS_URL);
const prisma = new PrismaClient();

const a11yTranslations: Record<string, Record<string, string>> = {
    "tr": {
        "aria.language": "Dili değiştir",
        "aria.theme": "Temayı değiştir",
        "aria.admin": "Yönetici menüsü",
        "nav.scrollToTop": "Yukarı kaydır",
        "search.clearSearch": "Aramayı temizle",
        "aria.closeParams": "Kapat",
        "aria.close": "Kapat",
        "category.sidebarTitle": "Kategorİler",
        "preset.sidebarTitle": "Hızlı Ayarlar"
    },
    "en": {
        "aria.language": "Change language",
        "aria.theme": "Toggle theme",
        "aria.admin": "Admin menu",
        "nav.scrollToTop": "Scroll to top",
        "search.clearSearch": "Clear search",
        "aria.closeParams": "Close Settings",
        "aria.close": "Close",
        "category.sidebarTitle": "Categories",
        "preset.sidebarTitle": "Presets"
    },
    "de": {
        "aria.language": "Sprache ändern",
        "aria.theme": "Design umschalten",
        "aria.admin": "Admin-Menü",
        "nav.scrollToTop": "Nach oben scrollen",
        "search.clearSearch": "Suche löschen",
        "aria.closeParams": "Schließen",
        "aria.close": "Schließen",
        "category.sidebarTitle": "Kategorien",
        "preset.sidebarTitle": "Voreinstellungen"
    },
    "es": {
        "aria.language": "Cambiar idioma",
        "aria.theme": "Alternar tema",
        "aria.admin": "Menú de administrador",
        "nav.scrollToTop": "Desplazarse hacia arriba",
        "search.clearSearch": "Borrar búsqueda",
        "aria.closeParams": "Cerrar",
        "aria.close": "Cerrar",
        "category.sidebarTitle": "Categorías",
        "preset.sidebarTitle": "Ajustes rápidos"
    },
    "fr": {
        "aria.language": "Changer de langue",
        "aria.theme": "Changer de thème",
        "aria.admin": "Menu administrateur",
        "nav.scrollToTop": "Faire défiler vers le haut",
        "search.clearSearch": "Effacer la recherche",
        "aria.closeParams": "Fermer",
        "aria.close": "Fermer",
        "category.sidebarTitle": "Catégories",
        "preset.sidebarTitle": "Préréglages"
    },
    "zh": {
        "aria.language": "更改语言",
        "aria.theme": "切换主题",
        "aria.admin": "管理员菜单",
        "nav.scrollToTop": "滚动到顶部",
        "search.clearSearch": "清除搜索",
        "aria.closeParams": "关闭",
        "aria.close": "关闭",
        "category.sidebarTitle": "分类",
        "preset.sidebarTitle": "预设"
    },
    "hi": {
        "aria.language": "भाषा बदलें",
        "aria.theme": "विषय बदलें",
        "aria.admin": "व्यवस्थापक मेनू",
        "nav.scrollToTop": "शीर्ष पर स्क्रॉल करें",
        "search.clearSearch": "खोज साफ़ करें",
        "aria.closeParams": "बंद करें",
        "aria.close": "बंद करें",
        "category.sidebarTitle": "श्रेणियाँ",
        "preset.sidebarTitle": "प्रीसेट"
    }
};

async function main() {
    console.log("Seeding Accessibility (A11y) and Missing Translations...");
    
    for (const [langCode, newTranslations] of Object.entries(a11yTranslations)) {
        const langRecord = await prisma.language.findUnique({ where: { code: langCode } });
        if (!langRecord) {
            console.log(`Language ${langCode} not found in DB, skipping.`);
            continue;
        }

        const existingTranslations = (langRecord.translations as Record<string, string>) || {};
        
        const mergedTranslations = {
            ...existingTranslations,
            ...newTranslations
        };

        await prisma.language.update({
            where: { code: langCode },
            data: { translations: mergedTranslations }
        });
        
        console.log(`Updated a11y translations for ${langCode}.`);
        
        // Remove from cache
        await redisClient.del(`optwin:translations:${langCode}`);
    }

    console.log("A11y translations seed and cache purge completed!");
    process.exit(0);
}

main().catch(console.error);
