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

    // Landing Page (Phase 4)
    { key: "hero.cta", en: "Explore Optimizations", tr: "Optimizasyonları Keşfet" },
    { key: "value.section.title", en: "Why OptWin?", tr: "Neden OptWin?" },
    { key: "beforeAfter.section.title", en: "Before & After", tr: "Öncesi ve Sonrası" },
    { key: "beforeAfter.before.title", en: "Without OptWin", tr: "OptWin Olmadan" },
    { key: "beforeAfter.after.title", en: "With OptWin", tr: "OptWin ile" },
    { key: "howItWorks.section.title", en: "How It Works", tr: "Nasıl Çalışır?" },
    { key: "howItWorks.step1.title", en: "Select", tr: "Seç" },
    { key: "howItWorks.step2.title", en: "Generate", tr: "Oluştur" },
    { key: "howItWorks.step3.title", en: "Run", tr: "Çalıştır" },
    
    // Preset & Actions (Phase 13)
    { key: "preset.mainTitle", en: "Your tailored presets", tr: "Size özel ayarlanmış ön ayarlar" },
    { key: "preset.sidebarTitle", en: "Quick Presets", tr: "Hızlı Ayarlar" },
    { key: "preset.showDescriptions", en: "Show Descriptions", tr: "Açıklamaları Göster" },
    { key: "preset.hideDescriptions", en: "Hide Descriptions", tr: "Açıklamaları Gizle" },
    { key: "preset.selectAllWarning", en: "All features selected. Please review the list.", tr: "Tüm özellikler seçildi. Lütfen listeyi gözden geçirin." },
    { key: "preset.clearAll", en: "Reset", tr: "Sıfırla" },
    { key: "preset.default", en: "Default", tr: "Sistem Varsayılanı" },
    { key: "preset.recommended.desc", en: "Safe optimizations to improve general system performance without breaking features.", tr: "Sistem özelliklerini bozmadan genel performansı artıran güvenli optimizasyonlar." },
    { key: "preset.gamer.desc", en: "Extreme optimizations focused purely on maximizing gaming performance and reducing latency.", tr: "Tamamen oyun performansını en üst düzeye çıkarmaya ve gecikmeyi azaltmaya odaklanan agresif optimizasyonlar." },
    { key: "category.collapseAll", en: "Collapse All", tr: "Tümünü Daralt" },
    { key: "category.expandAll", en: "Expand All", tr: "Tümünü Genişlet" },
    
    // Terminal & Layout Additions
    { key: 'hero.term.safe', en: 'Safe', tr: 'Güvenli', de: 'Sicher', fr: 'Sûr', es: 'Seguro', zh: '安全', hi: 'सुरक्षित' },
    { key: 'hero.term.openSource', en: 'Open Source', tr: 'Açık Kaynak', de: 'Open Source', fr: 'Open Source', es: 'Código Abierto', zh: '开源', hi: 'ओपन सोर्स' },
    { key: 'hero.term.fast', en: 'Fast', tr: 'Hızlı', de: 'Schnell', fr: 'Rapide', es: 'Rápido', zh: '快速', hi: 'तेज़' },
    { key: 'hero.term.optimized', en: 'Optimized', tr: 'Optimize', de: 'Optimiert', fr: 'Optimisé', es: 'Optimizado', zh: '已优化', hi: 'अनुकूलित' },
    { key: 'hero.term.cmd1', en: 'Disabling Telemetry', tr: 'Telemetri Kapatılıyor', de: 'Telemetrie wird deaktiviert', fr: 'Désactivation de la télémétrie', es: 'Desactivando Telemetría', zh: '正在禁用遥测', hi: 'टेलीमेट्री अक्षम की जा रही है' },
    { key: 'hero.term.cmd2', en: 'Clearing Temp/Prefetch', tr: 'Geçici Dosyalar Temizleniyor', de: 'Temp/Prefetch wird geleert', fr: 'Nettoyage des fichiers temporaires', es: 'Borrando Temp/Prefetch', zh: '正在清理临时文件/预取', hi: 'अस्थायी/प्रीफ़ेच साफ़ किया जा रहा है' },
    { key: 'hero.term.cmd3', en: 'Disabling Background Apps', tr: 'Arka Plan Uygulamaları Kapatılıyor', de: 'Hintergrund-Apps werden deaktiviert', fr: 'Désactivation des applications en arrière-plan', es: 'Desactivando aplicaciones en segundo plano', zh: '正在禁用后台应用', hi: 'पृष्ठभूमि ऐप्स अक्षम किए जा रहे हैं' },
    { key: 'hero.term.cmd4', en: 'Optimizing Services', tr: 'Servisler Optimize Ediliyor', de: 'Dienste werden optimiert', fr: 'Optimisation des services', es: 'Optimizando Servicios', zh: '正在优化服务', hi: 'सेवाएं अनुकूलित की जा रही हैं' },
    { key: 'hero.term.cmd5', en: 'Configuring Privacy', tr: 'Gizlilik Ayarlanıyor', de: 'Datenschutz wird konfiguriert', fr: 'Configuration de la confidentialité', es: 'Configurando Privacidad', zh: '正在配置隐私', hi: 'गोपनीयता कॉन्फ़िगर की जा रही है' },
    { key: 'hero.term.allDone', en: 'All tasks completed', tr: 'Tüm işlemler tamamlandı', de: 'Alle Aufgaben abgeschlossen', fr: 'Toutes les tâches sont terminées', es: 'Todas las tareas completadas', zh: '所有任务已完成', hi: 'सभी कार्य पूर्ण हुए' },
    { key: 'hero.term.thanks', en: 'Thank you for using OptWin!', tr: 'OptWin kullandığınız için teşekkürler!', de: 'Danke, dass Sie OptWin verwenden!', fr: 'Merci d\\'utiliser OptWin!', es: '¡Gracias por usar OptWin!', zh: '感谢您使用 OptWin！', hi: 'OptWin का उपयोग करने के लिए धन्यवाद!' },
    { key: 'hero.term.preview', en: 'Script preview', tr: 'Script Önizleme', de: 'Skript-Vorschau', fr: 'Aperçu du script', es: 'Vista previa del script', zh: '脚本预览', hi: 'स्क्रिप्ट पूर्वावलोकन' },
    { key: 'hero.term.replay', en: 'Click to replay', tr: 'Tekrar oynat', de: 'Zum Wiederholen klicken', fr: 'Cliquer pour rejouer', es: 'Haz clic para repetir', zh: '点击重放', hi: 'रीप्ले करने के लिए क्लिक करें' },
    { key: 'hero.term.expand', en: 'Expand', tr: 'Genişlet', de: 'Erweitern', fr: 'Développer', es: 'Expandir', zh: '展开', hi: 'विस्तृत करें' },
    { key: 'hero.term.collapse', en: 'Collapse', tr: 'Daralt', de: 'Reduzieren', fr: 'Réduire', es: 'Contraer', zh: '折叠', hi: 'संकुचित करें' },
    { key: 'common.hideDescriptions', en: 'Hide Descriptions', tr: 'Açıklamaları Gizle', de: 'Beschreibungen ausblenden', fr: 'Masquer les descriptions', es: 'Ocultar descripciones', zh: '隐藏描述', hi: 'विवरण छुपाएं' },
    { key: 'common.showDescriptions', en: 'Show Descriptions', tr: 'Açıklamaları Göster', de: 'Beschreibungen anzeigen', fr: 'Afficher les descriptions', es: 'Mostrar descripciones', zh: '显示描述', hi: 'विवरण दिखाएं' }
];

