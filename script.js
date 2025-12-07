const translations = {
    en: {
        title: "OptWin",
        heroTitle: "Optimize your Windows experience",
        heroDesc: "Select the optimizations you need and generate a custom script instantly.",
        btnText: "Create Script",
        footerText: "Secure & Open Source.",
        scriptSuccess: "Windows optimization successful",
        dnsTitle: "DNS Configuration",
        pingBtn: "Download Ping Test",
        pingTooltip: "Download a script to test latency for various DNS providers.",
        categories: {
            system: "System Optimization",
            network: "Network Optimization",
            maintenance: "Maintenance & Repair",
            services: "Services Management",
            extra: "Extra Tweaks"
        },
        warningModal: {
            msg: "Please select at least one feature to generate a script.",
            conflict: "You can only select one Power Plan (High or Ultimate)."
        },
        presets: {
            recommended: "Recommended Settings",
            selectAll: "Select All",
            reset: "Reset"
        },
        features: {
            cleanTemp: { title: "Clean Temporary Files", desc: "Removes temporary files from %temp% and Windows/Temp to free up space." },
            cleanPrefetch: { title: "Clean Prefetch", desc: "Clears the Prefetch folder to refresh system caching/boot files." },
            recycleBin: { title: "Empty Recycle Bin", desc: "Permanently deletes all files currently in the Recycle Bin." },
            disableHibernate: { title: "Disable Hibernate", desc: "Disables hibernation to save several GBs of disk space (hiberfil.sys)." },
            systemFileCheck: { title: "Repair System Files", desc: "Runs sfc /scannow to identify and automatically fix corrupted Windows files." },
            disableTelemetry: { title: "Disable Telemetry", desc: "Reduces Windows tracking, data collection, and feedback notifications." },
            disableGameDVR: { title: "Disable Game DVR", desc: "Turns off Xbox Game DVR and Game Bar to free up background resources." },
            highPerformance: { title: "High Performance Mode", desc: "Sets the power plan to 'High Performance' for better responsiveness." },
            ultimatePerformance: { title: "Ultimate Performance", desc: "Enables the hidden 'Ultimate Performance' power plan for maximum speed." },
            flushDNS: { title: "Flush DNS Cache", desc: "Resets the DNS resolver cache to fix connection or loading issues." },
            changeDNS: { title: "Change DNS", desc: "Switch to a faster DNS provider (Cloudflare, Google, Quad9, AdGuard)." },
            dismCheck: { title: "DISM Check Health", desc: "Checks for corruption in the Windows image." },
            dismRepair: { title: "DISM Restore Health", desc: "Scans and repairs the Windows image using Windows Update." },
            disableSticky: { title: "Disable Sticky Keys", desc: "Disables Sticky Keys shortcut (Shift x5)." },
            disableBingSearch: { title: "Disable Bing Search", desc: "Removes Bing search results from the Start Menu." },
            disableWallet: { title: "Disable Wallet Service", desc: "Disables the Wallet Service used for mobile payments." },
            disableMaps: { title: "Disable Maps Broker", desc: "Disables downloaded maps manager if you don't use Maps." },
            disableDiagTrack: { title: "Disable DiagTrack", desc: "Disables the Connected User Experiences and Telemetry service." },
            disableFax: { title: "Disable Fax Service", desc: "Disables the legacy Fax service." },
            disableWer: { title: "Disable Error Reporting", desc: "Disables Windows Error Reporting service." },
            disableTouch: { title: "Disable Touch Keyboard", desc: "Disables Touch Keyboard and Handwriting service (TabletInputService)." },
            disableXbox: { title: "Disable Xbox Services", desc: "Disables Xbox Auth, Game Save, and Networking services." },
            disableMouseAccel: { title: "Disable Mouse Acceleration", desc: "Disables 'Enhance Pointer Precision' for raw mouse input." },
            disableTransparency: { title: "Disable Transparency", desc: "Disables Windows transparency effects for better performance." },
            disableNotifications: { title: "Disable Notifications", desc: "Disables Windows tips, suggestions, and app notifications." },
            networkReset: { title: "Network Stack Reset", desc: "Resets Winsock and TCP/IP stack to fix connectivity issues." },
            cleanEventLog: { title: "Clear Event Logs", desc: "Clears all Windows Event Viewer logs to free up space/clutter." },
            updateCacheClean: { title: "Clean Update Cache", desc: "Clears Windows Update download cache (SoftwareDistribution) to fix update errors." },
            disablePrintSpooler: { title: "Disable Print Spooler", desc: "Disables printing service. Recommended if you don't use a printer." },
            disableSearch: { title: "Disable Windows Search", desc: "Disables Windows Search Indexing to save CPU/Disk usage." },
            disableThrottling: { title: "Disable Network Throttling", desc: "Disables Windows network throttling mechanism for better throughput." },
            showExtensions: { title: "Show File Extensions", desc: "Always show file extensions (e.g. .txt, .exe) in Explorer." },
            showHiddenFiles: { title: "Show Hidden Files", desc: "Show hidden files and folders in Explorer." }
        },
        restoreModal: {
            title: "System Restore Point",
            desc: "Do you want to add a System Restore Point creation step to the script? (Recommended)",
            yes: "Add",
            no: "No, Skip"
        },
        scriptMsgs: {
            header: "Faster Windows with OptWin",
            processing: "Processing...",
            success: "Successful",
            fail: "Failed",
            complete: "Operation Completed",
            thankYou: "Thank you for using OptWin",
            author: "Designed by ahmetly_"
        },
        overlay: {
            title: "Script",
            badgeRun: "Can be run multiple times",
            badgeReady: "Ready for use",
            downloadBtn: "Download Script",
            closeBtn: "Close",
            instrTitle: "How to use:",
            step1: "Download the script file below.",
            step2: "Right-click the downloaded file and select <b>Run as Administrator</b>.",
            step3: "If Windows SmartScreen appears, click 'More info' and then 'Run anyway'."
        }
    },
    tr: {
        title: "OptWin",
        heroTitle: "Windows Deneyiminizi Hızlandırın",
        heroDesc: "İhtiyacınız olan optimizasyonları seçin ve anında sizin için bir script oluşturun.",
        btnText: "Script Oluştur",
        footerText: "Güvenli ve Açık Kaynak.",
        scriptSuccess: "Windows optimizasyonu başarılı",
        dnsTitle: "DNS Yapılandırması",
        pingBtn: "Ping Testi İndir",
        pingTooltip: "En hızlı DNS sunucusunu bulmak için testi indirin.",
        categories: {
            system: "Bilgisayar Optimizasyonu",
            network: "Ağ Optimizasyonu",
            maintenance: "Bakım ve Onarım",
            services: "Hizmet Yönetimi",
            extra: "Ekstra Ayarlar"
        },
        warningModal: {
            msg: "Lütfen script oluşturmak için en az bir özellik seçin.",
            conflict: "Sadece bir Güç Planı seçebilirsiniz (Yüksek veya Nihai)."
        },
        presets: {
            recommended: "Önerilen Ayarlar",
            selectAll: "Hepsini Seç",
            reset: "Sıfırla"
        },
        features: {
            cleanTemp: { title: "Geçici Dosyaları Temizle", desc: "%temp% ve Windows/Temp klasörlerindeki gereksiz dosyaları silerek yer açar." },
            cleanPrefetch: { title: "Prefetch Temizle", desc: "Sistem önbelleğini ve başlangıç dosyalarını yenilemek için temizler." },
            recycleBin: { title: "Çöp Kutusunu Boşalt", desc: "Geri Dönüşüm Kutusundaki dosyaları kalıcı olarak siler." },
            disableHibernate: { title: "Hazırda Bekleti Kapat", desc: "Disk alanı kazanmak için (hiberfil.sys) hazırda bekletme modunu kapatır." },
            systemFileCheck: { title: "Sistem Dosyalarını Onar", desc: "Bozuk Windows dosyalarını tespit edip onarmak için sfc /scannow çalıştırır." },
            disableTelemetry: { title: "Telemetriyi Kapat", desc: "Windows izleme, veri toplama ve geri bildirim bildirimlerini azaltır." },
            disableGameDVR: { title: "Oyun Modu (DVR) Kapat", desc: "Arka plan kaynaklarını boşaltmak için Xbox Game DVR ve Oyun Çubuğunu kapatır." },
            highPerformance: { title: "Yüksek Performans", desc: "Daha iyi tepki süresi için güç planını 'Yüksek Performans' moduna alır." },
            ultimatePerformance: { title: "Nihai Performans", desc: "Maksimum hız için gizli 'Nihai Performans' güç planını etkinleştirir." },
            flushDNS: { title: "DNS Önbelleğini Temizle", desc: "Bağlantı sorunlarını çözmek için DNS çözümleyici önbelleğini sıfırlar." },
            changeDNS: { title: "DNS Değiştir", desc: "Daha hızlı bir DNS sağlayıcısına geçin (Cloudflare, Google, Quad9, AdGuard)." },
            dismCheck: { title: "DISM Sağlık Kontrolü", desc: "Windows imajındaki bozulmaları kontrol eder." },
            dismRepair: { title: "DISM Onarım", desc: "Windows Update kullanarak Windows imajını onarır." },
            disableSticky: { title: "Yapışkan Tuşları Kapat", desc: "Shift x5 kısayolunu ve yapışkan tuşları devre dışı bırakır." },
            disableBingSearch: { title: "Bing Aramayı Kapat", desc: "Başlat menüsünden Bing arama sonuçlarını kaldırır." },
            disableWallet: { title: "Cüzdan Hizmetini Kapat", desc: "Mobil ödemeler için kullanılan Cüzdan Hizmetini devre dışı bırakır." },
            disableMaps: { title: "Harita Yöneticisini Kapat", desc: "Harita kullanmıyorsanız harita yöneticisini devre dışı bırakır." },
            disableDiagTrack: { title: "DiagTrack'i Kapat", desc: "Bağlı Kullanıcı Deneyimleri ve Telemetri hizmetini kapatır." },
            disableFax: { title: "Faks Hizmetini Kapat", desc: "Eski Faks hizmetini devre dışı bırakır." },
            disableWer: { title: "Hata Raporlamayı Kapat", desc: "Windows Hata Raporlama hizmetini kapatır." },
            disableTouch: { title: "Dokunmatik Klavyeyi Kapat", desc: "Dokunmatik Klavye ve El Yazısı hizmetini kapatır." },
            disableXbox: { title: "Xbox Hizmetlerini Kapat", desc: "Xbox Kimlik Doğrulama, Oyun Kaydetme ve Ağ hizmetlerini kapatır." },
            disableMouseAccel: { title: "Fare İvmesini Kapat", desc: "Daha iyi oyun performansı için 'İşaretçi Hassasiyetini Artır' seçeneğini kapatır." },
            disableTransparency: { title: "Saydamlığı Kapat", desc: "Performansı artırmak için Windows saydamlık efektlerini kapatır." },
            disableNotifications: { title: "Bildirimleri Kapat", desc: "Windows ipuçlarını, önerilerini ve uygulama bildirimlerini kapatır." },
            networkReset: { title: "Ağ Yığınını Sıfırla", desc: "Bağlantı sorunlarını çözmek için Winsock ve TCP/IP yığınını sıfırlar." },
            cleanEventLog: { title: "Olay Günlüklerini Temizle", desc: "Tüm Windows Olay Görüntüleyici günlüklerini temizler." },
            updateCacheClean: { title: "Güncelleme Önbelleğini Temizle", desc: "Güncelleme hatalarını düzeltmek için Windows Update önbelleğini temizler." },
            disablePrintSpooler: { title: "Yazıcı Hizmetini Kapat", desc: "Yazıcı yazdırma biriktiricisini kapatır. Yazıcı kullanmıyorsanız önerilir." },
            disableSearch: { title: "Windows aramayı Kapat", desc: "CPU/Disk kullanımını azaltmak için Windows Arama Dizini'ni kapatır." },
            disableThrottling: { title: "Ağ Kısıtlamasını Kapat", desc: "Daha iyi veri akışı için Windows ağ kısıtlama mekanizmasını devre dışı bırakır." },
            showExtensions: { title: "Dosya Uzantılarını Göster", desc: "Dosya uzantılarını (örn. .txt, .exe) her zaman gösterir." },
            showHiddenFiles: { title: "Gizli Dosyaları Göster", desc: "Gizli dosya ve klasörleri Gezgin'de görünür yapar." }
        },
        restoreModal: {
            title: "Sistem Geri Yükleme Noktası",
            desc: "Scripte geri yükleme noktası oluşturmayı eklemek ister misiniz? (Önerilir)",
            yes: "Ekle",
            no: "Hayır, atla"
        },
        scriptMsgs: {
            header: "Faster Windows with OptWin",
            processing: "Islem yapiliyor...",
            success: "Basarili",
            fail: "Basarisiz",
            complete: "Islem Tamamlandi",
            thankYou: "OptWin'i kullandiginiz icin tesekkurler",
            author: "OptWin, ahmetly tarafindan tasarlandi"
        },
        overlay: {
            title: "Script",
            badgeRun: "Birden çok kez çalıştırılabilir",
            badgeReady: "Kullanım için hazır",
            downloadBtn: "Script İndir",
            closeBtn: "Kapat",
            instrTitle: "Nasıl kullanılır:",
            step1: "Script dosyasını aşağıdaki butondan indirin.",
            step2: "İndirilen dosyaya sağ tıklayın ve <b>Yönetici olarak çalıştır</b> seçeneğini seçin.",
            step3: "Eğer Windows SmartScreen görünürse, 'Ek bilgi'ye ve ardından 'Yine de çalıştır'a tıklayın."
        }
    }
};

