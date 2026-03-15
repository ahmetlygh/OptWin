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
                <div className="fixed inset-0 z-[400] flex items-center justify-center" onClick={onClose}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 12 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                        className="relative bg-[#0f0f18] border border-white/[0.06] rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-bold text-white mb-2">Kaydedilmemiş Değişiklikler</h3>
                        <p className="text-sm text-white/40 mb-6 leading-relaxed">
                            Bu sayfada kaydedilmemiş değişiklikler var. Ne yapmak istiyorsunuz?
                        </p>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={onSaveAndLeave}
                                className="w-full h-9 bg-[#6b5be6] hover:bg-[#5a4bd4] text-white font-medium rounded-xl transition-all text-sm"
                            >
                                Kaydet ve Çık
                            </button>
                            <button
                                onClick={onDiscardAndLeave}
                                className="w-full h-9 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium rounded-xl transition-all text-sm border border-red-500/10"
                            >
                                Kaydetmeden Çık
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full h-9 bg-white/[0.03] hover:bg-white/[0.06] text-white/50 font-medium rounded-xl transition-all text-sm border border-white/[0.04]"
                            >
                                İptal
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
