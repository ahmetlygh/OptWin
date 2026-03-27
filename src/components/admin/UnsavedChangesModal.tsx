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
    
    // ESC key handles "İptal"
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
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-[#05050a]/80 backdrop-blur-sm"
                    />

                    {/* Modal Content - Standardized with Admin Panel design language */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 12 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full max-w-[400px] bg-[#0f0f18] border border-white/[0.08] rounded-2xl shadow-[0_50px_100px_rgba(0,0,0,0.6)] overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-6">
                            {/* Header Section */}
                            <div className="flex items-start justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                        <AlertCircle size={20} className="text-amber-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white tracking-tight">Değişiklikleri Kaydet?</h3>
                                        <p className="text-[11px] text-white/30 uppercase tracking-[0.1em] font-black mt-0.5">Kaydedilmemiş Veriler</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={onClose} 
                                    className="size-8 flex items-center justify-center rounded-lg hover:bg-white/[0.05] text-white/20 hover:text-white/60 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <p className="text-[13px] text-white/40 leading-relaxed font-medium mb-8">
                                Sayfadan ayrılmak üzeresiniz. Yapılan değişiklikleri <span className="text-amber-500/80 font-bold">kaydetmek</span> ister misiniz? Kaydetmezseniz tüm değişiklikler silinecektir.
                            </p>

                            <div className="space-y-2.5">
                                <button
                                    onClick={onSaveAndLeave}
                                    className="w-full h-11 bg-[#6b5be6] hover:bg-[#5a4bd4] text-white font-bold text-[13px] rounded-xl transition-all shadow-lg shadow-[#6b5be6]/15 flex items-center justify-center gap-2 hover:-translate-y-0.5"
                                >
                                    <Save size={15} />
                                    Kaydet ve Çık
                                </button>
                                
                                <div className="grid grid-cols-2 gap-2.5">
                                    <button
                                        onClick={onDiscardAndLeave}
                                        className="h-10 bg-white/[0.03] hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 text-white/50 font-semibold text-[12px] rounded-xl transition-all border border-white/[0.05] flex items-center justify-center gap-2"
                                    >
                                        <LogOut size={13} />
                                        Kaydetmeden Çık
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="h-10 bg-white/[0.02] hover:bg-white/[0.06] text-white/30 hover:text-white/60 font-semibold text-[12px] rounded-xl transition-all border border-white/[0.04] flex items-center justify-center"
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
