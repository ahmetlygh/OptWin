const adminTranslationsObj = {
    tr: {
        dashboard: "Dashboard",
        features: "Özellikler",
        categories: "Kategoriler",
        dns: "DNS Sağlayıcılar",
        settings: "Ayarlar",
        scriptDefaults: "Script Etiketleri"
    },
    en: {
        dashboard: "Dashboard",
        features: "Features",
        categories: "Categories",
        dns: "DNS Providers",
        settings: "Settings",
        scriptDefaults: "Script Labels"
    }
};

const privacyJson = {
    en: {
        lastUpdated: "March 2026",
        sections: [
            { title: "1. Introduction", content: ["OptWin is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our website and application."] },
            { title: "2. Information We Collect", content: ["We track anonymous page visit counts solely for homepage statistics. No IP addresses or device identifiers are stored. We use only essential cookies for theme and language preferences."] },
            { title: "3. How We Use Your Information", content: ["To display anonymous aggregated statistics. To remember your preferences. To generate optimization scripts. We do not sell or share your data."] },
            { title: "4. Generated Scripts", content: ["All scripts are generated on our server and sent directly to your browser. We do not store or analyze any generated scripts."] },
            { title: "5. Data Security", content: ["HTTPS encryption for all data. No personal data collected. Regular security audits."] },
            { title: "6. Contact Us", content: ["If you have questions, please contact us via the Contact page."] }
        ]
    }
};

const termsJson = {
    en: {
        lastUpdated: "March 2026",
        sections: [
            { title: "1. Acceptance of Terms", content: ["By accessing and using OptWin, you agree to be bound by these Terms of Service."] },
            { title: "2. Description of Service", content: ["OptWin is a free, open-source Windows optimization tool that generates PowerShell scripts."] },
            { title: "3. Disclaimer", content: ["OptWin is provided 'as is' without warranty of any kind. Always create a system restore point before running any script."] },
            { title: "4. Limitation of Liability", content: ["We are not liable for any damages arising from the use of this Service or generated scripts."] },
            { title: "5. Contact", content: ["If you have questions, please contact us via the Contact page."] }
        ]
    }
};

export const defaultSettings = [
    { key: "site_name", value: "OptWin", type: "string", description: "Site Adı" },
    { key: "site_url", value: "https://optwin.tech", type: "string", description: "Site URL" },
    { key: "site_description", value: "Free, open-source browser-based Windows optimizer. Select from 60+ optimizations and generate a custom PowerShell script. No installation needed.", type: "string", description: "Site Açıklaması" },
    { key: "site_keywords", value: "windows optimizer, powershell, system optimization", type: "string", description: "Anahtar Kelimeler" },
    { key: "maintenance_mode", value: "false", type: "boolean", description: "Site bakım modu" },
    { key: "site_version", value: "1.3.0", type: "string", description: "Görüntülenen sürüm" },
    { key: "github_url", value: "https://github.com/ahmetlygh/optwin", type: "string", description: "GitHub repo URL" },
    { key: "bmc_url", value: "https://www.buymeacoffee.com/ahmetly_", type: "string", description: "Buy Me a Coffee URL" },
    { key: "contact_email", value: "contact@optwin.tech", type: "string", description: "İletişim e-postası" },
    { key: "author_name", value: "ahmetly_", type: "string", description: "Geliştirici adı" },
    { key: "author_url", value: "https://ahmetly.com", type: "string", description: "Geliştirici web sitesi" },
    { key: "default_lang", value: "en", type: "string", description: "Varsayılan dil" },
    { key: "default_theme", value: "dark", type: "string", description: "Varsayılan tema" },
    { key: "script_format", value: "ps1", type: "string", description: "Script formatı" },
    { key: "bmc_widget_enabled", value: "true", type: "boolean", description: "BMC widget göster/gizle" },
    { key: "footer_year", value: "2026", type: "string", description: "Footer yıl metni" },
    { key: "site_logo_url", value: "/optwin.png", type: "string", description: "Site Logosu URL" },
    { key: "site_favicon_url", value: "/favicon.ico", type: "string", description: "Site Favicon URL" },
    { key: "theme_primary_color", value: "#6b5be6", type: "string", description: "Temel Marka Rengi (HEX)" },
    { key: "admin_dashboard_limit", value: "5", type: "number", description: "Dashboard son işlem limit" },
    { key: "privacy_policy_content", value: JSON.stringify(privacyJson), type: "json", description: "Gizlilik Politikası (JSON)" },
    { key: "terms_content", value: JSON.stringify(termsJson), type: "json", description: "Kullanım Koşulları (JSON)" },
    { key: "admin_translations", value: JSON.stringify(adminTranslationsObj), type: "json", description: "Admin UI Çevirileri" },
];

export const defaultDnsProviders = [
    { slug: "cloudflare", name: "Cloudflare", primary: "1.1.1.1", secondary: "1.0.0.1", order: 0 },
    { slug: "google", name: "Google", primary: "8.8.8.8", secondary: "8.8.4.4", order: 1 },
    { slug: "opendns", name: "OpenDNS", primary: "208.67.222.222", secondary: "208.67.220.220", order: 2 },
    { slug: "quad9", name: "Quad9", primary: "9.9.9.9", secondary: "149.112.112.112", order: 3 },
    { slug: "adguard", name: "AdGuard", primary: "94.140.14.14", secondary: "94.140.15.15", order: 4 },
];

