import { prisma } from "./db";

type ScriptParams = {
    features: string[];
    dnsProvider?: string | null;
    lang: string;
    createRestorePoint?: boolean;
};

type ScriptLabels = {
    scriptTitle: string;
    version: string;
    date: string;
    developer: string;
    website: string;
    openSource: string;
    bannerTitle: string;
    openSourceShort: string;
    adminRequest: string;
    adminPrompt: string;
    adminError: string;
    adminHint: string;
    pressAnyKey: string;
    restorePoint: string;
    restoreSuccess: string;
    restoreFail: string;
    complete: string;
    success: string;
    thankYou: string;
    author: string;
    done: string;
};

const allLabels: Record<string, ScriptLabels> = {
    en: {
        scriptTitle: 'OptWin - Windows Optimization Script',
        version: 'Version',
        date: 'Date',
        developer: 'Developer',
        website: 'Website',
        openSource: 'This script is open source and free to use.',
        bannerTitle: 'Windows Optimization Script',
        openSourceShort: 'Open Source | Free to Use',
        adminRequest: '[INFO] Requesting Administrator privileges...',
        adminPrompt: 'Please click Yes on the UAC prompt.',
        adminError: '[ERROR] Could not elevate to Administrator.',
        adminHint: 'Please right-click the script and select Run with PowerShell',
        pressAnyKey: 'Press any key to exit...',
        restorePoint: 'Creating System Restore Point...',
        restoreSuccess: 'Restore point created successfully.',
        restoreFail: 'Failed to create restore point. Check system settings.',
        complete: 'OPTIMIZATION COMPLETE',
        success: 'System reboot is recommended to apply all changes.',
        thankYou: 'Thank you for using OptWin!',
        author: 'Developed by ahmetly_',
        done: 'Done',
    },
    tr: {
        scriptTitle: 'OptWin - Windows Optimizasyon Scripti',
        version: 'Versiyon',
        date: 'Tarih',
        developer: 'Gelistirici',
        website: 'Website',
        openSource: 'Bu script acik kaynaklidir ve ucretsiz kullanilabilir.',
        bannerTitle: 'Windows Optimizasyon Scripti',
        openSourceShort: 'Acik Kaynak | Ucretsiz',
        adminRequest: '[BILGI] Yonetici izni isteniyor...',
        adminPrompt: 'Lutfen UAC penceresinde Evet i tiklayin.',
        adminError: '[HATA] Yonetici olarak calistirilamadi.',
        adminHint: 'Lutfen scripte sag tiklayin ve PowerShell ile Calistir secin',
        pressAnyKey: 'Cikmak icin herhangi bir tusa basin...',
        restorePoint: 'Sistem Geri Yukleme Noktasi olusturuluyor...',
        restoreSuccess: 'Geri yukleme noktasi basariyla olusturuldu.',
        restoreFail: 'Geri yukleme noktasi olusturulamadi. Sistem ayarlarini kontrol edin.',
        complete: 'OPTIMIZASYON TAMAMLANDI',
        success: 'Tum degisikliklerin uygulanmasi icin sistemi yeniden baslatmaniz onerilir.',
        thankYou: 'OptWin i kullandiginiz icin tesekkurler!',
        author: 'ahmetly_ tarafindan gelistirildi',
        done: 'Tamamlandi',
    },
    zh: {
        scriptTitle: 'OptWin - Windows 优化脚本',
        version: '版本',
        date: '日期',
        developer: '开发者',
        website: '网站',
        openSource: '此脚本是开源的，可免费使用。',
        bannerTitle: 'Windows 优化脚本',
        openSourceShort: '开源 | 免费使用',
        adminRequest: '[信息] 正在请求管理员权限...',
        adminPrompt: '请在 UAC 提示中点击"是"。',
        adminError: '[错误] 无法提升为管理员。',
        adminHint: '请右键点击脚本并选择"使用 PowerShell 运行"',
        pressAnyKey: '按任意键退出...',
        restorePoint: '正在创建系统还原点...',
        restoreSuccess: '还原点创建成功。',
        restoreFail: '创建还原点失败。请检查系统设置。',
        complete: '优化完成',
        success: '建议重启系统以应用所有更改。',
        thankYou: '感谢您使用 OptWin！',
        author: '由 ahmetly_ 开发',
        done: '完成',
    },
    es: {
        scriptTitle: 'OptWin - Script de Optimización de Windows',
        version: 'Versión',
        date: 'Fecha',
        developer: 'Desarrollador',
        website: 'Sitio Web',
        openSource: 'Este script es de código abierto y de uso gratuito.',
        bannerTitle: 'Script de Optimización de Windows',
        openSourceShort: 'Código Abierto | Uso Gratuito',
        adminRequest: '[INFO] Solicitando privilegios de Administrador...',
        adminPrompt: 'Por favor, haga clic en Sí en el aviso UAC.',
        adminError: '[ERROR] No se pudo elevar a Administrador.',
        adminHint: 'Haga clic derecho en el script y seleccione Ejecutar con PowerShell',
        pressAnyKey: 'Presione cualquier tecla para salir...',
        restorePoint: 'Creando Punto de Restauración del Sistema...',
        restoreSuccess: 'Punto de restauración creado exitosamente.',
        restoreFail: 'Error al crear punto de restauración. Verifique la configuración del sistema.',
        complete: 'OPTIMIZACIÓN COMPLETA',
        success: 'Se recomienda reiniciar el sistema para aplicar todos los cambios.',
        thankYou: '¡Gracias por usar OptWin!',
        author: 'Desarrollado por ahmetly_',
        done: 'Hecho',
    },
    hi: {
        scriptTitle: 'OptWin - Windows ऑप्टिमाइज़ेशन स्क्रिप्ट',
        version: 'संस्करण',
        date: 'तिथि',
        developer: 'डेवलपर',
        website: 'वेबसाइट',
        openSource: 'यह स्क्रिप्ट ओपन सोर्स है और मुफ्त में उपलब्ध है।',
        bannerTitle: 'Windows ऑप्टिमाइज़ेशन स्क्रिप्ट',
        openSourceShort: 'ओपन सोर्स | मुफ्त',
        adminRequest: '[जानकारी] एडमिनिस्ट्रेटर अनुमति का अनुरोध किया जा रहा है...',
        adminPrompt: 'कृपया UAC प्रॉम्प्ट पर हाँ क्लिक करें।',
        adminError: '[त्रुटि] एडमिनिस्ट्रेटर नहीं बन सके।',
        adminHint: 'कृपया स्क्रिप्ट पर राइट-क्लिक करें और PowerShell से चलाएं चुनें',
        pressAnyKey: 'बाहर निकलने के लिए कोई भी कुंजी दबाएं...',
        restorePoint: 'सिस्टम रिस्टोर पॉइंट बनाया जा रहा है...',
        restoreSuccess: 'रिस्टोर पॉइंट सफलतापूर्वक बनाया गया।',
        restoreFail: 'रिस्टोर पॉइंट बनाने में विफल। सिस्टम सेटिंग्स जांचें।',
        complete: 'ऑप्टिमाइज़ेशन पूर्ण',
        success: 'सभी परिवर्तन लागू करने के लिए सिस्टम रीबूट की सिफारिश की जाती है।',
        thankYou: 'OptWin का उपयोग करने के लिए धन्यवाद!',
        author: 'ahmetly_ द्वारा विकसित',
        done: 'पूर्ण',
    },
    de: {
        scriptTitle: 'OptWin - Windows-Optimierungsskript',
        version: 'Version',
        date: 'Datum',
        developer: 'Entwickler',
        website: 'Webseite',
        openSource: 'Dieses Skript ist Open Source und kostenlos nutzbar.',
        bannerTitle: 'Windows-Optimierungsskript',
        openSourceShort: 'Open Source | Kostenlos',
        adminRequest: '[INFO] Administratorrechte werden angefordert...',
        adminPrompt: 'Bitte klicken Sie im UAC-Dialog auf Ja.',
        adminError: '[FEHLER] Konnte nicht als Administrator starten.',
        adminHint: 'Bitte klicken Sie mit der rechten Maustaste auf das Skript und waehlen Sie Mit PowerShell ausfuehren',
        pressAnyKey: 'Druecken Sie eine beliebige Taste zum Beenden...',
        restorePoint: 'Systemwiederherstellungspunkt wird erstellt...',
        restoreSuccess: 'Wiederherstellungspunkt erfolgreich erstellt.',
        restoreFail: 'Wiederherstellungspunkt konnte nicht erstellt werden.',
        complete: 'OPTIMIERUNG ABGESCHLOSSEN',
        success: 'Ein Systemneustart wird empfohlen, um alle Aenderungen anzuwenden.',
        thankYou: 'Vielen Dank fuer die Nutzung von OptWin!',
        author: 'Entwickelt von ahmetly_',
        done: 'Erledigt',
    },
    fr: {
        scriptTitle: 'OptWin - Script d\'Optimisation Windows',
        version: 'Version',
        date: 'Date',
        developer: 'Developpeur',
        website: 'Site Web',
        openSource: 'Ce script est open source et gratuit.',
        bannerTitle: 'Script d\'Optimisation Windows',
        openSourceShort: 'Open Source | Gratuit',
        adminRequest: '[INFO] Demande de privileges Administrateur...',
        adminPrompt: 'Veuillez cliquer sur Oui dans la fenetre UAC.',
        adminError: '[ERREUR] Impossible d\'obtenir les droits Administrateur.',
        adminHint: 'Veuillez faire un clic droit sur le script et selectionnez Executer avec PowerShell',
        pressAnyKey: 'Appuyez sur une touche pour quitter...',
        restorePoint: 'Creation d\'un point de restauration systeme...',
        restoreSuccess: 'Point de restauration cree avec succes.',
        restoreFail: 'Echec de la creation du point de restauration.',
        complete: 'OPTIMISATION TERMINEE',
        success: 'Un redemarrage du systeme est recommande pour appliquer tous les changements.',
        thankYou: 'Merci d\'utiliser OptWin !',
        author: 'Developpe par ahmetly_',
        done: 'Termine',
    },
};

