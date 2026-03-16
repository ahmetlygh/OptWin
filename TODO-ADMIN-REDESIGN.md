# Admin Panel Yeniden Tasarım v3 — Yapılacaklar

> Aşağıdaki maddeler öncelik sırasına göre düzenlenmiştir.

---

## O. Bakım Tasarımı, Kategori CRUD, Feature Edit Bugfix, Script Preview Sync, Public ActionArea

### Bakım Sayfası — Middleware HTML (`buildMaintenanceHtml`)
- [x] **O1. Bakım HTML tasarımını zenginleştir + eski iyi tasarımı geri getir**
  - Copyright yazısını büyüt (`.copy` font-size `.62rem` → `.78rem`)
  - Logo yamukluğunu düzelt: `img` etiketinde `object-fit:contain` + `vertical-align:middle` ekle
  - Tüm metin boyutlarını ~%15 artır (msg, apology, reason, countdown label, date vb.)
  - Tüm elementleri ~%15 büyüt (gear `48→56px`, countdown box `min-width:52→60px`, num `1.3→1.5rem` vb.)
  - Progress bar'ın altına "Çalışmalar devam ediyor" metni ekle (tüm 7 dilde: `wip` anahtarı)
  - Güncel saati saniyeye kadar göster, dile göre locale formatında (her saniye güncellenir)
  - Eski tasarımdaki `status` text'ini geri getir (bar altında)

### Bakım Sayfası — React Overlay (`PublicShell.tsx > MaintenanceOverlay`)
- [x] **O2. React overlay'i middleware ile uyumlu hale getir**
  - Tüm metin ve element boyutlarını ~%15 artır (aynı oranlar)
  - Copyright yazısını büyüt
  - Progress bar'ın altına "Çalışmalar devam ediyor" metni ekle (tüm 7 dilde)
  - Güncel saati saniyeye kadar göster (dile göre locale)
  - Fade-in/out spinner (TransitionSpinner): bakıma girerken VE bakımdan çıkarken çalışsın
  - Bakım bitince ani geçiş yerine spinner → fade → ana site

### Kategori Yönetimi — Features Sayfası
- [x] **O3. Düzenleme butonunu kategori isminin hemen yanına taşı**
  - Pencil butonu şu anda toggle/özellik sayısından sonra → isim `<span>` etiketinin hemen sağına taşı
  - Dil ne olursa olsun her zaman ismin yanında olsun

- [x] **O4. Tümünü Daralt / Genişlet butonlarını genişlet + isim yaz**
  - Sadece ikon yerine simge + "Tümünü Genişlet" / "Tümünü Daralt" yazısı butonlara ekle
  - Butonlar daha geniş olacak (`w-8` → `h-8 px-3` + metin)

- [x] **O5. Kaydet/İptal butonlarını Daralt/Genişlet butonlarının SOLUNA taşı**
  - Şu an: [Daralt][Genişlet] | [İptal][Kaydet] | [Dil]
  - Olması gereken: [İptal][Kaydet] | [Daralt][Genişlet] | [Dil]

- [x] **O6. Kategori silme ekle — toggle'ın sağına, onay modalı ile**
  - Enable/disable toggle'ın sağında Trash2 ikonu butonu
  - Basınca AdminConfirmModal ile onay iste
  - Onaylanırsa `DELETE /api/admin/categories?id=xxx` çağır
  - Kategoriye bağlı özellik varsa uyarı göster

### Yeni Kategori Modalı
- [x] **O7. Dil seçimini AdminLangPicker bayraklı butona çevir + seçili dilden çeviri**
  - Sağdaki 7 inputluk liste yerine: tek bir AdminLangPicker dropdown + tek input
  - AdminLangPicker ile dil seç → o dildeki ismi gir → Çevir butonuna bas → diğer dillere çevrilsin
  - Çeviri kaynağı: seçili dil (sadece EN değil)

