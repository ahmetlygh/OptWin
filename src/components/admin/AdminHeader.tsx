"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { motion } from "framer-motion";
import { LogOut, ExternalLink, Clock } from "lucide-react";
import { AdminConfirmModal } from "./AdminConfirmModal";

interface AdminHeaderProps {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
}

function getUTC3Time(): string {
    const now = new Date();
    const utc3 = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    const h = utc3.getUTCHours().toString().padStart(2, "0");
    const m = utc3.getUTCMinutes().toString().padStart(2, "0");
    const s = utc3.getUTCSeconds().toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
}

export function AdminHeader({ user }: AdminHeaderProps) {
    const [time, setTime] = useState(getUTC3Time());
    const [showSignOut, setShowSignOut] = useState(false);
    const [showViewSite, setShowViewSite] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => setTime(getUTC3Time()), 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <header className="h-14 flex items-center justify-between px-6 border-b border-white/[0.04] bg-[#0a0a10]/60 backdrop-blur-xl relative z-20 shrink-0">
                {/* Left: Clock */}
                <div className="flex items-center gap-2">
                    <Clock size={13} className="text-white/20" />
                    <span className="text-[12px] font-mono font-medium text-white/30 tabular-nums">
                        {time}
                    </span>
                    <span className="text-[9px] text-white/15 font-medium">UTC+3</span>
                </div>

                {/* Right: Actions + User */}
                <div className="flex items-center gap-3">
                    {/* View Site */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setShowViewSite(true)}
                        className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-medium text-white/30 hover:text-white/60 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] transition-all"
                    >
                        <ExternalLink size={12} />
                        <span>Siteye Git</span>
                    </motion.button>

                    {/* Separator */}
                    <div className="w-px h-6 bg-white/[0.06]" />

                    {/* User info */}
                    <div className="flex items-center gap-2.5">
                        {user.image ? (
                            <Image
                                src={user.image}
                                alt={user.name || "Admin"}
                                width={28}
                                height={28}
                                className="rounded-full ring-1 ring-white/[0.08]"
                            />
                        ) : (
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6b5be6]/20 to-[#9333ea]/20 flex items-center justify-center text-[#6b5be6] font-bold text-[11px]">
                                {(user.name || "A").charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="hidden sm:block">
                            <p className="text-[12px] font-semibold text-white/70 leading-tight">{user.name || "Admin"}</p>
                            <p className="text-[10px] text-white/20 leading-tight">{user.email}</p>
                        </div>

                        {/* Sign out */}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowSignOut(true)}
                            className="size-7 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-all ml-1"
                            title="Çıkış Yap"
                        >
                            <LogOut size={14} />
                        </motion.button>
                    </div>
                </div>
            </header>

            {/* Sign Out Modal */}
            <AdminConfirmModal
                open={showSignOut}
                onClose={() => setShowSignOut(false)}
                onConfirm={() => signOut({ callbackUrl: "/" })}
                title="Çıkış Yap"
                description="Admin panelinden çıkış yapmak istediğinize emin misiniz?"
                confirmText="Çıkış Yap"
                cancelText="İptal"
                variant="danger"
            />

            {/* View Site Modal */}
            <AdminConfirmModal
                open={showViewSite}
                onClose={() => setShowViewSite(false)}
                onConfirm={() => window.open("/", "_blank")}
                title="Siteye Git"
                description="Ana siteyi yeni sekmede açmak istediğinize emin misiniz?"
                confirmText="Siteye Git"
                cancelText="İptal"
            />
        </>
    );
}