export const defaultUiTranslations = [
    { key: "hero.titleTemplate", en: "{highlight} {prefix}", tr: "{prefix} {highlight}" },
    { key: "hero.titlePrefix", en: "your Windows Experience", tr: "Windows Deneyiminizi" },
    { key: "hero.titleHighlight", en: "Optimize", tr: "Hızlandırın" },
    { key: "hero.desc", en: "Select the optimizations you need and generate a custom script instantly.", tr: "İhtiyacınız olan optimizasyonları seçin ve anında sizin için bir script oluşturun." },
    { key: "btn.create", en: "Create Script", tr: "Script Oluştur" },
    { key: "footer.text", en: "Secure & Open Source.", tr: "Güvenli ve Açık Kaynak." },
    { key: "contact.message", en: "Feel free to email us for requests and suggestions.", tr: "İstek ve önerileriniz için mail atmaktan çekinmeyin." },
    { key: "nav.home", en: "Home", tr: "Ana Sayfa" },
    { key: "nav.about", en: "About", tr: "Hakkında" },
    { key: "search.placeholder", en: "Search features...", tr: "Özellik ara..." },
    { key: "search.noResults", en: "No features found", tr: "Özellik bulunamadı" },
    { key: "selected.count", en: "features selected", tr: "özellik seçildi" },
    { key: "risk.low", en: "Low Risk", tr: "Düşük Risk" },
    { key: "risk.medium", en: "Medium Risk", tr: "Orta Risk" },
    { key: "risk.high", en: "High Risk", tr: "Yüksek Risk" },
    { key: "preset.recommended", en: "Recommended Settings", tr: "Önerilen Ayarlar" },
    { key: "preset.gamer", en: "Gaming Settings", tr: "Oyuncu Ayarları" },
    { key: "preset.selectAll", en: "Select All", tr: "Hepsini Seç" },
    { key: "preset.reset", en: "Reset", tr: "Sıfırla" },
    { key: "about.title", en: "About OptWin", tr: "OptWin Hakkında" },
    { key: "about.subtitle", en: "Our mission is to empower Windows users with transparent, safe, and open-source optimization tools.", tr: "Misyonumuz, Windows kullanıcılarına şeffaf, güvenli ve açık kaynaklı optimizasyon araçları sağlamaktır." },
    { key: "about.safe.title", en: "Safe & Secure", tr: "Güvenli" },
    { key: "about.safe.desc", en: "Every optimization is carefully vetted. Your system's security is our priority.", tr: "Her optimizasyon dikkatle kontrol edilir. Sisteminizin güvenliği bizim önceliğimizdir." },
    { key: "about.open.title", en: "Open Source", tr: "Açık Kaynak" },
    { key: "about.open.desc", en: "Our code is transparent. Inspect, audit, and contribute on GitHub.", tr: "Kodumuz şeffaftır. GitHub'da inceleyebilir, denetleyebilir ve katkıda bulunabilirsiniz." },
    { key: "about.transparent.title", en: "Transparent", tr: "Şeffaf" },
    { key: "about.transparent.desc", en: "No hidden scripts. See exactly what your optimization does before running it.", tr: "Gizli scriptler yok. Optimizasyonun ne yaptığını çalıştırmadan önce tam olarak görün." },
    { key: "support.title", en: "Support OptWin Development", tr: "OptWin Gelişimini Destekleyin" },
    { key: "support.desc", en: "OptWin is 100% free and open-source. Your contribution helps keep it free for everyone.", tr: "OptWin %100 ücretsiz ve açık kaynaklıdır. Katkınız, OptWin'i herkes için ücretsiz tutmamıza yardımcı olur." },
    { key: "support.btn", en: "Buy Me a Coffee", tr: "Bana Kahve Al" },
    { key: "support.badgeFree", en: "100% Free", tr: "Ücretsiz" },
    { key: "support.badgeOpen", en: "Open Source", tr: "Açık Kaynak" },
    { key: "support.badgeSecure", en: "Secure", tr: "Güvenli" },
    { key: "dns.title", en: "DNS Configuration", tr: "DNS Yapılandırması" },
    { key: "dns.pingBtn", en: "Download Ping Test", tr: "Ping Testi İndir" },
    { key: "modal.restore.title", en: "System Restore Point", tr: "Sistem Geri Yükleme Noktası" },
    { key: "modal.restore.desc", en: "Do you want to add a System Restore Point creation step to the script? (Recommended)", tr: "Scripte geri yükleme noktası oluşturmayı eklemek ister misiniz? (Önerilir)" },
    { key: "modal.restore.yes", en: "Add", tr: "Ekle" },
    { key: "modal.restore.no", en: "No, Skip", tr: "Hayır, atla" },
    { key: "modal.warning.msg", en: "Please select at least one feature to generate a script.", tr: "Lütfen script oluşturmak için en az bir özellik seçin." },
    { key: "modal.warning.conflict", en: "You can only select one Power Plan (High or Ultimate).", tr: "Sadece bir Güç Planı seçebilirsiniz (Yüksek veya Nihai)." },
    { key: "overlay.title", en: "Script Preview", tr: "Script Önizleme" },
    { key: "overlay.badgeRun", en: "Can be run multiple times", tr: "Birden çok kez çalıştırılabilir" },
    { key: "overlay.badgeReady", en: "Ready for use", tr: "Kullanım için hazır" },
    { key: "overlay.download", en: "Download Script", tr: "Script İndir" },
    { key: "overlay.close", en: "Close", tr: "Kapat" },
    { key: "overlay.copy", en: "Copy", tr: "Kopyala" },
    { key: "overlay.copied", en: "Copied!", tr: "Kopyalandı!" },
];
