"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { useTranslation } from "@/i18n/useTranslation";
import Link from "next/link";
import { ArrowLeftIcon, ShieldIcon } from "@/components/shared/Icons";

const content: Record<string, { disclaimer?: string; lastUpdated: string; sections: { title: string; content: string[] }[] }> = {
    en: {
        lastUpdated: "March 2026",
        sections: [
            { title: "1. Introduction", content: ["OptWin (\"we\", \"us\", \"our\") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our website and application (\"Service\")."] },
            {
                title: "2. Information We Collect", content: [
                    "2.1 Automatically Collected Information",
                    "Visit Counts: We track anonymous page visit counts and script creation counts solely for display on our homepage statistics. No IP addresses, browser fingerprints, or device identifiers are stored.",
                    "2.2 Cookies",
                    "We use only essential cookies to remember your theme preference (dark/light mode) and language selection. We do not use any third-party tracking, advertising, or analytics cookies.",
                ]
            },
            {
                title: "3. How We Use Your Information", content: [
                    "To display anonymous aggregated statistics on our homepage (total visits, scripts created, downloads).",
                    "To remember your preferences (theme and language).",
                    "To generate optimization scripts on the server and deliver them to you.",
                    "We do not sell, trade, rent, or share your data with any third party.",
                ]
            },
            {
                title: "4. Generated Scripts", content: [
                    "All PowerShell scripts are generated on our server based on the features you select. The generated scripts are sent directly to your browser for download. We do not store, log, analyze, or retain copies of any generated scripts. The content of your scripts remains entirely private.",
                ]
            },
            {
                title: "5. Third-Party Services", content: [
                    "We use Cloudflare for DNS and CDN services to ensure fast and secure delivery. No personal or usage data is shared with Cloudflare or any other third party for advertising, analytics, or profiling purposes.",
                ]
            },
            {
                title: "6. Data Security", content: [
                    "We implement industry-standard security measures to protect the Service:",
                    "HTTPS encryption for all data in transit.",
                    "No personal data is collected or stored, minimizing risk.",
                    "Regular security audits and updates.",
                    "However, no system is completely secure. We cannot guarantee absolute security of the Service.",
                ]
            },
            {
                title: "7. Data Retention", content: [
                    "Since OptWin does not collect personal information, there is no personal data to retain. Anonymous statistics (visit counters) are stored in our database indefinitely. Cookie preferences are stored locally on your browser and can be cleared at any time.",
                ]
            },
            {
                title: "8. Your Rights", content: [
                    "Since we do not collect personal information, traditional data rights (access, correction, deletion, portability) do not apply. You can clear your local cookies at any time through your browser settings.",
                ]
            },
            {
                title: "9. Children's Privacy", content: [
                    "OptWin is not designed for users under the age of 13. We do not knowingly collect information from children. If we become aware of such collection, we will delete the information immediately.",
                ]
            },
            {
                title: "10. Changes to This Policy", content: [
                    "We may update this Privacy Policy periodically. We will notify you of significant changes by posting the updated policy on our website and updating the \"Last Updated\" date. Your continued use of the Service constitutes acceptance of the updated policy.",
                ]
            },
            {
                title: "11. Contact Us", content: [
                    "If you have questions about this Privacy Policy or our practices, please contact us via the Contact page on our website.",
                ]
            },
        ],
    },
    tr: {
        disclaimer: "Bu bir çeviridir. Uyuşmazlık durumunda İngilizce sürüm geçerlidir.",
        lastUpdated: "Mart 2026",
        sections: [
            { title: "1. Giriş", content: ["OptWin (\"biz\", \"bizi\", \"bizim\") gizliliğinizi korumayı taahhüt eder. Bu Gizlilik Politikası, web sitemizi ve uygulamamızı (\"Hizmet\") kullandığınızda bilgilerinizi nasıl topladığımızı, kullandığımızı ve koruduğumuzu açıklar."] },
            {
                title: "2. Topladığımız Bilgiler", content: [
                    "2.1 Otomatik Olarak Toplanan Bilgiler",
                    "Ziyaret Sayıları: Yalnızca ana sayfamızdaki istatistiklerde gösterilmek üzere anonim sayfa ziyaret sayılarını ve script oluşturma sayılarını takip ederiz. IP adresleri, tarayıcı parmak izleri veya cihaz tanımlayıcıları saklanmaz.",
                    "2.2 Çerezler",
                    "Yalnızca tema tercihinizi (koyu/açık mod) ve dil seçiminizi hatırlamak için temel çerezler kullanırız. Herhangi bir üçüncü taraf izleme, reklam veya analitik çerezi kullanmayız.",
                ]
            },
            {
                title: "3. Bilgilerinizi Nasıl Kullanıyoruz", content: [
                    "Ana sayfamızda anonim toplu istatistikleri görüntülemek için (toplam ziyaret, oluşturulan script, indirmeler).",
                    "Tercihlerinizi hatırlamak için (tema ve dil).",
                    "Sunucuda optimizasyon scriptleri oluşturmak ve size ulaştırmak için.",
                    "Verilerinizi herhangi bir üçüncü tarafla satmayız, takas etmeyiz, kiralamayız veya paylaşmayız.",
                ]
            },
            {
                title: "4. Oluşturulan Scriptler", content: [
                    "Tüm PowerShell scriptleri, seçtiğiniz özelliklere göre sunucumuzda oluşturulur. Oluşturulan scriptler doğrudan tarayıcınıza indirilmek üzere gönderilir. Oluşturulan scriptlerin kopyalarını saklamaz, kayıt altına almaz, analiz etmez veya muhafaza etmeyiz. Scriptlerinizin içeriği tamamen gizli kalır.",
                ]
            },
            {
                title: "5. Üçüncü Taraf Hizmetler", content: [
                    "Hızlı ve güvenli teslimat sağlamak için DNS ve CDN hizmetleri için Cloudflare kullanıyoruz. Reklam, analitik veya profilleme amaçları için Cloudflare veya başka bir üçüncü tarafla kişisel veya kullanım verisi paylaşılmaz.",
                ]
            },
            {
                title: "6. Veri Güvenliği", content: [
                    "Hizmeti korumak için endüstri standardı güvenlik önlemleri uyguluyoruz:",
                    "Aktarım halindeki tüm veriler için HTTPS şifreleme.",
                    "Kişisel veri toplanmaz veya saklanmaz, bu da riski en aza indirir.",
                    "Düzenli güvenlik denetimleri ve güncellemeler.",
                    "Ancak, hiçbir sistem tamamen güvenli değildir. Hizmetin mutlak güvenliğini garanti edemeyiz.",
                ]
            },
            {
                title: "7. Veri Saklama", content: [
                    "OptWin kişisel bilgi toplamadığından, saklanacak kişisel veri yoktur. Anonim istatistikler (ziyaret sayaçları) veritabanımızda süresiz olarak saklanır. Çerez tercihleri tarayıcınızda yerel olarak saklanır ve istediğiniz zaman temizlenebilir.",
                ]
            },
            {
                title: "8. Haklarınız", content: [
                    "Kişisel bilgi toplamadığımız için, geleneksel veri hakları (erişim, düzeltme, silme, taşınabilirlik) geçerli değildir. Yerel çerezlerinizi tarayıcı ayarlarınız aracılığıyla istediğiniz zaman temizleyebilirsiniz.",
                ]
            },
            {
                title: "9. Çocukların Gizliliği", content: [
                    "OptWin 13 yaşın altındaki kullanıcılar için tasarlanmamıştır. Çocuklardan bilerek bilgi toplamayız. Böyle bir toplamanın farkına varırsak, bilgileri derhal sileriz.",
                ]
            },
            {
                title: "10. Bu Politikadaki Değişiklikler", content: [
                    "Bu Gizlilik Politikasını periyodik olarak güncelleyebiliriz. Önemli değişiklikleri web sitemizde güncellenmiş politikayı yayınlayarak ve \"Son Güncelleme\" tarihini güncelleyerek size bildireceğiz. Hizmeti kullanmaya devam etmeniz, güncellenmiş politikayı kabul ettiğiniz anlamına gelir.",
                ]
            },
            {
                title: "11. Bize Ulaşın", content: [
                    "Bu Gizlilik Politikası veya uygulamalarımız hakkında sorularınız varsa, lütfen web sitemizdeki İletişim sayfası aracılığıyla bizimle iletişime geçin.",
                ]
            },
        ],
    },
    de: {
        disclaimer: "Dies ist eine Übersetzung. Im Falle von Unstimmigkeiten gilt die englische Version.",
        lastUpdated: "März 2026",
        sections: [
            { title: "1. Einleitung", content: ["OptWin (\"wir\", \"uns\", \"unser\") verpflichtet sich, Ihre Privatsphäre zu schützen. Diese Datenschutzrichtlinie erklärt, wie wir Ihre Informationen erfassen, verwenden und schützen, wenn Sie unsere Website und Anwendung (\"Dienst\") nutzen."] },
            {
                title: "2. Erhobene Informationen", content: [
                    "2.1 Automatisch erhobene Informationen",
                    "Besuchszähler: Wir verfolgen anonyme Seitenbesuche und Skripterstellungszähler ausschließlich zur Anzeige auf unserer Homepage. Es werden keine IP-Adressen, Browser-Fingerprints oder Gerätekennungen gespeichert.",
                    "2.2 Cookies",
                    "Wir verwenden nur essenzielle Cookies für Theme- und Spracheinstellungen. Keine Drittanbieter-Tracking-, Werbe- oder Analyse-Cookies.",
                ]
            },
            {
                title: "3. Verwendung Ihrer Daten", content: [
                    "Anzeige anonymer Statistiken auf unserer Homepage.",
                    "Speicherung Ihrer Einstellungen (Theme und Sprache).",
                    "Generierung von Optimierungsskripten auf dem Server.",
                    "Wir verkaufen, tauschen oder teilen Ihre Daten nicht mit Dritten.",
                ]
            },
            { title: "4. Generierte Skripte", content: ["Alle Skripte werden auf unserem Server generiert und direkt an Ihren Browser gesendet. Wir speichern, protokollieren oder analysieren keine generierten Skripte."] },
            { title: "5. Drittanbieter-Dienste", content: ["Wir nutzen Cloudflare für DNS und CDN. Keine Benutzerdaten werden für Werbung oder Analyse weitergegeben."] },
            { title: "6. Datensicherheit", content: ["HTTPS-Verschlüsselung, keine persönlichen Daten, regelmäßige Sicherheitsaudits. Absolute Sicherheit kann nicht garantiert werden."] },
            { title: "7. Datenaufbewahrung", content: ["Da keine persönlichen Daten erhoben werden, gibt es keine aufzubewahrenden Daten. Cookies können jederzeit im Browser gelöscht werden."] },
            { title: "8. Ihre Rechte", content: ["Da keine persönlichen Daten erhoben werden, gelten übliche Datenrechte nicht. Cookies können über die Browsereinstellungen gelöscht werden."] },
            { title: "9. Datenschutz von Kindern", content: ["OptWin richtet sich nicht an Nutzer unter 13 Jahren."] },
            { title: "10. Änderungen", content: ["Wir können diese Richtlinie aktualisieren. Änderungen werden auf der Website veröffentlicht."] },
            { title: "11. Kontakt", content: ["Bei Fragen nutzen Sie bitte unsere Kontaktseite."] },
        ],
    },
    fr: {
        disclaimer: "Ceci est une traduction. En cas de divergence, la version anglaise prévaut.",
        lastUpdated: "Mars 2026",
        sections: [
            { title: "1. Introduction", content: ["OptWin (\"nous\", \"notre\") s'engage à protéger votre vie privée. Cette politique explique comment nous collectons, utilisons et protégeons vos informations."] },
            {
                title: "2. Informations Collectées", content: [
                    "2.1 Informations collectées automatiquement",
                    "Compteurs de visites: Nous suivons uniquement les compteurs anonymes de visites et de création de scripts pour affichage sur notre page d'accueil. Aucune adresse IP ou empreinte de navigateur n'est stockée.",
                    "2.2 Cookies",
                    "Seuls les cookies essentiels pour le thème et la langue sont utilisés. Aucun cookie tiers de suivi ou de publicité.",
                ]
            },
            {
                title: "3. Utilisation des Données", content: [
                    "Afficher des statistiques anonymes sur notre page d'accueil.",
                    "Mémoriser vos préférences (thème et langue).",
                    "Générer des scripts d'optimisation côté serveur.",
                    "Nous ne vendons, n'échangeons ni ne partageons vos données.",
                ]
            },
            { title: "4. Scripts Générés", content: ["Tous les scripts sont générés sur notre serveur et envoyés directement à votre navigateur. Nous ne stockons ni n'analysons les scripts générés."] },
            { title: "5. Services Tiers", content: ["Nous utilisons Cloudflare pour DNS et CDN. Aucune donnée n'est partagée à des fins publicitaires ou analytiques."] },
            { title: "6. Sécurité des Données", content: ["Chiffrement HTTPS, aucune donnée personnelle collectée, audits de sécurité réguliers."] },
            { title: "7. Conservation des Données", content: ["Aucune donnée personnelle n'étant collectée, il n'y a rien à conserver. Les cookies peuvent être effacés à tout moment."] },
            { title: "8. Vos Droits", content: ["Aucune donnée personnelle n'étant collectée, les droits traditionnels ne s'appliquent pas."] },
            { title: "9. Confidentialité des Enfants", content: ["OptWin n'est pas destiné aux utilisateurs de moins de 13 ans."] },
            { title: "10. Modifications", content: ["Nous pouvons mettre à jour cette politique. Les changements seront publiés sur le site."] },
            { title: "11. Contact", content: ["Pour toute question, utilisez notre page de contact."] },
        ],
    },
    zh: {
        disclaimer: "这是翻译版本。如有歧义，以英文版本为准。",
        lastUpdated: "2026年3月",
        sections: [
            { title: "1. 简介", content: ["OptWin 致力于保护您的隐私。本政策说明我们在您使用服务时如何收集、使用和保护您的信息。"] },
            { title: "2. 收集的信息", content: ["我们仅跟踪匿名访问计数和脚本创建计数用于主页统计。不存储IP地址或设备标识。我们仅使用主题和语言所需的基本Cookie。"] },
            { title: "3. 信息使用", content: ["显示匿名统计、记住偏好设置、生成优化脚本。我们不出售或分享您的数据。"] },
            { title: "4. 生成的脚本", content: ["所有脚本在服务器上生成并直接发送到您的浏览器。我们不存储或分析脚本内容。"] },
            { title: "5. 第三方服务", content: ["我们使用Cloudflare提供DNS和CDN服务。不会与第三方共享数据。"] },
            { title: "6. 数据安全", content: ["HTTPS加密，不收集个人数据，定期安全审计。"] },
            { title: "7. 联系我们", content: ["如有问题，请通过联系页面与我们联系。"] },
        ],
    },
    es: {
        disclaimer: "Esta es una traducción. En caso de discrepancia, prevalece la versión en inglés.",
        lastUpdated: "Marzo 2026",
        sections: [
            { title: "1. Introducción", content: ["OptWin se compromete a proteger su privacidad. Esta política explica cómo recopilamos, usamos y protegemos su información."] },
            { title: "2. Información Recopilada", content: ["Solo rastreamos conteos anónimos de visitas y creación de scripts. No se almacenan direcciones IP. Solo cookies esenciales para tema e idioma."] },
            { title: "3. Uso de la Información", content: ["Mostrar estadísticas anónimas, recordar preferencias, generar scripts. No vendemos ni compartimos datos."] },
            { title: "4. Scripts Generados", content: ["Todos los scripts se generan en el servidor y se envían directamente. No almacenamos ni analizamos su contenido."] },
            { title: "5. Servicios de Terceros", content: ["Usamos Cloudflare para DNS y CDN. No se comparten datos con fines publicitarios."] },
            { title: "6. Seguridad", content: ["Cifrado HTTPS, sin datos personales, auditorías regulares."] },
            { title: "7. Contacto", content: ["Para preguntas, use nuestra página de contacto."] },
        ],
    },
    hi: {
        disclaimer: "यह एक अनुवाद है। विसंगति की स्थिति में अंग्रेजी संस्करण मान्य होगा।",
        lastUpdated: "मार्च 2026",
        sections: [
            { title: "1. परिचय", content: ["OptWin आपकी गोपनीयता की रक्षा करने के लिए प्रतिबद्ध है। यह नीति बताती है कि हम आपकी जानकारी कैसे एकत्र, उपयोग और सुरक्षित करते हैं।"] },
            { title: "2. एकत्रित जानकारी", content: ["हम केवल अनाम विज़िट और स्क्रिप्ट काउंट ट्रैक करते हैं। कोई IP पता संग्रहीत नहीं। केवल थीम और भाषा के लिए आवश्यक कुकीज़।"] },
            { title: "3. जानकारी का उपयोग", content: ["अनाम आँकड़े प्रदर्शित करना, प्राथमिकताएं याद रखना, स्क्रिप्ट जनरेट करना। हम डेटा नहीं बेचते या साझा नहीं करते।"] },
            { title: "4. जनरेट की गई स्क्रिप्ट", content: ["सभी स्क्रिप्ट सर्वर पर जनरेट होती हैं। हम स्क्रिप्ट सामग्री को संग्रहीत या विश्लेषण नहीं करते।"] },
            { title: "5. तृतीय पक्ष सेवाएँ", content: ["हम DNS और CDN के लिए Cloudflare का उपयोग करते हैं। विज्ञापन के लिए कोई डेटा साझा नहीं किया जाता।"] },
            { title: "6. संपर्क", content: ["प्रश्नों के लिए, हमारे संपर्क पृष्ठ का उपयोग करें।"] },
        ],
    },
};

