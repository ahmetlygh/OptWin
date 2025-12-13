/**
 * OptWin Features Definition
 * Optimizasyon özellikleri, kategoriler ve risk seviyeleri
 */

// ===== RISK LEVELS =====
const RISK = {
    LOW: 'low',      // Yeşil - Geri alınabilir, güvenli
    MEDIUM: 'medium', // Sarı - Bazı değişiklikler kalıcı olabilir
    HIGH: 'high'     // Kırmızı - Sistem davranışını değiştirir
};

// ===== CATEGORIZED FEATURES =====
const categorizedFeatures = [
    {
        id: 'system',
        items: [
            { id: 'cleanTemp', icon: 'fa-trash-can', risk: RISK.LOW, noRisk: true },
            { id: 'cleanPrefetch', icon: 'fa-box-archive', risk: RISK.LOW, noRisk: true },
            { id: 'recycleBin', icon: 'fa-dumpster', risk: RISK.LOW, noRisk: true },
            { id: 'disableHibernate', icon: 'fa-power-off', risk: RISK.MEDIUM },
            { id: 'disableTelemetry', icon: 'fa-user-secret', risk: RISK.MEDIUM },
            { id: 'disableGameDVR', icon: 'fa-gamepad', risk: RISK.LOW, noRisk: true },
            { id: 'disableNotifications', icon: 'fa-bell-slash', risk: RISK.LOW, noRisk: true },
            { id: 'highPerformance', icon: 'fa-gauge-high', risk: RISK.LOW, noRisk: true },
            { id: 'ultimatePerformance', icon: 'fa-rocket', risk: RISK.MEDIUM }
        ]
    },
    {
        id: 'maintenance',
        items: [
            { id: 'systemFileCheck', icon: 'fa-file-shield', risk: RISK.LOW, noRisk: true },
            { id: 'dismCheck', icon: 'fa-stethoscope', risk: RISK.LOW, noRisk: true },
            { id: 'dismRepair', icon: 'fa-kit-medical', risk: RISK.MEDIUM },
            { id: 'cleanEventLog', icon: 'fa-eraser', risk: RISK.LOW, noRisk: true },
            { id: 'updateCacheClean', icon: 'fa-rotate', risk: RISK.MEDIUM }
        ]
    },
    {
        id: 'services',
        items: [
            { id: 'disableWallet', icon: 'fa-wallet', risk: RISK.LOW, noRisk: true },
            { id: 'disableMaps', icon: 'fa-map-location-dot', risk: RISK.LOW, noRisk: true },
            { id: 'disableDiagTrack', icon: 'fa-user-gear', risk: RISK.MEDIUM },
            { id: 'disableFax', icon: 'fa-fax', risk: RISK.LOW, noRisk: true },
            { id: 'disableWer', icon: 'fa-bug', risk: RISK.LOW, noRisk: true },
            { id: 'disableTouch', icon: 'fa-keyboard', risk: RISK.MEDIUM },
            { id: 'disableXbox', icon: 'fa-gamepad', risk: RISK.LOW, noRisk: true },
            { id: 'disablePrintSpooler', icon: 'fa-print', risk: RISK.MEDIUM },
            { id: 'disableSearch', icon: 'fa-magnifying-glass', risk: RISK.HIGH }
        ]
    },
    {
        id: 'network',
        items: [
            { id: 'flushDNS', icon: 'fa-network-wired', risk: RISK.LOW, noRisk: true },
            { id: 'disableThrottling', icon: 'fa-bolt', risk: RISK.LOW, noRisk: true },
            { id: 'changeDNS', icon: 'fa-globe', risk: RISK.LOW, noRisk: true },
            { id: 'networkReset', icon: 'fa-wifi', risk: RISK.LOW, noRisk: true },
            { id: 'disableNagle', icon: 'fa-rocket', risk: RISK.LOW, noRisk: true },
            { id: 'disableAutoTuning', icon: 'fa-gears', risk: RISK.LOW, noRisk: true },
            { id: 'clearArpCache', icon: 'fa-broom', risk: RISK.LOW, noRisk: true },
            { id: 'enableQoS', icon: 'fa-sliders', risk: RISK.LOW, noRisk: true },
            { id: 'disableLSO', icon: 'fa-layer-group', risk: RISK.LOW, noRisk: true }
        ]
    },
    {
        id: 'privacy',
        items: [
            { id: 'disableCortana', icon: 'fa-microphone-slash', risk: RISK.MEDIUM },
            { id: 'disableOneDrive', icon: 'fa-cloud-arrow-down', risk: RISK.HIGH },
            { id: 'disableLocation', icon: 'fa-location-crosshairs', risk: RISK.LOW, noRisk: true },
            { id: 'disableClipboardHistory', icon: 'fa-clipboard', risk: RISK.LOW, noRisk: true },
            { id: 'disableActivityHistory', icon: 'fa-clock-rotate-left', risk: RISK.LOW, noRisk: true },
            { id: 'disableNewsInterests', icon: 'fa-newspaper', risk: RISK.LOW, noRisk: true }
        ]
    },
    {
        id: 'extra',
        items: [
            { id: 'disableSticky', icon: 'fa-keyboard', risk: RISK.LOW, noRisk: true },
            { id: 'disableBingSearch', icon: 'fa-magnifying-glass-minus', risk: RISK.LOW, noRisk: true },
            { id: 'showExtensions', icon: 'fa-file-code', risk: RISK.LOW, noRisk: true },
            { id: 'showHiddenFiles', icon: 'fa-eye', risk: RISK.LOW, noRisk: true },
            { id: 'disableMouseAccel', icon: 'fa-arrow-pointer', risk: RISK.LOW, noRisk: true },
            { id: 'disableTransparency', icon: 'fa-eye-slash', risk: RISK.LOW, noRisk: true },
            { id: 'clearBrowserCache', icon: 'fa-broom', risk: RISK.HIGH },
            { id: 'disableBackgroundApps', icon: 'fa-window-restore', risk: RISK.MEDIUM },
            { id: 'enableGpuScheduling', icon: 'fa-microchip', risk: RISK.MEDIUM }
        ]
    }
];