const categorizedFeatures = [
    {
        id: 'system',
        items: [
            { id: 'cleanTemp', icon: 'fa-trash-can' },
            { id: 'cleanPrefetch', icon: 'fa-box-archive' },
            { id: 'recycleBin', icon: 'fa-dumpster' },
            { id: 'disableHibernate', icon: 'fa-power-off' },
            { id: 'disableTelemetry', icon: 'fa-user-secret' },
            { id: 'disableGameDVR', icon: 'fa-gamepad' },
            { id: 'disableNotifications', icon: 'fa-bell-slash' },
            { id: 'highPerformance', icon: 'fa-gauge-high' },
            { id: 'ultimatePerformance', icon: 'fa-rocket' }
        ]
    },
    {
        id: 'maintenance',
        items: [
            { id: 'systemFileCheck', icon: 'fa-file-shield' },
            { id: 'dismCheck', icon: 'fa-stethoscope' },
            { id: 'dismRepair', icon: 'fa-kit-medical' },
            { id: 'cleanEventLog', icon: 'fa-eraser' },
            { id: 'updateCacheClean', icon: 'fa-rotate' },
            { id: 'networkReset', icon: 'fa-wifi' }
        ]
    },
    {
        id: 'services',
        items: [
            { id: 'disableWallet', icon: 'fa-wallet' },
            { id: 'disableMaps', icon: 'fa-map-location-dot' },
            { id: 'disableDiagTrack', icon: 'fa-user-gear' },
            { id: 'disableFax', icon: 'fa-fax' },
            { id: 'disableWer', icon: 'fa-bug' },
            { id: 'disableTouch', icon: 'fa-keyboard' },
            { id: 'disableXbox', icon: 'fa-gamepad' },
            { id: 'disablePrintSpooler', icon: 'fa-print' },
            { id: 'disableSearch', icon: 'fa-magnifying-glass' }
        ]
    },
    {
        id: 'network',
        items: [
            { id: 'flushDNS', icon: 'fa-network-wired' },
            { id: 'disableThrottling', icon: 'fa-bolt' },
            { id: 'changeDNS', icon: 'fa-globe' }
        ]
    },
    {
        id: 'extra',
        items: [
            { id: 'disableSticky', icon: 'fa-keyboard' },
            { id: 'disableBingSearch', icon: 'fa-magnifying-glass-minus' },
            { id: 'showExtensions', icon: 'fa-file-code' },
            { id: 'showHiddenFiles', icon: 'fa-eye' },
            { id: 'disableMouseAccel', icon: 'fa-arrow-pointer' },
            { id: 'disableTransparency', icon: 'fa-eye-slash' }
        ]
    }
];