export default function Privacy() {
    const lang = useOptWinStore((s) => s.lang);
    const { t } = useTranslation();
    const data = content[lang] || content.en;

    return (
        <div className="flex flex-col items-center w-full animate-fade-in-up mt-8 mb-16">
            <div className="w-full max-w-3xl px-4">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="size-16 rounded-2xl bg-[var(--accent-color)]/10 text-[var(--accent-color)] flex items-center justify-center mx-auto mb-4">
                        <ShieldIcon size={28} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[var(--text-primary)]">
                        {t["privacy.title"]}
                    </h1>
                    {data.disclaimer && (
                        <p className="text-sm text-amber-500/80 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2 inline-block mb-4">
                            {data.disclaimer}
                        </p>
                    )}
                </div>

                {/* Sections */}
                <div className="space-y-6">
                    {data.sections.map((section, i) => (
                        <div key={i} className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-2xl">
                            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3">
                                {section.title}
                            </h2>
                            <div className="space-y-2">
                                {section.content.map((line, j) => (
                                    <p key={j} className={`text-sm leading-relaxed ${line.match(/^\d+\.\d+/) ? 'font-semibold text-[var(--text-primary)] mt-3' : 'text-[var(--text-secondary)]'}`}>
                                        {line}
                                    </p>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Last updated */}
                <p className="text-center text-xs text-[var(--text-secondary)] mt-6">
                    {lang === "tr" ? "Son Güncelleme" : lang === "de" ? "Letzte Aktualisierung" : lang === "fr" ? "Dernière mise à jour" : "Last Updated"}: {data.lastUpdated}
                </p>

                {/* Back link */}
                <div className="mt-6 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--border-color)]/50 text-[var(--text-primary)] font-semibold hover:bg-[var(--border-color)] transition-all"
                    >
                        <ArrowLeftIcon size={16} />
                        {t["contact.backHome"]}
                    </Link>
                </div>
            </div>
        </div>
    );
}
