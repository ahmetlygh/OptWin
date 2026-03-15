# Admin Panel Yeniden Tasarım v3 — Yapılacaklar

> Aşağıdaki maddeler öncelik sırasına göre düzenlenmiştir.

## I. Bakım Ekranı, İkon Düzeltmeleri ve Kaydetme Mantığı

- [x] **I1. Bakım yazısı paragraflaması düzelt**
  - Uzun tek paragraf yerine 3 kısa paragraf (desc1, desc2, desc3)
  - line-height 1.7, max-w-sm, azalan opaklık ile nefes alan format

- [x] **I2. Dil seçici: bayraklar + Globe ikonu**
  - Her dilin yanına ülke bayrağı emoji (🇹🇷 🇬🇧 🇩🇪 🇫🇷 🇪🇸)
  - Dropdown butonunda Globe ikonu + bayrak + label
  - Dropdown listesinde bayrak + label her satırda

- [x] **I3. Dile göre saat dilimi gösterimi**
  - TR=UTC+3, EN=UTC±0, DE=UTC+1, FR=UTC+1, ES=UTC+1
  - `getDateTimeForOffset()` ile her dilin kendi offset'i hesaplanıyor
  - UTC label dinamik: `formatUtcLabel(offset)`

- [x] **I4. Bakım geçiş animasyonu: dönen çark + fade**
  - `TransitionSpinner` bileşeni: dönen Settings ikonu + karanlık arka plan
  - Durum değişikliğinde: fade-out → spinner 600ms → yeni durum fade-in
  - İlk yüklemede spinner gösterilmiyor (sadece geçişlerde)

- [x] **I5. "Destekle" linki pointer cursor**
  - `cursor-pointer` + `hover:underline underline-offset-2` eklendi
  - Tıklanabilir olduğu hem cursor hem underline ile anlaşılıyor

- [x] **I6. Kaydet sonrası butonlar animasyonla kaybolsun**
  - Kaydetme sonrası `setOriginal(form)` → hasChanges=false → AnimatePresence exit
  - Slug editor + inline editor her ikisinde de düzeltildi
  - 1.2s sonra "Kaydedildi!" gösterimi + onSave callback

- [x] **I7. İkon picker: seçilen ikon sitede doğru görünsün**
  - `Icons.tsx`'e 90+ eksik Lucide ikon import + FA_ICON_MAP entry eklendi
  - Admin ICON_MAP ile public FA_ICON_MAP tamamen senkronize
  - Yeni ikonlar: shield, settings, monitor, hard-drive, battery, camera, vb.

- [x] **I8. Kaydetme/İptal mantığını gözden geçir**
  - `[original, setOriginal]` → güncellenebilir state (önceden readonly idi)
  - İptal → `setForm(buildInitialState())` + `setOriginal(buildInitialState())`
  - Kaydet → API → `setOriginal(form)` → butonlar kaybolur

- [x] **I9. Bakım slider'ı ters çevir**
  - ON (yeşil) = Site Aktif, normal çalışıyor
  - OFF (gri) = Site Bakımda
  - Label dinamik: "Aktif" / "Bakımda" + renk geçişi

---

## F. UI/UX İyileştirmeleri ve Genişlik Düzenlemeleri

- [x] **F1. Badge bitiş zamanı UI yeniden tasarla**
  - Ayrı tarih ve saat input'ları (datetime-local yerine)
  - Hızlı saat presetleri: 3, 6, 12, 24, 48, 72 saat
  - Temizle butonu, bitiş zamanı önizlemesi

- [x] **F2. İkon seçiciye daha fazla ikon ekle**
  - ~85 yeni Lucide ikon eklendi (toplam ~150+)
  - Grid 7 sütuna, max yükseklik 280px'e çıkarıldı

- [x] **F3. Kaydet/İptal butonları animasyonlu kaybolsun**
  - AnimatePresence ile exit animasyonu eklendi (scale + opacity + x)

- [x] **F4. Header: breadcrumbs + saat yeniden konumlandırma**
  - Sol tarafta breadcrumbs navigasyonu (Admin > Özellikler > Düzenle gibi)
  - Saat kullanıcı isminin altına taşındı
  - E-posta adresi kaldırıldı

- [x] **F5. Yeni özellik eklerken newBadge + expiry desteği**
  - FeatureEditor'a newBadge toggle + expiry UI eklendi
  - POST API'da newBadge ve newBadgeExpiry desteği eklendi

- [x] **F6. Tam genişlik responsive layout**
  - Tüm sayfalardan max-w-5xl/6xl/2xl sınırlamaları kaldırıldı
  - Sidebar: 260px / xl:280px / 2xl:300px responsive genişlik
  - İçerik alanı ekranın tamamını kullanıyor

---

## E. Yeni Düzeltmeler ve Özellikler

- [x] **E1. Sidebar genişlet + logo/glow'u sol üste taşı**
  - Sidebar 220→260px genişletildi
  - OptWin logo+yazı+glow gradient sidebar header'a taşındı
  - Footer'da sadece versiyon bilgisi kaldı

- [x] **E2. Dashboard kartları büyüt + daha admin hissi**
  - Stat kartları p-6, text-3xl font yapıldı
  - Welcome bölümü kartlı layout + "Sistem Aktif" badge eklendi
  - max-w-6xl kaldırıldı, tam genişlik

- [x] **E3. Bakım modu slider'ı + onay modalı**
  - AdminHeader'a maintenance toggle eklendi (Siteye Git'in solunda)
  - Açarken/kapatırken AdminConfirmModal ile onay
  - `/api/admin/maintenance` GET/PUT endpoint'leri oluşturuldu
  - SiteSetting key: "maintenanceMode" kullanılıyor