// ===== RECOMMENDED FEATURES (Only noRisk) =====
const recommendedFeatures = new Set([
    'cleanTemp', 'cleanPrefetch', 'recycleBin',
    'systemFileCheck', 'dismCheck',
    'disableGameDVR', 'highPerformance', 'disableNotifications',
    'flushDNS', 'disableThrottling',
    'cleanEventLog',
    'disableWallet', 'disableMaps', 'disableFax', 'disableWer', 'disableXbox',
    'showExtensions', 'showHiddenFiles',
    'disableSticky', 'disableBingSearch', 'disableMouseAccel', 'disableTransparency',
    'disableLocation', 'disableClipboardHistory', 'disableActivityHistory', 'disableNewsInterests'
]);

// ===== GAMER MODE FEATURES (Gaming optimizations) =====
const gamerModeFeatures = new Set([
    // Performance
    'ultimatePerformance',
    'disableGameDVR',
    'enableGpuScheduling',
    // Network (Low Ping)
    'disableThrottling',
    'disableNagle',
    'disableAutoTuning',
    'disableLSO',
    'flushDNS',
    // Less Distractions
    'disableNotifications',
    'disableTransparency',
    'disableMouseAccel',
    // Clean
    'cleanTemp',
    'cleanPrefetch'
]);

// ===== DNS PROVIDERS =====
const dnsProviders = {
    cloudflare: { primary: '1.1.1.1', secondary: '1.0.0.1', name: 'Cloudflare' },
    google: { primary: '8.8.8.8', secondary: '8.8.4.4', name: 'Google' },
    opendns: { primary: '208.67.222.222', secondary: '208.67.220.220', name: 'OpenDNS' },
    quad9: { primary: '9.9.9.9', secondary: '149.112.112.112', name: 'Quad9' },
    adguard: { primary: '94.140.14.14', secondary: '94.140.15.15', name: 'AdGuard' }
};

