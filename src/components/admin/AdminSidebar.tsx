"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUnsavedChanges } from "@/components/admin/UnsavedChangesContext";
import { UnsavedChangesModal } from "@/components/admin/UnsavedChangesModal";
import {
    LayoutDashboard,
    Puzzle,
    FileCode2,
    FolderOpen,
    Globe,
    Languages,
    MessageSquare,
    BarChart3,
    Settings,
    Palette,
    Menu,
    X,
    Lock,
    Megaphone,
    Globe2,
} from "lucide-react";

interface AdminSidebarProps {
    unreadMessages?: number;
    siteName?: string;
    siteVersion?: string;
}

type MenuItem = {
    label: string;
    href: string;
    icon: React.ReactNode;
    disabled?: boolean;
    badge?: number;
};

export function AdminSidebar({ 
    unreadMessages = 0, 
    siteName = "OptWin", 
    siteVersion = "1.3" 
}: AdminSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileOpen, setMobileOpen] = useState(false);
    const { hasUnsavedChanges, onSave, onDiscard } = useUnsavedChanges();
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);
    const [pendingHref, setPendingHref] = useState<string | null>(null);

    const handleNavClick = (e: React.MouseEvent, href: string) => {
        if (hasUnsavedChanges && !pathname.startsWith(href)) {
            e.preventDefault();
            setPendingHref(href);
            setShowUnsavedModal(true);
        } else {
            setMobileOpen(false);
        }
    };

    const menuItems: MenuItem[] = [
        { label: "Genel Bakış", href: "/admin", icon: <LayoutDashboard size={17} /> },
        { label: "Özellikler", href: "/admin/features", icon: <Puzzle size={17} /> },
        { label: "Script Ayarları", href: "/admin/script-settings", icon: <FileCode2 size={17} /> },
        { label: "Kategoriler", href: "/admin/categories", icon: <FolderOpen size={17} />, disabled: true },
        { label: "DNS Sağlayıcılar", href: "/admin/dns", icon: <Globe size={17} />, disabled: true },
        { label: "Çeviriler", href: "/admin/translations", icon: <Languages size={17} />, disabled: true },
        { label: "Mesajlar", href: "/admin/messages", icon: <MessageSquare size={17} />, disabled: true, badge: unreadMessages },
        { label: "Duyurular", href: "/admin/announcements", icon: <Megaphone size={17} />, disabled: true },
        { label: "İstatistikler", href: "/admin/stats", icon: <BarChart3 size={17} />, disabled: true },
        { label: "Dil Yönetimi", href: "/admin/languages", icon: <Globe2 size={17} />, disabled: true },
        { label: "Görünüm", href: "/admin/appearance", icon: <Palette size={17} />, disabled: true },
        { label: "Ayarlar", href: "/admin/settings", icon: <Settings size={17} /> },
    ];

    const isActive = (href: string) => {
        if (href === "/admin") return pathname === "/admin";
        return pathname.startsWith(href);
    };

    const sidebarContent = (
        <aside className="flex flex-col h-screen w-[260px] xl:w-[280px] 2xl:w-[300px] relative overflow-hidden shrink-0 transition-all duration-300">
            {/* Background */}
            <div className="absolute inset-0 bg-[#0a0a10]/95 backdrop-blur-2xl" />
            <div className="absolute inset-0 border-r border-white/[0.05]" />
            <div className="absolute top-0 left-0 w-full h-40 bg-[radial-gradient(ellipse_at_top_left,rgba(107,91,230,0.08),transparent_70%)] pointer-events-none" />

            {/* Header — OptWin Logo + Glow */}
            <div className="relative z-10 px-4 py-4 border-b border-white/[0.05]">
                <Link href="/admin" className="flex items-center gap-3 group">
                    <div className="h-9 w-9 flex items-center justify-center shrink-0">
                        <Image
                            src="/optwin.png"
                            alt={siteName}
                            width={36}
                            height={36}
                            className="h-full w-auto object-contain drop-shadow-[0_0_12px_rgba(107,91,230,0.5)] group-hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-[#6b5be6] truncate max-w-[120px]" title={siteName}>{siteName}</span>
                            <span className="text-[8px] font-black uppercase tracking-widest text-[#6b5be6] bg-[#6b5be6]/10 px-1.5 py-0.5 rounded-md">
                                Admin
                            </span>
                        </div>
                        <span className="text-[10px] text-white/25 font-medium">Yönetim Paneli</span>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="relative z-10 flex-1 px-3 xl:px-4 py-3 space-y-0.5 overflow-y-auto custom-scrollbar">
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/15 px-2.5 mb-1.5">
                    Menü
                </p>
                {menuItems.map((item, index) => {
                    const active = isActive(item.href);

                    if (item.disabled) {
                        return (
                            <div
                                key={item.href}
                                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium text-white/12 cursor-not-allowed select-none"
                            >
                                <span className="text-white/8">{item.icon}</span>
                                <span>{item.label}</span>
                                {item.badge && item.badge > 0 ? (
                                    <span className="ml-auto text-[9px] font-bold bg-red-500/15 text-red-400/40 min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1">
                                        {item.badge}
                                    </span>
                                ) : (
                                    <Lock size={10} className="ml-auto text-white/8" />
                                )}
                            </div>
                        );
                    }

                    return (
                        <Link key={item.href} href={item.href} onClick={(e) => handleNavClick(e, item.href)}>
                            <motion.div
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.03, ease: "easeOut" }}
                                className={`relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-colors duration-200 group ${
                                    active ? "text-white" : "text-white/35 hover:text-white/75 hover:bg-white/[0.04]"
                                }`}
                            >
                                {active && (
                                    <motion.div
                                        layoutId="sidebarActive"
                                        className="absolute inset-0 rounded-lg bg-[#6b5be6]/10 border border-[#6b5be6]/15"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <span className={`relative z-10 transition-colors duration-200 ${active ? "text-[#6b5be6]" : "text-white/25 group-hover:text-white/55"}`}>
                                    {item.icon}
                                </span>
                                <span className="relative z-10">{item.label}</span>
                                {item.badge && item.badge > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="relative z-10 ml-auto text-[9px] font-bold bg-red-500/15 text-red-400 min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1"
                                    >
                                        {item.badge}
                                    </motion.span>
                                )}
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer — Version */}
            <div className="relative z-10 px-4 py-3 border-t border-white/[0.05]">
                <p className="text-[10px] text-white/15 font-medium text-center">{siteName} Admin v{siteVersion}</p>
            </div>
        </aside>
    );

    return (
        <>
            <UnsavedChangesModal
                open={showUnsavedModal}
                onClose={() => { setShowUnsavedModal(false); setPendingHref(null); }}
                onSaveAndLeave={async () => {
                    setShowUnsavedModal(false);
                    if (onSave.current) await onSave.current();
                    if (pendingHref) { router.push(pendingHref); setPendingHref(null); }
                }}
                onDiscardAndLeave={() => {
                    setShowUnsavedModal(false);
                    if (onDiscard.current) onDiscard.current();
                    if (pendingHref) { router.push(pendingHref); setPendingHref(null); }
                }}
            />
            {/* Desktop sidebar */}
            <div className="hidden md:block shrink-0">
                {sidebarContent}
            </div>

            {/* Mobile toggle */}
            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileOpen(!isMobileOpen)}
                className="md:hidden fixed top-4 left-4 z-[300] size-9 flex items-center justify-center rounded-xl bg-[#0a0a10]/90 backdrop-blur-xl border border-white/[0.06] text-white shadow-2xl"
            >
                {isMobileOpen ? <X size={16} /> : <Menu size={16} />}
            </motion.button>

            {/* Mobile overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <div className="md:hidden fixed inset-0 z-[250]">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                            onClick={() => setMobileOpen(false)}
                        />
                        <motion.div
                            initial={{ x: -240, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -240, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="absolute left-0 top-0 h-full"
                        >
                            {sidebarContent}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
