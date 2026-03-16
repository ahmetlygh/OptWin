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

/* ── Maintenance i18n ──────── */
const ML: Record<string, {
    label: string; flag: string;
    msg: string; apology: string; reasonLabel: string;
    estLabel: string; days: string; hours: string; min: string; sec: string;
    est: string;
}> = {
    tr: { label: "Türkçe", flag: "🇹🇷", msg: "Sitemiz şu anda bakımdadır. Ekibimiz en iyi deneyimi sunmak için çalışıyor.", apology: "Verdiğimiz rahatsızlık için özür dileriz.", reasonLabel: "Sebep:", estLabel: "Tahmini Bitiş", days: "Gün", hours: "Saat", min: "Dk", sec: "Sn", est: "Tahmini süre — daha erken veya geç bitebilir" },
    en: { label: "English", flag: "🇬🇧", msg: "Our site is currently under maintenance. Our team is working to provide the best experience.", apology: "We apologize for the inconvenience.", reasonLabel: "Reason:", estLabel: "Estimated Completion", days: "Days", hours: "Hours", min: "Min", sec: "Sec", est: "Estimated time — may finish earlier or later" },
    de: { label: "Deutsch", flag: "🇩🇪", msg: "Unsere Website befindet sich derzeit in Wartung. Unser Team arbeitet daran, das beste Erlebnis zu bieten.", apology: "Wir entschuldigen uns für die Unannehmlichkeiten.", reasonLabel: "Grund:", estLabel: "Voraussichtliches Ende", days: "Tage", hours: "Std", min: "Min", sec: "Sek", est: "Geschätzte Zeit — kann früher oder später enden" },
    fr: { label: "Français", flag: "🇫🇷", msg: "Notre site est actuellement en maintenance. Notre équipe travaille pour offrir la meilleure expérience.", apology: "Nous nous excusons pour la gêne occasionnée.", reasonLabel: "Raison :", estLabel: "Fin estimée", days: "Jours", hours: "Heures", min: "Min", sec: "Sec", est: "Temps estimé — peut finir plus tôt ou plus tard" },
    es: { label: "Español", flag: "🇪🇸", msg: "Nuestro sitio está en mantenimiento. Nuestro equipo trabaja para ofrecer la mejor experiencia.", apology: "Pedimos disculpas por las molestias.", reasonLabel: "Razón:", estLabel: "Finalización estimada", days: "Días", hours: "Horas", min: "Min", sec: "Seg", est: "Tiempo estimado — puede terminar antes o después" },
    zh: { label: "中文", flag: "🇨🇳", msg: "我们的网站正在维护中。我们的团队正在努力提供最佳体验。", apology: "对此给您带来的不便，我们深表歉意。", reasonLabel: "原因：", estLabel: "预计完成时间", days: "天", hours: "时", min: "分", sec: "秒", est: "预计时间 - 可能提前或延迟完成" },
    hi: { label: "हिन्दी", flag: "🇮🇳", msg: "हमारी साइट वर्तमान में रखरखाव में है। हमारी टीम सर्वोत्तम अनुभव प्रदान करने के लिए काम कर रही है।", apology: "असुविधा के लिए हम क्षमा चाहते हैं।", reasonLabel: "कारण:", estLabel: "अनुमानित समाप्ति", days: "दिन", hours: "घंटे", min: "मिनट", sec: "सेकंड", est: "अनुमानित समय — पहले या बाद में समाप्त हो सकता है" },
};
const ML_KEYS = Object.keys(ML);
const LOCALE_MAP: Record<string, string> = { tr: "tr-TR", en: "en-GB", de: "de-DE", fr: "fr-FR", es: "es-ES", zh: "zh-CN", hi: "hi-IN" };

