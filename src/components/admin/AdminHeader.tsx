"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, ExternalLink, Clock, Loader2, ChevronRight, X, AlertTriangle, Languages } from "lucide-react";
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

const DURATION_PRESETS = [
    { label: "5 dk", minutes: 5 },
    { label: "15 dk", minutes: 15 },
    { label: "30 dk", minutes: 30 },
    { label: "1 saat", minutes: 60 },
];

export function AdminHeader({ user }: AdminHeaderProps) {
    const [time, setTime] = useState("");
    const [showSignOut, setShowSignOut] = useState(false);
    const [showViewSite, setShowViewSite] = useState(false);
    const [maintenance, setMaintenance] = useState(false);
    const [maintenanceLoading, setMaintenanceLoading] = useState(true);
    const [showMaintenanceOn, setShowMaintenanceOn] = useState(false);
    const [showMaintenanceOff, setShowMaintenanceOff] = useState(false);

    // Maintenance modal fields
    const REASON_LANGS = ["tr", "en", "de", "fr", "es", "zh", "hi"] as const;
    const REASON_LANG_LABELS: Record<string, string> = { tr: "TR", en: "EN", de: "DE", fr: "FR", es: "ES", zh: "ZH", hi: "HI" };
    const [mReasons, setMReasons] = useState<Record<string, string>>(Object.fromEntries(REASON_LANGS.map(l => [l, ""])));
    const [mReasonLang, setMReasonLang] = useState("tr");
    const [mTranslating, setMTranslating] = useState(false);
    const [mTimeMode, setMTimeMode] = useState<"duration" | "datetime">("duration");
    const [mMinutes, setMMinutes] = useState<number | null>(null);
    const [mCustom, setMCustom] = useState(false);
    const [mCustomMinutes, setMCustomMinutes] = useState("");
    const [mDate, setMDate] = useState("");
    const [mTime, setMTime] = useState("");

    useEffect(() => {
        setTime(getUTC3Time());
        const interval = setInterval(() => setTime(getUTC3Time()), 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        fetch("/api/admin/maintenance").then(r => r.json()).then(d => {
            setMaintenance(d.maintenance === true);
            setMaintenanceLoading(false);
        }).catch(() => setMaintenanceLoading(false));
    }, []);

    const toggleMaintenance = async (enabled: boolean) => {
        setMaintenanceLoading(true);
        try {
            let estimatedEnd = "";
            if (enabled) {
                if (mTimeMode === "duration") {
                    const mins = mCustom ? parseInt(mCustomMinutes) || 0 : (mMinutes || 0);
                    if (mins > 0) {
                        const end = new Date(Date.now() + mins * 60000);
                        estimatedEnd = end.toISOString();
                    }
                } else if (mTimeMode === "datetime" && mDate && mTime) {
                    const localStr = `${mDate}T${mTime}:00+03:00`;
                    estimatedEnd = new Date(localStr).toISOString();
                }
            }
            const res = await fetch("/api/admin/maintenance", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ enabled, reason: enabled ? JSON.stringify(mReasons) : "", estimatedEnd: enabled ? estimatedEnd : "" }),
            });
            const data = await res.json();
            if (data.success) setMaintenance(data.maintenance);
        } catch { /* ignore */ }
        setMaintenanceLoading(false);
        setShowMaintenanceOn(false);
        setShowMaintenanceOff(false);
        if (!enabled) { setMReasons(Object.fromEntries(REASON_LANGS.map(l => [l, ""]))); setMMinutes(null); setMCustom(false); setMCustomMinutes(""); setMDate(""); setMTime(""); }
    };

    const openMaintenanceModal = () => {
        setMReasons(Object.fromEntries(REASON_LANGS.map(l => [l, ""]))); setMReasonLang("tr"); setMMinutes(null); setMCustom(false); setMCustomMinutes(""); setMDate(""); setMTime(""); setMTimeMode("duration");
        setShowMaintenanceOn(true);
    };

    // T4: ESC key closes maintenance modal
    useEffect(() => {
        if (!showMaintenanceOn) return;
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setShowMaintenanceOn(false); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [showMaintenanceOn]);

    // P7: Auto-fill UTC+3 current+1h when switching to datetime
    const switchToDatetime = () => {
        setMTimeMode("datetime");
        const utc3Now = new Date(Date.now() + 3 * 3600000);
        const plusOne = new Date(utc3Now.getTime() + 3600000);
        const dateStr = plusOne.toISOString().split("T")[0];
        const hh = plusOne.getUTCHours().toString().padStart(2, "0");
        const mm = plusOne.getUTCMinutes().toString().padStart(2, "0");
        setMDate(dateStr);
        setMTime(`${hh}:${mm}`);
    };

    const pathname = usePathname();

    const BREADCRUMB_LABELS: Record<string, string> = {
        admin: "Admin",
        features: "Özellikler",
        edit: "Düzenle",
        categories: "Kategoriler",
        "script-defaults": "Script Ayarları",
        translations: "Çeviriler",
        messages: "Mesajlar",
        stats: "İstatistikler",
        settings: "Ayarlar",
        appearance: "Görünüm",
    };

    const breadcrumbs = (() => {
        const parts = pathname.replace(/^\//, "").split("/").filter(Boolean);
        const items: { label: string; href: string }[] = [];
        let path = "";
        for (const part of parts) {
            path += `/${part}`;
            items.push({
                label: BREADCRUMB_LABELS[part] || part,
                href: path,
            });
        }
        return items;
    })();

    return (
        <>
            <header className="h-14 flex items-center justify-between px-6 border-b border-white/[0.04] bg-[#0a0a10]/60 backdrop-blur-xl relative z-20 shrink-0">
                {/* Left: Breadcrumbs */}
                <nav className="flex items-center gap-1 min-w-0">
                    {breadcrumbs.map((crumb, i) => (
                        <div key={crumb.href} className="flex items-center gap-1 min-w-0">
                            {i > 0 && <ChevronRight size={11} className="text-white/15 shrink-0" />}
                            {i < breadcrumbs.length - 1 ? (
                                <Link
                                    href={crumb.href}
                                    className="text-[12px] font-medium text-white/30 hover:text-white/60 transition-colors truncate"
                                >
                                    {crumb.label}
                                </Link>
                            ) : (
                                <span className="text-[12px] font-semibold text-white/60 truncate">
                                    {crumb.label}
                                </span>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Right: Actions + User */}
                <div className="flex items-center gap-3">
                    {/* Site Active Toggle — ON = site open, OFF = maintenance */}
                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-medium hidden sm:inline transition-colors duration-300 ${maintenance ? "text-amber-400/50" : "text-emerald-400/50"}`}>
                            {maintenance ? "Bakımda" : "Aktif"}
                        </span>
                        <button
                            onClick={() => maintenance ? setShowMaintenanceOff(true) : openMaintenanceModal()}
                            disabled={maintenanceLoading}
                            className={`relative w-9 h-[20px] rounded-full transition-all duration-300 ${!maintenance ? "bg-emerald-500/80" : "bg-white/[0.06]"} ${maintenanceLoading ? "opacity-50" : ""}`}
                        >
                            {maintenanceLoading ? (
                                <Loader2 size={10} className="absolute top-[5px] left-1/2 -translate-x-1/2 text-white/50 animate-spin" />
                            ) : (
                                <span className={`absolute top-[3px] w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-all duration-300 ${!maintenance ? "left-[19px]" : "left-[3px]"}`} />
                            )}
                        </button>
                    </div>

                    <div className="w-px h-5 bg-white/[0.06]" />

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
                            <div className="flex items-center gap-1 mt-0.5">
                                <Clock size={9} className="text-white/15" />
                                <span className="text-[10px] font-mono text-white/20 tabular-nums">{time}</span>
                            </div>
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
                onConfirm={() => { setShowViewSite(false); window.open("/", "_blank"); }}
                title="Siteye Git"
                description="Ana siteyi yeni sekmede açmak istediğinize emin misiniz?"
                confirmText="Siteye Git"
                cancelText="İptal"
            />

            {/* Maintenance On Modal — custom with reason + estimated time */}
            <AnimatePresence>
                {showMaintenanceOn && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center" onClick={() => setShowMaintenanceOn(false)}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 12 }}
                            transition={{ duration: 0.25 }}
                            className="relative bg-[#0f0f18] border border-white/[0.06] rounded-2xl p-5 max-w-md w-full mx-4 shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                    <AlertTriangle size={16} className="text-amber-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-white">Bakıma Al</h3>
                                    <p className="text-[11px] text-white/30">Tüm ziyaretçiler bakım sayfasına yönlendirilecek</p>
                                </div>
                                <button onClick={() => setShowMaintenanceOn(false)} className="p-1 text-white/30 hover:text-white/60"><X size={16} /></button>
                            </div>

                            {/* Reason — per language */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-[10px] font-bold text-white/25 uppercase tracking-wider">Bakım Sebebi <span className="text-white/15">(opsiyonel)</span></label>
                                    <div className="flex gap-0.5">
                                        {REASON_LANGS.map(l => (
                                            <button
                                                key={l}
                                                type="button"
                                                onClick={() => setMReasonLang(l)}
                                                className={`h-5 px-1.5 rounded text-[9px] font-bold transition-all ${
                                                    mReasonLang === l
                                                        ? "bg-[#6b5be6]/15 text-[#6b5be6] border border-[#6b5be6]/20"
                                                        : mReasons[l] ? "bg-white/[0.04] text-white/40 border border-white/[0.06]" : "text-white/20 border border-transparent hover:text-white/40"
                                                }`}
                                            >
                                                {REASON_LANG_LABELS[l]}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <textarea
                                    value={mReasons[mReasonLang] || ""}
                                    onChange={e => setMReasons(prev => ({ ...prev, [mReasonLang]: e.target.value }))}
                                    placeholder={mReasonLang === "tr" ? "Sistem güncellemesi, veritabanı bakımı..." : "System update, database maintenance..."}
                                    rows={2}
                                    className="w-full bg-white/[0.02] border border-white/[0.04] rounded-xl px-3 py-2 text-sm text-white/80 placeholder-white/15 focus:outline-none focus:border-[#6b5be6]/30 transition-colors resize-none"
                                />
                                {mReasons[mReasonLang]?.trim() && (
                                    <button
                                        type="button"
                                        disabled={mTranslating}
                                        onClick={async () => {
                                            const text = mReasons[mReasonLang];
                                            if (!text?.trim()) return;
                                            setMTranslating(true);
                                            try {
                                                const otherLangs = REASON_LANGS.filter(l => l !== mReasonLang);
                                                const res = await fetch("/api/admin/translate", {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({ text, sourceLang: mReasonLang, targetLangs: otherLangs }),
                                                });
                                                const data = await res.json();
                                                if (data.success) {
                                                    setMReasons(prev => {
                                                        const updated = { ...prev };
                                                        Object.entries(data.translations as Record<string, string>).forEach(([lang, translated]) => {
                                                            updated[lang] = translated;
                                                        });
                                                        return updated;
                                                    });
                                                }
                                            } catch { /* ignore */ }
                                            setMTranslating(false);
                                        }}
                                        className="mt-1.5 h-7 px-3 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/15 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
                                    >
                                        {mTranslating ? <Loader2 size={11} className="animate-spin" /> : <Languages size={11} />}
                                        {mTranslating ? "Çevriliyor..." : "Diğer Dillere Çevir"}
                                    </button>
                                )}
                            </div>

                            {/* Estimated End */}
                            <div className="mb-4">
                                <label className="block text-[10px] font-bold text-white/25 uppercase tracking-wider mb-1.5">Tahmini Bitiş <span className="text-white/15">(opsiyonel)</span></label>

                                {/* Mode toggle */}
                                <div className="flex gap-1 mb-3">
                                    <button
                                        onClick={() => setMTimeMode("duration")}
                                        className={`flex-1 h-8 rounded-lg text-[11px] font-bold transition-all border ${
                                            mTimeMode === "duration" ? "bg-[#6b5be6]/10 text-[#6b5be6] border-[#6b5be6]/20" : "bg-white/[0.02] text-white/30 border-white/[0.04] hover:text-white/50"
                                        }`}
                                    >
                                        Süre seç
                                    </button>
                                    <button
                                        onClick={switchToDatetime}
                                        className={`flex-1 h-8 rounded-lg text-[11px] font-bold transition-all border ${
                                            mTimeMode === "datetime" ? "bg-[#6b5be6]/10 text-[#6b5be6] border-[#6b5be6]/20" : "bg-white/[0.02] text-white/30 border-white/[0.04] hover:text-white/50"
                                        }`}
                                    >
                                        Tarih ve saat
                                    </button>
                                </div>

                                {mTimeMode === "duration" ? (
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-5 gap-1.5">
                                            {DURATION_PRESETS.map(p => (
                                                <button
                                                    key={p.minutes}
                                                    onClick={() => { setMMinutes(mMinutes === p.minutes ? null : p.minutes); setMCustom(false); }}
                                                    className={`h-8 rounded-lg text-[11px] font-bold transition-all border ${
                                                        !mCustom && mMinutes === p.minutes ? "bg-amber-500/15 text-amber-400 border-amber-500/20" : "bg-white/[0.02] text-white/30 border-white/[0.04] hover:text-white/50"
                                                    }`}
                                                >
                                                    {p.label}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => { setMCustom(!mCustom); setMMinutes(null); }}
                                                className={`h-8 rounded-lg text-[11px] font-bold transition-all border ${
                                                    mCustom ? "bg-amber-500/15 text-amber-400 border-amber-500/20" : "bg-white/[0.02] text-white/30 border-white/[0.04] hover:text-white/50"
                                                }`}
                                            >
                                                Özel
                                            </button>
                                        </div>
                                        {mCustom && (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={mCustomMinutes}
                                                    onChange={e => setMCustomMinutes(e.target.value.replace(/[^0-9]/g, ""))}
                                                    placeholder="Dakika girin"
                                                    className="flex-1 h-9 px-3 bg-white/[0.02] border border-white/[0.04] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-amber-500/30 transition-colors"
                                                    autoFocus
                                                />
                                                <span className="text-[10px] text-white/25 font-medium">dakika</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            type="date"
                                            value={mDate}
                                            onChange={e => setMDate(e.target.value)}
                                            className="flex-1 h-9 px-3 bg-white/[0.02] border border-white/[0.04] rounded-xl text-white text-sm focus:outline-none focus:border-[#6b5be6]/30 transition-colors [color-scheme:dark]"
                                        />
                                        <input
                                            type="time"
                                            value={mTime}
                                            onChange={e => setMTime(e.target.value)}
                                            className="w-28 h-9 px-3 bg-white/[0.02] border border-white/[0.04] rounded-xl text-white text-sm focus:outline-none focus:border-[#6b5be6]/30 transition-colors [color-scheme:dark]"
                                        />
                                        <span className="flex items-center text-[10px] text-white/20 font-mono">UTC+3</span>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button onClick={() => setShowMaintenanceOn(false)} className="flex-1 h-9 rounded-xl text-sm font-medium text-white/40 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] transition-all">
                                    İptal
                                </button>
                                <button
                                    onClick={() => toggleMaintenance(true)}
                                    className="flex-1 h-9 rounded-xl text-sm font-bold text-white bg-amber-600 hover:bg-amber-500 transition-all shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2"
                                >
                                    <AlertTriangle size={13} />
                                    Bakıma Al
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Maintenance Off Modal */}
            <AdminConfirmModal
                open={showMaintenanceOff}
                onClose={() => setShowMaintenanceOff(false)}
                onConfirm={() => toggleMaintenance(false)}
                title="Bakımdan Çıkar"
                description="Siteyi bakımdan çıkarmak istediğinize emin misiniz? Site tüm ziyaretçilere tekrar açılacak."
                confirmText="Bakımdan Çıkar"
                cancelText="İptal"
            />
        </>
    );
}
