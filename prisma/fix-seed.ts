import { PrismaClient } from '@prisma/client';
import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const redisClient = new Redis(REDIS_URL);
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
        "beforeAfter.after.title": "OptWin İle",
        "preset.mainTitle": "Ön Ayarlar",
        "preset.mainDescription": "Sistem performansınızı en üst düzeye çıkarmak için profesyonelce hazırlanmış tek tıkla uygulanabilen hazır yapılandırmalar.",
        "preset.bulkActionsTitle": "Toplu İşlemler",
        "preset.showDescriptions": "Açıklamaları Göster",
        "preset.hideDescriptions": "Açıklamaları Gizle",
        "hero.term.preview": "Script önizlemesi",
        "hero.term.replay": "Tekrar oynatmak için tıklayın",
        "hero.term.cmd1": "Telemetri Devre Dışı Bırakılıyor",
        "hero.term.cmd2": "Geçici Dosyalar Temizleniyor",
        "hero.term.cmd3": "Arka Plan Uygulamaları Kapatılıyor",
        "hero.term.cmd4": "Servisler Optimize Ediliyor",
        "hero.term.cmd5": "Gizlilik Ayarları Yapılandırılıyor",
        "hero.term.allDone": "Tüm işlemler tamamlandı",
        "hero.term.thanks": "OptWin kullandığınız için teşekkürler!"
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
        "beforeAfter.after.title": "With OptWin",
        "preset.mainTitle": "Presets",
        "preset.mainDescription": "Professionally crafted, one-click configurations to maximize your system performance.",
        "preset.bulkActionsTitle": "Bulk Actions",
        "preset.showDescriptions": "Show Descriptions",
        "preset.hideDescriptions": "Hide Descriptions",
        "hero.term.preview": "Script preview",
        "hero.term.replay": "Click to replay",
        "hero.term.cmd1": "Disabling Telemetry",
        "hero.term.cmd2": "Clearing Temp/Prefetch",
        "hero.term.cmd3": "Disabling Background Apps",
        "hero.term.cmd4": "Optimizing Services",
        "hero.term.cmd5": "Configuring Privacy",
        "hero.term.allDone": "All tasks completed",
        "hero.term.thanks": "Thank you for using OptWin!"
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
        "beforeAfter.after.title": "Mit OptWin",
        "preset.mainTitle": "Voreinstellungen",
        "preset.mainDescription": "Professionell erstellte Ein-Klick-Konfigurationen zur Maximierung Ihrer Systemleistung.",
        "preset.bulkActionsTitle": "Massenaktionen",
        "preset.showDescriptions": "Beschreibungen anzeigen",
        "preset.hideDescriptions": "Beschreibungen ausblenden",
        "hero.term.preview": "Skriptvorschau",
        "hero.term.replay": "Zum Abspielen klicken",
        "hero.term.cmd1": "Telemetrie deaktivieren",
        "hero.term.cmd2": "Temp/Prefetch löschen",
        "hero.term.cmd3": "Hintergrund-Apps deaktivieren",
        "hero.term.cmd4": "Dienste optimieren",
        "hero.term.cmd5": "Datenschutz konfigurieren",
        "hero.term.allDone": "Alle Aufgaben abgeschlossen",
        "hero.term.thanks": "Vielen Dank für die Nutzung von OptWin!"
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
        "beforeAfter.after.title": "Con OptWin",
        "preset.mainTitle": "Ajustes preestablecidos",
        "preset.mainDescription": "Configuraciones profesionales de un solo clic para maximizar el rendimiento del sistema.",
        "preset.bulkActionsTitle": "Acciones masivas",
        "preset.showDescriptions": "Mostrar descripciones",
        "preset.hideDescriptions": "Ocultar descripciones",
        "hero.term.preview": "Vista previa del script",
        "hero.term.replay": "Clic para repetir",
        "hero.term.cmd1": "Desactivando telemetr\u00eda",
        "hero.term.cmd2": "Limpiando archivos temporales",
        "hero.term.cmd3": "Desactivando apps en segundo plano",
        "hero.term.cmd4": "Optimizando servicios",
        "hero.term.cmd5": "Configurando privacidad",
        "hero.term.allDone": "Todas las tareas completadas",
        "hero.term.thanks": "\u00a1Gracias por usar OptWin!"
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
        "beforeAfter.after.title": "Avec OptWin",
        "preset.mainTitle": "Préréglages",
        "preset.mainDescription": "Configurations professionnelles en un clic pour maximiser les performances de votre système.",
        "preset.bulkActionsTitle": "Actions groupées",
        "preset.showDescriptions": "Afficher les descriptions",
        "preset.hideDescriptions": "Masquer les descriptions",
        "hero.term.preview": "Aper\u00e7u du script",
        "hero.term.replay": "Cliquer pour rejouer",
        "hero.term.cmd1": "D\u00e9sactivation de la t\u00e9l\u00e9m\u00e9trie",
        "hero.term.cmd2": "Nettoyage des fichiers temporaires",
        "hero.term.cmd3": "D\u00e9sactivation des apps en arri\u00e8re-plan",
        "hero.term.cmd4": "Optimisation des services",
        "hero.term.cmd5": "Configuration de la confidentialit\u00e9",
        "hero.term.allDone": "Toutes les t\u00e2ches termin\u00e9es",
        "hero.term.thanks": "Merci d'utiliser OptWin !"
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
        "beforeAfter.after.title": "使用 OptWin",
        "preset.mainTitle": "预设",
        "preset.mainDescription": "专业制作的一键配置，可最大限度地提高系统性能。",
        "preset.bulkActionsTitle": "批量操作",
        "preset.showDescriptions": "显示描述",
        "preset.hideDescriptions": "隐藏描述",
        "hero.term.preview": "脚本预览",
        "hero.term.replay": "点击重播",
        "hero.term.cmd1": "禁用遥测",
        "hero.term.cmd2": "清除临时文件",
        "hero.term.cmd3": "禁用后台应用",
        "hero.term.cmd4": "优化服务",
        "hero.term.cmd5": "配置隐私设置",
        "hero.term.allDone": "所有任务已完成",
        "hero.term.thanks": "感谢您使用 OptWin！"
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
        "beforeAfter.after.title": "OptWin के साथ",
        "preset.mainTitle": "प्रीसेट्स",
        "preset.mainDescription": "आपके सिस्टम के प्रदर्शन को अधिकतम करने के लिए पेशेवर रूप से तैयार किए गए वन-क्लिक कॉन्फ़िगरेशन।",
        "preset.bulkActionsTitle": "थोक क्रियाएं",
        "preset.showDescriptions": "विवरण दिखाएं",
        "preset.hideDescriptions": "विवरण छुपाएं",
        "hero.term.preview": "स्क्रिप्ट पूर्वावलोकन",
        "hero.term.replay": "फिर से चलाने के लिए क्लिक करें",
        "hero.term.cmd1": "टेलीमेट्री अक्षम कर रहा है",
        "hero.term.cmd2": "अस्थायी फ़ाइलें साफ़ कर रहा है",
        "hero.term.cmd3": "पृष्ठभूमि ऐप्स अक्षम कर रहा है",
        "hero.term.cmd4": "सेवाओं का अनुकूलन",
        "hero.term.cmd5": "गोपनीयता कॉन्फ़िगर कर रहा है",
        "hero.term.allDone": "सभी कार्य पूरे",
        "hero.term.thanks": "OptWin का उपयोग करने के लिए धन्यवाद!"
    }
};

async function main() {
    console.log("Merging translations into Language model JSON field...");
    
    for (const [langCode, newTranslations] of Object.entries(terminalTranslations)) {
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
        
        console.log(`Updated translations for ${langCode}.`);
        
        // Remove from cache
        await redisClient.del(`optwin:translations:${langCode}`);
    }

    console.log("Translation merge and cache invalidation completed!");
    process.exit(0);
}

main().catch(console.error);
