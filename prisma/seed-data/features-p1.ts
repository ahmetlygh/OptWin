// Feature seed data — Part 1: System, Maintenance, Services
// Each entry: [slug, category, icon, risk, noRisk, en_title, en_desc, tr_title, tr_desc]
export type FeatureSeed = [string, string, string, "low" | "medium" | "high", boolean, string, string, string, string];

export const featuresP1: FeatureSeed[] = [
    // === SYSTEM ===
    ["cleanTemp", "system", "fa-trash-can", "low", true, "Clean Temporary Files", "Removes temporary files from %temp% and Windows/Temp to free up space.", "Geçici Dosyaları Temizle", "%temp% ve Windows/Temp klasörlerindeki gereksiz dosyaları silerek yer açar."],
    ["cleanPrefetch", "system", "fa-box-archive", "low", true, "Clean Prefetch", "Clears the Prefetch folder to refresh system caching/boot files.", "Prefetch Temizle", "Sistem önbelleğini ve başlangıç dosyalarını yenilemek için temizler."],
    ["recycleBin", "system", "fa-dumpster", "low", true, "Empty Recycle Bin", "Permanently deletes all files currently in the Recycle Bin.", "Çöp Kutusunu Boşalt", "Geri Dönüşüm Kutusundaki dosyaları kalıcı olarak siler."],
    ["disableHibernate", "system", "fa-power-off", "medium", false, "Disable Hibernate", "Disables hibernation to save several GBs of disk space (hiberfil.sys).", "Hazırda Bekleti Kapat", "Disk alanı kazanmak için (hiberfil.sys) hazırda bekletme modunu kapatır."],
    ["disableTelemetry", "system", "fa-user-secret", "medium", false, "Disable Telemetry", "Reduces Windows tracking, data collection, and feedback notifications.", "Telemetriyi Kapat", "Windows izleme, veri toplama ve geri bildirim bildirimlerini azaltır."],
    ["disableGameDVR", "system", "fa-gamepad", "low", true, "Disable Game DVR", "Turns off Xbox Game DVR and Game Bar to free up background resources.", "Oyun Modu (DVR) Kapat", "Arka plan kaynaklarını boşaltmak için Xbox Game DVR ve Oyun Çubuğunu kapatır."],
    ["disableNotifications", "system", "fa-bell-slash", "low", true, "Disable Notifications", "Disables Windows tips, suggestions, and app notifications.", "Bildirimleri Kapat", "Windows ipuçlarını, önerilerini ve uygulama bildirimlerini kapatır."],
    ["highPerformance", "system", "fa-gauge-high", "low", true, "High Performance Mode", "Sets the power plan to 'High Performance' for better responsiveness.", "Yüksek Performans", "Daha iyi tepki süresi için güç planını 'Yüksek Performans' moduna alır."],
    ["ultimatePerformance", "system", "fa-rocket", "medium", false, "Ultimate Performance", "Enables the hidden 'Ultimate Performance' power plan for maximum speed.", "Nihai Performans", "Maksimum hız için gizli 'Nihai Performans' güç planını etkinleştirir."],
    ["disableStartupDelay", "system", "fa-forward-fast", "low", true, "Disable Startup Delay", "Removes Windows startup delay for faster boot times.", "Başlangıç Gecikmesini Kapat", "Daha hızlı açılış için Windows başlangıç gecikmesini kaldırır."],
    ["disableSuperfetch", "system", "fa-memory", "low", true, "Disable Superfetch", "Disables SysMain/Superfetch service (recommended for SSD).", "Superfetch Kapat", "SysMain/Superfetch hizmetini kapatır (SSD için önerilir)."],
    // === MAINTENANCE ===
    ["systemFileCheck", "maintenance", "fa-file-shield", "low", true, "Repair System Files", "Runs sfc /scannow to identify and automatically fix corrupted Windows files.", "Sistem Dosyalarını Onar", "Bozuk Windows dosyalarını tespit edip onarmak için sfc /scannow çalıştırır."],
    ["dismCheck", "maintenance", "fa-stethoscope", "low", true, "DISM Check Health", "Checks for corruption in the Windows image.", "DISM Sağlık Kontrolü", "Windows imajındaki bozulmaları kontrol eder."],
    ["dismRepair", "maintenance", "fa-kit-medical", "medium", false, "DISM Restore Health", "Scans and repairs the Windows image using Windows Update.", "DISM Onarım", "Windows Update kullanarak Windows imajını onarır."],
    ["cleanEventLog", "maintenance", "fa-eraser", "low", true, "Clear Event Logs", "Clears all Windows Event Viewer logs to free up space/clutter.", "Olay Günlüklerini Temizle", "Tüm Windows Olay Görüntüleyici günlüklerini temizler."],
    ["updateCacheClean", "maintenance", "fa-rotate", "medium", false, "Clean Update Cache", "Clears Windows Update download cache (SoftwareDistribution) to fix update errors.", "Güncelleme Önbelleğini Temizle", "Güncelleme hatalarını düzeltmek için Windows Update önbelleğini temizler."],
    ["clearIconCache", "maintenance", "fa-icons", "low", true, "Clear Icon Cache", "Clears Windows icon cache to fix broken icons.", "İkon Önbelleğini Temizle", "Bozuk ikonları düzeltmek için Windows ikon önbelleğini temizler."],
    ["clearThumbsCache", "maintenance", "fa-image", "low", true, "Clear Thumbnail Cache", "Clears thumbnail cache to fix missing previews.", "Küçük Resim Önbelleğini Temizle", "Eksik önizlemeleri düzeltmek için küçük resim önbelleğini temizler."],
    // === SERVICES ===
    ["disableWallet", "services", "fa-wallet", "low", true, "Disable Wallet Service", "Disables the Wallet Service used for mobile payments.", "Cüzdan Hizmetini Kapat", "Mobil ödemeler için kullanılan Cüzdan Hizmetini devre dışı bırakır."],
    ["disableMaps", "services", "fa-map-location-dot", "low", true, "Disable Maps Broker", "Disables downloaded maps manager if you don't use Maps.", "Harita Yöneticisini Kapat", "Harita kullanmıyorsanız harita yöneticisini devre dışı bırakır."],
    ["disableDiagTrack", "services", "fa-user-gear", "medium", false, "Disable DiagTrack", "Disables the Connected User Experiences and Telemetry service.", "DiagTrack'i Kapat", "Bağlı Kullanıcı Deneyimleri ve Telemetri hizmetini kapatır."],
    ["disableFax", "services", "fa-fax", "low", true, "Disable Fax Service", "Disables the legacy Fax service.", "Faks Hizmetini Kapat", "Eski Faks hizmetini devre dışı bırakır."],
    ["disableWer", "services", "fa-bug", "low", true, "Disable Error Reporting", "Disables Windows Error Reporting service.", "Hata Raporlamayı Kapat", "Windows Hata Raporlama hizmetini kapatır."],
    ["disableTouch", "services", "fa-keyboard", "medium", false, "Disable Touch Keyboard", "Disables Touch Keyboard and Handwriting service (TabletInputService).", "Dokunmatik Klavyeyi Kapat", "Dokunmatik Klavye ve El Yazısı hizmetini kapatır."],
    ["disableXbox", "services", "fa-gamepad", "low", true, "Disable Xbox Services", "Disables Xbox Auth, Game Save, and Networking services.", "Xbox Hizmetlerini Kapat", "Xbox Kimlik Doğrulama, Oyun Kaydetme ve Ağ hizmetlerini kapatır."],
    ["disablePrintSpooler", "services", "fa-print", "medium", false, "Disable Print Spooler", "Disables printing service. Recommended if you don't use a printer.", "Yazıcı Hizmetini Kapat", "Yazıcı yazdırma biriktiricisini kapatır. Yazıcı kullanmıyorsanız önerilir."],
    ["disableSearch", "services", "fa-magnifying-glass", "high", false, "Disable Windows Search", "Disables Windows Search Indexing to save CPU/Disk usage.", "Windows Aramayı Kapat", "CPU/Disk kullanımını azaltmak için Windows Arama Dizini'ni kapatır."],
    ["disableRemoteAssistance", "services", "fa-headset", "low", true, "Disable Remote Assistance", "Disables Windows Remote Assistance for security.", "Uzaktan Yardımı Kapat", "Güvenlik için Windows Uzaktan Yardımı devre dışı bırakır."],
    ["disableDeliveryOptimization", "services", "fa-truck-fast", "low", true, "Disable Delivery Optimization", "Disables Windows Update delivery optimization service.", "Teslim Optimizasyonunu Kapat", "Windows Update teslim optimizasyonu hizmetini kapatır."],
];