// ===== POWERSHELL SCRIPT MESSAGES (Bilingual) =====
const scriptMessages = {
    en: {
        cleanTemp: 'Cleaning temporary files...',
        cleanPrefetch: 'Cleaning Prefetch...',
        recycleBin: 'Emptying Recycle Bin...',
        disableHibernate: 'Disabling Hibernate...',
        systemFileCheck: 'Running System File Checker...',
        disableTelemetry: 'Disabling Telemetry...',
        disableGameDVR: 'Disabling Game DVR...',
        highPerformance: 'Setting High Performance power plan...',
        ultimatePerformance: 'Enabling Ultimate Performance...',
        flushDNS: 'Flushing DNS cache...',
        changeDNS: 'Changing DNS servers...',
        dismCheck: 'Running DISM Health Check...',
        dismRepair: 'Running DISM Restore Health...',
        disableSticky: 'Disabling Sticky Keys...',
        disableNotifications: 'Disabling Notifications...',
        networkReset: 'Resetting Network Stack...',
        cleanEventLog: 'Clearing Event Logs...',
        updateCacheClean: 'Cleaning Windows Update Cache...',
        disablePrintSpooler: 'Disabling Print Spooler...',
        disableSearch: 'Disabling Windows Search...',
        disableThrottling: 'Disabling Network Throttling...',
        disableBingSearch: 'Disabling Bing Search...',
        showExtensions: 'Showing File Extensions...',
        showHiddenFiles: 'Showing Hidden Files...',
        disableWallet: 'Disabling Wallet Service...',
        disableMaps: 'Disabling Maps Broker...',
        disableDiagTrack: 'Disabling DiagTrack...',
        disableFax: 'Disabling Fax Service...',
        disableWer: 'Disabling Error Reporting...',
        disableTouch: 'Disabling Touch Keyboard...',
        disableXbox: 'Disabling Xbox Services...',
        disableMouseAccel: 'Disabling Mouse Acceleration...',
        disableTransparency: 'Disabling Transparency Effects...',
        disableCortana: 'Disabling Cortana...',
        disableOneDrive: 'Disabling OneDrive...',
        clearBrowserCache: 'Clearing Browser Cache...',
        disableBackgroundApps: 'Disabling Background Apps...',
        enableGpuScheduling: 'Enabling Hardware GPU Scheduling...',
        disableLocation: 'Disabling Location Services...',
        disableClipboardHistory: 'Disabling Clipboard History...',
        disableActivityHistory: 'Disabling Activity History...',
        clearFontCache: 'Clearing Font Cache...',
        disableNewsInterests: 'Disabling News and Interests...',
        disableNagle: 'Disabling Nagle Algorithm (reduces latency)...',
        disableAutoTuning: 'Disabling TCP Auto-Tuning...',
        clearArpCache: 'Clearing ARP Cache...',
        enableQoS: 'Enabling QoS Packet Scheduler...',
        disableLSO: 'Disabling Large Send Offload (LSO)...',
        done: 'Done!',
        restorePoint: 'Creating System Restore Point...',
        restoreSuccess: 'Restore Point created successfully!',
        restoreFail: 'Could not create Restore Point (may already exist today)'
    },
    tr: {
        cleanTemp: 'Gecici dosyalar temizleniyor...',
        cleanPrefetch: 'Prefetch temizleniyor...',
        recycleBin: 'Geri donusum kutusu bosaltiliyor...',
        disableHibernate: 'Hazirda bekletme kapatiliyor...',
        systemFileCheck: 'Sistem dosya denetleyicisi calistiriliyor...',
        disableTelemetry: 'Telemetri kapatiliyor...',
        disableGameDVR: 'Game DVR kapatiliyor...',
        highPerformance: 'Yuksek performans guc plani ayarlaniyor...',
        ultimatePerformance: 'Nihai performans etkinlestiriliyor...',
        flushDNS: 'DNS onbellegi temizleniyor...',
        changeDNS: 'DNS sunuculari degistiriliyor...',
        dismCheck: 'DISM saglik kontrolu yapiliyor...',
        dismRepair: 'DISM onarim yapiliyor...',
        disableSticky: 'Yapiskan tuslar kapatiliyor...',
        disableNotifications: 'Bildirimler kapatiliyor...',
        networkReset: 'Ag yigini sifirlaniyor...',
        cleanEventLog: 'Olay gunlukleri temizleniyor...',
        updateCacheClean: 'Windows Update onbellegi temizleniyor...',
        disablePrintSpooler: 'Yazici hizmeti kapatiliyor...',
        disableSearch: 'Windows arama kapatiliyor...',
        disableThrottling: 'Ag kisitlamasi kapatiliyor...',
        disableBingSearch: 'Bing arama kapatiliyor...',
        showExtensions: 'Dosya uzantilari gosteriliyor...',
        showHiddenFiles: 'Gizli dosyalar gosteriliyor...',
        disableWallet: 'Cuzdan hizmeti kapatiliyor...',
        disableMaps: 'Harita hizmeti kapatiliyor...',
        disableDiagTrack: 'DiagTrack kapatiliyor...',
        disableFax: 'Faks hizmeti kapatiliyor...',
        disableWer: 'Hata raporlama kapatiliyor...',
        disableTouch: 'Dokunmatik klavye kapatiliyor...',
        disableXbox: 'Xbox hizmetleri kapatiliyor...',
        disableMouseAccel: 'Fare ivmesi kapatiliyor...',
        disableTransparency: 'Saydamlik efektleri kapatiliyor...',
        disableCortana: 'Cortana kapatiliyor...',
        disableOneDrive: 'OneDrive kapatiliyor...',
        clearBrowserCache: 'Tarayici onbellegi temizleniyor...',
        disableBackgroundApps: 'Arka plan uygulamalari kapatiliyor...',
        enableGpuScheduling: 'Donanim GPU zamanlamasi etkinlestiriliyor...',
        disableLocation: 'Konum servisleri kapatiliyor...',
        disableClipboardHistory: 'Pano gecmisi kapatiliyor...',
        disableActivityHistory: 'Aktivite gecmisi kapatiliyor...',
        clearFontCache: 'Font onbellegi temizleniyor...',
        disableNewsInterests: 'Haber ve ilgi alanlari kapatiliyor...',
        disableNagle: 'Nagle algoritmasi kapatiliyor (gecikme azaltir)...',
        disableAutoTuning: 'TCP Auto-Tuning kapatiliyor...',
        clearArpCache: 'ARP onbellegi temizleniyor...',
        enableQoS: 'QoS paket zamanlayicisi etkinlestiriliyor...',
        disableLSO: 'Large Send Offload (LSO) kapatiliyor...',
        done: 'Basarili!',
        restorePoint: 'Sistem Geri Yukleme Noktasi olusturuluyor...',
        restoreSuccess: 'Geri yukleme noktasi basariyla olusturuldu!',
        restoreFail: 'Geri yukleme noktasi olusturulamadi (bugun zaten olusturulmus olabilir)'
    }
};

