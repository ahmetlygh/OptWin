# AGENTS.md — OptWin v1.3 Proje Referansı

> Bu belge projedeki **gerçek mevcut durumu** yansıtır.
> Herhangi bir AI agent, geliştirici veya katkıda bulunan bu dosyayı okuyarak başlamalıdır.
> Son güncelleme: 22 Mart 2026

---

## 🧠 OptWin Nedir?

**OptWin** ücretsiz, açık kaynak, tarayıcı tabanlı bir Windows optimizasyon aracıdır.
Kullanıcılar 7 kategorideki 62+ optimizasyon seçeneği arasından tercihlerini yapar ve özelleştirilmiş bir **PowerShell (.bat wrapper + gömülü .ps1)** scripti oluşturur.

- Kurulum gerektirmez
- Çok dilli: EN, TR, DE, FR, ES, ZH, HI
- Her komut açık kaynak ve incelenebilir
- Canlı site: [optwin.tech](https://optwin.tech)

---

## 🏗️ Mevcut Teknoloji Stack'i

| Katman | Teknoloji | Sürüm |
|---|---|---|
| Framework | Next.js (App Router) | 16.1.6 |
| UI | React | 19.2.3 |
| Dil | TypeScript (strict) | ^5 |
| Styling | Tailwind CSS v4 + CSS Variables | ^4 |
| Animasyon | Framer Motion | ^12.34.3 |
| State | Zustand (persist) | ^5.0.11 |
| Auth | NextAuth.js v5 beta (Google OAuth) | ^5.0.0-beta.30 |
| ORM | Prisma | ^6.4.1 |
| DB | PostgreSQL (Coolify üzerinde Docker) | — |
| Validasyon | Zod (kısmen kullanılıyor) | ^4.3.6 |
| Resim İşleme | Sharp | ^0.34.5 |
| UI Bileşenleri | Radix UI (dialog, dropdown, switch, toast, tooltip) | — |
| DnD | @dnd-kit/core + @dnd-kit/sortable | ^6/^10 |
| Deploy | Coolify (self-hosted, standalone output) | — |
| Test | Vitest | ^4.1.0 |

---

## 📁 Gerçek Proje Yapısı

```
optwin/
├── AGENTS.md                    ← Bu dosya
├── prisma/
│   ├── schema.prisma            ← 15 model, 1 enum (RiskLevel)
│   ├── migrations/              ← Migration dosyaları
│   ├── seed.ts                  ← Ana seed scripti
│   └── seed-data/               ← Kategori, feature, ayar seed verileri
│
├── src/
│   ├── proxy.ts                 ← Next.js 16 proxy (rate limiting + CORS + bakım modu)
│   ├── app/
│   │   ├── layout.tsx           ← Root layout (Inter font, theme provider, PublicShell)
│   │   ├── page.tsx             ← Ana sayfa (SSR: preset, DNS, features sorguları)
│   │   ├── globals.css          ← CSS Variables + animasyonlar (~544 satır)
│   │   ├── error.tsx            ← Error boundary
│   │   ├── global-error.tsx     ← Global error boundary
│   │   ├── loading.tsx          ← Loading state
│   │   ├── robots.ts            ← Dinamik robots.txt
│   │   ├── sitemap.ts           ← Dinamik sitemap.xml
│   │   ├── contact/page.tsx     ← İletişim formu (client component)
│   │   ├── privacy/page.tsx     ← Gizlilik politikası (7 dil, hardcoded)
│   │   ├── terms/page.tsx       ← Kullanım koşulları (hardcoded)
│   │   ├── maintenance/page.tsx ← Bakım modu yönlendirme
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts  ← NextAuth handler
│   │   │   ├── features/route.ts            ← GET: public feature listesi
│   │   │   ├── features/[id]/route.ts       ← GET: tek feature (slug veya id)
│   │   │   ├── generate-script/route.ts     ← POST: script oluşturma (Zod validasyonlu)
│   │   │   ├── stats/route.ts               ← GET/POST: ziyaret/script/indirme sayaçları
│   │   │   ├── contact/route.ts             ← POST: iletişim formu (Zod + DB rate limit)
│   │   │   ├── maintenance/route.ts         ← GET: public bakım modu durumu
│   │   │   ├── system/status/route.ts       ← GET: public sistem durumu
│   │   │   └── admin/                       ← Admin API'leri (auth korumalı, Zod validasyonlu)
│   │   │       ├── categories/route.ts      ← CRUD: kategoriler
│   │   │       ├── dashboard/route.ts       ← GET: dashboard istatistikleri
│   │   │       ├── dns/route.ts             ← CRUD: DNS sağlayıcıları
│   │   │       ├── features/route.ts        ← CRUD + bulk move: özellikler
│   │   │       ├── maintenance/route.ts     ← GET/PUT: bakım modu (auth korumalı)
│   │   │       ├── reorder/route.ts         ← POST: sıralama değiştirme
│   │   │       ├── script-labels/route.ts   ← GET/PUT/DELETE: script etiketleri
│   │   │       ├── script-labels/reset/     ← POST: etiketleri varsayılana sıfırla
│   │   │       ├── translate/route.ts       ← POST: otomatik çeviri (Google + MyMemory)
│   │   │       ├── upload/route.ts          ← POST: ikon yükleme (Sharp + SVG sanitize)
│   │   │       └── fix-slugs/route.ts       ← POST: Türkçe slug düzeltme (tek seferlik)
│   │   └── admin/
│   │       ├── login/page.tsx               ← Admin giriş sayfası
│   │       ├── unauthorized/page.tsx        ← Yetkisiz erişim sayfası
│   │       └── (dashboard)/
│   │           ├── layout.tsx               ← Auth guard + sidebar + header
│   │           ├── page.tsx                 ← Dashboard ana sayfa
│   │           ├── features/page.tsx        ← Feature listesi
│   │           ├── features/edit/page.tsx   ← Feature düzenleme
│   │           ├── features/edit/[slug]/    ← Tek feature düzenleme
│   │           ├── categories/page.tsx      ← Kategori yönetimi
│   │           ├── dns/page.tsx             ← DNS sağlayıcı yönetimi
│   │           └── script-defaults/page.tsx ← Script etiket yönetimi
│   │
│   ├── components/
│   │   ├── admin/         ← Admin bileşenleri (AdminSidebar, AdminHeader, ConfirmModal, vs.)
│   │   ├── features/      ← FeatureCard, FeatureGrid (server), FeatureGridClient, SearchBar
│   │   ├── layout/        ← Header, Footer, Hero, HeroStats, HeroTitle, ActionArea,
│   │   │                     PublicShell, ScrollToTop, StickyControlsPanel,
│   │   │                     PresetControls, MaintenanceOverlay
│   │   ├── modals/        ← DnsModal, RestorePointModal, ScriptOverlay, SupportModal,
│   │   │                     Toast, WarningModal
│   │   ├── providers/     ← ClientProviders (tema, dil, hydration)
│   │   ├── sections/      ← AboutSection, StatsSection
│   │   └── shared/        ← CountUp, Flags (SVG), HashScroller, HighlightText, Icons,
│   │                         ScrollRestorer, TranslatableText
│   │
│   ├── lib/
│   │   ├── auth.ts              ← NextAuth yapılandırması (Google OAuth + admin whitelist)
│   │   ├── db.ts                ← Prisma client singleton
│   │   ├── admin-guard.ts       ← checkAdmin() + unauthorizedResponse()
│   │   ├── script-generator.ts  ← PowerShell script builder (batch wrapper + PS kodu)
│   │   ├── powershell-safe.ts   ← ASCII dönüşüm + PS string escaping
│   │   ├── maintenance.ts       ← Bakım modu kontrolü (unstable_cache)
│   │   ├── settings.ts          ← Site ayarları okuma (getSetting, getSettings)
│   │   └── utils.ts             ← cn(), formatNumber()
│   │
│   ├── hooks/
│   │   └── useModalPhase.ts     ← Modal açılış/kapanış animasyon hook'u
│   │
│   ├── store/
│   │   └── useOptWinStore.ts    ← Zustand: selectedFeatures, lang, theme, DNS, modals, toast
│   │
│   ├── types/
│   │   ├── feature.ts           ← Feature, Category, DnsProvider, Preset tip tanımları
│   │   ├── admin.ts             ← ContactMessage, SiteSetting, SettingKey, DashboardStats
│   │   └── next-auth.d.ts       ← NextAuth Session tipi genişletmesi (isAdmin)
│   │
│   └── i18n/
│       ├── index.ts             ← getTranslation(), t() fonksiyonları
│       ├── useTranslation.ts    ← React hook: { t, lang }
│       └── locales/             ← 7 dil dosyası: en, tr, de, fr, es, zh, hi
│
├── public/
│   ├── optwin.png, favicon.ico, background.png
│   └── uploads/                 ← Yüklenen ikonlar (WebP)
│
├── .env                         ← ⚠️ Gerçek secret'lar (rotate edilmeli!)
├── .env.example                 ← Sahte değerlerle örnek dosya
├── .gitignore
├── Dockerfile                   ← Next.js standalone build
├── docker-compose.yml           ← App + PostgreSQL
├── vitest.config.ts             ← Test yapılandırması
├── next.config.ts               ← standalone output, sharp resim, Google avatar pattern
├── tsconfig.json                ← strict mode, bundler moduleResolution
├── eslint.config.mjs            ← core-web-vitals + typescript preset
├── postcss.config.mjs
├── .prettierrc
└── package.json                 ← v1.3.0
```

---

## 🗄️ Veritabanı Şeması (Prisma — PostgreSQL)

### Mevcut Modeller (15 model + 1 enum)

| Model | Açıklama |
|---|---|
| `AdminUser` | Admin e-posta whitelist (Google OAuth sonrası oluşturulur) |
| `Category` | Optimizasyon kategorileri (slug, icon, order, enabled) |
| `CategoryTranslation` | Kategori isimleri (categoryId + lang → name) |
| `Feature` | Optimizasyon özellikleri (slug, icon, risk, order, selectCount, newBadge) |
| `FeatureTranslation` | Feature başlık ve açıklamaları (featureId + lang → title, desc) |
| `FeatureCommand` | PowerShell komutları (featureId + lang → command, scriptMessage) |
| `DnsProvider` | DNS sağlayıcıları (slug, primary, secondary IP) |
| `Preset` | Ön tanımlı seçim kümeleri (recommended, gamer, all) |
| `PresetTranslation` | Preset isimleri (presetId + lang → name) |
| `SiteStats` | Global sayaçlar (totalVisits, totalScripts, totalDownloads) |
| `DailyStat` | Günlük istatistikler (date → visits, scripts, downloads) |
| `ContactMessage` | İletişim form mesajları (soft delete: deleted boolean) |
| `SiteSetting` | Key-value site ayarları (maintenanceMode, version, vs.) |
| `UiTranslation` | UI çeviri tablosu (key + lang → value) |
| `ScriptLabel` | Script içi etiketler (lang + key → value, 7 dil) |
| `VisitDedup` | Günlük benzersiz ziyaret kontrolü (ipHash + date) |

**Enum:** `RiskLevel` → `low`, `medium`, `high`

---

## 🔐 Kimlik Doğrulama & Yetkilendirme

- **Google OAuth** → NextAuth.js v5 beta
- Kullanıcı kaydı yok — sadece admin erişimi
- Admin kontrolü: `AdminUser` tablosu + `ADMIN_EMAILS` env değişkeni
- Auth guard: `src/lib/admin-guard.ts` → `checkAdmin()` her admin API route'unda çağrılır
- Admin layout: `src/app/admin/(dashboard)/layout.tsx` → SSR auth kontrolü + redirect
- Oturum: `session.isAdmin` boolean (next-auth.d.ts ile genişletilmiş)

---

## ⚙️ Script Generator Mantığı

**Dosya:** `src/lib/script-generator.ts`

### Akış:
1. `ScriptLabel` tablosundan dile göre etiketler çekilir
2. Etiketlerdeki `<referans>` placeholder'ları çözümlenir
3. Tüm etiketler `toPowerShellSafe()` ile ASCII'ye dönüştürülür
4. **Batch header** oluşturulur:
   - UAC yükseltme batch seviyesinde yapılır (PS'de değil)
   - `net session` ile admin kontrolü
   - Admin değilse `Start-Process -Verb RunAs` ile yeniden başlatma
   - Admin ise PS kodunu temp .ps1'e çıkarıp çalıştırma
5. **PowerShell kodu** oluşturulur:
   - Error trap
   - ASCII banner
   - Restore point (opsiyonel)
   - Her feature komutu try/catch içinde
   - DNS değişikliği (e ğer seçiliyse, `{{PRIMARY_DNS}}/{{SECONDARY_DNS}}` replace)
   - Tamamlanma özeti
   - ReadKey ile bekleme

### İş Kuralları:
- `highPerformance` ↔ `ultimatePerformance` karşılıklı dışlama (Zustand store'da)
- `changeDNS` seçildiğinde DNS modal otomatik açılır
- Script çıktısı `.bat` dosyası (batch + embedded PS)
- Tüm script mesajları ASCII-safe (Türkçe/aksanlı karakterler dönüştürülür)

---

## 🛡️ Admin Paneli — Mevcut Durum

| Sayfa | Durum | Açıklama |
|---|---|---|
| Dashboard | ✅ Mevcut | Ziyaret, script, mesaj istatistikleri |
| Features | ✅ Mevcut | CRUD + düzenleme + sıralama |
| Categories | 🔒 Disabled | CRUD + sıralama (sidebar'da tıklanamaz) |
| DNS | 🔒 Disabled | CRUD + sıralama (sidebar'da tıklanamaz) |
| Script Defaults | ✅ Mevcut | Script etiketleri düzenleme + sıfırlama |
| Translations | 🔒 Disabled | API mevcut ama admin sayfası yok |
| Messages | 🔒 Disabled | API mevcut ama admin sayfası yok |
| Announcements | 🔒 Disabled | Yeni — sidebar'da tab eklendi, sayfa yok (Faz 13) |
| Stats (detay) | 🔒 Disabled | Sadece dashboard'da özet var |
| Languages | 🔒 Disabled | Yeni — sidebar'da tab eklendi, sayfa yok (Faz 14) |
| Settings | 🔒 Disabled | API mevcut ama admin sayfası yok |
| Appearance | 🔒 Disabled | Henüz planlanmamış |

---

## 🌐 Public Sayfalar

| Route | Açıklama |
|---|---|
| `/` | Ana optimizasyon aracı (Hero + Preset + Features + Stats + About) |
| `/contact` | İletişim formu (Zod validasyonlu) |
| `/privacy` | Gizlilik politikası (7 dil, hardcoded) |
| `/terms` | Kullanım koşulları (hardcoded) |
| `/#about` | Hakkında bölümü (scroll anchor) |

---

## 📏 Kod Kuralları

- **TypeScript strict mode** — `any` kullanımı minimum (bazı admin API'lerde hâlâ var)
- **Server Components varsayılan** — `'use client'` yalnızca interaktif bileşenlerde
- **Zustand store** — client-side UI state (seçimler, dil, tema, modals)
- **Prisma** — yalnızca server tarafında (API routes + Server Components)
- **Tailwind CSS v4** — CSS Variables ile design tokens
- **PascalCase** bileşenler, **camelCase** utils/hooks, **kebab-case** route'lar

---

## 🚀 Deploy

- **Platform:** Coolify (self-hosted Docker)
- **Output:** `standalone` (next.config.ts)
- **Dockerfile:** ✅ Mevcut (Next.js standalone build)
- **docker-compose.yml:** ✅ Mevcut (App + PostgreSQL)
- **Gerekli env değişkenleri:**

```env
DATABASE_URL=postgresql://user:pass@host:5432/optwin
NEXTAUTH_SECRET=<random-secret>
NEXTAUTH_URL=https://optwin.tech
GOOGLE_CLIENT_ID=<google-console>
GOOGLE_CLIENT_SECRET=<google-console>
ADMIN_EMAILS=admin@example.com
```

---

## ⚠️ Bilinen Sorunlar & Teknik Borç

1. **`.env` dosyası gerçek secret'lar içeriyor** — rotasyon gerekli (henüz yapılmadı)
2. **7+ admin sayfası henüz oluşturulmamış** (messages, translations, settings, appearance, stats, announcements, languages)
3. **Privacy/Terms sayfaları hardcoded** — i18n veya DB'ye taşınmadı
4. **50+ hardcoded URL ve marka bilgisi** — merkezi yapılandırma sistemi bekleniyor
5. **Bakım sayfası çevirileri 2 yerde duplicate** — proxy.ts HTML + MaintenanceOverlay.tsx
6. **Script generator ve core modüller test kapsamı yetersiz** — sadece powershell-safe testleri var
7. **Admin panel sadece Türkçe** — çok dilli admin planlanmadı

> ~~Çözülen eski sorunlar:~~ Admin API'lerde `any` → Zod ile değiştirildi, modal çift render → düzeltildi, error boundary → eklendi, rate limiting → proxy.ts'e entegre edildi, SVG XSS → sanitization eklendi.

> Detaylı analiz için: `OptWin-Analyze.md`
> Görev listesi için: `OptWin-Phases.md`

---

## 🔑 Kritik Dosya Referansları

| Dosya | Amaç |
|---|---|
| `prisma/schema.prisma` | Tüm veri modellerinin kaynağı |
| `src/proxy.ts` | Next.js 16 proxy: rate limiting + CORS + bakım modu |
| `src/lib/auth.ts` | NextAuth + admin whitelist |
| `src/lib/script-generator.ts` | PowerShell script oluşturucu (en kritik iş mantığı) |
| `src/lib/powershell-safe.ts` | ASCII dönüşüm + PS escaping |
| `src/store/useOptWinStore.ts` | Tüm client-side UI state |
| `src/app/api/generate-script/route.ts` | Script API endpoint |
| `src/app/admin/(dashboard)/layout.tsx` | Admin auth guard |
| `src/components/admin/AdminSidebar.tsx` | Admin sidebar navigasyonu (12 menü öğesi) |
| `src/i18n/locales/en.ts` | İngilizce UI çevirileri (ana referans) |