- [x] **O8. Aynı sırada kategori varsa mevcut kategorilerin sıralarını kaydır**
  - `createCategory` fonksiyonunda: eğer `newCatOrder` ile aynı order'da bir kategori varsa, o ve sonrakilerin order'ını +1 artır
  - API tarafında da bu kontrol yapılmalı veya client-side shift + save

### Feature Edit Sayfası (`/admin/features/edit/[slug]`)
- [x] **O9. "Sıra" alanını kaldır**
  - Temel Bilgiler grid'inden `<div>` Sıra input'unu sil

- [x] **O10. Risk seviyesi dropdown açılmıyor — düzelt**
  - `AdminSelect` overflow hidden olan `motion.div` parent'ı dropdown'ı kesiyor
  - `overflow-hidden` → `overflow-visible` yap veya dropdown'ı portal'a taşı

- [x] **O11. Unsaved changes modal zamanlama sorunu — düzelt**
  - `registerOnSave.current` ve `registerOnDiscard.current` atamalarında `handleSubmit` henüz tanımlı olmayabilir
  - `useEffect` ile doğru zamanda register et, cleanup'ta null'a çek

### Script Ayarları
- [x] **O12. İndirilen .ps1 hemen kapanıyor — düzelt**
  - Mevcut: `previewText + "\npause"` — ancak PowerShell'de `pause` sadece `cmd` komutu
  - Düzeltme: `Read-Host -Prompt "Press Enter to exit"` veya `$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")` zaten satırlarda var ama `pause` çalışmıyor
  - Çözüm: `\npause` yerine `\nWrite-Host ""\nRead-Host "Press Enter to exit"` ekle

- [x] **O13. Preview'de "Geliştirici" vb. değer değişiklikleri yansımıyor**
  - `developer` format fonksiyonu: `(v, L) => \`# ${v}: ${L.developerName}\`` — burada `v` = "Geliştirici" etiketi, `L.developerName` = "ahmetly" değeri
  - Kullanıcı "developerName" değerini değiştirdiğinde preview'e yansıyor ama "developer" satırındaki `L.developerName` referansı güncellenmiyormuş gibi görünüyor
  - Sorun: `useMemo` dependency'de `currentLabels` var ama `L.developerName` deep reference ile güncellenmiyor olabilir
  - Çözüm: KEY_FORMAT fonksiyonlarının `L` parametresini her render'da taze `currentLabels`'dan alsın

### Public Site
- [x] **O14. Floating "Script Oluştur" butonu (ActionArea) görünmüyor**
  - `ActionArea` bileşeni `shouldShow = hasSelections && !isDnsModalOpen` koşuluna bağlı
  - Sorun: Feature seçildiğinde `selectedFeatures.size > 0` olması lazım
  - Zustand store'da `selectedFeatures` Set'inin doğru güncellenip güncellenmediğini kontrol et
  - CSS: `translate-y-full` ile gizleniyor, `shouldShow` true olduğunda `-translate-y-6` ile gösterilmeli
  - `z-[110]` yeterli mi kontrol et, başka element üstünü kapatıyor olabilir

---

## N. Bakım Sayfası Düzeltme, Kategori UX, Script Ayarları & Otomatik Toggle Bugfix

### Bakım Sayfası (Middleware + React Overlay)
- [x] **N1. Bakım sayfası tasarımını eski haline getir + son özellikleri koru**
  - Mevcut tasarım kötü: fade/spinner geçişi çalışmıyor, dil seçici siteye özel değil, logo bozuk, altta çizgi animasyonu yok, özür mesajı eksik
  - Middleware HTML (`buildMaintenanceHtml`): logo düzelt (48x48, drop-shadow), özür mesajı ekle (msg altında), progress bar'a kayma animasyonu ekle, dil seçici OptWin'e özel tasarım (select yerine custom dropdown)
  - React overlay (`MaintenanceOverlay`): fade geçişi düzelt, spinner geçişi düzelt (bakıma girerken/çıkarken), özür mesajı zaten var — koru
  - Tersine mühendislik ile ana site içeriği ASLA görülemesin — mevcut güvenlik korunsun
  - Son eklenen özellikler aynen kalsın: countdown, sebep, çok dilli destek, tahmini bitiş