export async function generateScript(params: ScriptParams): Promise<string> {
    const { features, dnsProvider, lang, createRestorePoint } = params;
    const labels = allLabels[lang] || allLabels.en;
    const dateStr = new Date().toLocaleString();

    // The DB commands are stored in en/tr — fallback to en for other languages
    const dbLang = (lang === "en" || lang === "tr") ? lang : "en";

    // Fetch site settings
    const settingsArr = await prisma.siteSetting.findMany({
        where: { key: { in: ["site_version", "contact_email"] } }
    });
    const settings = settingsArr.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as Record<string, string>);
    const version = settings.site_version || "1.3.0";

    let script = '<#\n';
    script += '    ' + labels.scriptTitle + '\n';
    script += '    ' + labels.version + '   : ' + version + '\n';
    script += '    ' + labels.date + '      : ' + dateStr + '\n';
    script += '    ' + labels.developer + ' : ahmetly\n';
    script += '    ' + labels.website + '   : https://optwin.tech\n';
    script += '    GitHub    : https://github.com/ahmetlygh/optwin\n';
    script += '    ' + labels.openSource + '\n';
    script += '#>\n\n';

    // Self-elevation code
    script += '# ===== SELF-ELEVATION =====\n';
    script += '$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)\n\n';
    script += 'if (-not $isAdmin) {\n';
    script += '    Write-Host ""\n';
    script += '    Write-Host "  ' + labels.adminRequest + '" -ForegroundColor Yellow\n';
    script += '    Write-Host "  ' + labels.adminPrompt + '" -ForegroundColor Cyan\n';
    script += '    Write-Host ""\n';
    script += '    $scriptPath = $MyInvocation.MyCommand.Definition\n';
    script += '    try {\n';
    script += '        Start-Process powershell.exe -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`"" -Verb RunAs\n';
    script += '    } catch {\n';
    script += '        Write-Host "  ' + labels.adminError + '" -ForegroundColor Red\n';
    script += '        Write-Host "  ' + labels.adminHint + '" -ForegroundColor Yellow\n';
    script += '        pause\n';
    script += '    }\n';
    script += '    exit\n';
    script += '}\n\n';

    // Set execution policy
    script += 'Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force -ErrorAction SilentlyContinue\n\n';
    script += '$host.UI.RawUI.WindowTitle = "OptWin Optimizer Script"\n\n';

    // Header - Display ASCII Banner
    script += 'Clear-Host\n';
    script += 'Write-Host ""\n';
    script += 'Write-Host "  ================================================================" -ForegroundColor Magenta\n';
    script += 'Write-Host "" -ForegroundColor Magenta\n';
    script += 'Write-Host "       OOOO  PPPP  TTTTT W   W  III  N   N" -ForegroundColor Cyan\n';
    script += 'Write-Host "      O    O P   P   T   W   W   I   NN  N" -ForegroundColor Cyan\n';
    script += 'Write-Host "      O    O PPPP    T   W W W   I   N N N" -ForegroundColor Cyan\n';
    script += 'Write-Host "      O    O P       T   WW WW   I   N  NN" -ForegroundColor Cyan\n';
    script += 'Write-Host "       OOOO  P       T    W W   III  N   N" -ForegroundColor Cyan\n';
    script += 'Write-Host "" -ForegroundColor Magenta\n';
    script += 'Write-Host "  ================================================================" -ForegroundColor Magenta\n';
    script += 'Write-Host "    ' + labels.bannerTitle + '" -ForegroundColor White\n';
    script += 'Write-Host "  ----------------------------------------------------------------" -ForegroundColor DarkGray\n';
    script += 'Write-Host "    ' + labels.version + '   : ' + version + '" -ForegroundColor Gray\n';
    script += 'Write-Host "    ' + labels.date + '      : ' + dateStr + '" -ForegroundColor Gray\n';
    script += 'Write-Host "  ----------------------------------------------------------------" -ForegroundColor DarkGray\n';
    script += 'Write-Host "    ' + labels.openSourceShort + '" -ForegroundColor DarkGray\n';
    script += 'Write-Host "    GitHub: github.com/ahmetlygh/optwin" -ForegroundColor DarkGray\n';
    script += 'Write-Host "  ================================================================" -ForegroundColor Magenta\n';
    script += 'Write-Host ""\n\n';

    // Restore point
    if (createRestorePoint) {
        script += 'Write-Host "  [*] ' + labels.restorePoint + '" -ForegroundColor Cyan\n';
        script += 'try {\n';
        script += '    Enable-ComputerRestore -Drive "C:\\" -ErrorAction SilentlyContinue\n';
        script += '    Checkpoint-Computer -Description "OptWin Optimization" -RestorePointType "MODIFY_SETTINGS" -ErrorAction Stop\n';
        script += '    Write-Host "      ' + labels.restoreSuccess + '" -ForegroundColor Green\n';
        script += '} catch {\n';
        script += '    Write-Host "      ' + labels.restoreFail + '" -ForegroundColor Yellow\n';
        script += '}\n';
        script += 'Write-Host ""\n\n';
    }

    // Fetch feature commands
    const featuresDb = await prisma.feature.findMany({
        where: { slug: { in: features }, enabled: true },
        include: { commands: { where: { lang: dbLang } } },
        orderBy: { order: 'asc' }
    });

    featuresDb.forEach(feat => {
        if (feat.slug === 'changeDNS') return; // handle separately

        const cmd = feat.commands[0];
        if (cmd) {
            script += 'Write-Host "  ' + cmd.scriptMessage + '" -ForegroundColor Cyan\n';
            script += cmd.command + '\n';
            script += 'Write-Host "      ' + labels.done + '" -ForegroundColor Green\n';
            script += 'Write-Host ""\n';
        }
    });

    // Handle DNS separately if included
    if (features.includes('changeDNS') && dnsProvider) {
        const dnsCmd = await prisma.feature.findUnique({
            where: { slug: 'changeDNS' },
            include: { commands: { where: { lang: dbLang } } }
        });

        const provider = await prisma.dnsProvider.findUnique({ where: { slug: dnsProvider } });

        if (dnsCmd && dnsCmd.commands[0] && provider) {
            let command = dnsCmd.commands[0].command;
            command = command.replace(/\{\{PRIMARY_DNS\}\}/g, provider.primary);
            command = command.replace(/\{\{SECONDARY_DNS\}\}/g, provider.secondary);

            script += 'Write-Host "  ' + dnsCmd.commands[0].scriptMessage + '" -ForegroundColor Cyan\n';
            script += command + '\n';
            script += 'Write-Host "      ' + labels.done + ' (' + provider.name + ')" -ForegroundColor Green\n';
            script += 'Write-Host ""\n';
        }
    }

    // Completion message
    script += '\nWrite-Host ""\n';
    script += 'Write-Host "  ========================================" -ForegroundColor Green\n';
    script += 'Write-Host "       ' + labels.complete + '" -ForegroundColor Green\n';
    script += 'Write-Host "       ' + labels.success + '" -ForegroundColor Green\n';
    script += 'Write-Host "  ========================================" -ForegroundColor Green\n';
    script += 'Write-Host ""\n';
    script += 'Write-Host "  ' + labels.thankYou + '" -ForegroundColor Cyan\n';
    script += 'Write-Host "  ' + labels.author + '" -ForegroundColor Gray\n';
    script += 'Write-Host ""\n';
    script += 'Write-Host "  ' + labels.pressAnyKey + '" -ForegroundColor Gray\n';
    script += '$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")\n';

    return script;
}
