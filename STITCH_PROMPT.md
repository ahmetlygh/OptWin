# Google Stitch UI Redesign Prompt — OptWin v1.3

## Bu Dosya Hakkında
Bu dosya, OptWin v1.3 için Google Stitch'e verilecek tam ve detaylı UI tasarım promptunu içerir.
Google Stitch'i kullanarak mevcut OptWin arayüzünü Next.js + Tailwind CSS için yeniden tasarlayın.

---

## 🎨 GOOGLE STİTCH PROMPT (Aşağıdaki metni Stitch'e yapıştırın)

---

```
Design a modern, premium web application UI for "OptWin" — a free, open-source Windows optimization tool. The app lets users select from 62+ optimization features across 7 categories and generates a custom PowerShell script for their system.

## DESIGN SYSTEM

**Color Palette (Dark theme — primary):**
- Background: #0d0d12 (near-black, deep space)
- Card background: #1a1a24 (dark navy)
- Primary accent: #6c5ce7 (vivid purple)
- Secondary accent: #a29bfe (soft lavender)
- Text primary: #ffffff
- Text secondary: #a0a0b0
- Border: #2d2d3a
- Success: #00b894
- Warning: #f39c12
- Danger: #e84118
- Risk Low: #00b894 (green)
- Risk Medium: #f39c12 (amber)
- Risk High: #e84118 (red)

**Color Palette (Light theme — toggle):**
- Background: #f4f6f8
- Card background: #ffffff
- All accents identical
- Text primary: #2d3436
- Text secondary: #636e72
- Border: #dfe6e9

**Typography:**
- Font: Inter (Google Fonts) — weights 400, 500, 600, 700
- Logo/Title: 2rem, 700 weight, gradient text (#a29bfe → #6c5ce7)
- Hero title: 2.5rem, gradient text
- Category headers: 1.5rem, 600 weight
- Feature card title: 1.1rem, 600 weight
- Body/desc: 0.9rem, regular weight, secondary color
- Small labels: 0.75rem, 500 weight

**Spacing System:** 4px base unit. Cards: 1.5rem padding. Sections: 3rem gaps.
**Border Radius:** Cards 15px, buttons 10-12px, badges 20px (pill), checkboxes 6px.

---

## 📱 PAGES TO DESIGN

### Page 1: Homepage (Main Tool — Public)

**Header (sticky, glassmorphism):**
- Left: OptWin logo (PNG image) + "OptWin" gradient text (h1)
- Center: Nav links — "About" with info icon
- Right: GitHub link (GitHub icon + text), EN/TR language switcher, dark/light theme toggle button (moon/sun icon)
- Mobile: Replace right nav with hamburger menu (3 bars icon). Show on screens < 768px
- Background: rgba(13,13,18,0.95) with backdrop-filter blur. 1px bottom border.

**Mobile Slide-in Navigation Panel:**
- Slides in from right on hamburger tap
- Dark overlay backdrop
- Logo at top with X close button
- Navigation links: Home, About, GitHub
- Language switcher (EN / TR toggle)
- Theme toggle button
- Divider
- Mini stats: 🌐 [visit count] / ⬇ [download count]
- Divider
- "Support OptWin" heart button (primary purple, links to buymeacoffee)
- Footer: contact email, "Designed by ahmetly_", version badge

**Hero Section:**
- Full-width centered
- h2: "Optimize your Windows experience" — large gradient text (purple to lavender)
- Subtitle p: "Select the optimizations you need and generate a custom script instantly."
- Subtle animated gradient background glow (radial, purple tones)
- Bottom margin before preset buttons

**Preset Controls Bar:**
- 4 pill/rounded buttons in a flex-wrap row, centered:
  1. ⭐ "Recommended Settings" — filled gradient purple (primary CTA style)
  2. 🎮 "Gamer Mode" — filled gradient red→orange (#e84118 → #f39c12)
  3. ✓✓ "Select All" — outlined, ghost style
  4. ↺ "Reset" — outlined, ghost style
- All buttons: 0.75rem padding, font-awesome icons, rounded-lg, smooth hover (lift + glow)

**Smart Search Bar:**
- Full-width search input with magnifying glass icon on left
- Rounded pill shape (border-radius: 50px), border with accent color on focus
- Clear (X) button appears on right when text is typed
- Below: Selection counter badge — "✓ X features selected" (hidden when 0)

**Feature Categories & Cards:**
- 7 category sections displayed vertically
- Each section: Category title (h3, bold, left-aligned) above a responsive card grid
- Grid: `repeat(auto-fill, minmax(300px, 1fr))` — 3 columns on desktop, 2 on tablet, 1 on mobile
- **Feature Card design:**
  - Background: card-bg color
  - 2px border (default: border color, selected: accent purple)
  - 15px border-radius, 1.5rem padding
  - Layout: [icon column] [info column] [checkbox top-right]
  - Icon: 2rem Font Awesome icon in accent purple color, left side
  - Title: 1.1rem bold, primary text
  - Description: 0.9rem, secondary text, 1.5 line-height
  - Risk badge (BELOW description, pill shape): only shown for MEDIUM and HIGH risk
    - Medium: amber/yellow pill badge
    - High: red pill badge
    - Low: NO badge shown
  - Checkbox indicator: top-right corner, 24x24px square with 6px radius border
    - Default: empty with border-color border
    - Selected: filled solid accent purple with white ✓ checkmark
  - Hover: lift translateY(-5px), purple border, purple glow box-shadow
  - Selected state: purple border, subtle purple gradient background tint, purple glow
  - Reveal animation: subtle fadeInUp when scrolling into viewport (lazy load)

**DNS Settings Panel (hidden by default, slides open when "Change DNS" feature is selected):**
- Card panel with header: "DNS Configuration" title + "Download Ping Test" secondary button
- Grid of 5 radio options: Cloudflare, Google, OpenDNS, Quad9, AdGuard
- Each option: radio input + label, hover background highlight

**Action Area:**
- Large centered "⚡ Create Script" primary button
- When 0 features selected: grey/inactive state (still clickable, shows warning modal)
- When features selected: vivid purple gradient, glow shadow, lifts on hover
- Activation animation when switching from inactive to active state
- Below button: small secondary text "Feel free to email us for requests and suggestions."

**Toast Notification (bottom-right, overlay):**
- Warning icon + message text
- Slides up to appear, fades out after 4 seconds
- Used for "Select All" warning

**Statistics Section (floating, between main content and About):**
- 2 card widgets side-by-side, centered:
  - 🌐 [number] / "Site Visits"
  - ⬇ [number] / "Scripts Downloaded"
- Each card: card-bg, subtle border, hover lift animation

**About Section:**
- Title "About OptWin" + subtitle paragraph
- 3-column values grid (responsive, stacks on mobile):
  - 🛡️ Safe & Secure
  - 🔓 Open Source
  - 👁 Transparent
  - Each: icon (accent color), h4 title, paragraph
- Support/Donation card below (highlighted, hero-style):
  - Large ❤️ icon
  - Title: "Support OptWin Development"
  - Description text
  - 3 badge chips: "100% Free", "Open Source", "Secure"
  - Large CTA button: "☕ Buy Me a Coffee" (primary purple gradient)

**Footer:**
- 3-column grid layout (left: contact email link, center: copyright + credits, right: version badge)
- Subtle top border, semi-transparent background
- Version "v1.3" links to GitHub commits

**Script Ready Overlay (full-screen modal, appears after generating script):**
- Full-screen overlay takeover (dark backdrop)
- Header: "Script Preview" title + 2 badge chips ("Can be run multiple times" / "Ready for use")
- Script preview pane: monospace code block with "Copy" button top-right
- Instruction box below code: numbered steps (1, 2, 3) with icons
- Bottom action row: "⬇ Download Script" (primary) + "✕ Close" (secondary)

**Modals:**
- System Restore Point modal: title + description + "✓ Add" (primary) + "No, Skip" (secondary)
- Warning modal: warning icon (large, centered) + message text + X close
- Both: centered, dark card with blur backdrop, X button top-right

---

### Page 2: /contact — Contact Form Page

**Layout:** Full page with header + footer from main site.

**Form Card (centered, max-width 600px):**
- Title: "Contact Us" with envelope icon
- Subtitle: "Send us a message — it goes directly to our admin inbox."
- Fields: Name (text), Email (email), Subject (text), Message (textarea, 5 rows)
- All fields: dark card-bg, 2px border, accent focus ring, rounded-lg
- Submit button: "✉ Send Message" — primary purple gradient, full width
- Success state: replace form with ✅ success message
- Error state: red toast notification

---

### Page 3: /admin/login — Admin Login Page

**Layout:** Minimal, centered, no header/footer.

**Login Card (centered vertically and horizontally, max-width 400px):**
- OptWin logo at top
- "Admin Panel" title (gradient text)
- "Sign in with Google" button (white background, Google logo, dark text)
- Small note: "Access restricted to authorized administrators only."
- Version badge at bottom

---

### Page 4: /admin — Admin Dashboard

**Layout:**
- Left sidebar (fixed, 260px wide on desktop, collapsible to icon-only, drawer on mobile)
- Top header bar (account avatar, name, sign-out)
- Main content area (scrollable)

**Sidebar:**
- OptWin logo at top
- Navigation items with icons and labels:
  - 📊 Dashboard (active state: accent bg pill)
  - ⚙️ Features
  - 📁 Categories
  - 🌐 Translations
  - ✉️ Messages (shows unread count badge if > 0)
  - 📈 Stats
  - ⚙️ Settings
  - 🎨 Appearance
- Bottom: signed-in user avatar + name + sign-out icon button
- Sidebar background: slightly lighter than page bg (#141420)
- Active item: accent color background pill, accent text
- Hover: subtle accent tint

**Dashboard Content:**
- Greeting: "Good [morning/evening], [Name] 👋"
- 4 stat cards in a row: Total Visits, Scripts Generated, Unread Messages, Active Features
  - Each: icon, large number, label, subtle up/down trend indicator
- Quick Actions row: buttons for common tasks (Add Feature, View Messages, Toggle Maintenance)
- Recent Activity feed (latest messages, latest script downloads)
- System Status card: maintenance mode status, DB connection, last deploy time

**Features Admin Page:**
- Search bar + category filter dropdown + risk filter dropdown
- Feature list table or drag-sortable card grid
- Each row/card: icon, title, category chip, risk badge, enabled toggle switch, Edit/Delete buttons
- "Add Feature" button (top right, primary)
- Edit modal/drawer: all fields (id, icon picker, risk, noRisk, translations EN/TR, PS command, PS message EN/TR)

**Settings Page:**
- Grouped sections with cards:
  - General: site name, version, contact email, author
  - Links: GitHub URL, BMC URL
  - Appearance: default theme, default language
  - Maintenance: large toggle switch (red when ON), maintenance message editor
  - Danger Zone: clear stats, bulk delete messages

---

## ✨ DESIGN PRINCIPLES

1. **Premium Dark by default.** Every surface feels intentional. No flat greys — use subtle gradients and borders.
2. **Purple is the brand.** #6c5ce7 is THE color. Use it for interactive elements, active states, and key accents.
3. **Micro-animations everywhere:** hover lifts (+glow), button pulse on activate, cards reveal on scroll, smooth modal open/close, search highlight fade-in.
4. **Glassmorphism for header only.** Blur + semi-transparent bg. Not overused.
5. **Mobile first, but desktop showcase.** The feature grid should look impressive on a 1440px screen.
6. **Risk communication matters.** Medium and High risk badges must be visually clear but not alarming.
7. **The "Create Script" button is the climax.** It should feel like the most important button on the page.
8. **Admin panel is a professional tool.** Clean, data-dense, utilitarian but still on-brand.
9. **Generous whitespace.** 3rem between sections. 1.5rem between cards.
10. **Typography hierarchy is sacred.** h1 > h2 > h3 > h4 > p > small — never skip levels.

---

## 🔧 COMPONENT NOTES FOR NEXT.JS IMPLEMENTATION

- All public page Server Components (no 'use client')
- Feature cards, checkboxes, search, preset buttons → Client Component with Zustand
- Theme toggle → Client Component with localStorage
- Lang switch → Client Component with localStorage
- Admin pages → mixed server/client with NextAuth session
- Transitions: Framer Motion for overlay, modal, and panel open/close
- Icons: Font Awesome 6 via CDN (keep identical to v1.2 icon classes)
```

---

## 📋 Stitch'e Nasıl Kullanılır?

1. [Google Stitch](https://stitch.withgoogle.com)'i açın
2. Yukarıdaki prompt metnini olduğu gibi kopyalayın (``` işaretleri dahil değil, sadece içerik)
3. "New Design" → "From Prompt" seçeneğini kullanın
4. Her sayfa için ayrı ayrı çıktı alın
5. Çıkan tasarım kodlarını `src/app/page.tsx`, `src/app/admin/page.tsx` gibi dosyalara yapıştırın
6. Tailwind class'larını kendi design system token'larınıza uyarlayın

---

## 🔄 Hangi Tasarım Sayfalarını Lütfen Üretin

Stitch'e sırayla bu sayfaları ürettirin:
1. `homepage` — Ana iyileştirme aracı (en öncelikli)
2. `contact` — İletişim formu sayfası
3. `admin-login` — Admin giriş sayfası
4. `admin-dashboard` — Yönetim paneli ana ekranı
5. `admin-features` — Özellik listesi ve düzenleme
