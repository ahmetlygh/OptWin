import { prisma } from "./db";
import { toPowerShellSafe } from "./powershell-safe";

type ScriptParams = {
    features: string[];
    dnsProvider?: string | null;
    lang: string;
    createRestorePoint?: boolean;
};

async function getLabelsFromDb(lang: string): Promise<Record<string, string>> {
    const [langLabels, enLabels] = await Promise.all([
        prisma.scriptLabel.findMany({ where: { lang } }),
        lang !== "en" ? prisma.scriptLabel.findMany({ where: { lang: "en" } }) : Promise.resolve([]),
    ]);

    const enMap: Record<string, string> = {};
    for (const l of enLabels) enMap[l.key] = l.value;

    const result: Record<string, string> = { ...enMap };
    for (const l of langLabels) result[l.key] = l.value;

    return result;
}

export async function generateScript(params: ScriptParams): Promise<string> {
    const { features, dnsProvider, lang, createRestorePoint } = params;
    const rawLabels = await getLabelsFromDb(lang);
    // Resolve <keyName> placeholders then make ASCII-safe for PowerShell
    const resolved: Record<string, string> = {};
    for (const [k, v] of Object.entries(rawLabels)) {
        resolved[k] = v.replace(/<([a-zA-Z_][a-zA-Z0-9_]*)>/g, (match, ref) =>
            rawLabels[ref] !== undefined ? rawLabels[ref] : match
        );
    }
    const labels: Record<string, string> = {};
    for (const [k, v] of Object.entries(resolved)) {
        labels[k] = toPowerShellSafe(v);
    }
    const dateStr = new Date().toLocaleString();

    // The DB commands are stored per-language — fallback to en for unknown languages
    const supportedLangs = ["en", "tr", "de", "fr", "es", "zh", "hi"];
    const dbLang = supportedLangs.includes(lang) ? lang : "en";

    const version = labels.versionNumber || '1.3.0';

    // ===== BATCH-POWERSHELL HYBRID POLYGLOT (.bat) =====
    // <# : is a no-op in Batch (failed redirect + label) but opens a block comment in PowerShell.
    // Batch executes the header, calls PowerShell to re-read the same file.
    // PowerShell sees <# ... #> as a comment, skips the batch header, runs only the PS code after #>.
    let script = '<# : batch header\r\n';
    script += '@echo off\r\n';
    script += 'chcp 65001 >nul 2>&1\r\n';
    script += 'set "OPTWIN_BAT=%~f0"\r\n';
    script += 'powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "& ([ScriptBlock]::Create((Get-Content -LiteralPath $env:OPTWIN_BAT -Encoding UTF8 -Raw)))"\r\n';
    script += 'if errorlevel 1 pause\r\n';
    script += 'exit /b\r\n';
    script += '#>\r\n\r\n';

    // From here on: pure PowerShell code (batch never reaches here due to exit /b)

    // Global error trap — if ANY unhandled error occurs, window stays open
    script += 'trap {\n';
    script += '    Write-Host "" \n';
    script += '    Write-Host "  ERROR: $_" -ForegroundColor Red\n';
    script += '    Write-Host "  Press any key to exit..." -ForegroundColor Gray\n';
    script += '    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")\n';
    script += '    break\n';
    script += '}\n\n';

    script += '<#\n';
    script += '    ' + labels.scriptTitle + '\n';
    script += '    ' + labels.version + '   : ' + version + '\n';
    script += '    ' + labels.date + '      : ' + dateStr + '\n';
    script += '    ' + labels.developer + ' : ' + (labels.developerName || 'ahmetly') + '\n';
    script += '    ' + labels.website + '   : ' + (labels.websiteUrl || 'https://optwin.tech') + '\n';
    script += '    GitHub    : ' + (labels.githubUrl || 'https://github.com/ahmetlygh/optwin') + '\n';
    script += '    ' + labels.openSource + '\n';
    script += '#>\n\n';

    // Self-elevation (re-launches the .bat via cmd.exe with RunAs)
    // Error messages are hardcoded per-language so they always display correctly
    const elevationMessages: Record<string, { requesting: string; error: string; requires: string; hint: string; pressKey: string }> = {
        en: {
            requesting: "Requesting administrator privileges...",
            error: "ERROR: Administrator privileges could not be obtained automatically.",
            requires: "This script requires administrator privileges to run.",
            hint: "Please right-click the file and select 'Run as administrator'.",
            pressKey: "Press any key to exit...",
        },
        tr: {
            requesting: "Yonetici yetkileri isteniyor...",
            error: "HATA: Yonetici yetkileri otomatik olarak alinamadi.",
            requires: "Bu betik calistirilmak icin yonetici izni gerektirir.",
            hint: "Lutfen dosyaya sag tiklayip 'Yonetici olarak calistir' secenegini secin.",
            pressKey: "Cikmak icin bir tusa basin...",
        },
        de: {
            requesting: "Administratorrechte werden angefordert...",
            error: "FEHLER: Administratorrechte konnten nicht automatisch erlangt werden.",
            requires: "Dieses Skript erfordert Administratorrechte.",
            hint: "Bitte klicken Sie mit der rechten Maustaste auf die Datei und waehlen Sie 'Als Administrator ausfuehren'.",
            pressKey: "Druecken Sie eine beliebige Taste zum Beenden...",
        },
        fr: {
            requesting: "Demande de privileges administrateur...",
            error: "ERREUR: Les privileges administrateur n'ont pas pu etre obtenus automatiquement.",
            requires: "Ce script necessite des privileges administrateur pour fonctionner.",
            hint: "Veuillez faire un clic droit sur le fichier et selectionner 'Executer en tant qu'administrateur'.",
            pressKey: "Appuyez sur une touche pour quitter...",
        },
        es: {
            requesting: "Solicitando privilegios de administrador...",
            error: "ERROR: No se pudieron obtener los privilegios de administrador automaticamente.",
            requires: "Este script requiere privilegios de administrador para ejecutarse.",
            hint: "Haga clic derecho en el archivo y seleccione 'Ejecutar como administrador'.",
            pressKey: "Presione cualquier tecla para salir...",
        },
        zh: {
            requesting: "Requesting administrator privileges...",
            error: "ERROR: Unable to obtain administrator privileges automatically.",
            requires: "This script requires administrator privileges to run.",
            hint: "Please right-click the file and select 'Run as administrator'.",
            pressKey: "Press any key to exit...",
        },
        hi: {
            requesting: "Requesting administrator privileges...",
            error: "ERROR: Administrator privileges could not be obtained automatically.",
            requires: "This script requires administrator privileges to run.",
            hint: "Please right-click the file and select 'Run as administrator'.",
            pressKey: "Press any key to exit...",
        },
    };
    const elev = elevationMessages[lang] || elevationMessages.en;

    script += '# ===== SELF-ELEVATION =====\n';
    script += '$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)\n\n';
    script += 'if (-not $isAdmin) {\n';
    script += '    Write-Host ""\n';
    script += '    Write-Host "  [*] ' + elev.requesting + '" -ForegroundColor Yellow\n';
    script += '    Write-Host ""\n';
    script += '    $elevated = $false\n';
    script += '    try {\n';
    script += '        Start-Process -FilePath $env:OPTWIN_BAT -Verb RunAs\n';
    script += '        $elevated = $true\n';
    script += '    } catch { }\n';
    script += '    if ($elevated) { exit }\n';
    script += '    Write-Host ""\n';
    script += '    Write-Host "  ========================================" -ForegroundColor Red\n';
    script += '    Write-Host "  ' + elev.error + '" -ForegroundColor Red\n';
    script += '    Write-Host "  ========================================" -ForegroundColor Red\n';
    script += '    Write-Host ""\n';
    script += '    Write-Host "  ' + elev.requires + '" -ForegroundColor Yellow\n';
    script += '    Write-Host "  ' + elev.hint + '" -ForegroundColor Yellow\n';
    script += '    Write-Host ""\n';
    script += '    Write-Host "  ' + elev.pressKey + '" -ForegroundColor Gray\n';
    script += '    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")\n';
    script += '    exit\n';
    script += '}\n\n';

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
    const ghShort = (labels.githubUrl || 'https://github.com/ahmetlygh/optwin').replace('https://', '');
    script += 'Write-Host "    GitHub: ' + ghShort + '" -ForegroundColor DarkGray\n';
    script += 'Write-Host "  ================================================================" -ForegroundColor Magenta\n';
    script += 'Write-Host ""\n\n';

    // Restore point
    if (createRestorePoint) {
        script += 'Write-Host "  [*] ' + labels.restorePoint + '" -ForegroundColor Cyan\n';
        script += 'try {\n';
        script += '    Enable-ComputerRestore -Drive "C:\\" -ErrorAction Stop\n';
        script += '    Checkpoint-Computer -Description "OptWin Optimization" -RestorePointType "MODIFY_SETTINGS" -ErrorAction Stop -WarningAction Stop\n';
        script += '    Write-Host "      ' + labels.restoreSuccess + '" -ForegroundColor Green\n';
        script += '} catch {\n';
        script += '    Write-Host "      ' + labels.restoreFail + ': $($_.Exception.Message)" -ForegroundColor Red\n';
        script += '}\n';
        script += 'Write-Host ""\n\n';
    }

    // Fetch feature commands
    const featuresDb = await prisma.feature.findMany({
        where: { slug: { in: features }, enabled: true, category: { enabled: true } },
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
    script += 'Write-Host "  ' + (labels.pressAnyKey || 'Press any key to exit...') + '" -ForegroundColor Gray\n';
    script += '$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")\n';

    return script;
}
