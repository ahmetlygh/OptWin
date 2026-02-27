# AGENTS.md — OptWin v1.3 Project Reference

> This document is the single source of truth for any AI agent, developer, or contributor working on OptWin.
> Read this file **first** before touching any code. Keep it updated as the project evolves.

---

## 🧠 What is OptWin?

**OptWin** is a free, open-source, browser-based Windows optimization tool hosted at [optwin.tech](https://optwin.tech).
Users select from 62+ optimization options across 7 categories and instantly generate a self-elevating **PowerShell (`.ps1`) script** tailored to their choices.

- No installation required
- No backend required for core functionality
- Bilingual: English 🇬🇧 & Turkish 🇹🇷
- Transparent: Every command is open source and reviewable

---

## 🏗️ Target Architecture — v1.3

The project is being migrated from a static Vanilla JS site to a full-stack modern web application.

### Chosen Stack

| Layer | Technology | Reason |
|---|---|---|
| **Framework** | Next.js 15 (App Router) + React 19 | SSG for public pages, SSR for admin, file-based routing |
| **Language** | TypeScript (strict mode) | Type safety across features, commands, translations |
| **Styling** | Tailwind CSS v4 + CSS Variables | Utility-first, tiny bundle, custom design tokens |
| **Animations** | Framer Motion | Smooth 60fps UI transitions matching current aesthetic |
| **State Management** | Zustand | Lightweight, perfect for selectedFeatures + lang + theme |
| **Auth** | NextAuth.js v5 (Google OAuth) | Admin-only Google Sign-In, no user accounts needed |
| **Database** | PostgreSQL (self-hosted via Coolify) | Stats, features, translations, messages, admin settings |
| **ORM** | Prisma | Type-safe DB queries, migrations, schema |
| **Deployment** | Coolify (self-hosted) | User's own server, Docker-based |
| **UI Components** | Radix UI + Shadcn/ui | Accessible, headless, fully styled |

---

## 📁 Project Structure (v1.3 Target)

```
optwin/
├── AGENTS.md                    ← You are here
├── PROGRESS.md                  ← Phase tracker
├── README.md                    ← Public-facing docs
│
├── old-optwin/                  ← Legacy v1.2 files (static site)
├── prisma/
│   ├── schema.prisma            ← DB schema: features, categories, stats, messages, settings
│   └── migrations/              ← Auto-generated migration files
│
├── src/
│   ├── app/                     ← Next.js App Router
│   │   ├── layout.tsx           ← Root layout (fonts, theme provider)
│   │   ├── page.tsx             ← Public homepage (SSG)
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts   ← NextAuth Google OAuth
│   │   │   ├── stats/route.ts               ← GET/POST visit & script stats
│   │   │   ├── features/route.ts            ← GET all features (public)
│   │   │   └── contact/route.ts             ← POST contact messages
│   │   └── admin/
│   │       ├── layout.tsx       ← Admin shell (auth guard, sidebar)
│   │       ├── page.tsx         ← Dashboard overview
│   │       ├── features/
│   │       │   ├── page.tsx     ← Feature list & management
│   │       │   └── [id]/page.tsx ← Edit single feature
│   │       ├── categories/page.tsx   ← Category CRUD
│   │       ├── translations/page.tsx ← Live translation editor (EN/TR + future)
│   │       ├── messages/page.tsx     ← Contact form inbox
│   │       ├── stats/page.tsx        ← Detailed site analytics
│   │       ├── settings/page.tsx     ← Site-wide settings (maintenance mode, version, etc.)
│   │       └── appearance/page.tsx   ← Theme colors, hero text, homepage content
│   │
│   ├── components/
│   │   ├── ui/                  ← Shadcn/ui base components (button, modal, input, toast…)
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── MobileNav.tsx
│   │   ├── features/
│   │   │   ├── FeatureCard.tsx  ← Individual optimization card with checkbox
│   │   │   ├── FeatureGrid.tsx  ← Category section + grid
│   │   │   └── SearchBar.tsx
│   │   ├── script/
│   │   │   ├── ScriptOverlay.tsx        ← Preview + download panel
│   │   │   └── RestorePointModal.tsx
│   │   ├── admin/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── FeatureEditor.tsx
│   │   │   ├── CategoryEditor.tsx
│   │   │   ├── TranslationEditor.tsx
│   │   │   ├── MessagesInbox.tsx
│   │   │   ├── StatsPanel.tsx
│   │   │   └── SettingsPanel.tsx
│   │   └── shared/
│   │       ├── Toast.tsx
│   │       ├── ThemeToggle.tsx
│   │       └── LangSwitch.tsx
│   │
│   ├── lib/
│   │   ├── db.ts                ← Prisma client singleton
│   │   ├── auth.ts              ← NextAuth config, authorized admin emails list
│   │   ├── script-generator.ts ← Core PowerShell script builder (ported from script.js)
│   │   └── utils.ts             ← cn(), formatNumber(), etc.
│   │
│   ├── store/
│   │   └── useOptWinStore.ts    ← Zustand: selectedFeatures, lang, theme, dnsProvider
│   │
│   ├── types/
│   │   ├── feature.ts           ← Feature, Category, RiskLevel types
│   │   ├── translation.ts       ← Translation shape types
│   │   └── admin.ts             ← Admin-only types (Message, Setting, etc.)
│   │
│   └── i18n/
│       ├── en.ts                ← English translations (ported from config.js)
│       └── tr.ts                ← Turkish translations
│
├── public/
│   ├── assets/
│   │   ├── optwin.png
│   │   └── favicon.ico
│   └── og-image.png
│
├── .env.local                   ← LOCAL ONLY — never commit
├── .env.example                 ← Committed template
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🗄️ Database Schema (Prisma — PostgreSQL)

### Key Models

```
Feature          → id, categoryId, icon, risk, noRisk, order, enabled
Category         → id, slug, order, enabled
FeatureTranslation → featureId, lang, title, desc
CategoryTranslation → categoryId, lang, name
FeatureCommand   → featureId, lang, scriptContent, messageText
DnsProvider      → id, slug, primary, secondary, name, enabled
SiteStats        → id, totalVisits, totalScripts, updatedAt
ContactMessage   → id, name, email, subject, message, read, createdAt
SiteSetting      → key (unique), value, type, description
AdminUser        → email (unique), name, createdAt
```

> **Key rule:** Features, categories, and translations are **database-driven**.
> The admin panel is the single place to add/edit/remove anything. The public site reads from the DB at build/request time.

---

## 🔐 Authentication & Authorization

- **Google OAuth only** via NextAuth.js
- No user registration — admin access is controlled by `AdminUser` table
- Only emails in the `AdminUser` table can access `/admin/*`
- Auth guard in `src/app/admin/layout.tsx` — redirects unauthenticated users to `/`
- Session checked server-side via `getServerSession()` in all admin API routes

---

## ⚙️ Core Business Logic Rules

### Script Generator (`src/lib/script-generator.ts`)
- Accepts `selectedFeatureIds[]`, `lang`, `createRestorePoint`, `dnsProvider`
- Returns a UTF-8 PowerShell string
- Self-elevating: script requests UAC admin on launch
- Mutual exclusion: `highPerformance` and `ultimatePerformance` cannot coexist
- DNS placeholders: `{{PRIMARY_DNS}}` and `{{SECONDARY_DNS}}` are replaced at generation time

### Feature Risk System
- `LOW` → No risk badge shown (`noRisk: true`)
- `MEDIUM` → Yellow badge, no block
- `HIGH` → Red badge, shown in "Select All" warning toast
- Risk is stored per feature in DB and reflected in admin panel

### Preset System
- `recommended`: Only `noRisk: true` features
- `gamer`: Performance + network + visual (all `noRisk`)
- `all`: Everything (triggers warning toast)
- `reset`: Clear all

### Internationalization
- Languages: `en` (default), `tr`
- Language stored in `localStorage` and Zustand
- All UI strings are in `src/i18n/[lang].ts`
- All feature/category strings are in DB `FeatureTranslation` / `CategoryTranslation` tables
- Script messages (PowerShell output) are ASCII-only (Turkish accents stripped) for PowerShell compat

---

## 🛡️ Admin Panel Capabilities (God Mode)

The `/admin` section provides **complete control** over the entire site:

| Section | What you can do |
|---|---|
| **Dashboard** | Live stats, quick actions, site health |
| **Features** | Add, edit, delete, reorder, enable/disable features. Edit icon, risk, commands, all translations |
| **Categories** | Add, rename, reorder, enable/disable categories |
| **Translations** | Edit every string on the site in EN/TR side-by-side |
| **Messages** | Read/delete contact form submissions from users |
| **Stats** | Detailed visit & download graphs, reset counters |
| **Settings** | Maintenance mode on/off, site version, contact email, BMC URL, GitHub URL, etc. |
| **Appearance** | Hero title/desc, about section, support section content |

---

## 🚀 Deployment

- **Target platform:** Coolify (self-hosted Docker)
- **Dockerfile:** Standard Next.js standalone output (`output: 'standalone'` in next.config.ts)
- **Environment variables required:**

```env
DATABASE_URL=postgresql://user:pass@host:5432/optwin
NEXTAUTH_SECRET=<random-secret>
NEXTAUTH_URL=https://optwin.tech
GOOGLE_CLIENT_ID=<from-google-console>
GOOGLE_CLIENT_SECRET=<from-google-console>
ADMIN_EMAILS=admin@example.com,other@example.com  # comma-separated
```

- **nixpacks.toml** remains for Coolify auto-detection if nixpacks is used instead of Docker

---

## 📏 Code Conventions

- **TypeScript strict mode** — no `any` without explicit comment
- **Server Components by default** — `'use client'` only when needed
- **Co-located types** — types live in `src/types/` or next to their component
- **Zustand store** — only client-side UI state (selections, lang, theme)
- **Server-side data fetching** — all DB calls happen in Server Components or API Routes
- **Prisma** — never import in Client Components. Use API routes for mutations.
- **Tailwind** — use CSS variables for design tokens, Tailwind for layout utilities
- **File naming** — PascalCase for components, camelCase for utils/hooks, kebab-case for routes

---

## 🔑 Key Files Quick Reference

| File | Purpose |
|---|---|
| `prisma/schema.prisma` | Single source of truth for all data shapes |
| `src/lib/auth.ts` | NextAuth config + admin email whitelist |
| `src/lib/script-generator.ts` | PowerShell script builder (core feature) |
| `src/store/useOptWinStore.ts` | All client-side UI state |
| `src/app/api/stats/route.ts` | Visit & script download counter |
| `src/app/admin/layout.tsx` | Auth guard for all admin pages |
| `src/app/admin/features/page.tsx` | Feature CRUD (most complex admin page) |
| `src/i18n/en.ts` + `tr.ts` | All static UI strings |
| `.env.example` | Template for environment variables |
| `PROGRESS.md` | Phase-by-phase implementation tracker |

---

## 🌐 Public Pages

| Route | Description |
|---|---|
| `/` | Main optimization tool (homepage) |
| `/#about` | About + values + donation section |
| `/contact` | Contact form (sends to DB → admin inbox) |

---

## ⚠️ Important Notes for Agents

1. **Never modify `prisma/schema.prisma` without running `npx prisma migrate dev`.**
2. **Never expose admin routes without auth check** — all `/admin/*` pages must verify session.
3. **PowerShell script content must remain ASCII-safe** — no Unicode/Turkish chars in PS messages.
4. **The `selectedFeatures` Set in Zustand is the source of truth** for what goes into the generated script.
5. **Maintenance mode** is a `SiteSetting` key. When enabled, the public site shows a maintenance page and all API routes return 503.
6. **Stats are eventually consistent** — use a simple increment-on-visit pattern, not real-time events.
7. **Contact form messages** must never be auto-deleted. Only soft-delete (mark as deleted) or admin explicitly deletes.
