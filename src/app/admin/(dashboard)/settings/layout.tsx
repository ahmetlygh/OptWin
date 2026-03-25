"use client";

import { motion } from "framer-motion";
import { Settings as SettingsIcon, Type, ChevronRight } from "lucide-react";
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-5"
        >
            {/* Breadcrumbs & Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-1.5 px-0.5 mb-1">
                        <Link href="/admin/stats" className="text-[10px] font-bold text-white/20 hover:text-white/40 uppercase tracking-widest transition-colors">Admin</Link>
                        <ChevronRight size={10} className="text-white/10" />
                        <Link href="/admin/settings/general" className="text-[10px] font-bold text-white/20 hover:text-white/40 uppercase tracking-widest transition-colors">Ayarlar</Link>
                        <ChevronRight size={10} className="text-white/10" />
                        <span className="text-[10px] font-bold text-[#6b5be6]/50 uppercase tracking-widest">{activeTabLabel}</span>
                    </nav>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#6b5be6]/10 flex items-center justify-center">
                            <SettingsIcon size={18} className="text-[#6b5be6]" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-tight">{activeTabLabel}</h1>
                            <p className="text-xs text-white/30">Site genelinde geçerli olan tüm yapılandırmaları yönetin</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    {pathname.includes("/settings") && (
                        <div className="flex items-center gap-2 bg-white/[0.02] border border-white/[0.06] rounded-xl px-3 py-1.5 shadow-sm">
                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-wider">Alt Dil</span>
                            <AdminLangPicker 
                                value={lang} 
                                onChange={(l) => {
                                    setLang(l);
                                    window.dispatchEvent(new CustomEvent('optwin:admin-lang-change', { detail: l }));
                                }} 
                                variant="form"
                                className="!h-7 border-none bg-transparent"
                            />
                        </div>
                    )}
                </div>
            </div>


            {/* Tab bar */}
            <div className="flex gap-1 p-1 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                {TABS.map(tab => {
                    const active = pathname === tab.href;
                    return (
                        <Link
                            key={tab.id}
                            href={tab.href}
                            className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                                active
                                    ? "text-white"
                                    : "text-white/30 hover:text-white/60 hover:bg-white/[0.02]"
                            }`}
                        >
                            {active && (
                                <motion.div
                                    layoutId="settingsTab"
                                    className="absolute inset-0 rounded-lg bg-[#6b5be6]/10 border border-[#6b5be6]/15"
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                            <span className={`relative z-10 ${active ? "text-[#6b5be6]" : ""}`}>{tab.icon}</span>
                            <span className="relative z-10">{tab.label}</span>
                        </Link>
                    );
                })}
            </div>

            {children}
        </motion.div>
    );
}
