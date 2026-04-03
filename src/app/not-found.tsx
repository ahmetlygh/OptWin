"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertTriangle, Home } from "lucide-react";

const translations = {
    tr: { title: "Sayfa Bulunamadı", desc: "Aradığınız sayfa mevcut değil veya taşınmış olabilir.", home: "Ana Sayfa" },
    en: { title: "Page Not Found", desc: "The page you are looking for does not exist or has been moved.", home: "Go Home" },
    de: { title: "Seite Nicht Gefunden", desc: "Die von Ihnen gesuchte Seite existiert nicht oder wurde verschoben.", home: "Startseite" },
    fr: { title: "Page Introuvable", desc: "La page que vous recherchez n'existe pas ou a été déplacée.", home: "Accueil" },
    es: { title: "Página No Encontrada", desc: "La página que busca no existe o ha sido movida.", home: "Inicio" },
    zh: { title: "页面未找到", desc: "您寻找的页面不存在或已被移动。", home: "主页" },
    hi: { title: "पृष्ठ नहीं मिला", desc: "आप जो पृष्ठ खोज रहे हैं वह मौजूद नहीं है या ले जाया गया है।", home: "मुख्य पृष्ठ" }
};

export default function NotFound() {
    const pathname = usePathname();
    const [lang, setLang] = useState("tr");

    useEffect(() => {
        const pathLang = pathname?.split("/")[1];
        if (translations[pathLang as keyof typeof translations]) {
            setLang(pathLang);
        } else {
            const cookieMatch = document.cookie.match(/NEXT_LOCALE=([^;]+)/);
            if (cookieMatch && translations[cookieMatch[1] as keyof typeof translations]) {
                setLang(cookieMatch[1]);
            }
        }
    }, [pathname]);

    const t = translations[lang as keyof typeof translations];

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a10] bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:24px_24px] relative overflow-hidden w-full fixed inset-0 z-[9999]">
            {/* Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#6b5be6]/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-red-500/10 blur-[100px] rounded-full pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-lg mx-4 p-10 bg-white/[0.015] border border-white/[0.05] rounded-[2.5rem] backdrop-blur-3xl shadow-2xl text-center"
            >
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-20 h-20 rounded-[1.5rem] bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-6 shadow-inner"
                >
                    <AlertTriangle size={36} strokeWidth={2.5} />
                </motion.div>
                
                <h1 className="text-4xl font-black text-white mb-4 tracking-tight">{t.title}</h1>
                <p className="text-lg font-medium text-white/50 mb-10 leading-relaxed max-w-sm mx-auto">{t.desc}</p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href={`/${lang}`}
                        className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#6b5be6] hover:bg-[#5b4be6] text-white font-bold tracking-wide transition-all shadow-[0_8px_20px_rgba(108,92,231,0.25)] flex items-center justify-center gap-2 active:scale-95"
                    >
                        <Home size={18} /> {t.home}
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
