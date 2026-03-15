"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, ChevronDown, Globe } from "lucide-react";
import Image from "next/image";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { SupportModal } from "@/components/modals/SupportModal";
import { ScrollToTop } from "./ScrollToTop";
import { ScrollRestorer } from "@/components/shared/ScrollRestorer";

/* ── Maintenance i18n with flags, timezones, better text ──────── */
const MAINTENANCE_LANGS: Record<string, {
    label: string; flag: string; utcOffset: number;
    title: string; desc1: string; desc2: string; working: string;
}> = {
    tr: {
        label: "Türkçe", flag: "🇹🇷", utcOffset: 3,
        title: "Bakım Çalışması",
        desc1: "Sitemiz şu anda planlı bakım nedeniyle geçici olarak hizmet dışıdır. Ekibimiz en iyi deneyimi sunmak için çalışmaya devam ediyor.",
        desc2: "Verdiğimiz rahatsızlık için özür dileriz, kısa süre içinde tekrar hizmetinizde olacağız.",
        working: "Çalışma devam ediyor",
    },
    en: {
        label: "English", flag: "🇬🇧", utcOffset: 0,
        title: "Under Maintenance",
        desc1: "Our website is temporarily unavailable due to scheduled maintenance. Our team is working hard to bring you the best experience.",
        desc2: "We apologize for the inconvenience and will be back online shortly.",
        working: "Work in progress",
    },
    de: {
        label: "Deutsch", flag: "🇩🇪", utcOffset: 1,
        title: "Wartungsarbeiten",
        desc1: "Unsere Website ist aufgrund geplanter Wartungsarbeiten vorübergehend nicht verfügbar. Unser Team arbeitet daran, Ihnen das beste Erlebnis zu bieten.",
        desc2: "Wir entschuldigen uns für die Unannehmlichkeiten und sind in Kürze wieder online.",
        working: "Arbeiten laufen",
    },
    fr: {
        label: "Français", flag: "🇫🇷", utcOffset: 1,
        title: "Maintenance en cours",
        desc1: "Notre site est temporairement indisponible pour cause de maintenance planifiée. Notre équipe travaille pour vous offrir la meilleure expérience.",
        desc2: "Nous nous excusons pour la gêne occasionnée et serons bientôt de retour.",
        working: "Travaux en cours",
    },
    es: {
        label: "Español", flag: "🇪🇸", utcOffset: 1,
        title: "En mantenimiento",
        desc1: "Nuestro sitio no está disponible temporalmente debido a mantenimiento programado. Nuestro equipo trabaja para ofrecerle la mejor experiencia.",
        desc2: "Pedimos disculpas por las molestias y volveremos en breve.",
        working: "Trabajo en curso",
    },
    zh: {
        label: "中文", flag: "🇨🇳", utcOffset: 8,
        title: "维护中",
        desc1: "我们的网站正在进行计划维护，暂时无法访问。我们的团队正在努力为您提供最佳体验。",
        desc2: "对此给您带来的不便，我们深表歉意，网站将很快恢复上线。",
        working: "维护进行中",
    },
    hi: {
        label: "हिन्दी", flag: "🇮🇳", utcOffset: 5.5,
        title: "रखरखाव जारी",
        desc1: "हमारी वेबसाइट नियोजित रखरखाव के कारण अस्थायी रूप से अनुपलब्ध है। हमारी टीम आपको सर्वोत्तम अनुभव देने के लिए काम कर रही है।",
        desc2: "असुविधा के लिए हम क्षमा चाहते हैं, जल्द ही वापस आएँगे।",
        working: "कार्य प्रगति पर है",
    },
};
const LANG_KEYS = Object.keys(MAINTENANCE_LANGS);

function getDateTimeForOffset(utcOffset: number): string {
    const now = new Date();
    const target = new Date(now.getTime() + utcOffset * 60 * 60 * 1000);
    const day = target.getUTCDate().toString().padStart(2, "0");
    const month = (target.getUTCMonth() + 1).toString().padStart(2, "0");
    const year = target.getUTCFullYear();
    const h = target.getUTCHours().toString().padStart(2, "0");
    const m = target.getUTCMinutes().toString().padStart(2, "0");
    const s = target.getUTCSeconds().toString().padStart(2, "0");
    return `${day}.${month}.${year} ${h}:${m}:${s}`;
}

function formatUtcLabel(offset: number): string {
    if (offset === 0) return "UTC±0";
    return `UTC${offset > 0 ? "+" : ""}${offset}`;
}

