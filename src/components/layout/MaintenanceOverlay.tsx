"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, ChevronDown, Globe } from "lucide-react";
import Image from "next/image";

/* ── SVG Flag icons (cross-browser) ──────── */
const FlagSvg: Record<string, React.ReactNode> = {
    tr: <svg viewBox="0 0 30 20" width="16" height="11" className="inline-block"><rect fill="#E30A17" width="30" height="20"/><circle cx="11" cy="10" r="6" fill="white"/><circle cx="13" cy="10" r="5" fill="#E30A17"/><polygon fill="white" points="17,10 14.09,8.09 15.18,11.45 13.09,9.54 16.45,10.73"/></svg>,
    en: <svg viewBox="0 0 30 20" width="16" height="11" className="inline-block"><rect fill="#012169" width="30" height="20"/><path d="M0,0 L30,20 M30,0 L0,20" stroke="white" strokeWidth="4"/><path d="M0,0 L30,20 M30,0 L0,20" stroke="#C8102E" strokeWidth="2"/><path d="M15,0 V20 M0,10 H30" stroke="white" strokeWidth="6"/><path d="M15,0 V20 M0,10 H30" stroke="#C8102E" strokeWidth="3"/></svg>,
    de: <svg viewBox="0 0 30 20" width="16" height="11" className="inline-block"><rect fill="#000" width="30" height="6.67"/><rect fill="#DD0000" y="6.67" width="30" height="6.67"/><rect fill="#FFCC00" y="13.33" width="30" height="6.67"/></svg>,
    fr: <svg viewBox="0 0 30 20" width="16" height="11" className="inline-block"><rect fill="#002395" width="10" height="20"/><rect fill="white" x="10" width="10" height="20"/><rect fill="#ED2939" x="20" width="10" height="20"/></svg>,
    es: <svg viewBox="0 0 30 20" width="16" height="11" className="inline-block"><rect fill="#AA151B" width="30" height="5"/><rect fill="#F1BF00" y="5" width="30" height="10"/><rect fill="#AA151B" y="15" width="30" height="5"/></svg>,
    zh: <svg viewBox="0 0 30 20" width="16" height="11" className="inline-block"><rect fill="#DE2910" width="30" height="20"/><polygon fill="#FFDE00" points="5,2.5 6.1,5.9 3.1,3.9 6.9,3.9 3.9,5.9"/><polygon fill="#FFDE00" points="10,1 10.5,2.3 9.2,1.5 10.8,1.5 9.5,2.3" transform="scale(0.6) translate(10,0)"/><polygon fill="#FFDE00" points="12,3 12.5,4.3 11.2,3.5 12.8,3.5 11.5,4.3" transform="scale(0.6) translate(10,0)"/></svg>,
    hi: <svg viewBox="0 0 30 20" width="16" height="11" className="inline-block"><rect fill="#FF9933" width="30" height="6.67"/><rect fill="white" y="6.67" width="30" height="6.67"/><rect fill="#138808" y="13.33" width="30" height="6.67"/><circle cx="15" cy="10" r="2" fill="none" stroke="#000080" strokeWidth="0.5"/></svg>,
};

