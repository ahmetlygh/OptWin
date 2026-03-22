/**
 * Seed script: Seeds Privacy and Terms page content into PageContent table.
 * Run with: npx tsx prisma/seed-page-content.ts
 * 
 * This preserves ALL existing hardcoded content from privacy/page.tsx and terms/page.tsx
 * in the DB so it's fully admin-editable.
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

type SectionData = { title: string; content: string[] };
type PageData = { disclaimer?: string; lastUpdated: string; sections: SectionData[] };

const PRIVACY: Record<string, PageData> = {
    en: {
        lastUpdated: "March 2026",
        sections: [
            { title: "1. Introduction", content: ["OptWin (\"we\", \"us\", \"our\") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our website and application (\"Service\")."] },
            { title: "2. Information We Collect", content: ["2.1 Automatically Collected Information", "Visit Counts: We track anonymous page visit counts and script creation counts solely for display on our homepage statistics. No IP addresses, browser fingerprints, or device identifiers are stored.", "2.2 Cookies", "We use only essential cookies to remember your theme preference (dark/light mode) and language selection. We do not use any third-party tracking, advertising, or analytics cookies."] },
            { title: "3. How We Use Your Information", content: ["To display anonymous aggregated statistics on our homepage (total visits, scripts created, downloads).", "To remember your preferences (theme and language).", "To generate optimization scripts on the server and deliver them to you.", "We do not sell, trade, rent, or share your data with any third party."] },
            { title: "4. Generated Scripts", content: ["All PowerShell scripts are generated on our server based on the features you select. The generated scripts are sent directly to your browser for download. We do not store, log, analyze, or retain copies of any generated scripts. The content of your scripts remains entirely private."] },
            { title: "5. Third-Party Services", content: ["We use Cloudflare for DNS and CDN services to ensure fast and secure delivery. No personal or usage data is shared with Cloudflare or any other third party for advertising, analytics, or profiling purposes."] },
            { title: "6. Data Security", content: ["We implement industry-standard security measures to protect the Service:", "HTTPS encryption for all data in transit.", "No personal data is collected or stored, minimizing risk.", "Regular security audits and updates.", "However, no system is completely secure. We cannot guarantee absolute security of the Service."] },
            { title: "7. Data Retention", content: ["Since OptWin does not collect personal information, there is no personal data to retain. Anonymous statistics (visit counters) are stored in our database indefinitely. Cookie preferences are stored locally on your browser and can be cleared at any time."] },
            { title: "8. Your Rights", content: ["Since we do not collect personal information, traditional data rights (access, correction, deletion, portability) do not apply. You can clear your local cookies at any time through your browser settings."] },
            { title: "9. Children's Privacy", content: ["OptWin is not designed for users under the age of 13. We do not knowingly collect information from children."] },
            { title: "10. Changes to This Policy", content: ["We may update this Privacy Policy periodically. We will notify you of significant changes by posting the updated policy on our website."] },
            { title: "11. Contact Us", content: ["If you have questions about this Privacy Policy, please contact us via the Contact page on our website."] },
        ],
    },
    tr: {
        disclaimer: "Bu bir çeviridir. Uyuşmazlık durumunda İngilizce sürüm geçerlidir.",
        lastUpdated: "Mart 2026",
        sections: [
            { title: "1. Giriş", content: ["OptWin (\"biz\", \"bizi\", \"bizim\") gizliliğinizi korumayı taahhüt eder. Bu Gizlilik Politikası, web sitemizi ve uygulamamızı (\"Hizmet\") kullandığınızda bilgilerinizi nasıl topladığımızı, kullandığımızı ve koruduğumuzu açıklar."] },
            { title: "2. Topladığımız Bilgiler", content: ["2.1 Otomatik Olarak Toplanan Bilgiler", "Ziyaret Sayıları: Yalnızca ana sayfamızdaki istatistiklerde gösterilmek üzere anonim sayfa ziyaret sayılarını ve script oluşturma sayılarını takip ederiz. IP adresleri, tarayıcı parmak izleri veya cihaz tanımlayıcıları saklanmaz.", "2.2 Çerezler", "Yalnızca tema tercihinizi (koyu/açık mod) ve dil seçiminizi hatırlamak için temel çerezler kullanırız. Herhangi bir üçüncü taraf izleme, reklam veya analitik çerezi kullanmayız."] },
            { title: "3. Bilgilerinizi Nasıl Kullanıyoruz", content: ["Ana sayfamızda anonim toplu istatistikleri görüntülemek için.", "Tercihlerinizi hatırlamak için (tema ve dil).", "Sunucuda optimizasyon scriptleri oluşturmak ve size ulaştırmak için.", "Verilerinizi herhangi bir üçüncü tarafla satmayız, takas etmeyiz, kiralamayız veya paylaşmayız."] },
            { title: "4. Oluşturulan Scriptler", content: ["Tüm PowerShell scriptleri, seçtiğiniz özelliklere göre sunucumuzda oluşturulur. Oluşturulan scriptler doğrudan tarayıcınıza indirilmek üzere gönderilir. Oluşturulan scriptlerin kopyalarını saklamaz, kayıt altına almaz, analiz etmez veya muhafaza etmeyiz."] },
            { title: "5. Üçüncü Taraf Hizmetler", content: ["Hızlı ve güvenli teslimat sağlamak için DNS ve CDN hizmetleri için Cloudflare kullanıyoruz."] },
            { title: "6. Veri Güvenliği", content: ["Hizmeti korumak için endüstri standardı güvenlik önlemleri uyguluyoruz:", "Aktarım halindeki tüm veriler için HTTPS şifreleme.", "Kişisel veri toplanmaz veya saklanmaz.", "Düzenli güvenlik denetimleri ve güncellemeler."] },
            { title: "7. Veri Saklama", content: ["OptWin kişisel bilgi toplamadığından, saklanacak kişisel veri yoktur. Anonim istatistikler veritabanımızda süresiz olarak saklanır. Çerez tercihleri tarayıcınızda yerel olarak saklanır."] },
            { title: "8. Haklarınız", content: ["Kişisel bilgi toplamadığımız için, geleneksel veri hakları geçerli değildir. Yerel çerezlerinizi tarayıcı ayarlarınız aracılığıyla istediğiniz zaman temizleyebilirsiniz."] },
            { title: "9. Çocukların Gizliliği", content: ["OptWin 13 yaşın altındaki kullanıcılar için tasarlanmamıştır."] },
            { title: "10. Bu Politikadaki Değişiklikler", content: ["Bu Gizlilik Politikasını periyodik olarak güncelleyebiliriz."] },
            { title: "11. Bize Ulaşın", content: ["Bu Gizlilik Politikası hakkında sorularınız varsa, lütfen web sitemizdeki İletişim sayfası aracılığıyla bizimle iletişime geçin."] },
        ],
    },
    de: {
        disclaimer: "Dies ist eine Übersetzung. Im Falle von Unstimmigkeiten gilt die englische Version.",
        lastUpdated: "März 2026",
        sections: [
            { title: "1. Einleitung", content: ["OptWin verpflichtet sich, Ihre Privatsphäre zu schützen."] },
            { title: "2. Erhobene Informationen", content: ["Wir verfolgen anonyme Seitenbesuche. Keine IP-Adressen werden gespeichert. Nur essenzielle Cookies."] },
            { title: "3. Verwendung Ihrer Daten", content: ["Anzeige anonymer Statistiken. Speicherung Ihrer Einstellungen. Generierung von Optimierungsskripten. Wir teilen Ihre Daten nicht."] },
            { title: "4. Generierte Skripte", content: ["Alle Skripte werden auf unserem Server generiert und direkt an Ihren Browser gesendet. Wir speichern keine Skripte."] },
            { title: "5. Datensicherheit", content: ["HTTPS-Verschlüsselung, keine persönlichen Daten, regelmäßige Sicherheitsaudits."] },
            { title: "6. Kontakt", content: ["Bei Fragen nutzen Sie bitte unsere Kontaktseite."] },
        ],
    },
    fr: {
        disclaimer: "Ceci est une traduction. En cas de divergence, la version anglaise prévaut.",
        lastUpdated: "Mars 2026",
        sections: [
            { title: "1. Introduction", content: ["OptWin s'engage à protéger votre vie privée."] },
            { title: "2. Informations Collectées", content: ["Compteurs de visites anonymes uniquement. Aucune adresse IP stockée. Cookies essentiels uniquement."] },
            { title: "3. Utilisation des Données", content: ["Afficher des statistiques anonymes. Mémoriser vos préférences. Générer des scripts. Nous ne partageons pas vos données."] },
            { title: "4. Scripts Générés", content: ["Tous les scripts sont générés sur notre serveur et envoyés directement. Nous ne stockons ni n'analysons les scripts."] },
            { title: "5. Sécurité", content: ["Chiffrement HTTPS, aucune donnée personnelle, audits de sécurité réguliers."] },
            { title: "6. Contact", content: ["Pour toute question, utilisez notre page de contact."] },
        ],
    },
    es: {
        disclaimer: "Esta es una traducción. En caso de discrepancia, prevalece la versión en inglés.",
        lastUpdated: "Marzo 2026",
        sections: [
            { title: "1. Introducción", content: ["OptWin se compromete a proteger su privacidad."] },
            { title: "2. Información Recopilada", content: ["Solo rastreamos conteos anónimos de visitas. No se almacenan direcciones IP. Solo cookies esenciales."] },
            { title: "3. Uso de la Información", content: ["Mostrar estadísticas anónimas, recordar preferencias, generar scripts. No vendemos ni compartimos datos."] },
            { title: "4. Scripts Generados", content: ["Todos los scripts se generan en el servidor y se envían directamente. No almacenamos ni analizamos su contenido."] },
            { title: "5. Seguridad", content: ["Cifrado HTTPS, sin datos personales, auditorías regulares."] },
            { title: "6. Contacto", content: ["Para preguntas, use nuestra página de contacto."] },
        ],
    },
    zh: {
        disclaimer: "这是翻译版本。如有歧义，以英文版本为准。",
        lastUpdated: "2026年3月",
        sections: [
            { title: "1. 简介", content: ["OptWin 致力于保护您的隐私。"] },
            { title: "2. 收集的信息", content: ["我们仅跟踪匿名访问计数。不存储IP地址。仅使用基本Cookie。"] },
            { title: "3. 信息使用", content: ["显示匿名统计、记住偏好设置、生成优化脚本。我们不出售或分享您的数据。"] },
            { title: "4. 生成的脚本", content: ["所有脚本在服务器上生成并直接发送。我们不存储或分析脚本内容。"] },
            { title: "5. 数据安全", content: ["HTTPS加密，不收集个人数据，定期安全审计。"] },
            { title: "6. 联系我们", content: ["如有问题，请通过联系页面与我们联系。"] },
        ],
    },
    hi: {
        disclaimer: "यह एक अनुवाद है। विसंगति की स्थिति में अंग्रेजी संस्करण मान्य होगा।",
        lastUpdated: "मार्च 2026",
        sections: [
            { title: "1. परिचय", content: ["OptWin आपकी गोपनीयता की रक्षा करने के लिए प्रतिबद्ध है।"] },
            { title: "2. एकत्रित जानकारी", content: ["हम केवल अनाम विज़िट काउंट ट्रैक करते हैं। कोई IP पता संग्रहीत नहीं। केवल आवश्यक कुकीज़।"] },
            { title: "3. जानकारी का उपयोग", content: ["अनाम आँकड़े प्रदर्शित करना, प्राथमिकताएं याद रखना, स्क्रिप्ट जनरेट करना। हम डेटा साझा नहीं करते।"] },
            { title: "4. जनरेट की गई स्क्रिप्ट", content: ["सभी स्क्रिप्ट सर्वर पर जनरेट होती हैं। हम स्क्रिप्ट सामग्री को संग्रहीत नहीं करते।"] },
            { title: "5. डेटा सुरक्षा", content: ["HTTPS एन्क्रिप्शन, कोई व्यक्तिगत डेटा नहीं, नियमित सुरक्षा ऑडिट।"] },
            { title: "6. संपर्क", content: ["प्रश्नों के लिए, हमारे संपर्क पृष्ठ का उपयोग करें।"] },
        ],
    },
};

const TERMS: Record<string, PageData> = {
    en: {
        lastUpdated: "March 2026",
        sections: [
            { title: "1. Acceptance of Terms", content: ["By accessing and using OptWin (\"Service\"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use this Service."] },
            { title: "2. Description of Service", content: ["OptWin is a free, open-source Windows optimization tool that generates PowerShell scripts based on user-selected features."] },
            { title: "3. Usage License", content: ["Permission is granted to use OptWin for personal and commercial purposes.", "Generate and download optimization scripts for your own systems.", "Share the generated scripts with others.", "Inspect and contribute to the source code on GitHub."] },
            { title: "4. Disclaimer of Warranties", content: ["OptWin is provided 'as is' without warranty of any kind. We make no guarantees regarding accuracy, reliability, or completeness."] },
            { title: "5. Limitation of Liability", content: ["We are not liable for any damages arising from your use of the Service or generated scripts. Always create a System Restore Point before running any optimization script."] },
            { title: "6. User Responsibilities", content: ["Use the Service in compliance with all applicable laws.", "Create a system restore point before running any generated script.", "Review the contents of scripts before execution.", "Not use the Service for any malicious or illegal purposes."] },
            { title: "7. Generated Scripts", content: ["Scripts modify Windows system settings. You acknowledge that you understand the changes and accept full responsibility for any consequences."] },
            { title: "8. Intellectual Property", content: ["OptWin's source code is publicly available on GitHub under an open-source license. The OptWin name, logo, and branding are the property of the developer."] },
            { title: "9. Modifications to Terms", content: ["We reserve the right to modify these Terms at any time. Continued use constitutes acceptance of changes."] },
            { title: "10. Governing Law", content: ["These Terms shall be governed by the laws of the Republic of Turkey. Jurisdiction: Istanbul."] },
            { title: "11. Contact", content: ["If you have questions, please contact us via the Contact page."] },
        ],
    },
    tr: {
        disclaimer: "Bu bir çeviridir. Uyuşmazlık durumunda İngilizce sürüm geçerlidir.",
        lastUpdated: "Mart 2026",
        sections: [
            { title: "1. Şartların Kabulü", content: ["OptWin'e erişerek ve kullanarak, bu Kullanım Şartlarına bağlı kalmayı kabul edersiniz."] },
            { title: "2. Hizmet Açıklaması", content: ["OptWin, kullanıcının seçtiği özelliklere göre PowerShell scriptleri oluşturan ücretsiz, açık kaynaklı bir Windows optimizasyon aracıdır."] },
            { title: "3. Kullanım Lisansı", content: ["OptWin'i kişisel ve ticari amaçlarla kullanma izni verilir.", "Kendi sistemleriniz için scriptler oluşturabilirsiniz.", "Oluşturulan scriptleri başkalarıyla paylaşabilirsiniz.", "GitHub'da kaynak kodu inceleyebilir ve katkıda bulunabilirsiniz."] },
            { title: "4. Garanti Reddi", content: ["OptWin hiçbir garanti olmaksızın 'olduğu gibi' sağlanmaktadır."] },
            { title: "5. Sorumluluk Sınırlaması", content: ["Hizmeti kullanımınızdan kaynaklanan hasarlardan sorumlu değiliz. Herhangi bir script çalıştırmadan önce geri yükleme noktası oluşturun."] },
            { title: "6. Kullanıcı Sorumlulukları", content: ["Hizmeti yasalara uygun kullanın.", "Script çalıştırmadan önce geri yükleme noktası oluşturun.", "Scriptlerin içeriğini çalıştırmadan önce inceleyin.", "Hizmeti kötü niyetli amaçlarla kullanmayın."] },
            { title: "7. Oluşturulan Scriptler", content: ["Scriptler Windows sistem ayarlarını değiştirir. Değişiklikleri anladığınızı ve sonuçları kabul ettiğinizi onaylarsınız."] },
            { title: "8. Fikri Mülkiyet", content: ["OptWin'in kaynak kodu GitHub'da açık kaynak lisansı altında kamuya açıktır. OptWin adı, logosu ve markası geliştiricinin mülkiyetindedir."] },
            { title: "9. Şartlarda Değişiklikler", content: ["Bu şartları herhangi bir zamanda değiştirme hakkını saklı tutarız."] },
            { title: "10. Geçerli Hukuk", content: ["Bu Şartlar Türkiye Cumhuriyeti yasalarına tabidir. Yargı yetkisi: İstanbul."] },
            { title: "11. İletişim", content: ["Sorularınız için İletişim sayfamızı kullanın."] },
        ],
    },
    de: { disclaimer: "Dies ist eine Übersetzung. Im Falle von Unstimmigkeiten gilt die englische Version.", lastUpdated: "März 2026", sections: [{ title: "1. Annahme der Bedingungen", content: ["Durch den Zugriff auf OptWin stimmen Sie diesen Nutzungsbedingungen zu."] }, { title: "2. Beschreibung", content: ["OptWin ist ein kostenloses Open-Source Windows-Optimierungstool."] }, { title: "3. Haftungsausschluss", content: ["OptWin wird ohne Garantie bereitgestellt. Erstellen Sie immer einen Wiederherstellungspunkt."] }, { title: "4. Kontakt", content: ["Bei Fragen nutzen Sie unsere Kontaktseite."] }] },
    fr: { disclaimer: "Ceci est une traduction. En cas de divergence, la version anglaise prévaut.", lastUpdated: "Mars 2026", sections: [{ title: "1. Acceptation", content: ["En accédant à OptWin, vous acceptez ces Conditions."] }, { title: "2. Description", content: ["OptWin est un outil gratuit et open source d'optimisation Windows."] }, { title: "3. Avertissement", content: ["OptWin est fourni 'tel quel'. Créez toujours un point de restauration."] }, { title: "4. Contact", content: ["Pour toute question, utilisez notre page de contact."] }] },
    es: { disclaimer: "Esta es una traducción. En caso de discrepancia, prevalece la versión en inglés.", lastUpdated: "Marzo 2026", sections: [{ title: "1. Aceptación", content: ["Al usar OptWin, acepta estos Términos."] }, { title: "2. Descripción", content: ["OptWin es una herramienta gratuita de código abierto para optimización de Windows."] }, { title: "3. Exención", content: ["OptWin se proporciona 'tal cual'. Cree siempre un punto de restauración."] }, { title: "4. Contacto", content: ["Para preguntas, use nuestra página de contacto."] }] },
    zh: { disclaimer: "这是翻译版本。如有歧义，以英文版本为准。", lastUpdated: "2026年3月", sections: [{ title: "1. 条款接受", content: ["使用OptWin即表示您同意这些条款。"] }, { title: "2. 免责声明", content: ["OptWin按「原样」提供。运行脚本前务必创建还原点。"] }, { title: "3. 联系方式", content: ["如有问题，请通过联系页面联系我们。"] }] },
    hi: { disclaimer: "यह एक अनुवाद है। विसंगति की स्थिति में अंग्रेजी संस्करण मान्य होगा।", lastUpdated: "मार्च 2026", sections: [{ title: "1. शर्तों की स्वीकृति", content: ["OptWin का उपयोग करके, आप इन शर्तों से सहमत होते हैं।"] }, { title: "2. अस्वीकरण", content: ["OptWin बिना गारंटी के प्रदान किया जाता है। स्क्रिप्ट चलाने से पहले रिस्टोर पॉइंट बनाएं।"] }, { title: "3. संपर्क", content: ["प्रश्नों के लिए, हमारे संपर्क पृष्ठ का उपयोग करें।"] }] },
};

async function seedPageContent(pageSlug: string, data: Record<string, PageData>) {
    console.log(`  📄 Seeding ${pageSlug} page content...`);
    let count = 0;
    for (const [lang, page] of Object.entries(data)) {
        for (let i = 0; i < page.sections.length; i++) {
            const section = page.sections[i];
            await prisma.pageContent.upsert({
                where: { pageSlug_lang_sectionOrder: { pageSlug, lang, sectionOrder: i } },
                update: {
                    title: section.title,
                    content: JSON.stringify(section.content),
                    disclaimer: page.disclaimer || null,
                    lastUpdated: page.lastUpdated,
                },
                create: {
                    pageSlug,
                    lang,
                    sectionOrder: i,
                    title: section.title,
                    content: JSON.stringify(section.content),
                    disclaimer: page.disclaimer || null,
                    lastUpdated: page.lastUpdated,
                },
            });
            count++;
        }
    }
    console.log(`    ✅ ${count} sections seeded for ${pageSlug}`);
}

async function main() {
    console.log("📄 Seeding page content...\n");
    await seedPageContent("privacy", PRIVACY);
    await seedPageContent("terms", TERMS);
    console.log("\n🎉 Page content seeding complete!");
}

main()
    .catch(e => { console.error("❌ Seed error:", e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
