import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

const TR_LABELS = {
    scriptTitle: "OptWin Windows Optimizasyon Scripti",
    version: "Versiyon",
    date: "Tarih",
    developer: "Geliştirici",
    developerName: "ahmetly",
    website: "Website",
    websiteUrl: "https://optwin.tech",
    githubUrl: "https://github.com/ahmetlygh/optwin",
    openSource: "Açık Kaynak — Ücretsiz kullanım ve değiştirme hakkı",
    bannerTitle: "OptWin Windows Optimizasyon",
    openSourceShort: "Açık Kaynak Proje",
    adminRequest: "Bu script yönetici izni gerektirmektedir.",
    adminPrompt: "Devam etmek için UAC penceresinde 'Evet' seçeneğine tıklayın.",
    adminError: "Yetki yükseltme başarısız oldu.",
    adminHint: "Scripte sağ tıklayıp 'Yönetici olarak çalıştır' seçeneğini kullanın.",
    restorePoint: "Sistem geri yükleme noktası oluşturuluyor...",
    restoreSuccess: "Geri yükleme noktası başarıyla oluşturuldu.",
    restoreFail: "Geri yükleme noktası oluşturulamadı (kritik değil).",
    done: "Tamamlandı",
    complete: "Tüm optimizasyonlar tamamlandı!",
    success: "Değişikliklerin etkili olması için lütfen bilgisayarınızı yeniden başlatın.",
    thankYou: "OptWin kullandığınız için teşekkürler!",
    author: "ahmetly tarafından — https://optwin.tech",
    pressAnyKey: "Çıkmak için herhangi bir tuşa basın...",
};

// Delete existing TR labels
const deleted = await p.scriptLabel.deleteMany({ where: { lang: "tr" } });
console.log(`Deleted ${deleted.count} existing TR labels.`);

let created = 0;
for (const [key, value] of Object.entries(TR_LABELS)) {
    await p.scriptLabel.create({ data: { lang: "tr", key, value } });
    created++;
}
console.log(`Created ${created} TR labels.`);

await p.$disconnect();