/* ── Maintenance Overlay ──────────────────────────────────────── */
function MaintenanceOverlay({ reason, estimatedEnd }: { reason?: string | null; estimatedEnd?: string | null }) {
    const [lang, setLang] = useState("tr");
    const [langOpen, setLangOpen] = useState(false);
    const [tick, setTick] = useState(0);
    const langRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const stored = localStorage.getItem("optwin-lang");
        if (stored && ML[stored]) setLang(stored);
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

    const t = ML[lang] || ML.tr;
    void tick;

    // Countdown calculation
    const endTime = estimatedEnd ? new Date(estimatedEnd).getTime() : 0;
    const now = Date.now();
    const diff = endTime > now ? endTime - now : 0;
    const cd = {
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
    };
    const hasCountdown = !!estimatedEnd && diff > 0;

    // Format end date in user's locale
    let endDateStr = "";
    if (estimatedEnd) {
        try {
            endDateStr = new Date(estimatedEnd).toLocaleString(LOCALE_MAP[lang] || "en-GB", { dateStyle: "long", timeStyle: "short" });
        } catch { endDateStr = new Date(estimatedEnd).toLocaleString(); }
    }

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
            </div>

            {/* Language dropdown */}
            <div ref={langRef} className="absolute top-6 right-6 z-20">
                <button onClick={() => setLangOpen(!langOpen)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[11px] font-medium text-white/40 hover:text-white/60 transition-all">
                    <Globe size={12} className="text-white/25" />
                    <span>{t.flag}</span>
                    <span>{t.label}</span>
                    <ChevronDown size={11} className={`transition-transform ${langOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                    {langOpen && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }} className="absolute right-0 mt-1 min-w-[140px] bg-[#13131d] border border-white/[0.06] rounded-lg shadow-xl overflow-hidden">
                            {ML_KEYS.map(code => (
                                <button key={code} onClick={() => { setLang(code); setLangOpen(false); localStorage.setItem("optwin-lang", code); }} className={`w-full text-left px-3 py-2 text-[11px] font-medium transition-all flex items-center gap-2 ${lang === code ? "bg-[#6b5be6]/10 text-[#6b5be6]" : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]"}`}>
                                    <span>{ML[code].flag}</span><span>{ML[code].label}</span>
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Main content */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative z-10 flex flex-col items-center text-center px-6 max-w-md">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-8">
                    <Image src="/optwin.png" alt="OptWin" width={48} height={48} className="drop-shadow-[0_0_16px_rgba(107,91,230,0.5)]" />
                    <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-[#6b5be6]">OptWin</h1>
                </div>

                {/* Spinning gear */}
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="mb-6">
                    <Settings size={48} className="text-[#6b5be6]/35" strokeWidth={1.5} />
                </motion.div>

                {/* Message */}
                <p className="text-white/40 text-[13px] leading-[1.7] mb-2 max-w-sm">{t.msg}</p>
                <p className="text-white/20 text-[12px] leading-[1.7] mb-6 max-w-sm">{t.apology}</p>

                {/* Reason */}
                {reason && (
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 mb-6 max-w-sm w-full text-left">
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1">{t.reasonLabel}</p>
                        <p className="text-[12px] text-white/25 leading-relaxed">{reason}</p>
                    </div>
                )}

                {/* Progress bar */}
                <div className="w-full max-w-[280px] mb-5">
                    <div className="h-[2px] bg-white/[0.06] rounded-full overflow-hidden relative">
                        <motion.div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-[#6b5be6]/60 to-transparent rounded-full" animate={{ x: ["-100%", "400%"] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
                    </div>
                </div>

                {/* Countdown */}
                {hasCountdown && (
                    <div className="mb-5">
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-wider mb-3">{t.estLabel}</p>
                        <div className="flex gap-2 justify-center mb-2">
                            {[
                                { v: cd.d, u: t.days },
                                { v: cd.h, u: t.hours },
                                { v: cd.m, u: t.min },
                                { v: cd.s, u: t.sec },
                            ].map((item, i) => (
                                <div key={i} className="bg-[#6b5be6]/[0.06] border border-[#6b5be6]/[0.12] rounded-xl px-3 py-2 min-w-[52px] text-center">
                                    <p className="text-xl font-extrabold text-[#6b5be6]/70 font-mono tabular-nums">{item.v}</p>
                                    <p className="text-[9px] text-white/15 uppercase tracking-wider mt-0.5">{item.u}</p>
                                </div>
                            ))}
                        </div>
                        <p className="text-[11px] text-white/15">{endDateStr}</p>
                        <p className="text-[9px] text-white/10 italic mt-1">{t.est}</p>
                    </div>
                )}
            </motion.div>

            {/* Copyright */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="absolute bottom-8 left-0 right-0 text-center">
                <p className="text-xs text-white/15 font-medium">&copy; {new Date().getFullYear()} OptWin. All rights reserved.</p>
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
    const [mReason, setMReason] = useState<string | null>(null);
    const [mEstimatedEnd, setMEstimatedEnd] = useState<string | null>(null);

    // Poll maintenance status for public pages
    useEffect(() => {
        if (isAdmin) return;

        const check = async () => {
            try {
                const res = await fetch("/api/maintenance");
                const data = await res.json();
                const newState = data.maintenance === true;
                setMReason(data.reason || null);
                setMEstimatedEnd(data.estimatedEnd || null);

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
                {maintenance && checked && !transitioning && <MaintenanceOverlay key="maintenance" reason={mReason} estimatedEnd={mEstimatedEnd} />}
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