/* ── Maintenance i18n ──────── */
const ML: Record<string, {
    label: string; flag: React.ReactNode;
    msg: string; apology: string; reasonLabel: string;
    estLabel: string; days: string; hours: string; min: string; sec: string;
    est: string; wip: string; loading: string;
}> = {
    tr: { label: "Türkçe", flag: FlagSvg.tr, msg: "Sitemiz şu anda bakımdadır. Ekibimiz en iyi deneyimi sunmak için çalışıyor.", apology: "Verdiğimiz rahatsızlık için özür dileriz.", reasonLabel: "Sebep:", estLabel: "Tahmini Bitiş", days: "Gün", hours: "Saat", min: "Dk", sec: "Sn", est: "Tahmini süre — daha erken veya geç bitebilir", wip: "Çalışmalar devam ediyor...", loading: "Yükleniyor..." },
    en: { label: "English", flag: FlagSvg.en, msg: "Our site is currently under maintenance. Our team is working to provide the best experience.", apology: "We apologize for the inconvenience.", reasonLabel: "Reason:", estLabel: "Estimated Completion", days: "Days", hours: "Hours", min: "Min", sec: "Sec", est: "Estimated time — may finish earlier or later", wip: "Work in progress...", loading: "Loading..." },
    de: { label: "Deutsch", flag: FlagSvg.de, msg: "Unsere Website befindet sich derzeit in Wartung. Unser Team arbeitet daran, das beste Erlebnis zu bieten.", apology: "Wir entschuldigen uns für die Unannehmlichkeiten.", reasonLabel: "Grund:", estLabel: "Voraussichtliches Ende", days: "Tage", hours: "Std", min: "Min", sec: "Sek", est: "Geschätzte Zeit — kann früher oder später enden", wip: "Arbeiten im Gange...", loading: "Wird geladen..." },
    fr: { label: "Français", flag: FlagSvg.fr, msg: "Notre site est actuellement en maintenance. Notre équipe travaille pour offrir la meilleure expérience.", apology: "Nous nous excusons pour la gêne occasionnée.", reasonLabel: "Raison :", estLabel: "Fin estimée", days: "Jours", hours: "Heures", min: "Min", sec: "Sec", est: "Temps estimé — peut finir plus tôt ou plus tard", wip: "Travaux en cours...", loading: "Chargement..." },
    es: { label: "Español", flag: FlagSvg.es, msg: "Nuestro sitio está en mantenimiento. Nuestro equipo trabaja para ofrecer la mejor experiencia.", apology: "Pedimos disculpas por las molestias.", reasonLabel: "Razón:", estLabel: "Finalización estimada", days: "Días", hours: "Horas", min: "Min", sec: "Seg", est: "Tiempo estimado — puede terminar antes o después", wip: "Trabajos en curso...", loading: "Cargando..." },
    zh: { label: "中文", flag: FlagSvg.zh, msg: "我们的网站正在维护中。我们的团队正在努力提供最佳体验。", apology: "对此给您带来的不便，我们深表歉意。", reasonLabel: "原因：", estLabel: "预计完成时间", days: "天", hours: "时", min: "分", sec: "秒", est: "预计时间 - 可能提前或延迟完成", wip: "工作正在进行中...", loading: "加载中..." },
    hi: { label: "हिन्दी", flag: FlagSvg.hi, msg: "हमारी साइट वर्तमान में रखरखाव में है। हमारी टीम सर्वोत्तम अनुभव प्रदान करने के लिए काम कर रही है।", apology: "असुविधा के लिए हम क्षमा चाहते हैं।", reasonLabel: "कारण:", estLabel: "अनुमानित समाप्ति", days: "दिन", hours: "घंटे", min: "मिनट", sec: "सेकंड", est: "अनुमानित समय — पहले या बाद में समाप्त हो सकता है", wip: "कार्य प्रगति पर है...", loading: "लोड हो रहा है..." },
};
const ML_KEYS = Object.keys(ML);
const UTC_OFFSET: Record<string, number> = { tr: 3, en: 0, de: 1, fr: 1, es: 1, zh: 8, hi: 5.5 };

