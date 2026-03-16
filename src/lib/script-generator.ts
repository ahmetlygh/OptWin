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

    // The DB commands are stored in en/tr — fallback to en for other languages
    const dbLang = (lang === "en" || lang === "tr") ? lang : "en";

    const version = labels.versionNumber || '1.3.0';

    // ===== BATCH-POWERSHELL HYBRID POLYGLOT (.bat) =====
    // <# : is a no-op in Batch (failed redirect + label) but opens a block comment in PowerShell.
    // Batch executes the header, calls PowerShell to re-read the same file.
    // PowerShell sees <# ... #> as a comment, skips the batch header, runs only the PS code after #>.
    let script = '<# : batch header\r\n';
    script += '@echo off\r\n';
    script += 'chcp 65001 >nul 2>&1\r\n';
    script += 'set "OPTWIN_BAT=%~f0"\r\n';
    script += 'powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "Get-Content -LiteralPath $env:OPTWIN_BAT -Encoding UTF8 -Raw | iex"\r\n';
    script += 'exit /b\r\n';
    script += '#>\r\n\r\n';

    // From here on: pure PowerShell code (batch never reaches here due to exit /b)
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
    script += '# ===== SELF-ELEVATION =====\n';
    script += '$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)\n\n';
    script += 'if (-not $isAdmin) {\n';
    script += '    Write-Host ""\n';
    script += '    Write-Host "  ' + labels.adminRequest + '" -ForegroundColor Yellow\n';
    script += '    Write-Host "  ' + labels.adminPrompt + '" -ForegroundColor Cyan\n';
    script += '    Write-Host ""\n';
    script += '    $batPath = $env:OPTWIN_BAT\n';
    script += '    try {\n';
    script += '        Start-Process cmd.exe -ArgumentList "/c `"$batPath`"" -Verb RunAs\n';
    script += '    } catch {\n';
    script += '        Write-Host "  ' + labels.adminError + '" -ForegroundColor Red\n';
    script += '        Write-Host "  ' + labels.adminHint + '" -ForegroundColor Yellow\n';
    script += '        Read-Host\n';
    script += '    }\n';
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

    return script;
}
