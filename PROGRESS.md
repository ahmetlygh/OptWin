# PROGRESS.md — OptWin v1.3 Geçiş Takip Dosyası

> Görevleri tamamladıkça `[x]` ile işaretle.
> Mevcut sürüm: `v1.2` (statik) → Hedef: `v1.3` (Full-stack Next.js)

---

## 📋 Faz 0 — Planlama ve Kurulum
> Hedef: Proje temeli, araçlar ve depo yapısının hazır hale getirilmesi.

- [x] TypeScript ile yeni Next.js 15 projesi oluştur (`npx create-next-app`)
- [x] Tailwind CSS v4 yapılandırmasını yap
- [x] Framer Motion (animasyon kütüphanesi) kurulumunu yap
- [x] ESLint + Prettier yapılandırmasını yap
- [x] PostgreSQL bağlantısı ile Prisma kurulumunu yap
- [x] Başlangıç `schema.prisma` dosyasını yaz (tüm modeller)
- [x] İlk migration'ı çalıştır (`npx prisma migrate dev --name init`)
- [x] Shadcn/ui temel bileşenlerini kur (Radix UI + CVA + tailwind-merge + lucide-react)
- [x] Zustand store iskeletini oluştur (`useOptWinStore.ts`)
- [x] `.env.example` dosyasını oluştur
- [x] Proje dosyalarını asıl klasöre taşı ve eski dosyaları `old-optwin` klasörüne aktar
- [x] Coolify projesi + PostgreSQL servisini kur
- [x] Google Provider ile NextAuth.js v5 yapılandırmasını yap
- [x] Google OAuth girişini yerelde test et
- [x] Eski `config.js` dosyasındaki 62 özellik, kategoriler ve TR/EN çevirileriyle veritabanını besle (seeding) — seed dosyası hazır
- [x] `AGENTS.md` dosyasını nihai dosya yapısına göre güncelle

---

## 🎨 Faz 1 — Genel Frontend (1:1 Geçiş)
> Hedef: Genel sitenin v1.2 ile GÖRSEL OLARAK AYNI görünmesi ancak Next.js + TypeScript ile inşa edilmesi.
> Görsel ve özellik kaybı sıfır olmalı.

- [x] `css/style.css` tasarım token'larını Tailwind + CSS değişkenlerine aktar
- [x] `Header` bileşenini oluştur (logo, navigasyon, dil seçimi, tema değiştirici, hamburger menü)
- [x] `MobileNav` bileşenini oluştur (yandan açılır panel, tüm linkler, istatistikler)
- [x] `Hero` bölümü bileşenini oluştur
- [x] `PresetControls` bileşenini oluştur (Önerilen, Oyuncu, Hepsini Seç, Sıfırla)
- [x] Vurgulama ve temizleme butonlu `SearchBar` (Arama Çubuğu) bileşenini oluştur
- [x] `FeatureCard` bileşenini oluştur (ikon, başlık, açıklama, risk rozeti, seçim göstergesi)
- [x] `FeatureGrid` bileşenini oluştur (kategori başlığı + grid düzeni)
- [x] `DnsPanel` bileşenini oluştur (radyo seçenekleri, ping testi butonu)
- [x] `ActionArea` bileşenini oluştur (Script Oluştur butonu + iletişim mesajı)
- [x] `ScriptOverlay` bileşenini oluştur (önizleme, kopyalama, indirme, talimatlar)
- [x] `RestorePointModal` (Geri Yükleme Noktası Modal) bileşenini oluştur
- [x] `WarningModal` (Uyarı Modal) bileşenini oluştur
- [x] `Toast` bildirim bileşenini oluştur
- [x] `StatsSection` (ziyaret + indirme yüzen kartları) bileşenini oluştur
- [x] `AboutSection` (değerler gridi, misyon, destek kartı) bileşenini oluştur
- [x] `Footer` (Altbilgi) bileşenini oluştur
- [x] `script.js` dosyasındaki script oluşturma mantığını `script-generator.ts` olarak TypeScript'e taşı
- [x] Zustand store aktarımı: `selectedFeatures`, `lang`, `theme`, `dnsProvider`
- [x] React için lazy loading (IntersectionObserver muadili) uygula
- [x] Özellik seçimi karşılıklı dışlama mantığını uygula (Yüksek ve Nihai Performans aynı anda seçilemez)
- [x] Preset (Hazır ayarlar) mantığını uygula (önerilen, oyuncu, hepsi, sıfırla)
- [x] Ziyaret takibi için `/api/stats` bağlantısını yap
- [x] Script indirme takibi için `/api/stats` bağlantısını yap
- [x] Tam i18n: `localStorage` kalıcılığı ile EN + TR desteği
- [x] `localStorage` kalıcılığı ile Karanlık / Aydınlık tema desteği
- [x] Mobil uyumluluk: 320px, 375px, 768px, 1024px, 1440px testleri
- [x] 62 özelliğin tamamının doğru render edildiğini doğrula
- [x] Oluşturulan PowerShell scriptinin v1.2 çıktısıyla birebir aynı olduğunu doğrula