// State
let currentLang = 'en';
let currentTheme = localStorage.getItem('theme') || 'dark';
let selectedFeatures = new Set();
let selectedDnsProvider = 'cloudflare';
let usageCount = localStorage.getItem('usageCount') || 0;

const recommendedFeatures = new Set([
    'cleanTemp', 'cleanPrefetch', 'recycleBin',
    'systemFileCheck', 'dismCheck', 'dismRepair', 'disableTelemetry',
    'disableGameDVR', 'highPerformance',
    'disableSearch', 'disableThrottling', 'showExtensions',
    'cleanEventLog', 'updateCacheClean', 'disableMaps', 'disableWallet',
    'disableDiagTrack', 'disableWer', 'disableXbox',
    'disableMouseAccel', 'disableFax', 'disableTouch'
]);

// Elements
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('i');
const langOpts = document.querySelectorAll('.lang-opt');
const featuresContainer = document.getElementById('features-container');
const generateBtn = document.getElementById('generate-btn');
const dnsSettingsPanel = document.getElementById('dns-settings-panel');
const pingTestBtn = document.getElementById('ping-test-btn');

const btnRecommended = document.getElementById('btn-recommended');
const btnSelectAll = document.getElementById('btn-select-all');
const btnReset = document.getElementById('btn-reset');

