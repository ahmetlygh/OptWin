"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, ChevronDown, Globe, Check } from "lucide-react";
import Image from "next/image";

import { LanguageData } from "@/lib/languageService";

export function MaintenanceUI({ 
    locale, 
    translations, 
    settings, 
    reason, 
    estimatedEnd,
    isActive,
    languagesData
}: { 
    locale: string; 
    translations: Record<string, string>; 
    settings: Record<string, string>;
    reason: string; 
    estimatedEnd: string | null;
    isActive: boolean;
    languagesData: LanguageData[];
}) {
    const [langOpen, setLangOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [, setTick] = useState(0);
    const langRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // SSE redirect is now handled exclusively by ClientProviders (unified listener)
    // No duplicate EventSource needed here

    // Tick for countdown
    useEffect(() => {
        const timer = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
        };
        const keyHandler = (e: KeyboardEvent) => {
            if (e.key === "Escape") setLangOpen(false);
        };
        document.addEventListener("mousedown", handler);
        document.addEventListener("keydown", keyHandler);
        return () => {
            document.removeEventListener("mousedown", handler);
            document.removeEventListener("keydown", keyHandler);
        };
    }, []);

    const mt = (key: string, fallback: string) => translations[key] || fallback;

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

    let endDateStr = "";
    if (estimatedEnd) {
        try {
            const dateObj = new Date(estimatedEnd);
            const currentLangData = languagesData.find(l => l.code === locale) || languagesData[0];
            const offset = currentLangData?.utcOffset ?? 0;
            const targetTime = dateObj.getTime() + (offset * 3600000);
            const targetDate = new Date(targetTime);
            const d = targetDate.getUTCDate().toString().padStart(2, '0');
            const m = (targetDate.getUTCMonth() + 1).toString().padStart(2, '0');
            const y = targetDate.getUTCFullYear();
            const hh = targetDate.getUTCHours().toString().padStart(2, '0');
            const mm = targetDate.getUTCMinutes().toString().padStart(2, '0');
            if (locale === 'en') {
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                endDateStr = `${d} ${monthNames[targetDate.getUTCMonth()]} ${y}, ${hh}:${mm}`;
            } else {
                endDateStr = `${d}.${m}.${y} ${hh}:${mm}`;
            }
        } catch { endDateStr = new Date(estimatedEnd).toLocaleString(); }
    }

    const currentLang = languagesData.find(l => l.code === locale) || languagesData[0] || { code: "en", nativeName: "English", flagSvg: "" };
    const siteName = settings.site_name || "OptWin";
    const copyrightYear = settings.copyright_year || new Date().getFullYear().toString();
    // Match main site footer logic exactly: copyright_text falls back to siteName
    const copyrightText = settings.copyright_text || siteName;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-10000 flex flex-col items-center justify-center overflow-hidden bg-[#08080d]"
        >
            <div className="absolute inset-0 bg-[#08080d]">
                <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(107,91,230,0.14)_0%,transparent_70%)] animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute bottom-[-15%] left-[20%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(147,51,234,0.10)_0%,transparent_70%)] animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
                <div className="absolute top-[25%] right-[-8%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.09)_0%,transparent_70%)] animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
                <div className="absolute bottom-[10%] right-[30%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.06)_0%,transparent_70%)] animate-pulse" style={{ animationDuration: '7s', animationDelay: '0.5s' }} />
                <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
            </div>

            {/* Language dropdown — glassmorphism standard */}
            <div ref={langRef} className="absolute top-6 right-6 z-20">
                <button
                    onClick={() => setLangOpen(!langOpen)}
                    className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-[11px] font-bold transition-all duration-200 border backdrop-blur-xl ${
                        langOpen
                            ? "bg-white/6 border-[#6b5be6]/30 text-white/70 shadow-[0_0_20px_rgba(107,91,230,0.1)]"
                            : "bg-white/3 border-white/6 text-white/40 hover:text-white/60 hover:border-white/10"
                    }`}
                >
                    {currentLang.flagSvg ? (
                        <span className="relative flex items-center justify-center shrink-0 w-4 h-3 rounded-[2px] overflow-hidden [&>svg]:absolute [&>svg]:inset-0 [&>svg]:w-full [&>svg]:h-full [&>svg]:object-cover" dangerouslySetInnerHTML={{ __html: currentLang.flagSvg }} />
                    ) : (
                        <Globe size={12} className="text-white/25 shrink-0" />
                    )}
                    <span className="uppercase tracking-widest text-[10px]">{currentLang.code}</span>
                    <motion.div animate={{ rotate: langOpen ? 180 : 0 }} transition={{ duration: 0.2, ease: "circOut" }} className="shrink-0">
                        <ChevronDown size={11} className="text-white/20" />
                    </motion.div>
                </button>
                <AnimatePresence>
                    {langOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -4, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.96 }}
                            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                            className="absolute right-0 mt-2 min-w-[180px] rounded-xl border border-white/8 bg-[#0d0d12]/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
                        >
                            <div className="py-1 max-h-60 overflow-y-auto">
                                {languagesData.filter(l => l.isActive !== false).map((l) => {
                                    const isSelected = locale === l.code;
                                    return (
                                        <button
                                            key={l.code}
                                            onClick={() => {
                                                setLangOpen(false);
                                                document.cookie = `NEXT_LOCALE=${l.code}; path=/; max-age=31536000`;
                                                window.location.href = `/${l.code}/maintenance`;
                                            }}
                                            className={`w-full flex items-center justify-between gap-3 px-3.5 py-2 text-[12px] font-medium transition-all duration-150 ${
                                                isSelected
                                                    ? "text-[#6b5be6] bg-[#6b5be6]/8"
                                                    : "text-white/50 hover:text-white/90 hover:bg-white/4"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5 overflow-hidden">
                                                {l.flagSvg ? (
                                                    <span className="relative flex items-center justify-center shrink-0 w-4 h-3 rounded-[2px] overflow-hidden [&>svg]:absolute [&>svg]:inset-0 [&>svg]:w-full [&>svg]:h-full [&>svg]:object-cover" dangerouslySetInnerHTML={{ __html: l.flagSvg }} />
                                                ) : (
                                                    <span className="w-4 h-3 bg-white/10 rounded-[2px] shrink-0" />
                                                )}
                                                <span className="truncate">{l.nativeName}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-mono uppercase tracking-wider ${isSelected ? "text-[#6b5be6]/50" : "text-white/10"}`}>
                                                    {l.code}
                                                </span>
                                                {isSelected && (
                                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}>
                                                        <Check size={12} className="text-[#6b5be6] shrink-0" />
                                                    </motion.div>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">
                <div className="flex items-center gap-4 mb-10 select-none">
                    <Image src={settings.site_logo_url || "/optwin.png"} alt={siteName} width={68} height={68} className="drop-shadow-[0_0_25px_rgba(107,91,230,0.5)] object-contain pointer-events-none" draggable={false} />
                    <h1 className="text-[2.5rem] font-black tracking-tight bg-clip-text text-transparent bg-linear-to-r from-white via-white to-[#6b5be6] leading-none pointer-events-none">{siteName}</h1>
                </div>

                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="mb-6">
                    <Settings size={68} className="text-[#6b5be6]/35" strokeWidth={1.5} />
                </motion.div>

                <div className="bg-white/2 border border-white/5 rounded-2xl px-6 py-5 mb-6 max-w-[460px] w-full backdrop-blur-sm">
                    <p className="text-white/50 text-[18px] leading-[1.7] mb-2">
                        {mt("maintenance.msg", "Our site is currently under maintenance.")}
                    </p>
                    <p className="text-white/25 text-[15px] leading-[1.7]">
                        {mt("maintenance.apology", "We apologize for the inconvenience.")}
                    </p>
                </div>

                {reason && reason.trim() !== "" && (
                    <div className="bg-white/3 border border-white/6 rounded-xl px-5 py-3.5 mb-6 max-w-[460px] w-full text-left">
                        <p className="text-[12px] font-bold text-white/35 uppercase tracking-wider mb-1">
                            {mt("maintenance.reasonLabel", "Reason:")}
                        </p>
                        <p className="text-[15px] text-white/30 leading-relaxed">{reason}</p>
                    </div>
                )}

                <div className="w-full max-w-[384px] mb-2.5">
                    <div className="h-[3px] bg-white/6 rounded-full overflow-hidden relative">
                        <motion.div className="absolute top-0 left-0 h-full w-1/3 bg-linear-to-r from-transparent via-[#6b5be6]/60 to-transparent rounded-full" animate={{ x: ["-100%", "400%"] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
                    </div>
                </div>

                <p className="text-[13px] text-white/18 font-medium mb-3 tracking-wide">
                    {mt("maintenance.wip", "Work in progress...")}
                </p>

                <p className="text-[13px] text-white/14 font-mono tabular-nums mb-6">
                    {isMounted ? (() => {
                        const currentLangData = languagesData.find(l => l.code === locale) || languagesData[0];
                        const offset = currentLangData?.utcOffset ?? 0;
                        const utcNow = Date.now();
                        const local = new Date(utcNow + offset * 3600000);
                        const hh = local.getUTCHours().toString().padStart(2, '0');
                        const mm = local.getUTCMinutes().toString().padStart(2, '0');
                        const ss = local.getUTCSeconds().toString().padStart(2, '0');
                        const sign = offset >= 0 ? '+' : '';
                        const utcLabel = `UTC${sign}${offset}`;
                        return `${hh}:${mm}:${ss}  ${utcLabel}`;
                    })() : "00:00:00"}
                </p>

                {hasCountdown && isMounted && (
                    <div className="bg-white/2 border border-white/4 rounded-2xl px-6 py-5 mb-5 max-w-[460px] w-full">
                        <p className="text-[13px] font-bold text-white/25 uppercase tracking-wider mb-4">
                            {mt("maintenance.estLabel", "Estimated Completion")}
                        </p>
                        <div className="flex gap-3 justify-center mb-3">
                            {[
                                { v: cd.d, u: mt("maintenance.days", "Days") },
                                { v: cd.h, u: mt("maintenance.hours", "Hours") },
                                { v: cd.m, u: mt("maintenance.min", "Min") },
                                { v: cd.s, u: mt("maintenance.sec", "Sec") },
                            ].map((item, i) => (
                                <div key={i} className="bg-[#6b5be6]/7 border border-[#6b5be6]/14 rounded-xl px-4 py-3 min-w-[72px] text-center">
                                    <p className="text-3xl font-extrabold text-[#6b5be6]/70 font-mono tabular-nums">{item.v}</p>
                                    <p className="text-[10px] text-white/18 uppercase tracking-wider mt-1">{item.u}</p>
                                </div>
                            ))}
                        </div>
                        <p className="text-[14px] text-white/18">{endDateStr}</p>
                        <p className="text-[11px] text-white/10 italic mt-1">
                            {mt("maintenance.est", "Estimated time — may finish earlier or later")}
                        </p>
                    </div>
                )}
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="absolute bottom-8 left-0 right-0 text-center">
                <div className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-3">
                    <span className="text-[14px] text-white/10 font-medium select-none tracking-tight">
                        &copy; {copyrightYear} {copyrightText}
                    </span>
                    <span className="hidden md:inline size-1 rounded-full bg-white/6"></span>
                    <span className="text-[14px] text-white/10 font-medium select-none tracking-tight">
                        {mt("footer.allRights", "") || "All rights reserved."}
                    </span>
                </div>
            </motion.div>
        </motion.div>
    );
}
