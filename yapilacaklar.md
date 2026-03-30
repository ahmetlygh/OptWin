## Faz 8: Mimari Denetim ve Yapilacaklar

Tarih: 2026-03-30
Dosya: `src/app/admin/(dashboard)/languages/[code]/page.tsx`
Toplam Satir: ~944

---

### Tamamlanan Kritik Duzeltmeler (Bu Oturum)

- [x] **ESC Revert Hatasi**: JSON moduna girerken `snapshotTr`, `snapshotSeo`, `snapshotPt`, `snapshotLang` ref'leri ile anlık kopya alınıyor. ESC basılınca bu kopyalar geri yukleniyor, JSON'daki tum degisiklikler siliniyor.
- [x] **Bos Ekran (Blank UI) Hatasi**: `AnimatePresence mode="wait"` -> `mode="popLayout"` degistirildi. Eski mod, cikis animasyonu tamamlanana kadar yeni DOM'u blokluyordu ve `parentRef` hicbir zaman gecerli bir scroll containerina baglı kalmiyordu. `popLayout` gecici olarak eski DOM'u layout'tan cikarir, yeni DOM aninda monte olur.
- [x] **_config Blogu Her Zaman Mevcut**: `constructVirtualJson` artik filtre/arama durumundan bagimsiz olarak `_config` bloğunu JSON'un en altına yazar. Cift yonlu senkron garanti altında.
- [x] **Keyboard Ikonu Kalıntısı**: `<Keyboard />` bileşeni ve importu tamamen cikarildi. Gorunur kısayol ipuclari yok.
- [x] **Cift useEffect Birlestirildi**: Ayni isi yapan iki `useEffect` (satir 359-367 ve 371-379) tek bir konsolide useEffect'e indirildi. Race condition kaynagi ortadan kaldirildi.

---

### Mimari Denetim Bulgulari (Oncelik Sirasina Gore)

#### YUKSEK ONCELIK

- [ ] **P1: `any` Tip Kirliligi**
    - `seoMetadata` state'i `useState<any>({})` olarak tanimli (satir 180).
    - `origSeoMeta` ayni sekilde `any` (satir 181).
    - `snapshotSeo` ref'i `useRef<any>({})`.
    - `constructVirtualJson` parametreleri `(ui: any, seo: any, pt: any, ...)` seklinde.
    - `deconstructVirtualJson` icindeki `parsed`, `ui`, `seoPartial`, `ptPartial`, `meta` degiskenleri hepsi `any`.
    - **Cozum**: `SeoMetadata` interface'i tanimlanip tum bu alanlara uygulanmali. Bu, runtime'da sessizce kaybolan alanlari derleme zamaninda yakalamamizi saglar.

- [ ] **P2: `deconstructVirtualJson` Merge Stratejisi Hatalı**
    - `setTranslations` icinde sadece `Object.keys(ui).forEach(k => next[k] = ui[k])` yapiliyor. JSON'dan bir key silinirse (kullanici kazara temizlerse), eski deger korunuyor cunku sadece "additive merge" yapiliyor.
    - **Cozum**: JSON'dan gelen `ui` objesi tam kaynak olarak kabul edilmeli. `setTranslations(() => ui)` seklinde tam replacement yapilmali, ancak bu durumda JSON'da gorulmeyen (filtreli) key'lerin kaybolmamasi icin filtre durumu kontrol edilmeli.

- [ ] **P3: SmartJsonEditor Performans Sorunu**
    - `SmartJsonEditor` icerisindeki `onUpdate` her bir karakter girisinde `JSON.parse(jsonContent)` + `JSON.stringify(parsed, null, 4)` + `deconstructVirtualJson(nextJson)` calistiriyor. 500+ key iceren bir dilde her tuş vuruşunda tum JSON yeniden parse edilip serialize ediliyor.
    - **Cozum**: `onUpdate` icinde dirty flag kullanilmali, debounce (150ms) eklenmeli. Veya `SmartJsonEditor` kendi local state'ini tutmali ve sadece blur/commit aninda parent'a gondermeli.

#### ORTA ONCELIK

- [ ] **P4: Virtualizer `parentRef` Yetim Kalma Riski**
    - `useVirtualizer` bilesenin ust seviyesinde tanimli ama `parentRef` sadece UI modunda DOM'a baglanıyor. JSON modundayken `parentRef.current === null` ve virtualizer bosuna hesaplama yapmaya devam ediyor.
    - **Cozum**: `useVirtualizer` cagrisini `isJsonMode === false` kosuluna baglamak veya `enabled` parametresi eklemek.

- [ ] **P5: `handleSave` Dependency Array Sizmasi**
    - `handleSave`'in bagimlilik dizisinde `router` var ama `handleSave` icinde `router` kullanilmiyor (sadece `history.pushState` kullaniliyor). Bu gereksiz yeniden olusturma tetikliyor.
    - **Cozum**: `router` bagimliligini kaldirmak.

