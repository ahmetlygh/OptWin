"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, ChevronDown } from "lucide-react";
import Image from "next/image";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { SupportModal } from "@/components/modals/SupportModal";
import { ScrollToTop } from "./ScrollToTop";
import { ScrollRestorer } from "@/components/shared/ScrollRestorer";

/* ── Maintenance i18n ─────────────────────────────────────────── */
const MAINTENANCE_TEXTS: Record<string, { label: string; title: string; desc: string; working: string }> = {
    tr: { label: "Türkçe", title: "Bakım Çalışması", desc: "Sitemiz şu anda planlı bakım çalışması nedeniyle geçici olarak hizmet verememektedir. Ekibimiz sizlere en iyi deneyimi sunmak için çalışmalarına devam etmektedir. Verdiğimiz rahatsızlık için özür dileriz, kısa süre içinde tekrar hizmetinizde olacağız.", working: "Çalışma devam ediyor" },
    en: { label: "English", title: "Under Maintenance", desc: "Our website is temporarily unavailable due to scheduled maintenance. Our team is working hard to bring you the best experience. We apologize for the inconvenience and will be back online shortly.", working: "Work in progress" },
    de: { label: "Deutsch", title: "Wartungsarbeiten", desc: "Unsere Website ist aufgrund geplanter Wartungsarbeiten vorübergehend nicht verfügbar. Unser Team arbeitet daran, Ihnen das beste Erlebnis zu bieten. Wir entschuldigen uns für die Unannehmlichkeiten.", working: "Arbeiten laufen" },
    fr: { label: "Français", title: "Maintenance en cours", desc: "Notre site est temporairement indisponible pour cause de maintenance planifiée. Notre équipe travaille pour vous offrir la meilleure expérience. Nous nous excusons pour la gêne occasionnée.", working: "Travaux en cours" },
    es: { label: "Español", title: "En mantenimiento", desc: "Nuestro sitio no está disponible temporalmente debido a mantenimiento programado. Nuestro equipo está trabajando para ofrecerle la mejor experiencia. Pedimos disculpas por las molestias.", working: "Trabajo en curso" },
};
const LANG_KEYS = Object.keys(MAINTENANCE_TEXTS);

function getUTC3DateTime(): string {
    const now = new Date();
    const utc3 = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    const day = utc3.getUTCDate().toString().padStart(2, "0");
    const month = (utc3.getUTCMonth() + 1).toString().padStart(2, "0");
    const year = utc3.getUTCFullYear();
    const h = utc3.getUTCHours().toString().padStart(2, "0");
    const m = utc3.getUTCMinutes().toString().padStart(2, "0");
    const s = utc3.getUTCSeconds().toString().padStart(2, "0");
    return `${day}.${month}.${year} ${h}:${m}:${s}`;
}

