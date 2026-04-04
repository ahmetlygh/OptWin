"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, ExternalLink, Clock, Loader2, ChevronRight, X, AlertTriangle, Languages, Eraser, Trash2 } from "lucide-react";
import { AdminConfirmModal } from "./AdminConfirmModal";
import { AdminLangPicker } from "./AdminLangPicker";
import { createPortal } from "react-dom";

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
    const router = useRouter();
    const [time, setTime] = useState("");
    const [showSignOut, setShowSignOut] = useState(false);
    const [showViewSite, setShowViewSite] = useState(false);
    const [maintenance, setMaintenance] = useState(false);
    const [maintenanceLoading, setMaintenanceLoading] = useState(true);
    const [showMaintenanceOn, setShowMaintenanceOn] = useState(false);
    const [showMaintenanceOff, setShowMaintenanceOff] = useState(false);

    // Maintenance modal fields
    const [reasonLangs, setReasonLangs] = useState<string[]>([]);
    const [mReasons, setMReasons] = useState<Record<string, string>>({});
    const [mReasonLang, setMReasonLang] = useState("tr");
    const [mTranslating, setMTranslating] = useState(false);
    const [mTimeMode, setMTimeMode] = useState<"duration" | "datetime">("duration");
    const [mMinutes, setMMinutes] = useState<number | null>(null);
    const [mCustom, setMCustom] = useState(false);
    const [mCustomMinutes, setMCustomMinutes] = useState("");
    const [mDate, setMDate] = useState("");
    const [mTime, setMTime] = useState("");

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setTime(getUTC3Time());
        const interval = setInterval(() => setTime(getUTC3Time()), 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        fetch("/api/admin/maintenance").then(r => r.json()).then(d => {
            setMaintenance(d.maintenance === true);
            setMaintenanceLoading(false);
            window.dispatchEvent(new CustomEvent('optwin:set-maintenance', { detail: d.maintenance === true }));
        }).catch(() => setMaintenanceLoading(false));

        fetch("/api/admin/languages").then(r => r.json()).then(d => {
            if (Array.isArray(d)) {
                const codes = d.filter((l: any) => l.isActive).map((l: any) => l.code);
                setReasonLangs(codes);
                setMReasons(Object.fromEntries(codes.map((c: string) => [c, ""])));
                setMReasonLang(codes.includes("tr") ? "tr" : (codes[0] || "en"));
            }
        }).catch(() => { });
    }, []);

    useEffect(() => {
        const openModalHandler = () => openMaintenanceModal();
        const toggleOffHandler = () => setShowMaintenanceOff(true);
        const setMaintenanceHandler = (e: any) => setMaintenance(e.detail);

        window.addEventListener('optwin:open-maintenance-modal', openModalHandler);
        window.addEventListener('optwin:open-maintenance-off', toggleOffHandler);
        window.addEventListener('optwin:set-maintenance', setMaintenanceHandler);

        return () => {
            window.removeEventListener('optwin:open-maintenance-modal', openModalHandler);
            window.removeEventListener('optwin:open-maintenance-off', toggleOffHandler);
            window.removeEventListener('optwin:set-maintenance', setMaintenanceHandler);
        };
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
                body: JSON.stringify({ enabled, reason: JSON.stringify(mReasons), estimatedEnd: enabled ? estimatedEnd : "" }),
            });
            const data = await res.json();
            if (data.success) {
                setMaintenance(data.maintenance);
                window.dispatchEvent(new CustomEvent('optwin:set-maintenance', { detail: data.maintenance }));
                router.refresh();
            }
        } catch { /* ignore */ }
        setMaintenanceLoading(false);
        setShowMaintenanceOn(false);
        setShowMaintenanceOff(false);
        if (!enabled) {
            // Keep reasons in mReasons for persistence, just reset UI flags
            setMMinutes(null); setMCustom(false); setMCustomMinutes(""); setMDate(""); setMTime("");
        }
    };

    const openMaintenanceModal = async () => {
        setShowMaintenanceOn(true);
        setMMinutes(null); setMCustom(false); setMCustomMinutes(""); setMDate(""); setMTime(""); setMTimeMode("duration");

        // Fetch current reason if mReasons is empty
        const allEmpty = Object.values(mReasons).every(v => typeof v !== 'string' || !v.trim());
        if (allEmpty) {
            try {
                const res = await fetch("/api/admin/maintenance");
                const data = await res.json();
                if (data.reason) {
                    try {
                        const parsed = typeof data.reason === 'string' ? JSON.parse(data.reason) : data.reason;
                        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                            const sanitized = Object.fromEntries(
                                Object.entries(parsed).map(([k, v]) => [k, String(v)])
                            );
                            setMReasons(sanitized);
                        } else {
                            setMReasons(prev => ({ ...prev, [mReasonLang]: String(data.reason) }));
                        }
                    } catch {
                        setMReasons(prev => ({ ...prev, [mReasonLang]: String(data.reason) }));
                    }
                }
            } catch { /* ignore */ }
        }
    };

    // ESC key closes maintenance modal
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
        "script-settings": "Script Ayarları",
        translations: "Çeviriler",
        messages: "Mesajlar",
        stats: "İstatistikler",
        settings: "Ayarlar",
        general: "Genel Ayarlar",
        content: "İçerik Yönetimi",
        appearance: "Görünüm",
        languages: "Dil Yönetimi",
    };

    const [dynamicLabels, setDynamicLabels] = useState<Record<string, string>>({});

    useEffect(() => {
        const parts = pathname.split("/");
        if (pathname.startsWith("/admin/languages/") && parts.length >= 4) {
            const code = parts[3];
            fetch("/api/admin/languages")
                .then(r => r.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        const l = data.find(x => x.code === code);
                        if (l) setDynamicLabels(prev => ({ ...prev, [code]: l.turkishName || l.name }));
                    }
                }).catch(() => { });
        }
    }, [pathname]);

    const breadcrumbs = (() => {
        const parts = pathname.replace(/^\//, "").split("/").filter(Boolean);
        const items: { label: string; href: string }[] = [];
        let path = "";
        for (const part of parts) {
            path += `/${part}`;
            items.push({
                label: dynamicLabels[part] || BREADCRUMB_LABELS[part] || part,
                href: path,
            });
        }
        return items;
    })();

    return (
        <>
            <header className="h-14 flex items-center justify-between px-6 border-b border-white/4 bg-[#0a0a10]/60 backdrop-blur-xl relative z-20 shrink-0">
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
                    <div className="flex items-center gap-2.5">
                        <span className={`text-[11px] font-bold hidden sm:inline uppercase tracking-wider transition-colors duration-300 ${maintenanceLoading ? "text-white/20" : maintenance ? "text-orange-400" : "text-emerald-400"}`}>
                            {maintenanceLoading ? "Yükleniyor..." : maintenance ? "Bakımda" : "Aktif"}
                        </span>
                         <button
                             onClick={() => maintenance ? setShowMaintenanceOff(true) : openMaintenanceModal()}
                             disabled={maintenanceLoading}
                             className={`relative w-[46px] h-6 rounded-full transition-all duration-300 cursor-pointer ${maintenanceLoading ? "bg-white/10" : maintenance ? "bg-orange-500/80 shadow-[0_0_12px_rgba(245,158,11,0.25)]" : "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]"} ${maintenanceLoading ? "opacity-50" : ""}`}
                         >
                            {maintenanceLoading ? (
                                <Loader2 size={12} className="absolute top-[6px] left-1/2 -translate-x-1/2 text-white/50 animate-spin" />
                            ) : (
                                <span className={`absolute top-[4px] w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${maintenance ? "left-[4px]" : "left-[26px]"}`} />
                            )}
                        </button>
                    </div>

                    <div className="w-px h-5 bg-white/6" />

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setShowViewSite(true)}
                        className="flex items-center gap-2 h-9 px-4 rounded-xl text-[13px] font-bold text-white/40 hover:text-white/70 bg-white/2 hover:bg-white/4 border border-white/4 transition-all"
                    >
                        <ExternalLink size={14} />
                        <span>Siteye Git</span>
                    </motion.button>

                    <div className="w-px h-6 bg-white/6" />

                    <div className="flex items-center gap-2.5">
                        {user.image ? (
                            <Image
                                src={user.image}
                                alt={user.name || "Admin"}
                                width={28}
                                height={28}
                                className="rounded-full ring-1 ring-white/8"
                            />
                        ) : (
                            <div className="w-7 h-7 rounded-full bg-linear-to-br from-[#6b5be6]/20 to-[#9333ea]/20 flex items-center justify-center text-[#6b5be6] font-bold text-[11px]">
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

            {/* Maintenance On Modal */}
            {mounted && createPortal(
                <AnimatePresence>
                    {showMaintenanceOn && (
                        <div className="fixed inset-0 z-10000 flex items-center justify-center p-4" onClick={() => setShowMaintenanceOn(false)}>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                className="relative bg-[#0d0d12]/95 backdrop-blur-2xl border border-white/6 rounded-2xl p-7 max-w-lg w-full shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/8 blur-3xl pointer-events-none" />

                                <div className="relative z-10 flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                            <AlertTriangle size={22} className="text-amber-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-white uppercase tracking-tight">Bakıma Al</h3>
                                            <p className="text-[11px] text-white/25 font-bold uppercase tracking-[0.15em] mt-0.5">Ziyaretçiler bakım sayfasına yönlendirilecek</p>
                                        </div>
                                    </div>
                                     <button onClick={() => setShowMaintenanceOn(false)} className="size-9 flex items-center justify-center rounded-xl hover:bg-white/5 text-white/20 hover:text-white/60 transition-colors cursor-pointer">
                                         <X size={18} />
                                     </button>
                                </div>

                                <div className="relative z-10 mb-5">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-[11px] font-bold text-white/25 uppercase tracking-wider">Bakım Sebebi <span className="text-white/15">(opsiyonel)</span></label>
                                        <div className="flex items-center gap-1.5">
                                            <div className="flex items-center bg-white/3 border border-white/6 rounded-xl px-2 h-9">
                                                 <button
                                                     onClick={() => setMReasons(prev => ({ ...prev, [mReasonLang]: "" }))}
                                                     className="p-2 text-white/20 hover:text-orange-400 transition-colors cursor-pointer"
                                                     title="Dili temizle"
                                                 >
                                                    <Eraser size={16} />
                                                </button>
                                                <div className="w-px h-4 bg-white/5" />
                                                 <button
                                                     onClick={() => setMReasons(Object.fromEntries(reasonLangs.map(l => [l, ""])))}
                                                     className="p-2 text-white/20 hover:text-red-400 transition-colors cursor-pointer"
                                                     title="Tümünü temizle"
                                                 >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <AdminLangPicker
                                                value={mReasonLang}
                                                onChange={setMReasonLang}
                                                availableLangs={reasonLangs}
                                            />
                                        </div>
                                    </div>
                                    <textarea
                                        value={typeof mReasons[mReasonLang] === 'string' ? mReasons[mReasonLang] : ""}
                                        onChange={e => setMReasons(prev => ({ ...prev, [mReasonLang]: e.target.value }))}
                                        placeholder={mReasonLang === "tr" ? "Sistem güncellemesi, veritabanı bakımı..." : "System update, database maintenance..."}
                                        rows={3}
                                        className="w-full bg-white/3 border border-white/6 rounded-xl px-4 py-3 text-[14px] text-white/80 placeholder-white/15 focus:outline-none focus:border-[#6b5be6]/50 transition-colors resize-none"
                                    />
                                    {typeof mReasons[mReasonLang] === 'string' && mReasons[mReasonLang].trim() && (
                                         <button
                                             type="button"
                                             disabled={mTranslating}
                                             onClick={async () => {
                                                 const text = mReasons[mReasonLang];
                                                 if (!text?.trim()) return;
                                                 setMTranslating(true);
                                                 try {
                                                     const otherLangs = reasonLangs.filter(l => l !== mReasonLang);
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
                                             className="mt-2 h-8 px-4 rounded-xl text-[11px] font-bold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/15 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                                         >
                                            {mTranslating ? <Loader2 size={13} className="animate-spin" /> : <Languages size={13} />}
                                            {mTranslating ? "Çevriliyor..." : "Diğer Dillere Çevir"}
                                        </button>
                                    )}
                                </div>

                                <div className="relative z-10 mb-6">
                                    <label className="block text-[11px] font-bold text-white/25 uppercase tracking-wider mb-2">Tahmini Bitiş <span className="text-white/15">(opsiyonel)</span></label>

                                    <div className="flex gap-2 mb-4">
                                         <button
                                             onClick={() => setMTimeMode("duration")}
                                             className={`flex-1 h-10 rounded-xl text-[12px] font-bold transition-all border cursor-pointer ${mTimeMode === "duration" ? "bg-[#6b5be6]/10 text-[#6b5be6] border-[#6b5be6]/20" : "bg-white/2 text-white/30 border-white/6 hover:text-white/50"
                                                 }`}
                                         >
                                             Süre seç
                                         </button>
                                         <button
                                             onClick={switchToDatetime}
                                             className={`flex-1 h-10 rounded-xl text-[12px] font-bold transition-all border cursor-pointer ${mTimeMode === "datetime" ? "bg-[#6b5be6]/10 text-[#6b5be6] border-[#6b5be6]/20" : "bg-white/2 text-white/30 border-white/6 hover:text-white/50"
                                                 }`}
                                         >
                                             Tarih ve saat
                                         </button>
                                    </div>

                                    {mTimeMode === "duration" ? (
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-5 gap-2">
                                                {DURATION_PRESETS.map(p => (
                                                    <button
                                                        key={p.minutes}
                                                        onClick={() => { setMMinutes(mMinutes === p.minutes ? null : p.minutes); setMCustom(false); }}
                                                        className={`h-10 rounded-xl text-[12px] font-bold transition-all border ${!mCustom && mMinutes === p.minutes ? "bg-orange-500/15 text-orange-400 border-orange-500/20" : "bg-white/2 text-white/30 border-white/6 hover:text-white/50"
                                                            }`}
                                                    >
                                                        {p.label}
                                                    </button>
                                                ))}
                                                <button
                                                    onClick={() => { setMCustom(!mCustom); setMMinutes(null); }}
                                                    className={`h-10 rounded-xl text-[12px] font-bold transition-all border ${mCustom ? "bg-orange-500/15 text-orange-400 border-orange-500/20" : "bg-white/2 text-white/30 border-white/6 hover:text-white/50"
                                                        }`}
                                                >
                                                    Özel
                                                </button>
                                            </div>
                                            {mCustom && (
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        value={mCustomMinutes}
                                                        onChange={e => setMCustomMinutes(e.target.value.replace(/[^0-9]/g, ""))}
                                                        placeholder="Dakika girin"
                                                        className="flex-1 h-11 px-4 bg-white/3 border border-white/6 rounded-2xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-orange-500/30 transition-colors"
                                                        autoFocus
                                                    />
                                                    <span className="text-[11px] text-white/25 font-bold uppercase tracking-wider">dakika</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <input
                                                type="date"
                                                value={mDate}
                                                onChange={e => setMDate(e.target.value)}
                                                className="flex-1 h-11 px-4 bg-white/3 border border-white/6 rounded-2xl text-white text-sm focus:outline-none focus:border-[#6b5be6]/30 transition-colors scheme-dark"
                                            />
                                            <input
                                                type="time"
                                                value={mTime}
                                                onChange={e => setMTime(e.target.value)}
                                                className="w-32 h-11 px-4 bg-white/3 border border-white/6 rounded-2xl text-white text-sm focus:outline-none focus:border-[#6b5be6]/30 transition-colors scheme-dark"
                                            />
                                            <span className="flex items-center text-[11px] text-white/20 font-mono">UTC+3</span>
                                        </div>
                                    )}
                                </div>

                                <div className="relative z-10 flex gap-4">
                                     <button onClick={() => setShowMaintenanceOn(false)} className="flex-1 h-12 rounded-2xl text-[13px] font-black uppercase tracking-widest text-white/50 bg-white/3 hover:bg-white/6 border border-white/6 transition-all cursor-pointer">
                                         İptal
                                     </button>
                                     <button
                                         onClick={() => toggleMaintenance(true)}
                                         className="flex-1 h-12 rounded-2xl text-[13px] font-black uppercase tracking-widest text-white bg-amber-600 hover:bg-amber-500 transition-all shadow-xl shadow-amber-600/20 flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer"
                                     >
                                        <AlertTriangle size={16} />
                                        Bakıma Al
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}

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
