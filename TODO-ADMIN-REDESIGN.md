# Admin Panel Yeniden Tasarım — Detaylı Yapılacaklar

## 1. Veritabanı: Script Label Modeli
- [x] `ScriptLabel` modeli Prisma schema'ya ekle (lang + key + value)
- [x] Migration çalıştır
- [x] Mevcut hardcoded label'ları seed dosyasıyla DB'ye aktar (en, tr, zh, es, hi, de, fr)
- [x] `script-generator.ts` dosyasını güncelle: hardcoded `allLabels` yerine DB'den çek
- [x] `Feature.selectCount` alanı eklendi — her script oluşturulduğunda seçilen özellikler sayılır

## 2. Admin API Endpoints
- [x] `GET /api/admin/dashboard` — Toplam ziyaret, script, indirme, okunmamış mesaj, özellik sayısı, kategori sayısı, en çok seçilen özellikler
- [x] `GET /api/admin/script-labels` — Tüm script label'ları dil bazında getir
- [x] `PUT /api/admin/script-labels` — Script label'ları güncelle (dil + key + value)
- [x] `DELETE /api/admin/script-labels` — Script label sil
- [x] `/api/generate-script` — Feature selectCount increment eklendi

## 3. Admin Layout Yeniden Tasarım
- [x] `AdminSidebar.tsx` — Modern, glassmorphism, ana sayfa ile uyumlu renk paleti
  - Aktif sekmeler: Dashboard, Features, Script Defaults
  - Devre dışı sekmeler (gri, tıklanamaz): Categories, DNS, Translations, Messages, Statistics, Settings, Appearance
  - Unread message badge sidebar'da görünsün
  - Framer Motion animasyonları
- [x] `(dashboard)/layout.tsx` — Ambient background efektleri (ana sayfa gibi), modern header
  - Radial gradient arkaplan
  - Glassmorphism header
  - Animasyonlu sayfa geçişleri

## 4. Admin Dashboard Sayfası (Ana Giriş)
- [x] Hoş geldin mesajı (admin adıyla, saat dilimine göre)
- [x] İstatistik kartları (Framer Motion staggered):
  - Toplam Ziyaret
  - Toplam Script İndirme
  - Toplam İndirme
  - Aktif Özellik Sayısı
  - Kategori Sayısı
  - DNS Providers
- [x] Okunmamış mesaj uyarı bandı (kırmızı, animasyonlu)
- [x] En çok seçilen özellikler listesi (progress bar ile)
- [x] Son mesajlar listesi
- [x] Hızlı işlemler paneli (sadece aktif sayfalara link)
- [x] Tüm veriler gerçek DB'den çekilecek, hiçbir şey hardcoded olmayacak

## 5. Admin Features Sayfası
- [x] Tüm özellikler DB'den listelenir
- [x] Arama ve filtreleme (kategori, risk seviyesi)
- [x] Her özellik için:
  - Enable/Disable toggle (optimistic update ile anında DB'ye yazar)
  - Düzenle butonu → ayrı editor sayfası
  - Silme butonu → onay modal'ı
- [x] Düzenleme ekranı:
  - Temel bilgiler: slug, kategori, ikon, risk, sıra, aktif/pasif
  - Çeviriler: Dil seçici (tab) ile EN/TR başlık + açıklama
  - Komutlar: Dil seçici ile PowerShell komut + script mesajı
  - **Change Detection**: Değişiklik yapıldığında Kaydet + İptal butonları belirir
  - Eski haline dönülürse butonlar kaybolur
  - İptal'e basınca tüm değişiklikler geri alınır
- [x] Yeni özellik ekleme
- [x] Tüm metin DB'den çekilecek, gömülü string yok

## 6. Script Defaults (Varsayılan Script Ayarları) Sayfası
- [x] Dil seçici (tab): EN, TR, ZH, ES, HI, DE, FR...
- [x] Her dil için tüm script label'ları düzenlenebilir:
  - scriptTitle, version, date, developer, website, openSource
  - bannerTitle, openSourceShort
  - adminRequest, adminPrompt, adminError, adminHint
  - pressAnyKey, restorePoint, restoreSuccess, restoreFail
  - complete, success, thankYou, author, done
  - developerName, websiteUrl, githubUrl
- [x] Yeni satır eklenebilsin (yeni key)
- [x] Satır silinebilsin (sadece varsayılan olmayan key'ler)
- [x] Değişiklik varsa Kaydet + İptal butonları
- [x] DB'ye kaydedildiğinde script-generator.ts otomatik bu verileri kullanır

## 7. Genel Tasarım İlkeleri ✅
- Ana sayfa ile aynı renk paleti: accent (#6b5be6) + subtle greys
- Ambient radial gradient arkaplan
- Glassmorphism kartlar (backdrop-blur)
- Framer Motion animasyonları (stagger, fade, scale, spring)
- Minimal renk kullanımı
- Koyu tema varsayılan (admin her zaman dark)
- Mobil uyumlu (responsive sidebar)