### Kategori Yönetimi (Features Sayfası)
- [x] **N2. Çift tıklama yerine düzenleme butonu ile yeniden adlandırma**
  - Kategori başlığının yanında hover'da beliren kalem (Pencil) ikonu butonu
  - Bu butona basınca inline edit açılsın (mevcut çift tıklama kaldırılacak)
  - Butona basınca açılıp kapanma sorunu olmayacak

- [x] **N3. Kategori yeniden adlandırınca Kaydet/İptal butonları — dil seçicinin SOLUNA**
  - Düzenleme yapılınca dil seçicinin solunda Kaydet + İptal butonları belirsin
  - Eski haline döndürülürse veya butonlara basılırsa kaybolsun
  - AnimatePresence ile animasyonlu giriş/çıkış

- [x] **N4. Küçültülen kategoriler F5'te bile aynı kalsın — localStorage**
  - `collapsedCategories` Set'i localStorage'a yazılsın/okunansın
  - Sayfa yenilendiğinde (F5) aynı kategoriler kapalı kalsın

- [x] **N5. Tüm Kategorileri Daralt / Genişlet butonları**
  - Özellikler kısmında tüm kategoriler listesinin soluna iki buton ekle
  - "Tümünü Daralt" (ChevronsDownUp) + "Tümünü Genişlet" (ChevronsUpDown)
  - Her ikisi de localStorage'ı günceller

- [x] **N6. Kategori ekleme modalına dil listesi + sıra + çeviri API**
  - Modalın sağına dil listesi koy (tüm diller: en, tr, de, fr, es, zh, hi)
  - Her dil için isim girişi, slug tüm dillerde aynı kalacak
  - Sıra (order) alanı ekle — oluştururken belirlenebilsin
  - Çeviri API butonu: hangi dildeysem ondan diğer hepsine çevirecek
  - Çeviri başarılı olunca bildirim göster

- [x] **N7. Kategori içi sıralama değişince Kaydet/İptal butonları dil seçicinin SOLUNA**
  - Mevcut butonlar dil seçicinin sağında — sola taşınacak
  - Sıralama değişince animasyonlu belirsin, kaydet/iptal sonrası kaybolsun

### Script Düzenleme (Feature Edit) Bugfix
- [x] **N8. Otomatik toggle state bug düzelt**
  - `autoScriptMsg` state form ile senkronize değil
  - İptal'e basınca toggle sıfırlanmıyor
  - Kaydet sonrası toggle durumu korunmuyor
  - Çözüm: `autoScriptMsg` state'i form.commands'daki scriptMessage'lara bakarak türetilmeli (derived state)
  - Veya save/cancel işlemlerinde `autoScriptMsg`'ı da sıfırla

### Sidebar Navigasyon Guard
- [x] **N9. Tüm sayfalarda sidebar'dan geçiş yaparken unsaved changes modal**
  - Features sayfası zaten bağlı (UnsavedChangesContext)
  - Script Defaults sayfası zaten bağlı
  - Slug editor: mevcut kendi internal UnsavedChangesModal var ama sidebar'a bağlı DEĞİL → UnsavedChangesContext'e de bağla
  - Her sayfada sidebar geçişinde değişiklik varsa modal çıksın

### Script Ayarları Sayfası İyileştirmeleri
- [x] **N10. Satır sıralaması scriptlerin içinden değiştirilemesin**
  - Sol listedeki yukarı/aşağı ok butonlarını ve sıra input'unu kaldır
  - Sıralama sadece LABEL_DESCRIPTIONS sırasına göre sabit olsun