---

## 🔌 Faz 2 — API Rotaları ve Backend
> Hedef: Tüm genel API uç noktalarının çalışır hale getirilmesi.

- [x] `GET /api/stats` → `{ totalVisits, totalScripts }` döndür
- [x] `POST /api/stats?action=visit` → ziyaret sayacını artır
- [x] `POST /api/stats?action=script` → script sayacını artır
- [x] `GET /api/features` → çevirileriyle birlikte tüm aktif özellikleri döndür
- [x] `GET /api/features/[id]` → tekil özellik detayı
- [x] `POST /api/contact` → iletişim mesajını veritabanına kaydet
- [x] `/api/contact` için hız sınırlaması (IP başına saatte maks 3 mesaj)
- [x] Bakım modu middleware (SiteSetting.maintenance_mode kontrolü, 503 döndür)
- [x] Uygun CORS başlıklarını ekle
- [x] Tip güvenli hata yanıtları ile hata yönetimini ekle

---

## ⚡ Faz P — Performans Denetimi ve UI İyileştirmeleri
> Hedef: Tespit edilen performans sorunlarının çözümü ve akıcılık artışı.

### Performans Düzeltmeleri
- [x] **KRİTİK** — Middleware'de self-fetch döngüsü → env değişkenine çevrildi (her istek için +50-150ms kazanç)
- [x] **YÜKSEK** — Ana sayfada 8 seri Prisma sorgusu → `Promise.all()` ile paralelize edildi + DNS providers tekrarı kaldırıldı
- [x] **YÜKSEK** — Render-blocking CDN CSS (Material Symbols ~250KB + FontAwesome ~90KB) → tamamen kaldırıldı, lucide-react SVG'lere geçildi
- [x] **ORTA-YÜKSEK** — 10+ bileşende gereksiz `mounted` state anti-paterni → kaldırıldı, ClientProviders tek noktada hydration koruması sağlıyor
- [x] **ORTA** — FeatureCard'da çift useEffect hatası → düzeltildi
- [x] **ORTA** — SearchBar'da 3x gereksiz store subscription → tek değişkene indirildi
- [x] **ORTA** — Zustand persist'te modal/toast state'leri de serialize ediliyordu → `partialize` eklendi, sadece kullanıcı tercihleri kaydediliyor
- [x] **ORTA** — Hero'da harici Unsplash görseli → CSS gradient ile değiştirildi (LCP +100-300ms kazanç)
- [x] **ORTA** — HighlightText'te RegExp injection riski → özel karakterler escape edildi + `useMemo` ile cache'lendi
- [x] **DÜŞÜK** — Contact form mock API kullanıyordu → gerçek `/api/contact` endpoint'ine bağlandı

