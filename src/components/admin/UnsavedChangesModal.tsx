"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-[#05050a]/80 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full max-w-[380px] bg-[#0f0f18] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header mimic as requested in screenshot */}
                        <div className="bg-white/[0.03] px-6 py-4 flex items-center gap-2.5 border-b border-white/[0.04]">
                            <div className="size-5 rounded-full bg-white/10 flex items-center justify-center">
                                <span className="text-[10px] text-white/40">🌐</span>
                            </div>
                            <span className="text-[11px] font-bold text-white/30 tracking-wide uppercase">localhost:3000</span>
                        </div>

                        <div className="p-7">
                            <h3 className="text-lg font-black text-white italic tracking-tight mb-2">Değişiklikleri Sakla?</h3>
                            <p className="text-sm text-white/40 leading-relaxed font-medium mb-8">
                                Lütfen bu sayfayı terk etmek istediğinizi onaylayın. Sayfaya girdiğiniz bilgiler kaydedilmemiş olabilir.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={onSaveAndLeave}
                                    className="flex-1 h-11 bg-[#6b5be6] hover:bg-[#5a4bd4] text-white font-bold rounded-xl transition-all text-xs shadow-lg shadow-[#6b5be6]/20"
                                >
                                    Kaydet ve Çık
                                </button>
                                <button
                                    onClick={onDiscardAndLeave}
                                    className="flex-1 h-11 bg-white/[0.04] hover:bg-white/[0.08] text-white/80 font-bold rounded-xl transition-all text-xs border border-white/[0.06]"
                                >
                                    Terk Et
                                </button>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-full mt-3 h-11 text-white/30 hover:text-white/50 text-[11px] font-bold uppercase tracking-widest transition-colors"
                            >
                                Sayfada Kal (ESC)
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