// ===== POWERSHELL SCRIPT COMMANDS (Code only, messages injected separately) =====
const featureCommands = {
    cleanTemp: `
Remove-Item -Path "$env:TEMP\\*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$env:WINDIR\\Temp\\*" -Recurse -Force -ErrorAction SilentlyContinue
`,
    cleanPrefetch: `
Remove-Item -Path "$env:WINDIR\\Prefetch\\*" -Force -ErrorAction SilentlyContinue
`,
    recycleBin: `
Clear-RecycleBin -Force -ErrorAction SilentlyContinue
`,
    disableHibernate: `
powercfg /hibernate off
`,
    systemFileCheck: `
sfc /scannow
`,
    disableTelemetry: `
Set-ItemProperty -Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection" -Name "AllowTelemetry" -Value 0 -Type DWord -Force -ErrorAction SilentlyContinue
Set-ItemProperty -Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\AdvertisingInfo" -Name "DisabledByGroupPolicy" -Value 1 -Type DWord -Force -ErrorAction SilentlyContinue
`,
    disableGameDVR: `
Set-ItemProperty -Path "HKCU:\\System\\GameConfigStore" -Name "GameDVR_Enabled" -Value 0 -Type DWord -Force -ErrorAction SilentlyContinue
New-ItemProperty -Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\GameDVR" -Name "AllowGameDVR" -Value 0 -Type DWord -Force -ErrorAction SilentlyContinue
`,
    highPerformance: `
powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c
`,
    ultimatePerformance: `
powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61 2>$null
$ultimatePlan = powercfg /list | Select-String -Pattern "Ultimate|Nihai" | ForEach-Object { ($_ -split "\\s+")[3] }
if ($ultimatePlan) { powercfg /setactive $ultimatePlan }
`,
    flushDNS: `
ipconfig /flushdns | Out-Null
`,
    changeDNS: `
netsh interface ip set dns "Wi-Fi" static {{PRIMARY_DNS}} | Out-Null
netsh interface ip add dns "Wi-Fi" {{SECONDARY_DNS}} index=2 | Out-Null
netsh interface ip set dns "Ethernet" static {{PRIMARY_DNS}} | Out-Null
netsh interface ip add dns "Ethernet" {{SECONDARY_DNS}} index=2 | Out-Null
`,
    dismCheck: `
DISM /Online /Cleanup-Image /CheckHealth
`,
    dismRepair: `
DISM /Online /Cleanup-Image /RestoreHealth
`,
    disableSticky: `
Set-ItemProperty -Path "HKCU:\\Control Panel\\Accessibility\\StickyKeys" -Name "Flags" -Value "506" -Type String -Force
`,
    disableNotifications: `
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\PushNotifications" -Name "ToastEnabled" -Value 0 -Type DWord -Force -ErrorAction SilentlyContinue
`,
    networkReset: `
netsh int ip reset | Out-Null
netsh winsock reset | Out-Null
`,
    cleanEventLog: `
wevtutil el | ForEach-Object { wevtutil cl $_ 2>$null }
`,
    updateCacheClean: `
Stop-Service -Name wuauserv -Force -ErrorAction SilentlyContinue
Stop-Service -Name bits -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$env:WINDIR\\SoftwareDistribution\\Download\\*" -Recurse -Force -ErrorAction SilentlyContinue
Start-Service -Name wuauserv -ErrorAction SilentlyContinue
Start-Service -Name bits -ErrorAction SilentlyContinue
`,
    disablePrintSpooler: `
Stop-Service -Name Spooler -Force -ErrorAction SilentlyContinue
Set-Service -Name Spooler -StartupType Disabled -ErrorAction SilentlyContinue
`,
    disableSearch: `
Stop-Service -Name WSearch -Force -ErrorAction SilentlyContinue
Set-Service -Name WSearch -StartupType Disabled -ErrorAction SilentlyContinue
`,
    disableThrottling: `
Set-ItemProperty -Path "HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile" -Name "NetworkThrottlingIndex" -Value 0xFFFFFFFF -Type DWord -Force
`,
    disableBingSearch: `
New-ItemProperty -Path "HKCU:\\Software\\Policies\\Microsoft\\Windows\\Explorer" -Name "DisableSearchBoxSuggestions" -Value 1 -Type DWord -Force -ErrorAction SilentlyContinue
`,
    showExtensions: `
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" -Name "HideFileExt" -Value 0 -Type DWord -Force
`,
    showHiddenFiles: `
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" -Name "Hidden" -Value 1 -Type DWord -Force
`,
    disableWallet: `
Stop-Service -Name WalletService -Force -ErrorAction SilentlyContinue
Set-Service -Name WalletService -StartupType Disabled -ErrorAction SilentlyContinue
`,
    disableMaps: `
Stop-Service -Name MapsBroker -Force -ErrorAction SilentlyContinue
Set-Service -Name MapsBroker -StartupType Disabled -ErrorAction SilentlyContinue
`,
    disableDiagTrack: `
Stop-Service -Name DiagTrack -Force -ErrorAction SilentlyContinue
Set-Service -Name DiagTrack -StartupType Disabled -ErrorAction SilentlyContinue
`,
    disableFax: `
Stop-Service -Name Fax -Force -ErrorAction SilentlyContinue
Set-Service -Name Fax -StartupType Disabled -ErrorAction SilentlyContinue
`,
    disableWer: `
Stop-Service -Name WerSvc -Force -ErrorAction SilentlyContinue
Set-Service -Name WerSvc -StartupType Disabled -ErrorAction SilentlyContinue
`,
    disableTouch: `
Stop-Service -Name TabletInputService -Force -ErrorAction SilentlyContinue
Set-Service -Name TabletInputService -StartupType Disabled -ErrorAction SilentlyContinue
`,
    disableXbox: `
Stop-Service -Name XblAuthManager -Force -ErrorAction SilentlyContinue
Set-Service -Name XblAuthManager -StartupType Disabled -ErrorAction SilentlyContinue
Stop-Service -Name XblGameSave -Force -ErrorAction SilentlyContinue
Set-Service -Name XblGameSave -StartupType Disabled -ErrorAction SilentlyContinue
Stop-Service -Name XboxNetApiSvc -Force -ErrorAction SilentlyContinue
Set-Service -Name XboxNetApiSvc -StartupType Disabled -ErrorAction SilentlyContinue
`,
    disableMouseAccel: `
Set-ItemProperty -Path "HKCU:\\Control Panel\\Mouse" -Name "MouseSpeed" -Value "0" -Type String -Force
Set-ItemProperty -Path "HKCU:\\Control Panel\\Mouse" -Name "MouseThreshold1" -Value "0" -Type String -Force
Set-ItemProperty -Path "HKCU:\\Control Panel\\Mouse" -Name "MouseThreshold2" -Value "0" -Type String -Force
`,
    disableTransparency: `
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize" -Name "EnableTransparency" -Value 0 -Type DWord -Force
`,
    disableCortana: `
New-ItemProperty -Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\Windows Search" -Name "AllowCortana" -Value 0 -Type DWord -Force -ErrorAction SilentlyContinue
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Search" -Name "CortanaConsent" -Value 0 -Type DWord -Force -ErrorAction SilentlyContinue
`,
    disableOneDrive: `
Stop-Process -Name OneDrive -Force -ErrorAction SilentlyContinue
Start-Process "$env:SYSTEMROOT\\SysWOW64\\OneDriveSetup.exe" -ArgumentList "/uninstall" -Wait -ErrorAction SilentlyContinue
Remove-Item -Path "$env:USERPROFILE\\OneDrive" -Recurse -Force -ErrorAction SilentlyContinue
`,
    clearBrowserCache: `
# Chrome
Remove-Item -Path "$env:LOCALAPPDATA\\Google\\Chrome\\User Data\\Default\\Cache\\*" -Recurse -Force -ErrorAction SilentlyContinue
# Edge
Remove-Item -Path "$env:LOCALAPPDATA\\Microsoft\\Edge\\User Data\\Default\\Cache\\*" -Recurse -Force -ErrorAction SilentlyContinue
# Firefox
$firefoxProfile = Get-ChildItem -Path "$env:APPDATA\\Mozilla\\Firefox\\Profiles" -Directory -ErrorAction SilentlyContinue | Select-Object -First 1
if ($firefoxProfile) { Remove-Item -Path "$($firefoxProfile.FullName)\\cache2\\*" -Recurse -Force -ErrorAction SilentlyContinue }
`,
    disableBackgroundApps: `
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\BackgroundAccessApplications" -Name "GlobalUserDisabled" -Value 1 -Type DWord -Force -ErrorAction SilentlyContinue
`,
    enableGpuScheduling: `
Set-ItemProperty -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\GraphicsDrivers" -Name "HwSchMode" -Value 2 -Type DWord -Force -ErrorAction SilentlyContinue
`,
    disableLocation: `
Set-ItemProperty -Path "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\CapabilityAccessManager\\ConsentStore\\location" -Name "Value" -Value "Deny" -Type String -Force -ErrorAction SilentlyContinue
`,
    disableClipboardHistory: `
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Clipboard" -Name "EnableClipboardHistory" -Value 0 -Type DWord -Force -ErrorAction SilentlyContinue
`,
    disableActivityHistory: `
Set-ItemProperty -Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\System" -Name "EnableActivityFeed" -Value 0 -Type DWord -Force -ErrorAction SilentlyContinue
Set-ItemProperty -Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\System" -Name "PublishUserActivities" -Value 0 -Type DWord -Force -ErrorAction SilentlyContinue
`,
    clearFontCache: `
Stop-Service -Name FontCache -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$env:WINDIR\\ServiceProfiles\\LocalService\\AppData\\Local\\FontCache\\*" -Force -ErrorAction SilentlyContinue
Start-Service -Name FontCache -ErrorAction SilentlyContinue
`,
    disableNewsInterests: `
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Feeds" -Name "ShellFeedsTaskbarViewMode" -Value 2 -Type DWord -Force -ErrorAction SilentlyContinue
`,
    disableNagle: `
$adapters = Get-ChildItem -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters\\Interfaces"
foreach ($adapter in $adapters) {
    Set-ItemProperty -Path $adapter.PSPath -Name "TcpAckFrequency" -Value 1 -Type DWord -Force -ErrorAction SilentlyContinue
    Set-ItemProperty -Path $adapter.PSPath -Name "TCPNoDelay" -Value 1 -Type DWord -Force -ErrorAction SilentlyContinue
}
`,
    disableAutoTuning: `
netsh int tcp set global autotuninglevel=disabled | Out-Null
`,
    clearArpCache: `
netsh interface ip delete arpcache | Out-Null
`,
    enableQoS: `
Set-ItemProperty -Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\Psched" -Name "NonBestEffortLimit" -Value 0 -Type DWord -Force -ErrorAction SilentlyContinue
`,
    disableLSO: `
Get-NetAdapterAdvancedProperty -Name "*" -DisplayName "*Large Send Offload*" -ErrorAction SilentlyContinue | Set-NetAdapterAdvancedProperty -RegistryValue 0 -ErrorAction SilentlyContinue
`
};

// ===== HELPER FUNCTIONS =====
function getFeatureRisk(featureId) {
    for (const category of categorizedFeatures) {
        const feature = category.items.find(item => item.id === featureId);
        if (feature) return feature.risk;
    }
    return RISK.LOW;
}

function getAllFeatureIds() {
    const ids = [];
    categorizedFeatures.forEach(cat => cat.items.forEach(item => ids.push(item.id)));
    return ids;
}

function getFeaturesByRisk(riskLevel) {
    const features = [];
    categorizedFeatures.forEach(cat => {
        cat.items.forEach(item => {
            if (item.risk === riskLevel) features.push(item.id);
        });
    });
    return features;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        RISK,
        categorizedFeatures,
        recommendedFeatures,
        gamerModeFeatures,
        dnsProviders,
        featureCommands,
        scriptMessages,
        getFeatureRisk,
        getAllFeatureIds,
        getFeaturesByRisk
    };
}