/* ── Maintenance Overlay (inline, no separate page) ───────────── */
function MaintenanceOverlay() {
    const [lang, setLang] = useState("tr");
    const [langOpen, setLangOpen] = useState(false);
    const [dateTime, setDateTime] = useState(getUTC3DateTime());
    const langRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const stored = localStorage.getItem("optwin-lang");
        if (stored && MAINTENANCE_TEXTS[stored]) setLang(stored);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setDateTime(getUTC3DateTime()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const t = MAINTENANCE_TEXTS[lang] || MAINTENANCE_TEXTS.tr;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
        >
            {/* Rich background */}
            <div className="absolute inset-0 bg-[#08080d]">
                <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(107,91,230,0.1)_0%,transparent_70%)]" />
                <div className="absolute bottom-[-15%] left-[25%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(147,51,234,0.07)_0%,transparent_70%)]" />
                <div className="absolute top-[30%] right-[-5%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.06)_0%,transparent_70%)]" />
                {/* Grid pattern overlay */}
                <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
                {/* Subtle horizontal lines */}
                <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
                <div className="absolute top-3/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
            </div>

            {/* Language dropdown — top right */}
            <div ref={langRef} className="absolute top-6 right-6 z-20">
                <button
                    onClick={() => setLangOpen(!langOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[11px] font-medium text-white/40 hover:text-white/60 transition-all"
                >
                    {MAINTENANCE_TEXTS[lang]?.label}
                    <ChevronDown size={11} className={`transition-transform ${langOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                    {langOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 mt-1 min-w-[120px] bg-[#13131d] border border-white/[0.06] rounded-lg shadow-xl overflow-hidden"
                        >
                            {LANG_KEYS.map(code => (
                                <button
                                    key={code}
                                    onClick={() => { setLang(code); setLangOpen(false); localStorage.setItem("optwin-lang", code); }}
                                    className={`w-full text-left px-3 py-2 text-[11px] font-medium transition-all ${
                                        lang === code
                                            ? "bg-[#6b5be6]/10 text-[#6b5be6]"
                                            : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
                                    }`}
                                >
                                    {MAINTENANCE_TEXTS[code].label}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Main content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg"
            >
                {/* Logo + Name */}
                <div className="flex items-center gap-3 mb-8">
                    <Image
                        src="/optwin.png"
                        alt="OptWin"
                        width={48}
                        height={48}
                        className="drop-shadow-[0_0_16px_rgba(107,91,230,0.5)]"
                    />
                    <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-[#6b5be6]">
                        OptWin
                    </h1>
                </div>

                {/* Spinning gear */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="mb-8"
                >
                    <Settings size={56} className="text-[#6b5be6]/40" strokeWidth={1.5} />
                </motion.div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-white mb-4">{t.title}</h2>

                {/* Description */}
                <p className="text-white/35 text-sm leading-relaxed mb-8">{t.desc}</p>

                {/* Progress bar with sliding line */}
                <div className="w-full max-w-[280px] mb-3">
                    <div className="h-[2px] bg-white/[0.06] rounded-full overflow-hidden relative">
                        <motion.div
                            className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-[#6b5be6]/60 to-transparent rounded-full"
                            animate={{ x: ["-100%", "400%"] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </div>
                </div>
                <p className="text-[11px] text-white/20 font-medium mb-8">{t.working}</p>

                {/* Date & Time */}
                <div className="flex items-center gap-2 text-white/20 text-xs font-mono tabular-nums">
                    <span>{dateTime}</span>
                    <span className="text-white/10">UTC+3</span>
                </div>
            </motion.div>

            {/* Copyright footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="absolute bottom-8 left-0 right-0 text-center"
            >
                <p className="text-xs text-white/15 font-medium">
                    &copy; {new Date().getFullYear()} OptWin. All rights reserved.
                </p>
            </motion.div>
        </motion.div>
    );
}

/* ── Public Shell ─────────────────────────────────────────────── */
export function PublicShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname.startsWith("/admin");
    const [maintenance, setMaintenance] = useState(false);
    const [checked, setChecked] = useState(false);

    // Poll maintenance status for public pages
    useEffect(() => {
        if (isAdmin) return;

        const check = async () => {
            try {
                const res = await fetch("/api/maintenance");
                const data = await res.json();
                setMaintenance(data.maintenance === true);
            } catch { /* ignore */ }
            setChecked(true);
        };

        check();
        const poll = setInterval(check, 5000);
        return () => clearInterval(poll);
    }, [isAdmin]);

    if (isAdmin) {
        return <>{children}</>;
    }

    return (
        <>
            {/* Maintenance overlay — replaces everything with fade */}
            <AnimatePresence mode="wait">
                {maintenance && checked && <MaintenanceOverlay key="maintenance" />}
            </AnimatePresence>

            {/* Normal site — hidden during maintenance */}
            <AnimatePresence mode="wait">
                {(!maintenance && checked) && (
                    <motion.div
                        key="site"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Performant Ambient Background Effects */}
                        <div className="fixed inset-0 pointer-events-none z-[-1] bg-[var(--bg-color)]">
                            <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full bg-[radial-gradient(circle,rgba(107,91,230,0.12)_0%,transparent_70%)]"></div>
                            <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-[radial-gradient(circle,rgba(147,51,234,0.12)_0%,transparent_70%)]"></div>
                            <div className="absolute top-[40%] left-[30%] w-[70vw] h-[70vw] max-w-[1000px] max-h-[1000px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.08)_0%,transparent_70%)]"></div>
                        </div>

                        <div className="flex flex-col min-h-screen relative z-0">
                            <Header />
                            <main className="flex-1 w-full max-w-[1200px] mx-auto pt-6 pb-12 px-6">
                                {children}
                            </main>
                            <Footer />
                        </div>

                        <SupportModal />
                        <ScrollToTop />
                        <ScrollRestorer />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Initial loading — before first check */}
            {!checked && (
                <div className="fixed inset-0 z-[9999] bg-[var(--bg-color)]" />
            )}
        </>
    );
}
