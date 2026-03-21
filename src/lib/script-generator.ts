import { prisma } from "./db";
import { toPowerShellSafe, escapeForPsString } from "./powershell-safe";

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

    const supportedLangs = ["en", "tr", "de", "fr", "es", "zh", "hi"];
    const dbLang = supportedLangs.includes(lang) ? lang : "en";
    const version = labels.versionNumber || '1.3.0';

    // Use \r\n for ALL lines so batch and PowerShell both parse correctly.
    const L = '\r\n'; // line ending

    // ===== BATCH HEADER =====
    // Two-step approach to avoid batch encoding issues:
    //   Step 1: Short PS command reads the .bat, extracts PS code after marker → temp .ps1
    //   Step 2: Runs the temp .ps1 with -NoExit (keeps window open on errors)
    //
    // Why this works for all scenarios (double-click, Run as Admin, command line):
    //   - cd /d "%~dp0" fixes UAC working directory issue (System32 → script dir)
    //   - Step 1 PS command is ~300 chars, well under cmd.exe's 8191 limit
    //   - .NET ReadAllText/WriteAllText handles encoding correctly
    //   - -File is simpler and more reliable than -Command or -EncodedCommand
    //   - Temp file is cleaned up after execution
    const batchLines: string[] = [];
    batchLines.push(`@echo off`);
    batchLines.push(`chcp 65001 >nul 2>&1`);
    batchLines.push(`title OptWin Optimizer`);
    // Fix working directory — UAC elevation changes it to C:\Windows\System32
    batchLines.push(`cd /d "%~dp0"`);
    // Step 1: Extract PS code from this .bat into a temp .ps1 file
    // IMPORTANT: The marker string is built via concatenation ('REM === OPTWIN'+' PS ===')
    // so that IndexOf doesn't match THIS line itself — it only matches the real marker below.
    // UTF8Encoding($false) avoids BOM which would break PS parsing.
    batchLines.push(`set "T=%TEMP%\\optwin_%RANDOM%.ps1"`);
    batchLines.push(`powershell -NoP -Ep Bypass -C "$f='%~f0';$c=[IO.File]::ReadAllText($f);$m='REM === OPTWIN'+' PS ===';$i=$c.IndexOf($m);if($i-ge0){$u=New-Object Text.UTF8Encoding($false);[IO.File]::WriteAllText($env:T,$c.Substring($i+$m.Length),$u)}"`);
    // Step 2: Run the extracted PS1 file — -NoExit keeps window open if there's an error
    batchLines.push(`powershell.exe -NoProfile -NoExit -ExecutionPolicy Bypass -File "%T%"`);
    // Cleanup
    batchLines.push(`del /f /q "%T%" >nul 2>&1`);
    batchLines.push(`exit /b`);
    batchLines.push(`REM === OPTWIN PS ===`);

    let script = batchLines.join(L) + L;

    // ===== POWERSHELL CODE (after marker, extracted by the loader) =====

    const ps: string[] = [];

    // Error trap — keeps window open on any unhandled error
    ps.push('trap {');
    ps.push('    Write-Host ""');
    ps.push('    Write-Host "  ERROR: $_" -ForegroundColor Red');
    ps.push('    Write-Host "  Press any key to exit..." -ForegroundColor Gray');
    ps.push('    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")');
    ps.push('    exit 1');
    ps.push('}');
    ps.push('');

    // Script info comment (NO block comments — only # line comments)
    ps.push('#');
    ps.push('#    ' + labels.scriptTitle);
    ps.push('#    ' + labels.version + '   : ' + version);
    ps.push('#    ' + labels.date + '      : ' + dateStr);
    ps.push('#    ' + labels.developer + ' : ' + (labels.developerName || 'ahmetly'));
    ps.push('#    ' + labels.website + '   : ' + (labels.websiteUrl || 'https://optwin.tech'));
    ps.push('#    GitHub    : ' + (labels.githubUrl || 'https://github.com/ahmetlygh/optwin'));
    ps.push('#    ' + labels.openSource);
    ps.push('#');
    ps.push('');

    ps.push('$host.UI.RawUI.WindowTitle = "OptWin Optimizer Script"');
    ps.push('');

    // ASCII Banner
    ps.push('Clear-Host');
    ps.push('Write-Host ""');
    ps.push('Write-Host "  ================================================================" -ForegroundColor Magenta');
    ps.push('Write-Host "" -ForegroundColor Magenta');
    ps.push('Write-Host "       OOOO  PPPP  TTTTT W   W  III  N   N" -ForegroundColor Cyan');
    ps.push('Write-Host "      O    O P   P   T   W   W   I   NN  N" -ForegroundColor Cyan');
    ps.push('Write-Host "      O    O PPPP    T   W W W   I   N N N" -ForegroundColor Cyan');
    ps.push('Write-Host "      O    O P       T   WW WW   I   N  NN" -ForegroundColor Cyan');
    ps.push('Write-Host "       OOOO  P       T    W W   III  N   N" -ForegroundColor Cyan');
    ps.push('Write-Host "" -ForegroundColor Magenta');
    ps.push('Write-Host "  ================================================================" -ForegroundColor Magenta');
    ps.push('Write-Host "    ' + labels.bannerTitle + '" -ForegroundColor White');
    ps.push('Write-Host "  ----------------------------------------------------------------" -ForegroundColor DarkGray');
    ps.push('Write-Host "    ' + labels.version + '   : ' + version + '" -ForegroundColor Gray');
    ps.push('Write-Host "    ' + labels.date + '      : ' + dateStr + '" -ForegroundColor Gray');
    ps.push('Write-Host "  ----------------------------------------------------------------" -ForegroundColor DarkGray');
    ps.push('Write-Host "    ' + labels.openSourceShort + '" -ForegroundColor DarkGray');
    const ghShort = (labels.githubUrl || 'https://github.com/ahmetlygh/optwin').replace('https://', '');
    ps.push('Write-Host "    GitHub: ' + ghShort + '" -ForegroundColor DarkGray');
    ps.push('Write-Host "  ================================================================" -ForegroundColor Magenta');
    ps.push('Write-Host ""');
    ps.push('');

    // Restore point
    if (createRestorePoint) {
        ps.push('Write-Host "  [*] ' + labels.restorePoint + '" -ForegroundColor Cyan');
        ps.push('try {');
        ps.push('    Enable-ComputerRestore -Drive "C:\\" -ErrorAction Stop');
        ps.push('    Checkpoint-Computer -Description "OptWin Optimization" -RestorePointType "MODIFY_SETTINGS" -ErrorAction Stop -WarningAction Stop');
        ps.push('    Write-Host "      ' + labels.restoreSuccess + '" -ForegroundColor Green');
        ps.push('} catch {');
        ps.push('    Write-Host "      ' + labels.restoreFail + ': $($_.Exception.Message)" -ForegroundColor Red');
        ps.push('}');
        ps.push('Write-Host ""');
        ps.push('');
    }

    // Feature commands
    const featuresDb = await prisma.feature.findMany({
        where: { slug: { in: features }, enabled: true, category: { enabled: true } },
        include: { commands: { where: { lang: dbLang } } },
        orderBy: { order: 'asc' }
    });

    featuresDb.forEach(feat => {
        if (feat.slug === 'changeDNS') return;
        const cmd = feat.commands[0];
        if (cmd) {
            ps.push('Write-Host "  ' + escapeForPsString(cmd.scriptMessage) + '" -ForegroundColor Cyan');
            ps.push(cmd.command.trim());
            ps.push('Write-Host "      ' + labels.done + '" -ForegroundColor Green');
            ps.push('Write-Host ""');
        }
    });

    // DNS
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
            ps.push('Write-Host "  ' + escapeForPsString(dnsCmd.commands[0].scriptMessage) + '" -ForegroundColor Cyan');
            ps.push(command.trim());
            ps.push('Write-Host "      ' + labels.done + ' (' + provider.name + ')" -ForegroundColor Green');
            ps.push('Write-Host ""');
        }
    }

    // Completion
    ps.push('');
    ps.push('Write-Host ""');
    ps.push('Write-Host "  ========================================" -ForegroundColor Green');
    ps.push('Write-Host "       ' + labels.complete + '" -ForegroundColor Green');
    ps.push('Write-Host "       ' + labels.success + '" -ForegroundColor Green');
    ps.push('Write-Host "  ========================================" -ForegroundColor Green');
    ps.push('Write-Host ""');
    ps.push('Write-Host "  ' + labels.thankYou + '" -ForegroundColor Cyan');
    ps.push('Write-Host "  ' + labels.author + '" -ForegroundColor Gray');
    ps.push('Write-Host ""');
    ps.push('Write-Host "  ' + (labels.pressAnyKey || 'Press any key to exit...') + '" -ForegroundColor Gray');
    ps.push('$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")');
    ps.push('exit');

    script += ps.join(L) + L;

    return script;
}