/* ── Maintenance Overlay ──────────────────────────────────────── */
function MaintenanceOverlay() {
    const [lang, setLang] = useState("tr");
    const [langOpen, setLangOpen] = useState(false);
    const [tick, setTick] = useState(0);
    const langRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const stored = localStorage.getItem("optwin-lang");
        if (stored && MAINTENANCE_LANGS[stored]) setLang(stored);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const t = MAINTENANCE_LANGS[lang] || MAINTENANCE_LANGS.tr;
    const dateTime = getDateTimeForOffset(t.utcOffset);
    void tick;

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
                <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
                <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
                <div className="absolute top-3/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
            </div>

            {/* Language dropdown — top right with flags + Globe */}
            <div ref={langRef} className="absolute top-6 right-6 z-20">
                <button
                    onClick={() => setLangOpen(!langOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[11px] font-medium text-white/40 hover:text-white/60 transition-all"
                >
                    <Globe size={12} className="text-white/25" />
                    <span>{t.flag}</span>
                    <span>{t.label}</span>
                    <ChevronDown size={11} className={`transition-transform ${langOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                    {langOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 mt-1 min-w-[140px] bg-[#13131d] border border-white/[0.06] rounded-lg shadow-xl overflow-hidden"
                        >
                            {LANG_KEYS.map(code => {
                                const l = MAINTENANCE_LANGS[code];
                                return (
                                    <button
                                        key={code}
                                        onClick={() => { setLang(code); setLangOpen(false); localStorage.setItem("optwin-lang", code); }}
                                        className={`w-full text-left px-3 py-2 text-[11px] font-medium transition-all flex items-center gap-2 ${
                                            lang === code
                                                ? "bg-[#6b5be6]/10 text-[#6b5be6]"
                                                : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
                                        }`}
                                    >
                                        <span>{l.flag}</span>
                                        <span>{l.label}</span>
                                    </button>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Main content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative z-10 flex flex-col items-center text-center px-6 max-w-md"
            >
                {/* Logo + Name */}
                <div className="flex items-center gap-3 mb-8">
                    <Image src="/optwin.png" alt="OptWin" width={48} height={48} className="drop-shadow-[0_0_16px_rgba(107,91,230,0.5)]" />
                    <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-[#6b5be6]">
                        OptWin
                    </h1>
                </div>

                {/* Spinning gear */}
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="mb-8">
                    <Settings size={56} className="text-[#6b5be6]/40" strokeWidth={1.5} />
                </motion.div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-white mb-5">{t.title}</h2>

                {/* Description — two compact paragraphs */}
                <div className="space-y-2.5 mb-8 max-w-sm">
                    <p className="text-white/35 text-[13px] leading-[1.7]">{t.desc1}</p>
                    <p className="text-white/25 text-[13px] leading-[1.7]">{t.desc2}</p>
                </div>

                {/* Progress bar */}
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

                {/* Date & Time — timezone per language */}
                <div className="flex items-center gap-2 text-white/20 text-xs font-mono tabular-nums">
                    <span>{dateTime}</span>
                    <span className="text-white/10">{formatUtcLabel(t.utcOffset)}</span>
                </div>
            </motion.div>

            {/* Copyright footer */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="absolute bottom-8 left-0 right-0 text-center">
                <p className="text-xs text-white/15 font-medium">
                    &copy; {new Date().getFullYear()} OptWin. All rights reserved.
                </p>
            </motion.div>
        </motion.div>
    );
}

/* ── Transition spinner between states ────────────────────────── */
function TransitionSpinner() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] bg-[#08080d] flex items-center justify-center"
        >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <Settings size={32} className="text-[#6b5be6]" />
            </motion.div>
        </motion.div>
    );
}

/* ── Public Shell ─────────────────────────────────────────────── */
export function PublicShell({ children, serverMaintenance = false }: { children: React.ReactNode; serverMaintenance?: boolean }) {
    const pathname = usePathname();
    const isAdmin = pathname.startsWith("/admin");
    const [maintenance, setMaintenance] = useState(serverMaintenance);
    const [checked, setChecked] = useState(serverMaintenance || isAdmin);
    const [transitioning, setTransitioning] = useState(false);
    const prevMaintenance = useRef<boolean | null>(serverMaintenance ? true : null);

    // Poll maintenance status for public pages
    useEffect(() => {
        if (isAdmin) return;

        const check = async () => {
            try {
                const res = await fetch("/api/maintenance");
                const data = await res.json();
                const newState = data.maintenance === true;

                // Show transition spinner when switching between states (not on first load)
                if (prevMaintenance.current !== null && prevMaintenance.current !== newState) {
                    setTransitioning(true);
                    setTimeout(() => {
                        setMaintenance(newState);
                        setTimeout(() => setTransitioning(false), 400);
                    }, 600);
                } else {
                    setMaintenance(newState);
                }
                prevMaintenance.current = newState;
            } catch { /* ignore */ }
            setChecked(true);
        };

        // If server already told us maintenance is on, don't need initial fetch
        if (!serverMaintenance) {
            check();
        }
        const poll = setInterval(check, 5000);
        return () => clearInterval(poll);
    }, [isAdmin, serverMaintenance]);

    if (isAdmin) {
        return <>{children}</>;
    }

    return (
        <>
            {/* Transition spinner — shown during state change */}
            <AnimatePresence>
                {transitioning && <TransitionSpinner key="spinner" />}
            </AnimatePresence>

            {/* Maintenance overlay */}
            <AnimatePresence>
                {maintenance && checked && !transitioning && <MaintenanceOverlay key="maintenance" />}
            </AnimatePresence>

            {/* Normal site — CSS transition to avoid Framer re-render flicker */}
            {checked && !transitioning && !maintenance && (
                    <div
                        className="animate-fade-in-up"
                        style={{ animationDuration: "0.5s" }}
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
                    </div>
                )}

            {/* Initial loading */}
            {!checked && (
                <div className="fixed inset-0 z-[9999] bg-[var(--bg-color)]" />
            )}
        </>
    );
}