- [x] **N11. Kaydet/İptal butonları dil seçicinin SOLUNA**
  - Mevcut: dil seçicinin sağında — sola taşınacak
  - Animasyonla belirip kaybolacak

- [x] **N12. Terminal preview yazılarını baştan yaz + tamamını düzenlenebilir yap**
  - Mevcut 44 satırdan 24'ü düzenlenebilir — HEPSİ düzenlenebilir olmalı
  - Gereksiz süslü dekoratif satırları sadeleştir, sade tasarımlı script olsun
  - Liste ile %100 senkron

- [x] **N13. Admin'den indirilen preview .ps1'de "Press any key" çalışsın**
  - `$null = $Host.UI.RawUI.ReadKey(...)` satırı zaten var ama dosya açılınca kapanıyor
  - Scriptin sonuna `pause` veya `Read-Host` ekle ki terminal açık kalsın

- [x] **N14. Satır silmeden önce onay modalı + undo**
  - Listeden bir satır silinmeye çalışılınca "Emin misiniz?" modalı açılsın (ESC ile kapatılabilir)
  - Evet → sil, Hayır → silme
  - Silme işlemi Kaydet/İptal butonlarını tetiklesin
  - İptal'e basarsak silinen satırlar animasyonla geri gelsin

---

## M. Risk Badge Kaldırma, Bakım Sistemi Yenileme, Features DnD & Script Preview Yeniden Yazım

### Public Site
- [x] **M1. Risk badge'larını FeatureCard'dan kaldır**
  - `noRisk` kontrolü ve risk badge render bloğu tamamen kaldırılacak
  - Zaten admin'den risk seviyesi yönetilebilir, public'te göstermeye gerek yok

### Admin Hydration Fix
- [x] **M2. AdminHeader saat hydration hatası düzelt**
  - `getUTC3Time()` SSR'da çalışıp farklı zaman üretir → hydration mismatch
  - İlk render'da boş string göster, `useEffect` ile client-side saat başlat
  - `suppressHydrationWarning` eklenmeyecek, kök neden düzeltilecek

### Bakım Sistemi Yenileme
- [x] **M3. Bakım API: sebep + tahmini bitiş alanları**
  - `PUT /api/admin/maintenance` — `reason` (string) ve `estimatedEnd` (ISO datetime UTC) alanları
  - DB'de `SiteSetting` key'leri: `maintenanceReason`, `maintenanceEstimatedEnd`
  - `GET /api/admin/maintenance` — tüm bakım bilgilerini döndür
  - `GET /api/maintenance` (public) — bakım durumu + sebep + tahmini bitiş

