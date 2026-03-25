# Admin-to-Public Sync Audit Raporu

## Tespit Edilen Kritik Sorunlar ve Cozumleri

---

### 1. Admin Settings PUT - Redis Cache Invalidation Eksikligi (KRITIK)
**Dosya:** [src/app/api/admin/settings/route.ts](file:///c:/Users/ahmet/Desktop/OptWin/src/app/api/admin/settings/route.ts)

**Sorunun Kaynagi:** Admin panelinden ayarlar kaydedildiginde (`PUT /api/admin/settings`), sistem ham Prisma `upsert()` cagrilariyla veritabanina yaziyordu ancak Redis cache'ini **hicbir zaman** temizlemiyordu. Public site [getSettings()](file:///c:/Users/ahmet/Desktop/OptWin/src/lib/settingsService.ts#52-121) araciligiyla Redis'ten okudugu icin, 24 saatlik TTL sureleri dolmadan eski (stale) veriler gosterilmeye devam ediyordu.

**Cozum:** Raw Prisma upsert dongusu kaldirildi. Yerine `settingsService.updateSettings()` metodu kullanildi. Bu metot:
1. Veritabanina atomik `$transaction` ile yazar
2. Ardindan tum ilgili Redis key'lerini `redisCache.del([...keys])` ile aninda siler
3. Bir sonraki okumada otomatik olarak DB'den taze veri cekilip Redis'e yazilir (cache-aside pattern)

---

### 2. Script Labels PUT - Redis Cache Invalidation Eksikligi
**Dosya:** [src/app/api/admin/script-labels/route.ts](file:///c:/Users/ahmet/Desktop/OptWin/src/app/api/admin/script-labels/route.ts)

**Sorunun Kaynagi:** `script_extra_lines`, `script_line_overrides`, `script_deleted_preview_lines` key'leri ham Prisma upsert ile yaziliyordu ama Redis cache temizlenmiyordu.

**Cozum:** `redisCache.del()` cagrilari eklendi. Her basarili yazma isleminden sonra ilgili `optwin:setting:*` key'leri Redis'ten siliniyor.

---

### 3. Admin Maintenance GET - Ham Prisma Okumasi
**Dosya:** [src/app/api/admin/maintenance/route.ts](file:///c:/Users/ahmet/Desktop/OptWin/src/app/api/admin/maintenance/route.ts)

**Sorunun Kaynagi:** Admin paneli maintenance durumunu dogrudan Prisma `findMany` ile okuyordu. Bu, public endpoint (Redis uzerinden okuyan) ile tutarsizlik yaratiyordu.

**Cozum:** `settingsService.getSettings()` ile degistirildi (Redis -> DB fallback pattern'i). Artik admin ve public endpointler ayni veri kaynagindan okuyor.

---

### 4. [object Object] Render Hatasi
**Dosya:** [src/components/layout/MaintenanceOverlay.tsx](file:///c:/Users/ahmet/Desktop/OptWin/src/components/layout/MaintenanceOverlay.tsx)

**Sorunun Kaynagi:** `reason` prop'u `string` tipinde tanimlanmisti, ancak bazi kosullarda React tarafindan zaten parse edilmis bir JavaScript objesi (`Record<string, string>`) olarak geliyor olabilir. Bu durumda `{reason}` dogrudan JSX icerisinde render edilmeye calisildiginda `[object Object]` gosteriyordu.

**Cozum:** Component basinda bir `safeReason` normalizasyon katmani eklendi:
- `reason` null/undefined ise: bos string
- `reason` obje ise: `JSON.stringify()` ile stringe cevirilir
- `reason` zaten string ise: oldugu gibi kullanilir
Tum render bloklari `safeReason` kullaniyor.

---

### 5. URL/State Senkronizasyon Uyumsuzlugu (FOUC)
**Dosya:** [src/components/providers/ClientProviders.tsx](file:///c:/Users/ahmet/Desktop/OptWin/src/components/providers/ClientProviders.tsx)

**Sorunun Kaynagi:** Kullanici `/tr/privacy` adresine gittiginde, Zustand store hala localStorage'dan okunan eski dil tercihini ([en](file:///c:/Users/ahmet/Desktop/OptWin/src/proxy.ts#36-41)) kullaniyordu. Bu, UI'in yanlis dilde render edilmesine ve FOUC'a neden oluyordu.

**Cozum:** `useEffect` ile URL segment'inden dil algilama eklendi. URL segmenti (`/tr/`, `/en/`, vb.) her zaman `source of truth` olarak kabul edilir. Zugand state ve NEXT_LOCALE cookie'si URL'ye gore senkronize edilir.

---

### 6. Proxy Maintenance HTML - Cookie Tabanli Dil Algilama
**Dosya:** [src/proxy.ts](file:///c:/Users/ahmet/Desktop/OptWin/src/proxy.ts) (buildMaintenanceHtml fonksiyonu)

**Sorunun Kaynagi:** Statik maintenance HTML'i dil icin sadece `localStorage.getItem('optwin-lang')` kullaniyordu. `NEXT_LOCALE` cookie'sini okumuyordu.

**Cozum:** Dil algilama onceligi guncellendi:
1. `NEXT_LOCALE` cookie (kullanicinin acik tercihi)
2. `localStorage` fallback
3. `navigator.language` fallback
4. `'en'` varsayilan

Dil degistirildiginde de artik `document.cookie` yaziyor.

---

### 7. Root Layout Eksikligi
**Dosya:** [src/app/layout.tsx](file:///c:/Users/ahmet/Desktop/OptWin/src/app/layout.tsx)

**Sorunun Kaynagi:** Ana layout `[locale]/layout.tsx` altina tasindiktan sonra, Next.js'in zorunlu kildigi kok [layout.tsx](file:///c:/Users/ahmet/Desktop/OptWin/src/app/layout.tsx) dosyasi eksik kalmisti.

**Cozum:** Minimal bir pass-through root layout olusturuldu. Gercek HTML/body yapisi `[locale]/layout.tsx` ve [admin/layout.tsx](file:///c:/Users/ahmet/Desktop/OptWin/src/app/admin/layout.tsx) tarafindan yonetilir.

---

### 8. Contact Sayfasi Konum Hatasi
**Dosya:** `src/app/contact/` -> `src/app/[locale]/contact/`

**Sorunun Kaynagi:** Contact sayfasi `[locale]` dizinine tasinmamisti. Bu, locale redirect dongusuyle 404 veya sonsuz yonlendirmeye neden olabilirdi.

**Cozum:** `src/app/[locale]/contact/` altina tasindi.

---

## Duzeltilen Dosya Listesi

| Dosya | Degisiklik |
|---|---|
| `src/app/api/admin/settings/route.ts` | settingsService.updateSettings ile Redis invalidation |
| `src/app/api/admin/maintenance/route.ts` | GET: settingsService, prisma import kaldirildi |  
| `src/app/api/admin/script-labels/route.ts` | redisCache.del eklendi |
| `src/components/layout/MaintenanceOverlay.tsx` | safeReason normalizasyonu |
| `src/components/providers/ClientProviders.tsx` | URL-State senkronizasyonu |
| `src/proxy.ts` | Cookie-tabanli dil algilama |
| `src/app/layout.tsx` | Root layout olusturuldu |
| `src/app/[locale]/contact/` | Dizin tasidi |