### UI İyileştirmeleri
- [x] Material Symbols ve FontAwesome tamamen kaldırıldı → tüm ikonlar lucide-react SVG'lere geçirildi
- [x] DNS modal'da seçim sonrası "Seçimi Onayla" butonu eklendi, scroll sorunu çözüldü
- [x] DNS seçildikten sonra FeatureCard'da "Değiştir: cloudflare" butonu gösteriliyor
- [x] Dil seçici dropdown animasyonlu açılıp kapanıyor (dropdownOpen/Close CSS) 
- [x] Tema değişimi yavaşça geçiş yapıyor (theme-ready class + 0.5s cubic-bezier transition)
- [x] Tema ikonu (güneş↔ay) dönerek değişiyor
- [x] Footer'daki DB sorguları `Promise.all()` ile paralelize edildi
- [x] Tüm `transition-all` → hedefli `inline style transition` ile değiştirildi (repaint azaltma)

---

## 🔐 Faz 3 — Kimlik Doğrulama ve Admin İskeleti
> Hedef: Google girişi ile güvenli admin alanı ve çalışan düzen.

- [x] NextAuth.js `[...nextauth]` rotasını kur
- [x] Google OAuth sağlayıcısını yapılandır
- [x] `ADMIN_EMAILS` env değişkeni ile admin e-posta beyaz listesini kur
- [x] `AdminUser` tablosunu otomatik doldur (ADMIN_EMAILS'ten ilk girişte oluşturulur)
- [x] `/admin/layout.tsx` dosyasında auth koruması (oturum yoksa yönlendir)
- [x] Admin düzeni: yan menü navigasyonu + başlık + ana içerik alanı
- [x] Admin yan menü linkleri: Dashboard, Özellikler, Kategoriler, Çeviriler, Mesajlar, İstatistikler, Ayarlar, Görünüm
- [x] Duyarlı admin düzeni (mobilde daralan yan menü)
- [x] Admin başlığı: kullanıcı avatarı, isim, çıkış butonu
- [x] `/admin/login` adresinde Google ile Giriş butonu içeren sayfa
- [x] Admin olmayan Google hesapları için "Yetkisiz Erişim" sayfası
- [x] Oturum yenileme yönetimi (NextAuth.js session callback ile)

---

## 🛠️ Faz 4 — Admin Paneli: Temel CRUD
> Hedef: Admin panelinden tam özellik ve kategori yönetimi.

### Özellikler (Features)
- [x] Tüm özellikleri ara, kategoriye göre filtrele, riske göre filtrele seçenekleriyle listele
- [x] Özellik durumunu değiştir (aktif/pasif - genel sitede anında yansır)
- [x] Özellikleri sürükle-bırak ile yeniden sırala (reorder API)
- [x] Özellik düzenleme: ID, ikon, risk seviyesi, noRisk seçeneği
- [x] Özellik çevirilerini düzenle: EN ve TR başlık + açıklama yan yana
- [x] Özellik PowerShell komutunu düzenle
- [x] Özellik script mesajını düzenle (EN + TR)
- [x] Yeni özellik ekle (tam form)
- [x] Özellik sil (onay mekanizması ile)

### Kategoriler (Categories)
- [x] Özellik sayılarıyla birlikte tüm kategorileri listele
- [x] Kategori durumunu değiştir (aktif/pasif)
- [x] Kategorileri sürükle-bırak ile yeniden sırala
- [x] Kategori çevirilerini düzenle (EN + TR)
- [x] Yeni kategori ekle
- [x] Kategori sil (sadece içinde özellik yoksa)

### DNS Sağlayıcıları (DNS Providers)
- [x] Tüm DNS sağlayıcılarını listele
- [x] Birincil/İkincil IP'leri ve görünen ismi düzenle
- [x] Sağlayıcıyı aktif/pasif yap
- [x] Yeni DNS sağlayıcısı ekle
- [x] Sağlayıcı sil

---

## 📝 Faz 5 — Admin Paneli: İçerik ve Çeviriler
> Hedef: Genel sitede görünen her metnin admin panelinden düzenlenebilmesi.

- [ ] Çeviri editörü: Tüm UI metinleri için yan yana düzenleme
- [ ] Hero bölümü: Dil başına düzenlenebilir başlık + açıklama
- [ ] Hakkında bölümü: Dil başına başlık, alt başlık ve değer kartları düzenleme
- [ ] Destek bölümü: Dil başına başlık, açıklama ve not düzenleme
- [ ] Altbilgi (Footer) metni düzenleme
- [ ] İletişim mesajı metni düzenleme
- [ ] Preset buton etiketlerini dil başına düzenleme
- [ ] Risk seviyesi etiketlerini dil başına düzenleme
- [ ] Kategori isimlerini düzenleme (Çeviri modeline yansır)
- [ ] Önizleme: Yeni sekmede genel siteyi açma butonu

---

## 📬 Faz 6 — İletişim Formu ve Mesajlar
> Hedef: Kullanıcıların mesaj gönderebilmesi. Adminin bunları yönetebilmesi.

- [ ] `/contact` adresine form ekle (isim, e-posta, konu, mesaj)
- [ ] Form doğrulama (istemci + sunucu tarafı)
- [ ] Hız sınırlaması (IP başına saatte 3 başvuru)
- [ ] Gönderildiğinde: `ContactMessage` tablosuna kaydet
- [ ] Kullanıcıya başarı/hata geri bildirimi ver
- [ ] Admin mesajlar sayfası: Okundu/Okunmadı durumuyla tüm mesajları listele
- [ ] Okundu / Okunmadı olarak işaretle
- [ ] Mesaj sil (önce çöp kutusuna, ayarlardan tamamen sil)
- [ ] Admin yan menüsünde okunmamış mesaj sayısı rozeti
- [ ] Mesajı yanıtla (önceden doldurulmuş `mailto:` ile e-posta istemcisini açar)

---

## 📊 Faz 7 — Admin İstatistikleri ve Analiz
> Hedef: Admin panelinde detaylı kullanım analizlerini gör.

- [ ] Toplam ziyaret sayacı (ömür boyu)
- [ ] Toplam oluşturulan script sayacı (ömür boyu)
- [ ] Günlük ziyaret grafiği (son 30 gün)
- [ ] Günlük script oluşturma grafiği (son 30 gün)
- [ ] En çok seçilen özellikler sıralaması
- [ ] En çok kullanılan hazır ayarlar takibi
- [ ] En çok kullanılan DNS sağlayıcıları takibi
- [ ] Dil kullanım dağılımı (EN vs TR)
- [ ] Tema tercihi dağılımı (karanlık vs aydınlık)
- [ ] Admin arayüzünden bireysel sayaçları sıfırla
- [ ] İstatistikleri CSV olarak dışa aktar

---

## ⚙️ Faz 8 — Admin Ayarları (God Mode)
> Hedef: Sitenin her operasyonel yönünü admin panelinden kontrol et.

- [ ] **Bakım Modu** anahtarı (AÇIK olduğunda site bakım sayfasını gösterir)
- [ ] **Site Sürümü** metni (footer ve sürüm rozetinde görünür)
- [ ] **GitHub URL** düzenleme
- [ ] **Buy Me a Coffee URL** düzenleme
- [ ] **İletişim E-postası** düzenleme
- [ ] **Yazar Adı** + **Yazar URL** düzenleme
- [ ] **Varsayılan Dil** ayarı (en/tr)
- [ ] **Varsayılan Tema** ayarı (dark/light)
- [ ] **Script Formatı** ayarı (şimdilik sadece ps1)
- [ ] **BMC Widget** aç/kapat anahtarı
- [ ] **Analiz** sıfırlama butonları (ziyaretler, scriptler)
- [ ] **Tehlikeli Bölge**: mesajları toplu sil, tüm mesajları temizle
- [ ] Ayarlar `.env` yerine `SiteSetting` DB tablosuna kaydedilir

---

## 🌐 Faz 9 — Çok Dilli Temel (Geleceğe Hazırlık)
> Hedef: EN + TR ötesinde yeni diller eklemek için temel oluşturma.

- [ ] DB'de aktif/pasif bayrağıyla Dil modeli
- [ ] Admin: yeni dil ekle (kod, isim, bayrak)
- [ ] Çeviri editörü: yeni dil sütunu otomatik eklensin
- [ ] Genel site: dil seçici dinamik olarak N dili desteklesin
- [ ] Geri çekilme (fallback) zinciri: çeviri eksikse → EN'ye dön

---

## 🚀 Faz 10 — Yayına Alma ve Üretim
> Hedef: Coolify üzerinde kesintisiz yayın.

- [ ] Üretim `Dockerfile` dosyasını yaz (Next.js standalone)
- [ ] Next.js uygulaması için Coolify servisini yapılandır
- [ ] PostgreSQL için Coolify servisini yapılandır
- [ ] Coolify'da tüm çevre değişkenlerini ayarla
- [ ] Üretimde `prisma migrate deploy` çalıştır
- [ ] Başlangıç verileri için veritabanı seed işlemini yap
- [ ] `optwin.tech` özel alan adını Coolify'a yönlendir
- [ ] Coolify Let's Encrypt üzerinden SSL sertifikası
- [ ] Sağlık kontrolü (health check) uç noktası (`/api/health`)
- [ ] Tam üretim dağıtımını test et
- [ ] v1.3 lansmanı ✅

---

## 🎯 Faz 11 — Cilalama ve SEO
> Hedef: Performans, erişilebilirlik ve arama motoru görünürlüğü.

- [ ] Tüm metriklerde (Performans, Erişilebilirlik, SEO, En İyi Pratikler) Lighthouse skoru ≥ 95
- [ ] Tüm resimler için uygun alt metinli `next/image` kullanımı
- [ ] `robots.txt` ve `sitemap.xml` oluşturma
- [ ] Yapılandırılmış veriler (Schema.org SoftwareApplication) — v1.2'den aktar
- [ ] Sayfa başına Open Graph meta etiketleri
- [ ] Twitter Card meta etiketleri
- [ ] Sayfa başına `<meta name="description">`
- [ ] Canonical (Özgün) URL'ler
- [ ] Google Fonts, FontAwesome CDN için `preconnect` ipuçları
- [ ] Hata sınırı (Error Boundary) bileşenleri
- [ ] 404 ve 500 özel hata sayfaları
- [ ] Tüm sayfa bölümleri için `loading.tsx` iskelet ekranları
- [ ] Tüm TypeScript hatalarını ve ESLint uyarılarını düzelt
- [ ] Script oluşturucu için en azından temel duman testlerini (smoke tests) yaz

---

## 📦 Mevcut Durum

| Faz | Durum | Notlar |
|---|---|---|
| Faz 0 — Planlama | ✅ Tamamlandı | Kurulum, Prisma, Seed, Auth yapısı hazır |
| Faz 1 — Frontend | ✅ Tamamlandı | Tüm bileşenler, tema, dil, responsive |
| Faz 2 — API Rotaları | ✅ Tamamlandı | Stats, Features, Contact, Rate-limit |
| Faz P — Performans | ✅ Tamamlandı | CDN kaldırıldı, Promise.all, animasyonlar |
| Faz 3 — Auth & Admin | ✅ Tamamlandı | Google OAuth, Admin layout, Dashboard |
| Faz 4 — Admin CRUD | ✅ Tamamlandı | Features, Categories, DNS CRUD + Reorder API |
| Faz 5 — Çeviriler | ⬜ Başlamadı | |
| Faz 6 — İletişim | ⬜ Başlamadı | |
| Faz 7 — İstatistikler | ⬜ Başlamadı | |
| Faz 8 — Ayarlar | ⬜ Başlamadı | |
| Faz 9 — i18n Temeli | ⬜ Başlamadı | |
| Faz 10 — Yayın | ⬜ Başlamadı | |
| Faz 11 — Cilalama | ⬜ Başlamadı | |