- [x] **M4. Admin bakım modal: sebep + tahmini süre inputları**
  - Bakımı açarken modal: textarea (sebep), süre seçimi (saat dropdown VEYA tarih-saat picker)
  - Saat seçenekleri: 1, 2, 3, 6, 12, 24, 48, 72 saat
  - Tarih-saat: date + time input ile kesin zaman (admin UTC+3 girer, API UTC'ye çevirir)
  - Opsiyonel alanlar — boş bırakılabilir

- [x] **M5. Middleware bakım HTML: yeni tasarım + dinamik veri**
  - Bakım mesajı tüm dillerde: "Sitemiz şu anda bakımdadır. Ekibimiz en iyi deneyimi sunmak için çalışıyor."
  - Sebep varsa göster (görünümü bozmadan, küçük metin)
  - Tahmini bitiş varsa: geri sayım timer (JS ile), dile göre tarih formatı, zaman dilimine göre ayarlı
  - "Tahmini süre — daha erken veya geç bitebilir" disclaimer
  - Middleware bakım bilgilerini DB'den çeker ve HTML'e inject eder
  - Self-contained: tüm CSS/JS inline, dışarıdan hiçbir şey yüklenmez

- [x] **M6. PublicShell MaintenanceOverlay: yeni mesaj + countdown + tüm diller**
  - Aynı mesaj ve countdown mantığı React bileşeni olarak
  - `/api/maintenance` response'undaki `reason` ve `estimatedEnd` kullan
  - Geri sayım: gün, saat, dakika, saniye — canlı güncellenen
  - Kullanıcının tarayıcı zaman dilimine göre tarih gösterimi
  - Dil desteği: en, tr, de, fr, es, zh, hi

### Features Sayfası İyileştirmeleri
- [x] **M7. Her yerden sürükleme + tıklama navigasyonu**
  - Grip handle yerine tüm satır sürüklenebilir olacak
  - `PointerSensor` `distance: 8` ile drag/click ayrımı (8px hareket → drag, aksi halde click)
  - Tıklama hâlâ `/admin/features/edit/[slug]`'a yönlendiriyor

- [x] **M8. Kategoriler katlanabilir (animasyonlu)**
  - Her kategori başlığı tıklanabilir → açılır/kapanır
  - `AnimatePresence` + `motion.div` ile smooth height animasyonu
  - ChevronRight ikonu dönüşü ile açık/kapalı gösterimi
  - Varsayılan: tüm kategoriler açık

- [x] **M9. Dil seçici + kategori adı düzenleme + devre dışı bırakma**
  - "Kategorileri Sırala" soluna dil seçici (AdminLangPicker)
  - Seçilen dile göre özellik başlıkları ve kategori adları güncellenir
  - Kategori başlığına çift tıklayarak inline düzenleme
  - Kategori başlığı yanında enable/disable toggle

- [x] **M10. Sıralama kaydet/iptal + unsaved changes guard**
  - Sıralama değişikliğinde optimistic update YAPILMAYACAK
  - Değişiklikler local state'te tutulur, dil başlığının solunda Kaydet/İptal butonları belirir
  - Geri alınırsa butonlar kaybolur
  - Kaydet → API'ye gönder, İptal → orijinal sıraya dön
  - Sayfa değiştirirken unsaved changes modal (ESC ile kapatılabilir)

### Script Ayarları Terminal Preview Yeniden Yazım
- [x] **M11. Terminal preview tamamen yeniden yaz**
  - Mevcut previewLines siliniyor, sıfırdan yazılıyor
  - Liste ile %100 senkron: ekleme, silme, sıralama hepsi yansır
  - Modern terminal tasarımı (koyu arka plan, syntax highlighting)
  - Tüm varsayılan satırlar düzenlenebilir (optimizasyon placeholder hariç)
  - Not defteri modu: preview'e tıklayıp yazabilme, Enter ile alt satıra geçiş
  - Anahtar tamamlama (autocomplete) özelliği
  - Write-Host kısımlarına kadar her şey düzenlenebilir

---

## J. Özellik Düzenleme & Script Ayarları Geliştirmeleri

### Özellik Düzenleme Sayfası

- [x] **J1. Çeviriler ve Komut dil seçicileri bağımsız olsun**
  - `translationLang` + `commandLang` ayrı state'ler (slug edit + inline edit)
  - Birini değiştirmek diğerini etkilemiyor

- [x] **J2. Script mesajını komutun üstüne al**
  - Script Message textarea'sı PowerShell Command'ın üstünde
  - Her iki editor'da da uygulandı

- [x] **J3. Oto çeviri butonu TÜM dilleri çevirsin**
  - "Otomatik" butonu her dilin kendi title'ından scriptMessage üretir
  - `availableLangs` üzerinde for döngüsü ile tüm diller

### Script Ayarları Sayfası

- [x] **J4. Liste ekran sonuna kadar uzasın + özel scrollbar**
  - `height: calc(100vh - 220px)` + `min-h-0` + `admin-scrollbar` CSS
  - `globals.css`'e yeni `admin-scrollbar` sınıfı: 5px, koyu tema, hover reveal

- [x] **J5. githubUrl değerini kullan**
  - Preview'de `# GitHub: {githubUrl}` satırı eklendi
  - Header'da GitHub ikonu + tıklanabilir URL gösteriliyor

- [x] **J6. Anahtar-değer açıklamalarını düzenleme modu dışında da göster**
  - View modda key label'ları `text-white/10` ile her satırda görünüyor
  - Sol panelde LABEL_DESCRIPTIONS her zaman key altında

- [x] **J7. Preview'de Enter ile yeni satır oluşturma**
  - `handlePreviewKeyDown` — Enter'a basınca `yeniDeger1`, `yeniDeger2`... key oluşturur
  - Yeni key sol listeye otomatik eklenir, focus edilir

- [x] **J8. Hardcoded preview satırları da düzenlenebilir olsun**
  - `PreviewLine` tipine `editable: boolean` eklendi
  - Dekoratif çizgiler (`editable: false`), metin satırları (`editable: true`)
  - Satır/Komple modda sadece `editable: true` olanlar input olur

- [x] **J9. Anahtar eklerken autocomplete + otomatik değer doldurma**
  - `handleNewKeyChange` ile yazarken LABEL_DESCRIPTIONS'tan öneriler
  - Dropdown'dan seçince key otomatik dolar
  - Listede olmayan ama bilinen key'ler önerilir

- [x] **J10. Satır sıralama: listeden veya preview'den konum yönetimi**
  - `keyOrder` state ile her key'e sıra numarası atanıyor
  - Sol listede editlenebilir order input + yukarı/aşağı ok butonları (hover'da görünür)
  - `handleMoveUp` / `handleMoveDown` — komşu key'lerle swap
  - `handleSetOrder` — belirli sıraya koyma, dolu ise shift-down mantığı
  - Preview'de her 3 modda (view/line/full) key yanında order badge gösteriliyor
  - Framer Motion `layout` animasyonu ile sıra değiştiğinde smooth geçiş
  - Yeni eklenen key'ler otomatik en sona ekleniyor, silinen key'ler order'dan kaldırılıyor

- [x] **J11. Kaydedilmemiş değişiklik navigasyon guard modal**
  - `beforeunload` event'i ile tarayıcı kapatma/yenileme yakalanıyor
  - `UnsavedChangesModal` ile "Kaydet ve Çık" / "Kaydetmeden Çık" / "İptal"
  - `tryNavigate()` fonksiyonu sidebar entegrasyonu için hazır

---

## L. Bakım Modu Güvenliği, Dosya Yükleme, Sürükle-Bırak & Script Ayarları

### Bakım Modu Güvenliği
- [x] **L1. Middleware + Server Layout ile tam bakım modu güvenliği**
  - Middleware DB'den bakım durumunu kontrol eder (3sn cache, `/api/maintenance` üzerinden)
  - Bakım modunda TÜM public sayfa istekleri self-contained HTML döner (Next.js bundle yüklenmez)
  - Public API istekleri 503 JSON döner
  - Admin rotaları, auth, maintenance API, static dosyalar her zaman izinli (`ALWAYS_ALLOWED` listesi)
  - Self-contained HTML: OptWin tasarımıyla uyumlu bakım sayfası, 15sn auto-reload
  - Root layout (`layout.tsx`) server-side Prisma sorgusu ile `serverMaintenance` prop'u PublicShell'e geçirir
  - PublicShell `serverMaintenance` ile başlangıç state'i alır — site içeriği bakım modunda hiç render edilmez
  - `src/lib/maintenance.ts`: Server-side cache'li bakım kontrolü fonksiyonu
  - `x-next-pathname` header middleware'dan server component'lere pathname iletir
  - Tersine mühendislik ile bypass imkansız — HTML, JS, CSS hiçbir site dosyası gönderilmiyor

### Dosya Yükleme
- [x] **L2. Upload API + WebP dönüşümü + FeatureIcon desteği**
  - `POST /api/admin/upload` — multipart form data ile dosya yükleme
  - Raster görüntüler (PNG, JPEG, GIF) 128×128 WebP'ye dönüştürülür (`sharp` ile)
  - SVG dosyaları olduğu gibi kaydedilir
  - Dosyalar `public/uploads/icons/` dizinine `timestamp-hash` formatıyla kaydedilir
  - Max 5MB dosya boyutu limiti, yalnızca izin verilen MIME türleri
  - Auth guard: sadece admin kullanıcılar yükleyebilir
  - `AdminIconPicker` gerçek upload API kullanacak şekilde güncellendi (data URL yerine)
  - Upload sırasında loading spinner gösterimi
  - `FeatureIcon` bileşeni `/uploads/` ve `/assets/` path'lerini `<img>` olarak render eder
  - `CategoryIcon` aynı mantıkla güncellendi

### Özellik Düzenleme UI
- [x] **L3. 3 slider'ı Temel Bilgiler sağ üst köşeye taşı**
  - Yeni Badge (sarı), Risksiz (mavi), Aktif (yeşil) sağdan sola sırayla
  - Her slider'ın solunda metin etiketi, w-9 h-[20px] kompakt boyut
  - Hem slug editor (`edit/[slug]/page.tsx`) hem inline editor (`features/page.tsx`) güncellendi
  - Başlık satırı `flex justify-between` ile label + toggle'lar ayrıldı

### Sürükle-Bırak Sıralama
- [x] **L4. Features sayfasında drag-to-reorder + sıra numaraları**
  - `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` kuruldu
  - `SortableFeatureRow` bileşeni: GripVertical handle, sıra numarası, isim, risk badge, toggle
  - Her kategori için ayrı `DndContext` + `SortableContext` — kategori içi sıralama
  - Optimistic update: sürükleme sonucu anında yansır, arka planda API'ye kaydedilir
  - `/api/admin/reorder` POST endpoint'i ile `feature` tipi sıralama

### Kategori Yönetimi
- [x] **L5. Kategori sıralama modalı + kategori oluşturma**
  - Features sayfasına "Kategorileri Sırala" ve "Yeni Kategori" butonları eklendi
  - **Kategori Sıralama Modalı**: AnimatePresence backdrop, drag-to-reorder `SortableCategoryRow`
    - Kaydet/İptal butonları, sürükleyerek sıra değiştirme
    - API'ye `type: "category"` ile toplu sıralama kaydı
  - **Yeni Kategori Modalı**: slug (auto-lowercase), EN isim, TR isim inputları
    - Otomatik sıra ataması (listenin sonuna)
    - Loading state, validation (slug + EN isim zorunlu)
  - Ana liste: Özellikler kategorilere göre gruplandı, her kategori başlık + özellik sayısı gösteriyor
  - Boş kategoriler de listede görünür ("Bu kategoride özellik yok")

- [x] **L6. Yeni özellik eklerken kategori + sıra seçimi**
  - Inline FeatureEditor'da zaten kategori seçici (`AdminSelect`) ve sıra input'u mevcut
  - Kategori değişikliği slug editor'da da destekleniyor

### Script Ayarları İyileştirmeleri
- [x] **L7. Sıra değişikliğinde kaydet/iptal + tüm preview düzenlenebilir + ESC çıkış**
  - `originalKeyOrder` state eklendi — sıra değişiklikleri de `hasChanges`'e dahil
  - `hasChanges` artık hem labels hem keyOrder karşılaştırıyor
  - Kaydet sonrası `originalKeyOrder` senkronize, İptal'de geri alınıyor
  - Key input'ta ESC: orijinal değeri geri yükleyip blur (düzenlemeyi iptal)
  - Value textarea'da ESC: blur ile düzenlemeden çıkış
  - Preview'e eksik satırlar eklendi: `adminError`, `adminHint`, `restoreFail`
  - Tüm LABEL_DESCRIPTIONS key'leri artık preview'de düzenlenebilir
  - Liste ve preview arasında senkronizasyon: aynı key'i düzenlemek her iki tarafta da günceller

---

## K. Animasyon Düzeltmeleri, UI İyileştirmeleri & Script Ayarları Geliştirmeleri

### Bakım Ekranı
- [x] **K1. Bakım ekranı fade titremesi düzelt**
  - Framer Motion `AnimatePresence mode="wait"` yerine basit `AnimatePresence` kullanıldı
  - Ana site wrapper CSS `animate-fade-in-up` ile değiştirildi (Framer re-render flicker yok)

- [x] **K2. Bakım yazıları 3→2 satıra düşürüldü**
  - `desc3` kaldırıldı, `desc1` ve `desc2` birleştirilerek aynı anlam korundu
  - Tüm 7 dilde güncellendi

- [x] **K3. Bakım sayfasına eksik diller eklendi**
  - ZH (中文 🇨🇳 UTC+8) ve HI (हिन्दी 🇮🇳 UTC+5.5) eklendi
  - Ana sitedeki tüm diller artık bakım ekranında da mevcut

### Özellik Düzenleme Sayfası
- [x] **K4. Fade animasyon titremesi düzeltildi**
  - PublicShell: CSS transition'a geçildi (Framer Motion kaldırıldı)
  - Features tablo satırları: `initial={false}` ile re-render titremesi engellendi

- [x] **K5. Sil/İptal/Kaydet buton yerleri değiştirildi**
  - İptal ve Kaydet butonları sola taşındı (animasyon `x: -8` yönüne güncellendi)
  - Sil butonu en sağa taşındı
  - Hem slug editor hem inline editor'da uygulandı

- [x] **K6. Otomatik buton toggle oldu**
  - Tıklanınca tüm dillere script mesajı oluşturur (ON)
  - Tekrar tıklanınca tüm dillerdeki mesajları temizler (OFF)
  - Seçili durumda check ikonu gösterir

- [x] **K7. Risksiz seçiliyken risk seviyesi gizlenir**
  - `AnimatePresence initial={false}` ile animasyonlu açılıp kapanır
  - `noRisk=true` iken Risk Seviyesi alanı slide-up ile kaybolur
  - Hem slug editor hem inline editor'da uygulandı

- [x] **K8. Yeni Badge alanı animasyonlu açılıp kapanır**
  - `AnimatePresence` ile `height: 0 → auto` + opacity animasyonu
  - Hem slug editor hem inline editor'da uygulandı

### Script Ayarları Sayfası
- [x] **K9. Anahtar adları düzenlenebilir**
  - Sol listede key name input'a dönüştürüldü (onBlur ile rename)
  - `handleRenameKey` — tüm dillerde + keyOrder'da key adını günceller
  - Enter ile blur, Escape ile iptal

- [x] **K10. Yeni etiket ekleme iyileştirmeleri**
  - `AnimatePresence` ile animasyonlu satır açılıp kapanır
  - Çarpı (X) butonu ile eklemeyi iptal etme
  - Order input genişletildi (w-8 → w-10), arka plan + border eklendi
  - Anahtar ve değer inputlarına placeholder + arka plan + border eklendi

- [x] **K11. developerName ve websiteUrl düzenlenebilir**
  - Preview'de ayrı `→` satırları olarak gösteriliyor
  - Sol listede de düzenlenebilir (zaten LABEL_DESCRIPTIONS'ta var)

- [x] **K12. Sidebar unsaved changes modal doğrulandı**
  - ESC = sayfada kal (onClose)
  - "Kaydet ve Çık" = kaydet + hedefe git
  - "Kaydetmeden Çık" = değişiklikleri geri al + hedefe git
  - "İptal" = sayfada kal

---

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