- [ ] **P6: Sidebar State Carpmasi**
    - `setSeoMetadata({ ...seoMetadata, [field]: e.target.value })` (satir ~854) seklinde spread yapiliyor. Eger React state batching sirasinda iki ardisik alan degistirilirse, ikincisi birincinin degisikligini goremez (stale closure).
    - **Cozum**: `setSeoMetadata(prev => ({ ...prev, [field]: e.target.value }))` fonksiyonel guncelleme kullanilmali.

- [ ] **P7: JSON Export Eksik _config Verisi**
    - Disa aktarma butonu `jsonContent`'i oldugu gibi yazdirir. `_config` blogu artik her zaman dahil oldugu icin, disari aktarilan dosya icerisinde `_config` gibi dahili meta verisi de yer aliyor. Import eden sistem bunu beklemeyebilir.
    - **Cozum**: Export sirasinda `_config` key'ini cikararak temiz bir JSON olusturmak.

- [ ] **P8: Import Sonrasi `originalTranslations` Guncellenmemesi**
    - `handleImport` fonksiyonu `deconstructVirtualJson` cagiriyor ama `originalTranslations`'i guncellemiyor. Bu, import edilen dosya kaydedilmeden sayfa kapatilirsa "kaydedilmemis degisiklikler" uyarisini dogru tetikler, ancak "Iptal" butonuna basilinca import edilen verinin tamamen silinmesine neden olur.
    - **Cozum**: Kullaniciya import sonrasi otomatik kaydetme veya onay sorulmali.

#### DUSUK ONCELIK

- [ ] **P9: `forwardRef` Naming Catismasi**
    - `TranslationRow` bileseninde `forwardRef` adinda bir prop kullaniliyor. Bu, React'in `React.forwardRef` API'siyle isim catismasi yaratabilir ve gelecekte hata ayiklamayi zorlastirir.
    - **Cozum**: Prop adini `inputRef` olarak degistirmek.

- [ ] **P10: scrollIntoView Gereksiz Tetiklenmesi**
    - `TranslationRow` icindeki `input` ve `textarea` elementlerinde `onFocus` handler'i `scrollIntoView` cagiriyor. Virtualizer zaten scrollToIndex ile bu isi yapiyor. Bu cift scroll tetiklemesi "titreme" etkisi yaratabilir.
    - **Cozum**: `scrollIntoView`'i kaldirup sadece virtualizer'in `scrollToIndex`'ine guvenilmeli.

- [ ] **P11: `handleMakeDefault` Yetersiz State Guncelleme**
    - Varsayilan dil degistirildiginde `defaultLang` state'i guncellenmiyor. Header'daki referans dil bilgisi bozuk kalabilir.
    - **Cozum**: Basarili API cagrisindan sonra `setDefaultLang(...)` ile guncellemek.

- [ ] **P12: Dosya Boyutu ve Sorumluluk Ayırımı**
    - Tek dosya 944 satir, 62KB. SmartJsonEditor, TranslationRow, SeoPreview, SidebarSection, RippleToggle gibi bagimsiz bilesenler ayni dosyada tanimli.
    - **Cozum**: Her birini `@/components/admin/languages/` altina ayri dosyalara tasimak.

---

### Tamamlananlar (Arsiv)

- [x] Temel UI/UX Modernizasyonu (Glassmorphism, Neon Aksanlar).
- [x] Sıkı Turkce Tipografi Denetimi.
- [x] Sidebar Yapilandirmasi (Dil Durumu, Ilerleme onceliklendirme).
- [x] Toggle Tasarim Uyumu.
- [x] Duzenleme Modali (UTC Offset butonu, Buyuk boyut).
- [x] Dinamik Sayfa Basliklari.
- [x] Varsayilan Dil Degisim Onay Ekrani.
- [x] Ice/Disa Aktarma Butonlari.
- [x] JSON Syntax Highlighting (Arama vurgulu).
- [x] Akilli "Sonraki Eksik" Navigasyonu (Sidebarlari otomatik acan).
- [x] Global Kisayollar (Ctrl+F, Ctrl+S).
- [x] Tablo Yuksekligi ve Kaydirma sinirlandirmalari.
- [x] Performans Optimizasyonu (Virtualization iyilestirmeleri).
- [x] Ilerleme Sayaci ve Mantik Hatasi (Sayim metinleri duzeltildi).
- [x] Dinamik UI Elementleri (Tamamlanana gore buton gizleme).
- [x] Header Temizligi (Varsayilan rozeti ve Duzenle butonu kaldirildi).
- [x] ESC Revert Mekanizmasi (Snapshot tabanli geri alma).
- [x] Blank Screen Fix (AnimatePresence mode degisikligi).
- [x] _config Blogu Garanti (Her zaman JSON'da mevcut).
- [x] Keyboard Ikonu Kalintisi Temizlendi.
- [x] Cift useEffect Race Condition Giderildi.

---
*Bu dosya her mimari denetim sonrasinda guncellenecektir.*
