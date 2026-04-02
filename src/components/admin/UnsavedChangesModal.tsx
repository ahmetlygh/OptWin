"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X, Save, LogOut } from "lucide-react";

interface UnsavedChangesModalProps {
    open: boolean;
    onClose: () => void;
    onSaveAndLeave: () => void;
    onDiscardAndLeave: () => void;
}

export function UnsavedChangesModal({
    open,
    onClose,
    onSaveAndLeave,
    onDiscardAndLeave,
}: UnsavedChangesModalProps) {
    /* ── ESC to close ── */
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape" && open) onClose();
        };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [open, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* ── backdrop ── */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/70 backdrop-blur-md"
                    />

                    {/* ── modal content ── */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 20 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full max-w-[400px] bg-[#0d0d12]/95 backdrop-blur-2xl border border-white/[0.06] rounded-2xl shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* ambient glows */}
                        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/8 blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-600/5 blur-3xl pointer-events-none" />

                        <div className="p-6 relative z-10">
                            {/* header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                        <AlertCircle size={18} className="text-amber-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-white uppercase tracking-tight">Değişiklikleri Kaydet?</h3>
                                        <p className="text-[10px] text-white/25 font-bold uppercase tracking-[0.15em] mt-0.5">Kaydedilmemiş Veriler</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="size-8 flex items-center justify-center rounded-lg hover:bg-white/[0.05] text-white/20 hover:text-white/60 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* description */}
                            <p className="text-[13px] text-white/40 leading-relaxed font-medium mb-6">
                                Sayfadan ayrılmak üzeresiniz. Yapılan değişiklikleri <span className="text-amber-500/80 font-bold">kaydetmek</span> ister misiniz? Kaydetmezseniz tüm değişiklikler silinecektir.
                            </p>

                            {/* actions */}
                            <div className="space-y-2.5">
                                <button
                                    onClick={onSaveAndLeave}
                                    className="w-full h-11 bg-[#6b5be6] hover:bg-[#5a4bd4] text-white font-bold text-[12px] uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#6b5be6]/15 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:scale-95"
                                >
                                    <Save size={15} />
                                    Kaydet ve Çık
                                </button>

                                <div className="grid grid-cols-2 gap-2.5">
                                    <button
                                        onClick={onDiscardAndLeave}
                                        className="h-10 bg-white/[0.03] hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 text-white/50 font-bold text-[11px] uppercase tracking-wider rounded-xl transition-all border border-white/[0.06] flex items-center justify-center gap-2"
                                    >
                                        <LogOut size={13} />
                                        Kaydetmeden Çık
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="h-10 bg-white/[0.02] hover:bg-white/[0.06] text-white/30 hover:text-white/60 font-bold text-[11px] uppercase tracking-wider rounded-xl transition-all border border-white/[0.06] flex items-center justify-center"
                                    >
                                        İptal
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