// Modal Elements
const restoreModal = document.getElementById('restore-modal');
const modalYesBtn = document.getElementById('modal-yes');
const modalNoBtn = document.getElementById('modal-no');
const modalCloseBtn = document.getElementById('modal-close');

const warningModal = document.getElementById('warning-modal');
const warningCloseBtn = document.getElementById('warning-close');
const warningMsg = document.getElementById('warning-msg');

// Init
function init() {
    applyTheme(currentTheme);
    renderFeatures();
    updateTexts();

    // Event Listeners
    themeToggle.addEventListener('click', toggleTheme);
    langOpts.forEach(opt => opt.addEventListener('click', () => setLang(opt.dataset.lang)));
    generateBtn.addEventListener('click', initiateGeneration);
    pingTestBtn.addEventListener('click', generatePingTest);

    // Presets Listeners
    btnRecommended.addEventListener('click', () => applyPreset('recommended'));
    btnSelectAll.addEventListener('click', () => applyPreset('all'));
    btnReset.addEventListener('click', () => applyPreset('reset'));

    // Modal Listeners
    modalYesBtn.addEventListener('click', () => { closeModal(); finalizeGeneration(true); });
    modalNoBtn.addEventListener('click', () => { closeModal(); finalizeGeneration(false); });
    modalCloseBtn.addEventListener('click', closeModal);

    // Warning Modal Listeners
    warningCloseBtn.addEventListener('click', closeWarning);

    // Close modals on click outside or Escape
    window.addEventListener('click', (e) => {
        if (e.target === restoreModal) closeModal();
        if (e.target === warningModal) closeWarning();
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            closeWarning();
        }
    });

    // DNS Radio Listeners
    document.querySelectorAll('input[name="dns-provider"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val) {
                selectedDnsProvider = val;
                selectedFeatures.add('changeDNS');
                // Update visual state of changeDNS card
                const card = document.querySelector(`.feature-card[data-fid="changeDNS"]`);
                if (card) card.classList.add('selected');
            }
        });
    });

    // Check default DNS radio
    const defaultRadio = document.querySelector('input[value="cloudflare"]');
    if (defaultRadio) defaultRadio.checked = true;
}

// Theme Logic
function applyTheme(theme) {
    document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
    themeIcon.className = theme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    localStorage.setItem('theme', theme);
    currentTheme = theme;
}

