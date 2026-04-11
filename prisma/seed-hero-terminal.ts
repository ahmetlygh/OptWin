import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const terminalTranslations: Record<string, Record<string, string>> = {
    "tr": {
        "hero.term.init": "OptWin Framework v1.3 Başlatılıyor...",
        "hero.term.task1": "Windows Telemetrisi Optimize Ediliyor...",
        "hero.term.task2": "Temp ve Prefetch Temizleniyor...",
        "hero.term.task3": "Gereksiz Arkaplan Uygulamaları Kapatılıyor...",
        "hero.term.success": "Sistem başarıyla optimize edildi.",
        "hero.term.safe": "Güvenli",
        "hero.term.openSource": "Açık Kaynak",
        "hero.term.fast": "Hızlı",
        "hero.term.optimized": "Optimize Edildi",
        "beforeAfter.before.title": "OptWin Olmadan",
        "beforeAfter.after.title": "OptWin İle"
    },
    "en": {
        "hero.term.init": "Initializing OptWin Framework v1.3...",
        "hero.term.task1": "Optimizing Windows Telemetry...",
        "hero.term.task2": "Clearing Temp/Prefetch...",
        "hero.term.task3": "Disabling Background Apps...",
        "hero.term.success": "System successfully optimized.",
        "hero.term.safe": "Safe",
        "hero.term.openSource": "Open Source",
        "hero.term.fast": "Fast",
        "hero.term.optimized": "Optimized",
        "beforeAfter.before.title": "Without OptWin",
        "beforeAfter.after.title": "With OptWin"
    },
    "de": {
        "hero.term.init": "OptWin Framework v1.3 wird initialisiert...",
        "hero.term.task1": "Windows-Telemetrie wird optimiert...",
        "hero.term.task2": "Temp/Prefetch wird gelöscht...",
        "hero.term.task3": "Hintergrund-Apps werden deaktiviert...",
        "hero.term.success": "System erfolgreich optimiert.",
        "hero.term.safe": "Sicher",
        "hero.term.openSource": "Open Source",
        "hero.term.fast": "Schnell",
        "hero.term.optimized": "Optimiert",
        "beforeAfter.before.title": "Ohne OptWin",
        "beforeAfter.after.title": "Mit OptWin"
    },
    "es": {
        "hero.term.init": "Inicializando OptWin Framework v1.3...",
        "hero.term.task1": "Optimizando la telemetría de Windows...",
        "hero.term.task2": "Borrando Temp/Prefetch...",
        "hero.term.task3": "Desactivando aplicaciones en segundo plano...",
        "hero.term.success": "Sistema optimizado con éxito.",
        "hero.term.safe": "Seguro",
        "hero.term.openSource": "Código abierto",
        "hero.term.fast": "Rápido",
        "hero.term.optimized": "Optimizado",
        "beforeAfter.before.title": "Sin OptWin",
        "beforeAfter.after.title": "Con OptWin"
    },
    "fr": {
        "hero.term.init": "Initialisation d'OptWin Framework v1.3...",
        "hero.term.task1": "Optimisation de la télémétrie Windows...",
        "hero.term.task2": "Effacement de Temp/Prefetch...",
        "hero.term.task3": "Désactivation des applications en arrière-plan...",
        "hero.term.success": "Système optimisé avec succès.",
        "hero.term.safe": "Sûr",
        "hero.term.openSource": "Open Source",
        "hero.term.fast": "Rapide",
        "hero.term.optimized": "Optimisé",
        "beforeAfter.before.title": "Sans OptWin",
        "beforeAfter.after.title": "Avec OptWin"
    },
    "zh": {
        "hero.term.init": "正在初始化 OptWin Framework v1.3...",
        "hero.term.task1": "正在优化 Windows 遥测...",
        "hero.term.task2": "正在清除 Temp/Prefetch...",
        "hero.term.task3": "正在禁用后台应用程序...",
        "hero.term.success": "系统已成功优化。",
        "hero.term.safe": "安全",
        "hero.term.openSource": "开源",
        "hero.term.fast": "快速",
        "hero.term.optimized": "已优化",
        "beforeAfter.before.title": "没有 OptWin",
        "beforeAfter.after.title": "使用 OptWin"
    },
    "hi": {
        "hero.term.init": "OptWin Framework v1.3 प्रारंभ किया जा रहा है...",
        "hero.term.task1": "Windows टेलीमेट्री को अनुकूलित किया जा रहा है...",
        "hero.term.task2": "Temp/Prefetch साफ़ किया जा रहा है...",
        "hero.term.task3": "पृष्ठभूमि ऐप्स को अक्षम किया जा रहा है...",
        "hero.term.success": "सिस्टम सफलतापूर्वक अनुकूलित हुआ।",
        "hero.term.safe": "सुरक्षित",
        "hero.term.openSource": "ओपन सोर्स",
        "hero.term.fast": "तेज़",
        "hero.term.optimized": "अनुकूलित",
        "beforeAfter.before.title": "OptWin के बिना",
        "beforeAfter.after.title": "OptWin के साथ"
    }
};

async function main() {
    console.log("Seeding Hero Terminal ui_translations...");
    
    for (const [lang, translations] of Object.entries(terminalTranslations)) {
        for (const [key, value] of Object.entries(translations)) {
            await prisma.uiTranslation.upsert({
                where: {
                    key_lang: {
                        key: key,
                        lang: lang
                    }
                },
                update: {
                    value: value
                },
                create: {
                    key: key,
                    lang: lang,
                    value: value
                }
            });
        }
        console.log(`Translations seeded for ${lang}.`);
    }

    console.log("Hero Terminal translations seeded successfully!");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
