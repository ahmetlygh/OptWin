// Feature seed data — Part 2: Network, Privacy, Visual, Extra
import type { FeatureSeed } from "./features-p1";

export const featuresP2: FeatureSeed[] = [
    // === NETWORK ===
    ["flushDNS", "network", "fa-network-wired", "low", true, "Flush DNS Cache", "Resets the DNS resolver cache to fix connection or loading issues.", "DNS Önbelleğini Temizle", "Bağlantı sorunlarını çözmek için DNS çözümleyici önbelleğini sıfırlar."],
    ["disableThrottling", "network", "fa-bolt", "low", true, "Disable Network Throttling", "Disables Windows network throttling mechanism for better throughput.", "Ağ Kısıtlamasını Kapat", "Daha iyi veri akışı için Windows ağ kısıtlama mekanizmasını devre dışı bırakır."],
    ["changeDNS", "network", "fa-globe", "low", true, "Change DNS", "Switch to a faster DNS provider (Cloudflare, Google, Quad9, AdGuard).", "DNS Değiştir", "Daha hızlı bir DNS sağlayıcısına geçin (Cloudflare, Google, Quad9, AdGuard)."],
    ["networkReset", "network", "fa-wifi", "low", true, "Network Stack Reset", "Resets Winsock and TCP/IP stack to fix connectivity issues.", "Ağ Yığınını Sıfırla", "Bağlantı sorunlarını çözmek için Winsock ve TCP/IP yığınını sıfırlar."],
    ["disableNagle", "network", "fa-rocket", "low", true, "Disable Nagle Algorithm", "Disables Nagle algorithm to reduce network latency.", "Nagle Algoritmasını Kapat", "Ağ gecikmesini azaltmak için Nagle algoritmasını devre dışı bırakır."],
    ["disableAutoTuning", "network", "fa-gears", "low", true, "Disable TCP Auto-Tuning", "Disables TCP auto-tuning for improved network performance.", "TCP Auto-Tuning Kapat", "Ağ performansını artırmak için TCP otomatik ayarlamayı kapatır."],
    ["clearArpCache", "network", "fa-broom", "low", true, "Clear ARP Cache", "Clears ARP cache to resolve network connectivity issues.", "ARP Önbelleğini Temizle", "Ağ bağlantı sorunlarını çözmek için ARP önbelleğini temizler."],
    ["enableQoS", "network", "fa-sliders", "low", true, "Enable QoS Optimization", "Removes bandwidth reservation for better network speed.", "QoS Optimizasyonu", "Daha iyi ağ hızı için bant genişliği rezervasyonunu kaldırır."],
    ["disableLSO", "network", "fa-layer-group", "low", true, "Disable Large Send Offload", "Disables LSO to reduce network latency in games.", "Large Send Offload Kapat", "Oyunlarda ağ gecikmesini azaltmak için LSO'yu devre dışı bırakır."],
    ["disableP2PUpdate", "network", "fa-share-nodes", "low", true, "Disable P2P Updates", "Disables peer-to-peer Windows Update sharing.", "P2P Güncellemeleri Kapat", "Eşler arası Windows Update paylaşımını devre dışı bırakır."],
    // === PRIVACY ===
    ["disableCortana", "privacy", "fa-microphone-slash", "medium", false, "Disable Cortana", "Disables Cortana assistant to free up resources.", "Cortana'yı Kapat", "Kaynak kullanımını azaltmak için Cortana asistanını devre dışı bırakır."],
    ["disableOneDrive", "privacy", "fa-cloud-arrow-down", "high", false, "Disable OneDrive", "Removes OneDrive from startup and Explorer.", "OneDrive'ı Kapat", "OneDrive'ı başlangıçtan ve Gezgin'den kaldırır."],
    ["disableLocation", "privacy", "fa-location-crosshairs", "low", true, "Disable Location", "Disables location services for privacy.", "Konumu Kapat", "Gizlilik için konum servislerini devre dışı bırakır."],
    ["disableClipboardHistory", "privacy", "fa-clipboard", "low", true, "Disable Clipboard History", "Disables Windows clipboard history feature.", "Pano Geçmişini Kapat", "Windows pano geçmişi özelliğini devre dışı bırakır."],
    ["disableActivityHistory", "privacy", "fa-clock-rotate-left", "low", true, "Disable Activity History", "Stops Windows from collecting activity history.", "Aktivite Geçmişini Kapat", "Windows'un aktivite geçmişi toplamasını durdurur."],
    ["disableNewsInterests", "privacy", "fa-newspaper", "low", true, "Disable News & Interests", "Removes the news widget from taskbar.", "Haber ve İlgi Alanlarını Kapat", "Görev çubuğundaki haber widget'ını kaldırır."],
    ["disableTimeline", "privacy", "fa-timeline", "low", true, "Disable Timeline", "Disables Windows Timeline feature.", "Zaman Çizelgesini Kapat", "Windows Zaman Çizelgesi özelliğini devre dışı bırakır."],
    ["disableAdvertisingId", "privacy", "fa-rectangle-ad", "low", true, "Disable Advertising ID", "Disables Windows advertising ID for privacy.", "Reklam Kimliğini Kapat", "Gizlilik için Windows reklam kimliğini devre dışı bırakır."],
    // === VISUAL ===
    ["disableTransparency", "visual", "fa-eye-slash", "low", true, "Disable Transparency", "Disables Windows transparency effects for better performance.", "Saydamlığı Kapat", "Performansı artırmak için Windows saydamlık efektlerini kapatır."],
    ["disableAnimations", "visual", "fa-wand-magic-sparkles", "low", true, "Disable Animations", "Disables Windows animations for faster UI response.", "Animasyonları Kapat", "Daha hızlı arayüz tepkisi için Windows animasyonlarını kapatır."],
    ["disableWindowsTips", "visual", "fa-lightbulb", "low", true, "Disable Windows Tips", "Disables Windows tips and suggestions popups.", "Windows İpuçlarını Kapat", "Windows ipuçları ve öneri açılır pencerelerini kapatır."],
    ["disableWindowsSpotlight", "visual", "fa-images", "low", true, "Disable Windows Spotlight", "Disables lock screen rotating images.", "Windows Spotlight Kapat", "Kilit ekranı dönen görsellerini devre dışı bırakır."],
    ["optimizeVisualEffects", "visual", "fa-sliders", "low", true, "Optimize Visual Effects", "Optimizes visual effects for best performance.", "Görsel Efektleri Optimize Et", "En iyi performans için görsel efektleri optimize eder."],
    ["disableLockScreenTips", "visual", "fa-lock", "low", true, "Disable Lock Screen Tips", "Disables tips and ads on lock screen.", "Kilit Ekranı İpuçlarını Kapat", "Kilit ekranındaki ipuçlarını ve reklamları kapatır."],
    // === EXTRA ===
    ["disableSticky", "extra", "fa-keyboard", "low", true, "Disable Sticky Keys", "Disables Sticky Keys shortcut (Shift x5).", "Yapışkan Tuşları Kapat", "Shift x5 kısayolunu ve yapışkan tuşları devre dışı bırakır."],
    ["disableBingSearch", "extra", "fa-magnifying-glass-minus", "low", true, "Disable Bing Search", "Removes Bing search results from the Start Menu.", "Bing Aramayı Kapat", "Başlat menüsünden Bing arama sonuçlarını kaldırır."],
    ["showExtensions", "extra", "fa-file-code", "low", true, "Show File Extensions", "Always show file extensions (e.g. .txt, .exe) in Explorer.", "Dosya Uzantılarını Göster", "Dosya uzantılarını (örn. .txt, .exe) her zaman gösterir."],
    ["showHiddenFiles", "extra", "fa-eye", "low", true, "Show Hidden Files", "Show hidden files and folders in Explorer.", "Gizli Dosyaları Göster", "Gizli dosya ve klasörleri Gezgin'de görünür yapar."],
    ["disableMouseAccel", "extra", "fa-arrow-pointer", "low", true, "Disable Mouse Acceleration", "Disables 'Enhance Pointer Precision' for raw mouse input.", "Fare İvmesini Kapat", "Daha iyi oyun performansı için 'İşaretçi Hassasiyetini Artır' seçeneğini kapatır."],
    ["clearBrowserCache", "extra", "fa-broom", "high", false, "Clear Browser Cache", "Clears cache for Chrome, Edge, and Firefox browsers. May log you out of sites.", "Tarayıcı Önbelleğini Temizle", "Chrome, Edge ve Firefox tarayıcılarının önbelleğini temizler. Sitelerden çıkış yapabilir."],
    ["disableBackgroundApps", "extra", "fa-window-restore", "medium", false, "Disable Background Apps", "Prevents apps from running in the background.", "Arka Plan Uygulamalarını Kapat", "Uygulamaların arka planda çalışmasını engeller."],
    ["enableGpuScheduling", "extra", "fa-microchip", "medium", false, "GPU Scheduling", "Enables Hardware-accelerated GPU scheduling for better gaming.", "GPU Zamanlaması", "Daha iyi oyun performansı için donanım GPU zamanlamasını etkinleştirir."],
    ["disableGameBar", "extra", "fa-bars", "low", true, "Disable Game Bar", "Disables Xbox Game Bar overlay completely.", "Game Bar Kapat", "Xbox Game Bar arayüzünü tamamen devre dışı bırakır."],
];