function toggleTheme() {
    themeIcon.classList.add('spin-anim');
    setTimeout(() => themeIcon.classList.remove('spin-anim'), 600);
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

// Language Logic
function setLang(lang) {
    currentLang = lang;
    langOpts.forEach(opt => opt.classList.toggle('active', opt.dataset.lang === lang));
    updateTexts();
    renderFeatures();
}

function updateTexts() {
    const t = translations[currentLang];

    // Safe update helper
    const safe = (id, val, html = false) => {
        const el = document.getElementById(id);
        if (el) html ? el.innerHTML = val : el.textContent = val;
    };

    const safeQ = (selector, val, html = false) => {
        const el = document.querySelector(selector);
        if (el) html ? el.innerHTML = val : el.textContent = val;
    };

    // Basic UI
    safe('app-title', t.title);
    safe('hero-title', t.heroTitle);
    safe('hero-desc', t.heroDesc);
    safe('btn-text', t.btnText);
    safe('footer-text', t.footerText);

    // DNS Panel Strings
    safe('dns-title', t.dnsTitle);
    safe('ping-btn-text', t.pingBtn);

    // Modal Strings
    safe('modal-title', t.restoreModal.title);
    safe('modal-desc', t.restoreModal.desc);
    safe('modal-yes', `<i class="fa-solid fa-check"></i> ${t.restoreModal.yes}`, true);
    safe('modal-no', t.restoreModal.no);

    // Update Category Titles
    document.querySelectorAll('[data-cat-id]').forEach(el => {
        const catId = el.getAttribute('data-cat-id');
        if (t.categories[catId]) el.textContent = t.categories[catId];
    });

    // Update Warning
    if (warningMsg) warningMsg.textContent = t.warningModal.msg;

    // Preset Buttons
    safe('txt-recommended', t.presets.recommended);
    safe('txt-select-all', t.presets.selectAll);
    safe('txt-reset', t.presets.reset);

    // Overlay Strings
    const overlay = t.overlay;
    safeQ('.overlay-header h2', overlay.title);
    safe('badge-run', overlay.badgeRun);
    safe('badge-ready', overlay.badgeReady);
    safe('btn-download', overlay.downloadBtn);
    safe('btn-close', overlay.closeBtn);
    safe('instr-title', `<i class="fa-solid fa-book"></i> ${overlay.instrTitle}`, true);
    safe('step-1', overlay.step1, true);
    safe('step-2', overlay.step2, true);
    safe('step-3', overlay.step3, true);
}

// Render Features with Categories
function renderFeatures() {
    featuresContainer.innerHTML = '';
    const tCats = translations[currentLang].categories;
    const tFeats = translations[currentLang].features;

    categorizedFeatures.forEach(cat => {
        const section = document.createElement('div');
        section.className = 'category-section';

        const title = document.createElement('h3');
        title.className = 'category-title';
        title.textContent = tCats[cat.id];
        title.setAttribute('data-cat-id', cat.id);
        section.appendChild(title);

        const grid = document.createElement('div');
        grid.className = 'features-grid';

        cat.items.forEach(f => {
            const card = document.createElement('div');
            card.className = `feature-card ${selectedFeatures.has(f.id) ? 'selected' : ''}`;

            // Add click listener
            card.onclick = () => toggleFeature(f.id, card);
            // Also store ID for easier finding via selector if needed, though we pass element directly
            card.setAttribute('data-fid', f.id);

            const fTitle = tFeats[f.id] ? tFeats[f.id].title : f.id;
            const fDesc = tFeats[f.id] ? tFeats[f.id].desc : '';
            const iconClass = f.type === 'brands' ? 'fa-brands' : 'fa-solid';

            card.innerHTML = `
                <div class="feature-icon">
                    <i class="${iconClass} ${f.icon}"></i>
                </div>
                <div class="feature-info">
                    <h3>${fTitle}</h3>
                    <p>${fDesc}</p>
                </div>
                <div class="checkbox-indicator"></div>
            `;
            grid.appendChild(card);
        });

        section.appendChild(grid);
        featuresContainer.appendChild(section);
    });
}

function toggleFeature(id, card) {
    const isSelecting = !selectedFeatures.has(id);

    // Mutual Exclusion for Performance Modes
    if (id === 'highPerformance' && isSelecting) {
        if (selectedFeatures.has('ultimatePerformance')) {
            selectedFeatures.delete('ultimatePerformance');
            // Visually deselect ultimate
            const ultCard = document.querySelector(`.feature-card[data-fid="ultimatePerformance"]`);
            if (ultCard) ultCard.classList.remove('selected');
        }
    }
    if (id === 'ultimatePerformance' && isSelecting) {
        if (selectedFeatures.has('highPerformance')) {
            selectedFeatures.delete('highPerformance');
            // Visually deselect high
            const highCard = document.querySelector(`.feature-card[data-fid="highPerformance"]`);
            if (highCard) highCard.classList.remove('selected');
        }
    }

    if (isSelecting) {
        selectedFeatures.add(id);
        card.classList.add('selected');
    } else {
        selectedFeatures.delete(id);
        card.classList.remove('selected');
    }

    if (id === 'changeDNS') toggleDnsPanel(selectedFeatures.has('changeDNS'));
}

function toggleDnsPanel(show) {
    if (show) {
        dnsSettingsPanel.classList.remove('hidden');
    } else {
        dnsSettingsPanel.classList.add('hidden');
    }
}

// Modal Logic
function initiateGeneration() {
    if (selectedFeatures.size === 0) {
        // Show custom warning modal
        warningModal.classList.remove('hidden');
        if (warningMsg) warningMsg.textContent = translations[currentLang].warningModal.msg;
        return;
    }

    // Check for power plan conflict
    if (selectedFeatures.has('highPerformance') && selectedFeatures.has('ultimatePerformance')) {
        warningModal.classList.remove('hidden');
        if (warningMsg) warningMsg.textContent = translations[currentLang].warningModal.conflict;
        return;
    }

    if (selectedFeatures.has('changeDNS') && !selectedDnsProvider) {
        alert(currentLang === 'tr' ? 'Lütfen bir DNS sağlayıcısı seçin.' : 'Please select a DNS provider.');
        dnsSettingsPanel.scrollIntoView({ behavior: 'smooth' });
        return;
    }

    restoreModal.classList.remove('hidden');
}

function closeModal() {
    restoreModal.classList.add('hidden');
}

function closeWarning() {
    warningModal.classList.add('hidden');
}

// Overlay Logic
const scriptOverlay = document.getElementById('script-overlay');
const closeOverlayBtn = document.getElementById('close-overlay-btn');
const downloadScriptBtn = document.getElementById('download-script-btn');
let currentBatContent = '';

if (closeOverlayBtn) {
    closeOverlayBtn.addEventListener('click', () => {
        scriptOverlay.classList.remove('active');
    });
}

if (downloadScriptBtn) {
    downloadScriptBtn.addEventListener('click', () => {
        downloadFile('OptWin_Script.bat', currentBatContent);
    });
}

// Ping Test
function generatePingTest() {
    let batContent = `@echo off\r\n`;
    batContent += `title OptWin DNS Latency Test\r\n`;
    batContent += `color 0D\r\n`; // Purple on Black
    batContent += `cls\r\n`;
    batContent += `echo ==================================================\r\n`;
    batContent += `echo       OptWin DNS Latency Test\r\n`;
    batContent += `echo ==================================================\r\n`;
    batContent += `echo Testing DNS Latency (Ping in ms). This may take a minute...\r\n`;
    batContent += `echo.\r\n`;

    const targets = [
        { name: "Cloudflare (1.1.1.1)", ip: "1.1.1.1" },
        { name: "Google (8.8.8.8)", ip: "8.8.8.8" },
        { name: "OpenDNS (208.67.222.222)", ip: "208.67.222.222" },
        { name: "Quad9 (9.9.9.9)", ip: "9.9.9.9" },
        { name: "AdGuard (94.140.14.14)", ip: "94.140.14.14" },
    ];

    targets.forEach(t => {
        batContent += `echo [Testing] ${t.name}...\r\n`;
        batContent += `ping -n 4 ${t.ip} | find "Average"\r\n`;
        batContent += `echo ------------------------------------------\r\n`;
    });

    batContent += `echo.\r\n`;
    batContent += `echo Done. Compare the "Average =" times above. Lower is better.\r\n`;
    batContent += `echo.\r\n`;
    batContent += `pause\r\n`;

    downloadFile('OptWin_DNS_Test.bat', batContent);
}

// Preset Logic
function applyPreset(type) {
    // Collect all cards to update visual state efficiently
    const allCards = document.querySelectorAll('.feature-card');

    if (type === 'reset') {
        selectedFeatures.clear();
        allCards.forEach(c => c.classList.remove('selected'));
        toggleDnsPanel(false);
        return;
    }

    if (type === 'recommended') {
        selectedFeatures.clear();
        recommendedFeatures.forEach(id => selectedFeatures.add(id));
    }

    if (type === 'all') {
        // Add everything except conflicting power plans
        // Remove High Performance if Ultimate is available, or just prioritize one
        if (selectedFeatures.has('highPerformance')) selectedFeatures.delete('highPerformance');

        categorizedFeatures.forEach(cat => {
            cat.items.forEach(item => {
                if (item.id === 'highPerformance') return; // Skip High, prefer Ultimate
                selectedFeatures.add(item.id);
            });
        });
    }

    // visual update
    allCards.forEach(c => {
        const fid = c.getAttribute('data-fid');
        if (selectedFeatures.has(fid)) {
            c.classList.add('selected');
        } else {
            c.classList.remove('selected');
        }
    });

    toggleDnsPanel(selectedFeatures.has('changeDNS'));
}

// Script Generation
function finalizeGeneration(createRestorePoint) {
    usageCount++;
    localStorage.setItem('usageCount', usageCount);

    const t = translations[currentLang].scriptMsgs;
    const tFeat = translations[currentLang].features;

    let batContent = `@echo off\r\n`;
    batContent += `title OptWin Optimized Script\r\n`;
    batContent += `:: OptWin Optimized Script\r\n`;
    batContent += `:: Generated on ${new Date().toLocaleString()}\r\n`;
    batContent += `\r\n`;

    // Admin Check (New Logic: Check and Warn)
    batContent += `net session >nul 2>&1\r\n`;
    batContent += `if %errorLevel% neq 0 (\r\n`;
    batContent += `    echo.\r\n`;
    batContent += `    echo [ERROR] This script requires Administrator privileges.\r\n`;
    batContent += `    echo Please right-click the script and select "Run as Administrator".\r\n`;
    batContent += `    echo.\r\n`;
    batContent += `    echo Press any key to exit...\r\n`;
    batContent += `    pause >nul\r\n`;
    batContent += `    exit\r\n`;
    batContent += `)\r\n`;

    batContent += `\r\ncls\r\n`;
    // Set color to Light Purple (D) on standard Black (0)
    batContent += `color 0D\r\n`;

    batContent += `echo ==================================================\r\n`;
    batContent += `echo       ${t.header}\r\n`;
    batContent += `echo ==================================================\r\n`;
    batContent += `echo.\r\n`;

    if (createRestorePoint) {
        batContent += `echo [${t.processing}] Creating System Restore Point...\r\n`;
        batContent += `powershell -Command "Enable-ComputerRestore -Drive 'C:\\'" >nul 2>&1\r\n`;
        batContent += `reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\SystemRestore" /v SystemRestorePointCreationFrequency /t REG_DWORD /d 0 /f >nul 2>&1\r\n`;
        batContent += `reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\SystemRestore" /v SystemRestorePointCreationFrequency /t REG_DWORD /d 0 /f >nul 2>&1\r\n`;
        batContent += `powershell -Command "Checkpoint-Computer -Description 'OptWin Optimization' -RestorePointType 'MODIFY_SETTINGS'" >nul 2>&1\r\n`;
        // Green Success Text
        batContent += `powershell -Command "Write-Host '   - Success' -ForegroundColor Green"\r\n`;
        batContent += `echo.\r\n`;
    }

    // Create ordered list of features
    const orderedFeatureIds = [];
    categorizedFeatures.forEach(cat => cat.items.forEach(item => orderedFeatureIds.push(item.id)));

    // Now iterate based on ordered list
    orderedFeatureIds.forEach(id => {
        if (!selectedFeatures.has(id)) return;
        let featureTitle = tFeat[id].title;
        if (currentLang === 'tr') {
            featureTitle = featureTitle
                .replace(/ç/g, 'c').replace(/Ç/g, 'C')
                .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
                .replace(/ı/g, 'i').replace(/İ/g, 'I')
                .replace(/ö/g, 'o').replace(/Ö/g, 'O')
                .replace(/ş/g, 's').replace(/Ş/g, 'S')
                .replace(/ü/g, 'u').replace(/Ü/g, 'U');
        }

        batContent += `echo [${t.processing}] ${featureTitle}...\r\n`;

        switch (id) {
            case 'cleanTemp':
                batContent += `del /q /f /s "%temp%\\*" >nul 2>&1\r\n`;
                batContent += `rd /s /q "%temp%" >nul 2>&1\r\n`;
                batContent += `md "%temp%" >nul 2>&1\r\n`;
                batContent += `del /q /f /s "%WINDIR%\\Temp\\*" >nul 2>&1\r\n`;
                break;
            case 'cleanPrefetch':
                batContent += `del /q /f /s "%WINDIR%\\Prefetch\\*" >nul 2>&1\r\n`;
                break;
            case 'flushDNS':
                batContent += `ipconfig /flushdns >nul 2>&1\r\n`;
                break;
            case 'recycleBin':
                batContent += `rd /s /q %systemdrive%\\$Recycle.Bin >nul 2>&1\r\n`;
                break;
            case 'disableHibernate':
                batContent += `powercfg.exe /hibernate off >nul 2>&1\r\n`;
                break;
            case 'systemFileCheck':
                batContent += `sfc /scannow\r\n`;
                break;
            case 'dismCheck':
                batContent += `dism /online /cleanup-image /checkhealth\r\n`;
                break;
            case 'dismRepair':
                batContent += `dism /online /cleanup-image /restorehealth\r\n`;
                break;
            case 'disableSticky':
                batContent += `reg add "HKCU\\Control Panel\\Accessibility\\StickyKeys" /v Flags /t REG_SZ /d "506" /f >nul 2>&1\r\n`;
                break;
            case 'disableNotifications':
                batContent += `reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\PushNotifications" /v ToastEnabled /t REG_DWORD /d 0 /f >nul 2>&1\r\n`;
                batContent += `reg add "HKCU\\Software\\Policies\\Microsoft\\Windows\\CurrentVersion\\PushNotifications" /v NoToastApplicationNotification /t REG_DWORD /d 1 /f >nul 2>&1\r\n`;
                break;
            case 'networkReset':
                batContent += `netsh int ip reset >nul 2>&1\r\n`;
                batContent += `netsh winsock reset >nul 2>&1\r\n`;
                break;
            case 'cleanEventLog':
                batContent += `for /F "tokens=*" %%1 in ('wevtutil.exe el') DO wevtutil.exe cl "%%1" >nul 2>&1\r\n`;
                break;
            case 'updateCacheClean':
                batContent += `net stop wuauserv >nul 2>&1\r\n`;
                batContent += `net stop bits >nul 2>&1\r\n`;
                batContent += `del /f /s /q %windir%\\SoftwareDistribution\\Download\\* >nul 2>&1\r\n`;
                batContent += `net start wuauserv >nul 2>&1\r\n`;
                batContent += `net start bits >nul 2>&1\r\n`;
                break;
            case 'disablePrintSpooler':
                batContent += `sc config Spooler start= disabled >nul 2>&1\r\n`;
                batContent += `sc stop Spooler >nul 2>&1\r\n`;
                break;
            case 'disableSearch':
                batContent += `sc config WSearch start= disabled >nul 2>&1\r\n`;
                batContent += `sc stop WSearch >nul 2>&1\r\n`;
                break;
            case 'disableThrottling':
                batContent += `reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile" /v NetworkThrottlingIndex /t REG_DWORD /d 4294967295 /f >nul 2>&1\r\n`;
                break;
            case 'disableBingSearch':
                batContent += `reg add "HKCU\\Software\\Policies\\Microsoft\\Windows\\Explorer" /v DisableSearchBoxSuggestions /t REG_DWORD /d 1 /f >nul 2>&1\r\n`;
                batContent += `reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\Windows Search" /v DisableWebSearch /t REG_DWORD /d 1 /f >nul 2>&1\r\n`;
                batContent += `reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\Windows Search" /v ConnectedSearchUseWeb /t REG_DWORD /d 0 /f >nul 2>&1\r\n`;
                break;
            case 'showExtensions':
                batContent += `reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v HideFileExt /t REG_DWORD /d 0 /f >nul 2>&1\r\n`;
                break;
            case 'showHiddenFiles':
                batContent += `reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v Hidden /t REG_DWORD /d 1 /f >nul 2>&1\r\n`;
                break;
            case 'disableTelemetry':
                batContent += `reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection" /v AllowTelemetry /t REG_DWORD /d 0 /f >nul 2>&1\r\n`;
                batContent += `reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\AdvertisingInfo" /v DisabledByGroupPolicy /t REG_DWORD /d 1 /f >nul 2>&1\r\n`;
                break;
            case 'disableGameDVR':
                batContent += `reg add "HKCU\\System\\GameConfigStore" /v GameDVR_Enabled /t REG_DWORD /d 0 /f >nul 2>&1\r\n`;
                batContent += `reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\GameDVR" /v AllowGameDVR /t REG_DWORD /d 0 /f >nul 2>&1\r\n`;
                break;
            case 'highPerformance':
                batContent += `powercfg /list | findstr "8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c" >nul\r\n`;
                batContent += `if %errorlevel% neq 0 (powercfg -duplicatescheme 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c)\r\n`;
                batContent += `powercfg /s 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c >nul 2>&1\r\n`;
                break;
            case 'ultimatePerformance':
                batContent += `set "foundScheme="\r\n`;
                batContent += `for /f "tokens=4" %%a in ('powercfg /list ^| findstr /i "Ultimate Nihai Extreme"') do set "foundScheme=%%a"\r\n`;
                batContent += `if defined foundScheme (\r\n`;
                batContent += `    powercfg /setactive %foundScheme%\r\n`;
                batContent += `) else (\r\n`;
                batContent += `    powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61 >nul\r\n`;
                batContent += `    for /f "tokens=4" %%a in ('powercfg /list ^| findstr /i "Ultimate Nihai"') do powercfg /setactive %%a\r\n`;
                batContent += `)\r\n`;
                break;
            case 'disableWallet':
                batContent += `sc config WalletService start= disabled >nul 2>&1\r\n`;
                batContent += `sc stop WalletService >nul 2>&1\r\n`;
                break;
            case 'disableMaps':
                batContent += `sc config MapsBroker start= disabled >nul 2>&1\r\n`;
                batContent += `sc stop MapsBroker >nul 2>&1\r\n`;
                break;
            case 'disableDiagTrack':
                batContent += `sc config DiagTrack start= disabled >nul 2>&1\r\n`;
                batContent += `sc stop DiagTrack >nul 2>&1\r\n`;
                break;
            case 'disableFax':
                batContent += `sc config Fax start= disabled >nul 2>&1\r\n`;
                batContent += `sc stop Fax >nul 2>&1\r\n`;
                break;
            case 'disableWer':
                batContent += `sc config WerSvc start= disabled >nul 2>&1\r\n`;
                batContent += `sc stop WerSvc >nul 2>&1\r\n`;
                batContent += `reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\Windows Error Reporting" /v Disabled /t REG_DWORD /d 1 /f >nul 2>&1\r\n`;
                break;
            case 'disableTouch':
                batContent += `sc config TabletInputService start= disabled >nul 2>&1\r\n`;
                batContent += `sc stop TabletInputService >nul 2>&1\r\n`;
                break;
            case 'disableXbox':
                batContent += `sc config XblAuthManager start= disabled >nul 2>&1\r\n`;
                batContent += `sc stop XblAuthManager >nul 2>&1\r\n`;
                batContent += `sc config XblGameSave start= disabled >nul 2>&1\r\n`;
                batContent += `sc stop XblGameSave >nul 2>&1\r\n`;
                batContent += `sc config XboxNetApiSvc start= disabled >nul 2>&1\r\n`;
                batContent += `sc stop XboxNetApiSvc >nul 2>&1\r\n`;
                break;
            case 'disableMouseAccel':
                batContent += `reg add "HKCU\\Control Panel\\Mouse" /v MouseSpeed /t REG_SZ /d "0" /f >nul 2>&1\r\n`;
                batContent += `reg add "HKCU\\Control Panel\\Mouse" /v MouseThreshold1 /t REG_SZ /d "0" /f >nul 2>&1\r\n`;
                batContent += `reg add "HKCU\\Control Panel\\Mouse" /v MouseThreshold2 /t REG_SZ /d "0" /f >nul 2>&1\r\n`;
                break;
            case 'disableTransparency':
                batContent += `reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize" /v EnableTransparency /t REG_DWORD /d 0 /f >nul 2>&1\r\n`;
                break;
            case 'changeDNS':
                // Handled below
                break;
        }

    });

    // Handle DNS at the end if selected
    if (selectedFeatures.has('changeDNS')) {
        let prim = "1.1.1.1";
        let sec = "1.0.0.1";
        if (selectedDnsProvider === 'google') { prim = "8.8.8.8"; sec = "8.8.4.4"; }
        else if (selectedDnsProvider === 'opendns') { prim = "208.67.222.222"; sec = "208.67.220.220"; }
        else if (selectedDnsProvider === 'quad9') { prim = "9.9.9.9"; sec = "149.112.112.112"; }
        else if (selectedDnsProvider === 'adguard') { prim = "94.140.14.14"; sec = "94.140.15.15"; }
        else if (selectedDnsProvider === 'comodo') { prim = "8.26.56.26"; sec = "8.20.247.20"; }
        else if (selectedDnsProvider === 'alternate') { prim = "76.76.19.19"; sec = "76.223.122.150"; }

        batContent += `echo [${t.processing}] ${t.dnsTitle} (${selectedDnsProvider})...\r\n`;
        batContent += `netsh interface ip set dns "Wi-Fi" static ${prim} >nul 2>&1\r\n`;
        batContent += `netsh interface ip add dns "Wi-Fi" ${sec} index=2 >nul 2>&1\r\n`;
        batContent += `netsh interface ip set dns "Ethernet" static ${prim} >nul 2>&1\r\n`;
        batContent += `netsh interface ip add dns "Ethernet" ${sec} index=2 >nul 2>&1\r\n`;
    }

    // Green Success Text for whole script
    batContent += `echo.\r\n`;
    batContent += `echo ==================================================\r\n`;
    batContent += `echo    ${t.complete}\r\n`;
    batContent += `echo    ${t.thankYou}\r\n`;
    batContent += `echo    ${t.author}\r\n`;
    batContent += `echo ==================================================\r\n`;
    batContent += `pause\r\n`;

    downloadFile('OptWin_Optimizer.bat', batContent);
}

function downloadFile(filename, text) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// Start
init();
