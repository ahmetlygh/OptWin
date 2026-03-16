import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

async function checkAdmin() {
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session?.user || !(session as any).isAdmin) return false;
    return true;
}

// All values MUST be ASCII-safe (no Turkish/accented chars) for PowerShell compatibility
const DEFAULTS: Record<string, Record<string, string>> = {
    en: {
        scriptTitle: "OptWin -- Windows Optimization Script",
        version: "Version",
        versionNumber: "1.3.0",
        date: "Date",
        developer: "Developer",
        developerName: "ahmetly",
        website: "Website",
        websiteUrl: "https://optwin.tech",
        githubUrl: "https://github.com/ahmetlygh/optwin",
        openSource: "Open-source & free -- review every command",
        bannerTitle: "Windows Optimization Tool",
        openSourceShort: "Open-source & free",
        adminRequest: "Administrator privileges are required.",
        adminPrompt: "Please confirm the UAC prompt.",
        adminError: "Failed to get admin privileges.",
        adminHint: "Try right-clicking and select 'Run as administrator'.",
        restorePoint: "Creating system restore point...",
        restoreSuccess: "Restore point created successfully.",
        restoreFail: "Could not create restore point (skipped).",
        done: "Done",
        complete: "Optimization Complete!",
        success: "Restart your computer for best results.",
        thankYou: "Thank you for using OptWin!",
        author: "by ahmetly -- https://optwin.tech",
        pressAnyKey: "Press any key to exit...",
    },
    tr: {
        scriptTitle: "OptWin -- Windows Optimizasyon Scripti",
        version: "Versiyon",
        versionNumber: "1.3.0",
        date: "Tarih",
        developer: "Gelistirici",
        developerName: "ahmetly",
        website: "Website",
        websiteUrl: "https://optwin.tech",
        githubUrl: "https://github.com/ahmetlygh/optwin",
        openSource: "Acik kaynak & ucretsiz -- her komutu inceleyin",
        bannerTitle: "Windows Optimizasyon Araci",
        openSourceShort: "Acik kaynak & ucretsiz",
        adminRequest: "Yonetici yetkileri gereklidir.",
        adminPrompt: "Lutfen UAC istemini onaylayin.",
        adminError: "Yonetici yetkisi alinamadi.",
        adminHint: "Sag tiklayip 'Yonetici olarak calistir' secenegini deneyin.",
        restorePoint: "Sistem geri yukleme noktasi olusturuluyor...",
        restoreSuccess: "Geri yukleme noktasi basariyla olusturuldu.",
        restoreFail: "Geri yukleme noktasi olusturulamadi (atlandi).",
        done: "Tamamlandi",
        complete: "Optimizasyon Tamamlandi!",
        success: "En iyi sonuclar icin bilgisayarinizi yeniden baslatin.",
        thankYou: "OptWin kullandiginiz icin tesekkurler!",
        author: "ahmetly tarafindan -- https://optwin.tech",
        pressAnyKey: "Cikmak icin bir tusa basin...",
    },
    de: {
        scriptTitle: "OptWin -- Windows Optimierungs-Skript",
        version: "Version",
        versionNumber: "1.3.0",
        date: "Datum",
        developer: "Entwickler",
        developerName: "ahmetly",
        website: "Webseite",
        websiteUrl: "https://optwin.tech",
        githubUrl: "https://github.com/ahmetlygh/optwin",
        openSource: "Open-Source & kostenlos -- jeden Befehl pruefen",
        bannerTitle: "Windows Optimierungswerkzeug",
        openSourceShort: "Open-Source & kostenlos",
        adminRequest: "Administratorrechte sind erforderlich.",
        adminPrompt: "Bitte bestaetigen Sie die UAC-Abfrage.",
        adminError: "Administratorrechte konnten nicht erhalten werden.",
        adminHint: "Rechtsklick und 'Als Administrator ausfuehren' waehlen.",
        restorePoint: "Systemwiederherstellungspunkt wird erstellt...",
        restoreSuccess: "Wiederherstellungspunkt erfolgreich erstellt.",
        restoreFail: "Wiederherstellungspunkt konnte nicht erstellt werden (uebersprungen).",
        done: "Fertig",
        complete: "Optimierung abgeschlossen!",
        success: "Starten Sie Ihren Computer fuer beste Ergebnisse neu.",
        thankYou: "Danke, dass Sie OptWin verwenden!",
        author: "von ahmetly -- https://optwin.tech",
        pressAnyKey: "Druecken Sie eine beliebige Taste zum Beenden...",
    },
    es: {
        scriptTitle: "OptWin -- Script de Optimizacion de Windows",
        version: "Version",
        versionNumber: "1.3.0",
        date: "Fecha",
        developer: "Desarrollador",
        developerName: "ahmetly",
        website: "Sitio web",
        websiteUrl: "https://optwin.tech",
        githubUrl: "https://github.com/ahmetlygh/optwin",
        openSource: "Codigo abierto y gratuito -- revisa cada comando",
        bannerTitle: "Herramienta de Optimizacion de Windows",
        openSourceShort: "Codigo abierto y gratuito",
        adminRequest: "Se requieren privilegios de administrador.",
        adminPrompt: "Por favor confirme el aviso UAC.",
        adminError: "No se pudieron obtener privilegios de administrador.",
        adminHint: "Clic derecho y 'Ejecutar como administrador'.",
        restorePoint: "Creando punto de restauracion del sistema...",
        restoreSuccess: "Punto de restauracion creado exitosamente.",
        restoreFail: "No se pudo crear el punto de restauracion (omitido).",
        done: "Listo",
        complete: "Optimizacion Completada!",
        success: "Reinicie su computadora para mejores resultados.",
        thankYou: "Gracias por usar OptWin!",
        author: "por ahmetly -- https://optwin.tech",
        pressAnyKey: "Presione cualquier tecla para salir...",
    },
    fr: {
        scriptTitle: "OptWin -- Script d'Optimisation Windows",
        version: "Version",
        versionNumber: "1.3.0",
        date: "Date",
        developer: "Developpeur",
        developerName: "ahmetly",
        website: "Site web",
        websiteUrl: "https://optwin.tech",
        githubUrl: "https://github.com/ahmetlygh/optwin",
        openSource: "Open-source & gratuit -- verifiez chaque commande",
        bannerTitle: "Outil d'Optimisation Windows",
        openSourceShort: "Open-source & gratuit",
        adminRequest: "Les privileges administrateur sont requis.",
        adminPrompt: "Veuillez confirmer l'invite UAC.",
        adminError: "Impossible d'obtenir les privileges administrateur.",
        adminHint: "Clic droit et 'Executer en tant qu'administrateur'.",
        restorePoint: "Creation du point de restauration...",
        restoreSuccess: "Point de restauration cree avec succes.",
        restoreFail: "Impossible de creer le point de restauration (ignore).",
        done: "Termine",
        complete: "Optimisation terminee!",
        success: "Redemarrez votre ordinateur pour de meilleurs resultats.",
        thankYou: "Merci d'utiliser OptWin!",
        author: "par ahmetly -- https://optwin.tech",
        pressAnyKey: "Appuyez sur une touche pour quitter...",
    },
    hi: {
        scriptTitle: "OptWin -- Windows Optimization Script",
        version: "Version",
        versionNumber: "1.3.0",
        date: "Date",
        developer: "Developer",
        developerName: "ahmetly",
        website: "Website",
        websiteUrl: "https://optwin.tech",
        githubUrl: "https://github.com/ahmetlygh/optwin",
        openSource: "Open-source & free -- review every command",
        bannerTitle: "Windows Optimization Tool",
        openSourceShort: "Open-source & free",
        adminRequest: "Administrator privileges are required.",
        adminPrompt: "Please confirm the UAC prompt.",
        adminError: "Failed to get admin privileges.",
        adminHint: "Try right-clicking and select 'Run as administrator'.",
        restorePoint: "Creating system restore point...",
        restoreSuccess: "Restore point created successfully.",
        restoreFail: "Could not create restore point (skipped).",
        done: "Done",
        complete: "Optimization Complete!",
        success: "Restart your computer for best results.",
        thankYou: "Thank you for using OptWin!",
        author: "by ahmetly -- https://optwin.tech",
        pressAnyKey: "Press any key to exit...",
    },
    zh: {
        scriptTitle: "OptWin -- Windows Optimization Script",
        version: "Version",
        versionNumber: "1.3.0",
        date: "Date",
        developer: "Developer",
        developerName: "ahmetly",
        website: "Website",
        websiteUrl: "https://optwin.tech",
        githubUrl: "https://github.com/ahmetlygh/optwin",
        openSource: "Open-source & free -- review every command",
        bannerTitle: "Windows Optimization Tool",
        openSourceShort: "Open-source & free",
        adminRequest: "Administrator privileges are required.",
        adminPrompt: "Please confirm the UAC prompt.",
        adminError: "Failed to get admin privileges.",
        adminHint: "Try right-clicking and select 'Run as administrator'.",
        restorePoint: "Creating system restore point...",
        restoreSuccess: "Restore point created successfully.",
        restoreFail: "Could not create restore point (skipped).",
        done: "Done",
        complete: "Optimization Complete!",
        success: "Restart your computer for best results.",
        thankYou: "Thank you for using OptWin!",
        author: "by ahmetly -- https://optwin.tech",
        pressAnyKey: "Press any key to exit...",
    },
};

// POST /api/admin/script-labels/reset — wipe all labels and seed with correct defaults
export async function POST() {
    if (!(await checkAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Delete all existing labels
        await prisma.scriptLabel.deleteMany({});

        // Insert all defaults
        const records: { lang: string; key: string; value: string }[] = [];
        for (const [lang, labels] of Object.entries(DEFAULTS)) {
            for (const [key, value] of Object.entries(labels)) {
                records.push({ lang, key, value });
            }
        }

        await prisma.scriptLabel.createMany({ data: records });

        return NextResponse.json({
            success: true,
            message: `Reset complete: ${records.length} labels across ${Object.keys(DEFAULTS).length} languages`,
        });
    } catch (error) {
        console.error("Reset script labels error:", error);
        return NextResponse.json({ error: "Failed to reset script labels" }, { status: 500 });
    }
}