- [x] **E4. Bakım sayfası tasarla**
  - `/maintenance` sayfası: dönen çark, logo+glow, çok dilli metin
  - Sağ üstte dil seçici, altta copyright, ortada tarih/saat
  - Header/footer yok
  - PublicShell'de 10sn polling — bakımdaysa loading ile yönlendirme
  - Bakımdan çıkınca bakım sayfası 5sn polling ile tespit edip loading ile siteye dön

- [x] **E5. "Siteye Git" modal kapanma bugını düzelt**
  - onConfirm'de setShowViewSite(false) eklendi

- [x] **E6. Özellik kaydettikten sonra sayfada kal**
  - onSave artık reloadFeature yapıyor (router.push kaldırıldı)
  - saved state 2sn sonra reset oluyor

- [x] **E7. Tüm features'tan newBadge kaldır (default false)**
  - Schema: `@default(false)`, DB: tüm feature'lar güncellendi

- [x] **E8. AdminLangPicker bayrak ikonlarını düzelt**
  - Emoji bayraklar SVG bileşenlerine değiştirildi (Flags.tsx)

- [x] **E9. İkon seçici viewport taşma düzelt**
  - Akıllı up/down pozisyonlama eklendi (viewport ölçümü)

- [x] **E10. Script mesajına çeviri butonu ekle**
  - "Çevir" butonu Otomatik'in soluna eklendi
  - handleTranslateScriptMsg ile diğer dillere çeviri + toast

- [x] **E11. Kaydedilmemiş değişiklik modalı**
  - UnsavedChangesModal bileşeni oluşturuldu
  - Geri butonunda tryNavigate ile hasChanges kontrolü
  - "Kaydet ve Çık" / "Kaydetmeden Çık" / "İptal" + ESC desteği

---

# Admin Panel Yeniden Tasarım v2 — Tamamlanan Maddeler

## A. Kritik Düzen/Layout Düzeltmeleri

- [x] **A1. Admin sayfalarında public Header ve Footer kaldır**
  - Root layout (`app/layout.tsx`) admin rotalarında Header, Footer, SupportModal, ScrollToTop render etmemeli
  - `PublicShell` bileşeni oluşturuldu — admin rotalarında otomatik gizleniyor

- [x] **A2. Sidebar en sola gerçekten yapışsın (gap kaldır)**
  - Desktop sidebar `sticky top-0` yerine flex layout içinde doğrudan solda durmalı
  - `h-screen` + `aside` yapısına geçildi, gap kaldırıldı

- [x] **A3. Sidebar footer: OptWin logosunu alta taşı**
  - Shield ikonu yerine orijinal OptWin logosu (`/optwin.png`) kullanılıyor
  - "Admin" badge'i + "Yönetim Paneli" yazısı sidebar footer'da

- [x] **A4. Dashboard: "Günaydın Admin" → gerçek Google ismi**
  - Session'dan `user.name` alınıp `userName` prop olarak geçiriliyor

- [x] **A5. Özellik satırına tıklayınca /admin/features/edit/[slug] sayfasına yönlendir**
  - `router.push("/admin/features/edit/" + slug)` eklendi

- [x] **A6. AdminSelect dropdown overflow/konum düzelt**
  - Viewport sınırlarını ölçen akıllı yukarı/aşağı pozisyonlama eklendi

- [x] **A7. AdminLangPicker: TR en üstte, varsayılan dil EN**
  - LANGUAGES dizisinde TR birinci sırada, varsayılan `activeLang` hâlâ `"en"`

## B. Admin Giriş Sayfası

- [x] **B1. Admin login sayfası — açık modda kötü görünüm düzelt**
  - Login sayfasında zorla `dark` class + `data-theme=dark` eklendi

- [x] **B2. Admin login — seçilen dile göre yazıları değiştir**
  - TranslatableText zaten kullanılıyordu, dark mode override ile birlikte çalışıyor

## C. Açık Mod (Light Mode) Düzeltmeleri

- [x] **C1. Script önizleme terminalinde açık modda daha koyu gri arka plan**
  - Light mode: `#1e1e2e`, dark mode: `#0a0a0f` arka plan
  - Yazı renkleri her iki modda da görünür

## D. Yeni Özellikler

- [x] **D1. "Yeni" badge sistemi**
  - Prisma schema'ya `newBadge` (Boolean) + `newBadgeExpiry` (DateTime?) eklendi
  - Admin slug editor'da toggle + tarih seçici UI
  - Public FeatureCard'da çok dilli animasyonlu badge (Yeni/New/Neu/...)
  - Badge süresi dolunca veya admin kapatınca otomatik gizleniyor

- [x] **D2. Özellik eklerken varsayılan script mesajı otomatik oluştur**
  - `src/lib/powershell-safe.ts` — ASCII-safe karakter dönüşümü
  - Hem slug editor hem inline editor'da "Otomatik Oluştur" butonu

- [x] **D3. Ücretsiz çeviri API'si entegrasyonu**
  - MyMemory API ile `/api/admin/translate` route oluşturuldu
  - Slug editor'da "Diğer Dillere Çevir" butonu + toast bildirim

- [x] **D4. Script Ayarları sayfası iyileştirmeleri**
  - AdminLangPicker ile bayraklı dil seçici (tab sistemi kaldırıldı)
  - İki sütunlu layout: sol tablo + sağ terminal preview
  - Terminal preview'dan `.ps1` indirme butonu
  - Düzenle modunda satıra tıklayarak inline düzenleme

---

# Admin Panel Yeniden Tasarım v1 — Tamamlanan Maddeler (Arşiv)

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
