/**
 * Seed script: Add FeatureCommand rows for de, fr, es, zh, hi languages.
 * EN and TR already seeded by seed-commands.ts.
 * Run with: npx tsx prisma/seed-commands-all-langs.ts
 *
 * PowerShell commands are language-independent (same for all).
 * Only scriptMessage differs per language.
 * Chinese and Hindi use English fallback for PowerShell console compatibility.
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// All feature slugs — same PowerShell commands as EN (already in DB)
const featureSlugs = [
    "cleanTemp", "cleanPrefetch", "recycleBin", "disableHibernate",
    "systemFileCheck", "disableTelemetry", "disableGameDVR", "highPerformance",
    "ultimatePerformance", "flushDNS", "changeDNS", "dismCheck", "dismRepair",
    "disableSticky", "disableNotifications", "networkReset", "cleanEventLog",
    "updateCacheClean", "disablePrintSpooler", "disableSearch", "disableThrottling",
    "disableBingSearch", "showExtensions", "showHiddenFiles", "disableWallet",
    "disableMaps", "disableDiagTrack", "disableFax", "disableWer", "disableTouch",
    "disableXbox", "disableMouseAccel", "disableTransparency", "disableCortana",
    "disableOneDrive", "clearBrowserCache", "disableBackgroundApps",
    "enableGpuScheduling", "disableLocation", "disableClipboardHistory",
    "disableActivityHistory", "disableNewsInterests", "disableNagle",
    "disableAutoTuning", "clearArpCache", "enableQoS", "disableLSO",
    "disableStartupDelay", "disableSuperfetch", "clearIconCache", "clearThumbsCache",
    "disableRemoteAssistance", "disableDeliveryOptimization", "disableP2PUpdate",
    "disableTimeline", "disableAdvertisingId", "disableAnimations",
    "disableWindowsTips", "disableWindowsSpotlight", "optimizeVisualEffects",
    "disableLockScreenTips", "disableGameBar",
];

// ===== SCRIPT MESSAGES PER LANGUAGE =====
// German (ASCII-safe for PowerShell)
const de: Record<string, string> = {
    cleanTemp: "Temporaere Dateien werden bereinigt...",
    cleanPrefetch: "Prefetch wird bereinigt...",
    recycleBin: "Papierkorb wird geleert...",
    disableHibernate: "Ruhezustand wird deaktiviert...",
    systemFileCheck: "Systemdatei-Ueberpruefung wird ausgefuehrt...",
    disableTelemetry: "Telemetrie wird deaktiviert...",
    disableGameDVR: "Game DVR wird deaktiviert...",
    highPerformance: "Hoechstleistungs-Energieplan wird eingestellt...",
    ultimatePerformance: "Ultimative Leistung wird aktiviert...",
    flushDNS: "DNS-Cache wird geleert...",
    changeDNS: "DNS-Server werden geaendert...",
    dismCheck: "DISM-Integritaetspruefung wird ausgefuehrt...",
    dismRepair: "DISM-Reparatur wird ausgefuehrt...",
    disableSticky: "Einrastfunktion wird deaktiviert...",
    disableNotifications: "Benachrichtigungen werden deaktiviert...",
    networkReset: "Netzwerk-Stack wird zurueckgesetzt...",
    cleanEventLog: "Ereignisprotokolle werden geloescht...",
    updateCacheClean: "Windows-Update-Cache wird bereinigt...",
    disablePrintSpooler: "Druckdienst wird deaktiviert...",
    disableSearch: "Windows-Suche wird deaktiviert...",
    disableThrottling: "Netzwerk-Drosselung wird deaktiviert...",
    disableBingSearch: "Bing-Suche wird deaktiviert...",
    showExtensions: "Dateierweiterungen werden angezeigt...",
    showHiddenFiles: "Versteckte Dateien werden angezeigt...",
    disableWallet: "Wallet-Dienst wird deaktiviert...",
    disableMaps: "Karten-Broker wird deaktiviert...",
    disableDiagTrack: "DiagTrack wird deaktiviert...",
    disableFax: "Fax-Dienst wird deaktiviert...",
    disableWer: "Fehlerberichterstattung wird deaktiviert...",
    disableTouch: "Touch-Tastatur wird deaktiviert...",
    disableXbox: "Xbox-Dienste werden deaktiviert...",
    disableMouseAccel: "Mausbeschleunigung wird deaktiviert...",
    disableTransparency: "Transparenzeffekte werden deaktiviert...",
    disableCortana: "Cortana wird deaktiviert...",
    disableOneDrive: "OneDrive wird deaktiviert...",
    clearBrowserCache: "Browser-Cache wird geloescht...",
    disableBackgroundApps: "Hintergrund-Apps werden deaktiviert...",
    enableGpuScheduling: "Hardware-GPU-Planung wird aktiviert...",
    disableLocation: "Ortungsdienste werden deaktiviert...",
    disableClipboardHistory: "Zwischenablage-Verlauf wird deaktiviert...",
    disableActivityHistory: "Aktivitaetsverlauf wird deaktiviert...",
    disableNewsInterests: "Nachrichten und Interessen werden deaktiviert...",
    disableNagle: "Nagle-Algorithmus wird deaktiviert (reduziert Latenz)...",
    disableAutoTuning: "TCP Auto-Tuning wird deaktiviert...",
    clearArpCache: "ARP-Cache wird geleert...",
    enableQoS: "QoS-Paketplaner wird aktiviert...",
    disableLSO: "Large Send Offload (LSO) wird deaktiviert...",
    disableStartupDelay: "Startverzoegerung wird deaktiviert...",
    disableSuperfetch: "Superfetch/SysMain wird deaktiviert...",
    clearIconCache: "Symbol-Cache wird geloescht...",
    clearThumbsCache: "Miniaturansicht-Cache wird geloescht...",
    disableRemoteAssistance: "Remoteunterstuetzung wird deaktiviert...",
    disableDeliveryOptimization: "Uebermittlungsoptimierung wird deaktiviert...",
    disableP2PUpdate: "P2P-Updates werden deaktiviert...",
    disableTimeline: "Zeitachse wird deaktiviert...",
    disableAdvertisingId: "Werbe-ID wird deaktiviert...",
    disableAnimations: "Animationen werden deaktiviert...",
    disableWindowsTips: "Windows-Tipps werden deaktiviert...",
    disableWindowsSpotlight: "Windows Spotlight wird deaktiviert...",
    optimizeVisualEffects: "Visuelle Effekte werden optimiert...",
    disableLockScreenTips: "Sperrbildschirm-Tipps werden deaktiviert...",
    disableGameBar: "Game Bar wird deaktiviert...",
};

// French (ASCII-safe)
const fr: Record<string, string> = {
    cleanTemp: "Nettoyage des fichiers temporaires...",
    cleanPrefetch: "Nettoyage du Prefetch...",
    recycleBin: "Vidage de la Corbeille...",
    disableHibernate: "Desactivation de la mise en veille prolongee...",
    systemFileCheck: "Verification des fichiers systeme en cours...",
    disableTelemetry: "Desactivation de la telemetrie...",
    disableGameDVR: "Desactivation du Game DVR...",
    highPerformance: "Activation du mode Hautes performances...",
    ultimatePerformance: "Activation des Performances ultimes...",
    flushDNS: "Vidage du cache DNS...",
    changeDNS: "Modification des serveurs DNS...",
    dismCheck: "Verification de l'integrite DISM...",
    dismRepair: "Reparation DISM en cours...",
    disableSticky: "Desactivation des touches remanentes...",
    disableNotifications: "Desactivation des notifications...",
    networkReset: "Reinitialisation de la pile reseau...",
    cleanEventLog: "Nettoyage des journaux d'evenements...",
    updateCacheClean: "Nettoyage du cache Windows Update...",
    disablePrintSpooler: "Desactivation du spouleur d'impression...",
    disableSearch: "Desactivation de la recherche Windows...",
    disableThrottling: "Desactivation de la limitation reseau...",
    disableBingSearch: "Desactivation de la recherche Bing...",
    showExtensions: "Affichage des extensions de fichiers...",
    showHiddenFiles: "Affichage des fichiers caches...",
    disableWallet: "Desactivation du service Wallet...",
    disableMaps: "Desactivation du service Cartes...",
    disableDiagTrack: "Desactivation de DiagTrack...",
    disableFax: "Desactivation du service Fax...",
    disableWer: "Desactivation du rapport d'erreurs...",
    disableTouch: "Desactivation du clavier tactile...",
    disableXbox: "Desactivation des services Xbox...",
    disableMouseAccel: "Desactivation de l'acceleration de la souris...",
    disableTransparency: "Desactivation des effets de transparence...",
    disableCortana: "Desactivation de Cortana...",
    disableOneDrive: "Desactivation de OneDrive...",
    clearBrowserCache: "Nettoyage du cache du navigateur...",
    disableBackgroundApps: "Desactivation des applications en arriere-plan...",
    enableGpuScheduling: "Activation de la planification GPU materielle...",
    disableLocation: "Desactivation des services de localisation...",
    disableClipboardHistory: "Desactivation de l'historique du presse-papiers...",
    disableActivityHistory: "Desactivation de l'historique des activites...",
    disableNewsInterests: "Desactivation des actualites et centres d'interet...",
    disableNagle: "Desactivation de l'algorithme de Nagle (reduit la latence)...",
    disableAutoTuning: "Desactivation du TCP Auto-Tuning...",
    clearArpCache: "Vidage du cache ARP...",
    enableQoS: "Activation du planificateur de paquets QoS...",
    disableLSO: "Desactivation du Large Send Offload (LSO)...",
    disableStartupDelay: "Desactivation du delai de demarrage...",
    disableSuperfetch: "Desactivation de Superfetch/SysMain...",
    clearIconCache: "Nettoyage du cache d'icones...",
    clearThumbsCache: "Nettoyage du cache des miniatures...",
    disableRemoteAssistance: "Desactivation de l'assistance a distance...",
    disableDeliveryOptimization: "Desactivation de l'optimisation de livraison...",
    disableP2PUpdate: "Desactivation des mises a jour P2P...",
    disableTimeline: "Desactivation de la chronologie...",
    disableAdvertisingId: "Desactivation de l'identifiant publicitaire...",
    disableAnimations: "Desactivation des animations...",
    disableWindowsTips: "Desactivation des conseils Windows...",
    disableWindowsSpotlight: "Desactivation de Windows Spotlight...",
    optimizeVisualEffects: "Optimisation des effets visuels...",
    disableLockScreenTips: "Desactivation des conseils de l'ecran de verrouillage...",
    disableGameBar: "Desactivation de la Game Bar...",
};

// Spanish (ASCII-safe)
const es: Record<string, string> = {
    cleanTemp: "Limpiando archivos temporales...",
    cleanPrefetch: "Limpiando Prefetch...",
    recycleBin: "Vaciando la Papelera de reciclaje...",
    disableHibernate: "Desactivando hibernacion...",
    systemFileCheck: "Ejecutando comprobacion de archivos del sistema...",
    disableTelemetry: "Desactivando telemetria...",
    disableGameDVR: "Desactivando Game DVR...",
    highPerformance: "Configurando plan de energia de alto rendimiento...",
    ultimatePerformance: "Activando rendimiento maximo...",
    flushDNS: "Limpiando cache DNS...",
    changeDNS: "Cambiando servidores DNS...",
    dismCheck: "Ejecutando verificacion de integridad DISM...",
    dismRepair: "Ejecutando reparacion DISM...",
    disableSticky: "Desactivando teclas especiales...",
    disableNotifications: "Desactivando notificaciones...",
    networkReset: "Restableciendo pila de red...",
    cleanEventLog: "Limpiando registros de eventos...",
    updateCacheClean: "Limpiando cache de Windows Update...",
    disablePrintSpooler: "Desactivando servicio de impresion...",
    disableSearch: "Desactivando busqueda de Windows...",
    disableThrottling: "Desactivando limitacion de red...",
    disableBingSearch: "Desactivando busqueda de Bing...",
    showExtensions: "Mostrando extensiones de archivos...",
    showHiddenFiles: "Mostrando archivos ocultos...",
    disableWallet: "Desactivando servicio de Wallet...",
    disableMaps: "Desactivando servicio de Mapas...",
    disableDiagTrack: "Desactivando DiagTrack...",
    disableFax: "Desactivando servicio de Fax...",
    disableWer: "Desactivando informe de errores...",
    disableTouch: "Desactivando teclado tactil...",
    disableXbox: "Desactivando servicios de Xbox...",
    disableMouseAccel: "Desactivando aceleracion del raton...",
    disableTransparency: "Desactivando efectos de transparencia...",
    disableCortana: "Desactivando Cortana...",
    disableOneDrive: "Desactivando OneDrive...",
    clearBrowserCache: "Limpiando cache del navegador...",
    disableBackgroundApps: "Desactivando aplicaciones en segundo plano...",
    enableGpuScheduling: "Activando programacion de GPU por hardware...",
    disableLocation: "Desactivando servicios de ubicacion...",
    disableClipboardHistory: "Desactivando historial del portapapeles...",
    disableActivityHistory: "Desactivando historial de actividad...",
    disableNewsInterests: "Desactivando noticias e intereses...",
    disableNagle: "Desactivando algoritmo de Nagle (reduce latencia)...",
    disableAutoTuning: "Desactivando TCP Auto-Tuning...",
    clearArpCache: "Limpiando cache ARP...",
    enableQoS: "Activando planificador de paquetes QoS...",
    disableLSO: "Desactivando Large Send Offload (LSO)...",
    disableStartupDelay: "Desactivando retraso de inicio...",
    disableSuperfetch: "Desactivando Superfetch/SysMain...",
    clearIconCache: "Limpiando cache de iconos...",
    clearThumbsCache: "Limpiando cache de miniaturas...",
    disableRemoteAssistance: "Desactivando asistencia remota...",
    disableDeliveryOptimization: "Desactivando optimizacion de entrega...",
    disableP2PUpdate: "Desactivando actualizaciones P2P...",
    disableTimeline: "Desactivando linea de tiempo...",
    disableAdvertisingId: "Desactivando ID de publicidad...",
    disableAnimations: "Desactivando animaciones...",
    disableWindowsTips: "Desactivando consejos de Windows...",
    disableWindowsSpotlight: "Desactivando Windows Spotlight...",
    optimizeVisualEffects: "Optimizando efectos visuales...",
    disableLockScreenTips: "Desactivando sugerencias de pantalla de bloqueo...",
    disableGameBar: "Desactivando Game Bar...",
};

// Chinese (UTF-8, chcp 65001 is set in batch header)
const zh: Record<string, string> = {
    cleanTemp: "Cleaning temporary files...",
    cleanPrefetch: "Cleaning Prefetch...",
    recycleBin: "Emptying Recycle Bin...",
    disableHibernate: "Disabling Hibernate...",
    systemFileCheck: "Running System File Checker...",
    disableTelemetry: "Disabling Telemetry...",
    disableGameDVR: "Disabling Game DVR...",
    highPerformance: "Setting High Performance power plan...",
    ultimatePerformance: "Enabling Ultimate Performance...",
    flushDNS: "Flushing DNS cache...",
    changeDNS: "Changing DNS servers...",
    dismCheck: "Running DISM Health Check...",
    dismRepair: "Running DISM Restore Health...",
    disableSticky: "Disabling Sticky Keys...",
    disableNotifications: "Disabling Notifications...",
    networkReset: "Resetting Network Stack...",
    cleanEventLog: "Clearing Event Logs...",
    updateCacheClean: "Cleaning Windows Update Cache...",
    disablePrintSpooler: "Disabling Print Spooler...",
    disableSearch: "Disabling Windows Search...",
    disableThrottling: "Disabling Network Throttling...",
    disableBingSearch: "Disabling Bing Search...",
    showExtensions: "Showing File Extensions...",
    showHiddenFiles: "Showing Hidden Files...",
    disableWallet: "Disabling Wallet Service...",
    disableMaps: "Disabling Maps Broker...",
    disableDiagTrack: "Disabling DiagTrack...",
    disableFax: "Disabling Fax Service...",
    disableWer: "Disabling Error Reporting...",
    disableTouch: "Disabling Touch Keyboard...",
    disableXbox: "Disabling Xbox Services...",
    disableMouseAccel: "Disabling Mouse Acceleration...",
    disableTransparency: "Disabling Transparency Effects...",
    disableCortana: "Disabling Cortana...",
    disableOneDrive: "Disabling OneDrive...",
    clearBrowserCache: "Clearing Browser Cache...",
    disableBackgroundApps: "Disabling Background Apps...",
    enableGpuScheduling: "Enabling Hardware GPU Scheduling...",
    disableLocation: "Disabling Location Services...",
    disableClipboardHistory: "Disabling Clipboard History...",
    disableActivityHistory: "Disabling Activity History...",
    disableNewsInterests: "Disabling News and Interests...",
    disableNagle: "Disabling Nagle Algorithm (reduces latency)...",
    disableAutoTuning: "Disabling TCP Auto-Tuning...",
    clearArpCache: "Clearing ARP Cache...",
    enableQoS: "Enabling QoS Packet Scheduler...",
    disableLSO: "Disabling Large Send Offload (LSO)...",
    disableStartupDelay: "Disabling Startup Delay...",
    disableSuperfetch: "Disabling Superfetch/SysMain...",
    clearIconCache: "Clearing Icon Cache...",
    clearThumbsCache: "Clearing Thumbnail Cache...",
    disableRemoteAssistance: "Disabling Remote Assistance...",
    disableDeliveryOptimization: "Disabling Delivery Optimization...",
    disableP2PUpdate: "Disabling P2P Updates...",
    disableTimeline: "Disabling Timeline...",
    disableAdvertisingId: "Disabling Advertising ID...",
    disableAnimations: "Disabling Animations...",
    disableWindowsTips: "Disabling Windows Tips...",
    disableWindowsSpotlight: "Disabling Windows Spotlight...",
    optimizeVisualEffects: "Optimizing Visual Effects...",
    disableLockScreenTips: "Disabling Lock Screen Tips...",
    disableGameBar: "Disabling Game Bar...",
};

// Hindi (falls back to English for PowerShell console compatibility)
const hi: Record<string, string> = { ...zh };

const allMessages: Record<string, Record<string, string>> = { de, fr, es, zh, hi };

async function main() {
    const langs = Object.keys(allMessages);
    console.log(`Seeding feature commands for ${langs.join(", ")}...`);

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const slug of featureSlugs) {
        const feature = await prisma.feature.findUnique({ where: { slug } });
        if (!feature) {
            console.warn(`  ⚠ Feature "${slug}" not found — skipping`);
            skipped++;
            continue;
        }

        // Get the EN command as the base (PowerShell code is language-independent)
        const enCommand = await prisma.featureCommand.findUnique({
            where: { featureId_lang: { featureId: feature.id, lang: "en" } },
        });
        if (!enCommand) {
            console.warn(`  ⚠ No EN command for "${slug}" — skipping`);
            skipped++;
            continue;
        }

        for (const lang of langs) {
            const scriptMessage = allMessages[lang][slug] || allMessages.zh[slug] || enCommand.scriptMessage;

            const existing = await prisma.featureCommand.findUnique({
                where: { featureId_lang: { featureId: feature.id, lang } },
            });

            if (existing) {
                await prisma.featureCommand.update({
                    where: { id: existing.id },
                    data: { command: enCommand.command, scriptMessage },
                });
                updated++;
            } else {
                await prisma.featureCommand.create({
                    data: {
                        featureId: feature.id,
                        lang,
                        command: enCommand.command,
                        scriptMessage,
                    },
                });
                created++;
            }
        }
        console.log(`  ✓ ${slug}`);
    }

    console.log(`\nDone! Created: ${created}, Updated: ${updated}, Skipped: ${skipped}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
