"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, RotateCcw, Loader2, Check, AlertCircle } from "lucide-react";

interface AdminActionBarProps {
    show: boolean; // This is 'hasChanges'
    saving: boolean;
    saved: boolean;
    onSave: () => void;
    onCancel: () => void;
    saveText?: string;
    cancelText?: string;
    error?: string;
}

export function AdminActionBar({
    show,
    saving,
    saved,
    onSave,
    onCancel,
    saveText = "Değişiklikleri Kaydet",
    cancelText = "İptal",
    error
}: AdminActionBarProps) {
    // LOCK state to prevent re-entering after success animation until everything is cleared
    // We only want to lock out the "SAVED" persistent view, not "SHOW" (new changes)
    const [lockSuccess, setLockSuccess] = useState(false);

    // If NEW changes appear (show becomes true), immediately remove any success lock
    useEffect(() => {
        if (show) {
            setLockSuccess(false);
        }
    }, [show]);

    // Reset lock only when the sequence is fully idle
    useEffect(() => {
        if (!show && !saving && !saved) {
            setLockSuccess(false);
        }
    }, [show, saving, saved]);

    // Handle full "Saved" sequence exit
    useEffect(() => {
        if (saved) {
            const timer = setTimeout(() => {
                setLockSuccess(true);
            }, 1200); // 1.2s visibility for success state
            return () => clearTimeout(timer);
        }
    }, [saved]);

    // shouldRender logic: 
    // - Render if there are new changes (show) -> REGARDLESS of lock
    // - Render if currently saving
    // - Render if just saved AND not locked out yet
    const shouldRender = show || saving || (saved && !lockSuccess);

    return (
        <AnimatePresence>
            {shouldRender && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: -32, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 450, damping: 30 }}
                    className="fixed bottom-0 left-[260px] xl:left-[280px] 2xl:left-[300px] right-0 flex justify-center z-[9950] pointer-events-none px-6"
                >
                    <div className="pointer-events-auto flex flex-col items-center gap-3">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-[#0a0a10]/95 border border-red-500/30 text-red-400 text-[11px] font-bold shadow-2xl backdrop-blur-2xl"
                            >
                                <AlertCircle size={15} />
                                {error}
                            </motion.div>
                        )}
                        
                        <div className="bg-[#0a0a10]/98 backdrop-blur-3xl border border-white/[0.08] rounded-3xl shadow-[0_35px_80px_rgba(0,0,0,0.7),0_0_50px_rgba(107,91,230,0.15)] flex items-center gap-2.5 p-2.5 overflow-hidden relative group">
                            {/* Ambient Glow */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-color)]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                            {/* CANCEL BUTTON */}
                            <button
                                onClick={onCancel}
                                disabled={saving || saved}
                                className="h-12 px-6 rounded-2xl text-[12px] font-bold text-white/40 hover:text-white/90 hover:bg-white/[0.05] transition-all flex items-center gap-2.5 disabled:opacity-20 relative z-10"
                            >
                                <motion.div animate={{ rotate: saving ? 180 : 0 }}>
                                    <RotateCcw size={15} />
                                </motion.div>
                                {cancelText}
                            </button>
                            
                            <div className="w-px h-8 bg-white/[0.08] relative z-10 mx-1" />
                            
                            {/* SAVE BUTTON */}
                            <button
                                onClick={onSave}
                                disabled={saving || saved}
                                className={`h-12 min-w-[170px] px-8 rounded-2xl text-white font-black text-[11px] uppercase tracking-[0.1em] flex items-center justify-center gap-3 transition-all duration-500 relative z-10 overflow-hidden ${
                                    saved 
                                        ? "bg-transparent shadow-none" 
                                        : "bg-[#6b5be6] hover:bg-[#5a4bd4] shadow-[0_8px_25px_rgba(107,91,230,0.3)] hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(107,91,230,0.4)] active:translate-y-0 active:scale-95"
                                } disabled:cursor-not-allowed`}
                            >
                                {/* Green Expansion Disk */}
                                <AnimatePresence>
                                    {saved && (
                                        <motion.div
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 8, opacity: 1 }}
                                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                            className="absolute inset-0 bg-emerald-500 rounded-full z-[-1] origin-center"
                                        />
                                    )}
                                </AnimatePresence>

                                {/* Button Content with Transition */}
                                <AnimatePresence mode="wait">
                                    {saving ? (
                                        <motion.div
                                            key="saving"
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -12 }}
                                            className="flex items-center gap-2.5"
                                        >
                                            <Loader2 size={16} className="animate-spin" />
                                            <span>İşleniyor...</span>
                                        </motion.div>
                                    ) : saved ? (
                                        <motion.div
                                            key="saved"
                                            initial={{ opacity: 0, scale: 0.7 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ type: "spring", stiffness: 600, damping: 25 }}
                                            className="flex items-center gap-2.5"
                                        >
                                            <Check size={18} strokeWidth={3.5} />
                                            <span>Değişiklikler Kaydedildi</span>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="idle"
                                            initial={{ opacity: 0, y: -12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 12 }}
                                            className="flex items-center gap-2.5"
                                        >
                                            <Save size={16} />
                                            <span>{saveText}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
