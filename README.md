# OptWin

<div align="center">

<img src="public/optwin.png" alt="OptWin Logo" width="120" />

**Browser-based Windows optimization tool that generates customized PowerShell scripts.**

[![Site](https://img.shields.io/badge/Site-optwin.tech-6c5ce7?style=for-the-badge)](https://optwin.tech)
[![License](https://img.shields.io/badge/License-MIT-00b894?style=for-the-badge)](LICENSE)

<a href="https://www.buymeacoffee.com/ahmetly_" target="_blank">
  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-violet.png" alt="Buy Me A Coffee" height="50">
</a>

*Support the project -- every contribution helps keep OptWin free.*

</div>

---

## About

OptWin is a free, open-source Windows system optimizer. It runs entirely in the browser with no installation needed. Users pick from 60+ optimization options across 7 categories, and OptWin generates a tailored PowerShell script that applies only the selected changes.

Every generated command is transparent and reviewable. The tool supports 7 languages and works on any modern browser.

---

## How It Works

1. Open [optwin.tech](https://optwin.tech) in your browser
2. Browse categories and select the optimizations you need, or pick a preset
3. Click **Create Script** to generate a `.bat` file
4. Run the downloaded file as Administrator

The generated script handles UAC elevation automatically and creates a system restore point before making changes (if enabled).

---

## Features

| Category | Examples |
|---|---|
| System | Temp cleanup, power plans, prefetch, Game DVR, Superfetch |
| Network | DNS changer, flush DNS, Nagle algorithm, QoS, throttling |
| Services | Xbox, Fax, Maps, Wallet, Print Spooler |
| Privacy | Cortana, OneDrive, location tracking, telemetry |
| Visual | Animations, transparency, Windows tips |
| Maintenance | SFC scan, DISM repair, event log cleanup, cache |
| Extra | Mouse acceleration, Bing search, sticky keys |

---

## Safety

- Scripts optionally create a **system restore point** before making changes
- Every option shows a **risk indicator** (low, medium, high)
- All generated code is open source and fully reviewable
- No data is collected, no accounts required, nothing is installed

---

## Languages

:gb: English | :tr: Turkish | :de: German | :fr: French | :es: Spanish | :cn: Chinese | :india: Hindi

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| Database | PostgreSQL + Prisma |
| Auth | NextAuth.js (admin only) |
| Script Output | PowerShell (.bat wrapper) |

---

## Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run database migrations
npx prisma migrate dev

# Seed the database
npx prisma db seed

# Start the dev server
npm run dev
```

---

## License

MIT License -- free for personal and commercial use.

---

<div align="center">

**Built with :purple_heart: by [ahmetly](https://ahmetly.com)**

</div>