"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Settings, Globe } from "lucide-react";

const MAINTENANCE_TEXTS: Record<string, { title: string; desc: string; loading: string }> = {
    tr: { title: "Bakım Çalışması", desc: "Sitemiz şu anda bakım çalışması nedeniyle geçici olarak kullanılamıyor. Kısa süre içinde tekrar hizmetinizde olacağız.", loading: "Yükleniyor..." },
    en: { title: "Under Maintenance", desc: "Our site is temporarily unavailable due to scheduled maintenance. We'll be back shortly.", loading: "Loading..." },
    de: { title: "Wartungsarbeiten", desc: "Unsere Website ist aufgrund geplanter Wartungsarbeiten vorübergehend nicht verfügbar.", loading: "Wird geladen..." },
    fr: { title: "Maintenance en cours", desc: "Notre site est temporairement indisponible pour cause de maintenance planifiée.", loading: "Chargement..." },
    zh: { title: "维护中", desc: "我们的网站正在进行计划维护，暂时无法使用。", loading: "加载中..." },
    es: { title: "En mantenimiento", desc: "Nuestro sitio no está disponible temporalmente debido a un mantenimiento programado.", loading: "Cargando..." },
    hi: { title: "रखरखाव जारी", desc: "निर्धारित रखरखाव के कारण हमारी साइट अस्थायी रूप से अनुपलब्ध है।", loading: "लोड हो रहा है..." },
};

const LANGS = [
    { code: "tr", label: "TR" },
    { code: "en", label: "EN" },
    { code: "de", label: "DE" },
    { code: "fr", label: "FR" },
    { code: "zh", label: "ZH" },
    { code: "es", label: "ES" },
    { code: "hi", label: "HI" },
];

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

export default function MaintenancePage() {
    const router = useRouter();
    const [lang, setLang] = useState("tr");
    const [dateTime, setDateTime] = useState(getUTC3DateTime());
    const [redirecting, setRedirecting] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("optwin-lang");
        if (stored && MAINTENANCE_TEXTS[stored]) setLang(stored);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setDateTime(getUTC3DateTime()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Poll maintenance status every 5 seconds
    useEffect(() => {
        const poll = setInterval(async () => {
            try {
                const res = await fetch("/api/maintenance");
                const data = await res.json();
                if (!data.maintenance) {
                    setRedirecting(true);
                    clearInterval(poll);
                    setTimeout(() => router.push("/"), 1500);
                }
            } catch { /* ignore */ }
        }, 5000);
        return () => clearInterval(poll);
    }, [router]);

    const t = MAINTENANCE_TEXTS[lang] || MAINTENANCE_TEXTS.tr;

    if (redirecting) {
        return (
            <div className="fixed inset-0 bg-[#08080d] flex items-center justify-center z-[9999]">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        <Settings size={32} className="text-[#6b5be6]" />
                    </motion.div>
                    <p className="text-white/40 text-sm">{t.loading}</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-[#08080d] flex flex-col items-center justify-center overflow-hidden">
            {/* Ambient background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(107,91,230,0.08)_0%,transparent_70%)]" />
                <div className="absolute bottom-[-10%] left-[30%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(147,51,234,0.05)_0%,transparent_70%)]" />
            </div>

            {/* Language switcher — top right */}
            <div className="absolute top-6 right-6 z-10 flex items-center gap-1">
                <Globe size={13} className="text-white/20 mr-1" />
                {LANGS.map(l => (
                    <button
                        key={l.code}
                        onClick={() => { setLang(l.code); localStorage.setItem("optwin-lang", l.code); }}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                            lang === l.code
                                ? "bg-[#6b5be6]/15 text-[#6b5be6] border border-[#6b5be6]/20"
                                : "text-white/20 hover:text-white/40 border border-transparent"
                        }`}
                    >
                        {l.label}
                    </button>
                ))}
            </div>

            {/* Main content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
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
                <h2 className="text-2xl font-bold text-white mb-3">{t.title}</h2>

                {/* Description */}
                <p className="text-white/40 text-sm leading-relaxed mb-8">{t.desc}</p>

                {/* Date & Time */}
                <div className="flex items-center gap-2 text-white/20 text-xs font-mono tabular-nums">
                    <span>{dateTime}</span>
                    <span className="text-white/10">UTC+3</span>
                </div>
            </motion.div>

            {/* Copyright footer */}
            <div className="absolute bottom-6 left-0 right-0 text-center">
                <p className="text-[10px] text-white/10 font-medium">
                    &copy; {new Date().getFullYear()} OptWin. All rights reserved.
                </p>
            </div>
        </div>
    );
}