export function MaintenanceOverlay({ reason, estimatedEnd }: { reason?: string | null; estimatedEnd?: string | null }) {
    const [lang, setLang] = useState("en");
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

    // Format end date using the selected language's UTC offset
    let endDateStr = "";
    if (estimatedEnd) {
        try {
            const dateObj = new Date(estimatedEnd);
            const offset = UTC_OFFSET[lang] ?? 0;
            const targetTime = dateObj.getTime() + (offset * 3600000);
            const targetDate = new Date(targetTime);
            const d = targetDate.getUTCDate().toString().padStart(2, '0');
            const m = (targetDate.getUTCMonth() + 1).toString().padStart(2, '0');
            const y = targetDate.getUTCFullYear();
            const hh = targetDate.getUTCHours().toString().padStart(2, '0');
            const mm = targetDate.getUTCMinutes().toString().padStart(2, '0');
            if (lang === 'en') {
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                endDateStr = `${d} ${monthNames[targetDate.getUTCMonth()]} ${y}, ${hh}:${mm}`;
            } else {
                endDateStr = `${d}.${m}.${y} ${hh}:${mm}`;
            }
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
            {/* Rich background with animated pulse orbs */}
            <div className="absolute inset-0 bg-[#08080d]">
                <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(107,91,230,0.14)_0%,transparent_70%)] animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute bottom-[-15%] left-[20%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(147,51,234,0.10)_0%,transparent_70%)] animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
                <div className="absolute top-[25%] right-[-8%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.09)_0%,transparent_70%)] animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
                <div className="absolute bottom-[10%] right-[30%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.06)_0%,transparent_70%)] animate-pulse" style={{ animationDuration: '7s', animationDelay: '0.5s' }} />
                <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">
                {/* Logo */}
                <div className="flex items-center gap-4 mb-10 select-none">
                    <Image src="/optwin.png" alt="OptWin" width={68} height={68} className="drop-shadow-[0_0_25px_rgba(107,91,230,0.5)] object-contain pointer-events-none" draggable={false} />
                    <h1 className="text-[2.5rem] font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-[#6b5be6] leading-none pointer-events-none">OptWin</h1>
                </div>

                {/* Spinning gear + loading text */}
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="mb-4">
                    <Settings size={68} className="text-[#6b5be6]/35" strokeWidth={1.5} />
                </motion.div>
                <p className="text-white/30 text-sm font-medium mb-6 animate-pulse">{t.loading}</p>

                {/* Message card */}
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl px-6 py-5 mb-6 max-w-[460px] w-full backdrop-blur-sm">
                    <p className="text-white/50 text-[18px] leading-[1.7] mb-2">{t.msg}</p>
                    <p className="text-white/25 text-[15px] leading-[1.7]">{t.apology}</p>
                </div>

                {/* Reason — per language */}
                {(() => {
                    if (!reason) return null;
                    let reasonMap: Record<string, string> = {};
                    try { reasonMap = JSON.parse(reason); } catch { reasonMap = { en: reason, tr: reason }; }
                    const localReason = reasonMap[lang] || reasonMap.en || reasonMap.tr || "";
                    if (!localReason) return null;
                    return (
                        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-3.5 mb-6 max-w-[460px] w-full text-left">
                            <p className="text-[12px] font-bold text-white/35 uppercase tracking-wider mb-1">{t.reasonLabel}</p>
                            <p className="text-[15px] text-white/30 leading-relaxed">{localReason}</p>
                        </div>
                    );
                })()}

                {/* Progress bar */}
                <div className="w-full max-w-[384px] mb-2.5">
                    <div className="h-[3px] bg-white/[0.06] rounded-full overflow-hidden relative">
                        <motion.div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-[#6b5be6]/60 to-transparent rounded-full" animate={{ x: ["-100%", "400%"] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
                    </div>
                </div>

                {/* WIP text below bar */}
                <p className="text-[13px] text-white/18 font-medium mb-3 tracking-wide">{t.wip}</p>

                {/* Live clock with UTC offset */}
                <p className="text-[13px] text-white/14 font-mono tabular-nums mb-6">
                    {(() => {
                        const offset = UTC_OFFSET[lang] ?? 0;
                        const utcNow = Date.now();
                        const local = new Date(utcNow + offset * 3600000);
                        const hh = local.getUTCHours().toString().padStart(2, '0');
                        const mm = local.getUTCMinutes().toString().padStart(2, '0');
                        const ss = local.getUTCSeconds().toString().padStart(2, '0');
                        const sign = offset >= 0 ? '+' : '';
                        const utcLabel = Number.isInteger(offset) ? `UTC${sign}${offset}` : `UTC${sign}${offset}`;
                        return `${hh}:${mm}:${ss}  ${utcLabel}`;
                    })()}
                </p>

                {/* Countdown */}
                {hasCountdown && (
                    <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl px-6 py-5 mb-5 max-w-[460px] w-full">
                        <p className="text-[13px] font-bold text-white/25 uppercase tracking-wider mb-4">{t.estLabel}</p>
                        <div className="flex gap-3 justify-center mb-3">
                            {[
                                { v: cd.d, u: t.days },
                                { v: cd.h, u: t.hours },
                                { v: cd.m, u: t.min },
                                { v: cd.s, u: t.sec },
                            ].map((item, i) => (
                                <div key={i} className="bg-[#6b5be6]/[0.07] border border-[#6b5be6]/[0.14] rounded-xl px-4 py-3 min-w-[72px] text-center">
                                    <p className="text-3xl font-extrabold text-[#6b5be6]/70 font-mono tabular-nums">{item.v}</p>
                                    <p className="text-[10px] text-white/18 uppercase tracking-wider mt-1">{item.u}</p>
                                </div>
                            ))}
                        </div>
                        <p className="text-[14px] text-white/18">{endDateStr}</p>
                        <p className="text-[11px] text-white/10 italic mt-1">{t.est}</p>
                    </div>
                )}
            </motion.div>

            {/* Copyright */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="absolute bottom-8 left-0 right-0 text-center">
                <p className="text-[16px] text-white/13 font-medium">&copy; {new Date().getFullYear()} OptWin. All rights reserved.</p>
            </motion.div>
        </motion.div>
    );
}
