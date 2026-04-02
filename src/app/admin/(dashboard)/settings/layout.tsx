"use client";

import { motion } from "framer-motion";
import { Settings as SettingsIcon, Type } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminLangPicker } from "@/components/admin/AdminLangPicker";
import { useState, useEffect } from "react";

const TABS = [
    { id: "general", label: "Genel Ayarlar", href: "/admin/settings/general", icon: <SettingsIcon size={15} /> },
    { id: "content", label: "İçerik Yönetimi", href: "/admin/settings/content", icon: <Type size={15} /> },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [lang, setLang] = useState("en");

    useEffect(() => {
        const handler = (e: any) => setLang(e.detail);
        window.addEventListener('optwin:admin-lang-change', handler);
        return () => window.removeEventListener('optwin:admin-lang-change', handler);
    }, []);

    const activeTabLabel = TABS.find(t => t.href === pathname)?.label || "Ayarlar";
    const isContentTab = pathname.includes("/settings/content");

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-5"
        >
            {/* Header + Tab bar — unified card */}
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }} className="w-full bg-white/[0.02] backdrop-blur-md border border-white/[0.05] rounded-2xl p-4 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#6b5be6]/10 flex items-center justify-center border border-[#6b5be6]/20">
                            {isContentTab ? <Type size={18} className="text-[#6b5be6]" /> : <SettingsIcon size={18} className="text-[#6b5be6]" />}
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-white uppercase tracking-tight leading-tight">{activeTabLabel}</h1>
                            <p className="text-[10px] text-white/25 font-bold uppercase tracking-[0.15em] mt-0.5">Site genelinde yapılandırma yönetimi</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {/* Language picker only for Content tab */}
                        {isContentTab && (
                            <div className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-1.5">
                                <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] shrink-0">DİL</span>
                                <AdminLangPicker 
                                    value={lang} 
                                    onChange={(l) => {
                                        setLang(l);
                                        window.dispatchEvent(new CustomEvent('optwin:admin-lang-change', { detail: l }));
                                    }} 
                                    variant="form"
                                    className="border-none bg-transparent"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Tab bar — embedded */}
                <div className="flex gap-1 p-1 rounded-xl bg-white/[0.02] border border-white/[0.04] max-w-fit">
                    {TABS.map(tab => {
                        const active = pathname === tab.href;
                        return (
                            <Link
                                key={tab.id}
                                href={tab.href}
                                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200 ${
                                    active
                                        ? "text-white"
                                        : "text-white/30 hover:text-white/60 hover:bg-white/[0.02]"
                                }`}
                            >
                                {active && (
                                    <motion.div
                                        layoutId="settingsTab"
                                        className="absolute inset-0 rounded-lg bg-[#6b5be6]/10 border border-[#6b5be6]/15 shadow-[0_0_20px_rgba(107,91,230,0.1)]"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <span className={`relative z-10 ${active ? "text-[#6b5be6]" : ""}`}>{tab.icon}</span>
                                <span className="relative z-10">{tab.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </motion.div>

            {children}
        </motion.div>
    );
}
