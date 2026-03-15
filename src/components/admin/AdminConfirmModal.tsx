"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AdminConfirmModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "default";
}

export function AdminConfirmModal({
    open,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Onayla",
    cancelText = "İptal",
    variant = "default",
}: AdminConfirmModalProps) {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape" && open) onClose();
        };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [open, onClose]);

    const confirmColors =
        variant === "danger"
            ? "bg-red-500/80 hover:bg-red-500 text-white"
            : "bg-[#6b5be6] hover:bg-[#5a4bd4] text-white";

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
                        className="relative bg-[#0f0f18] border border-white/[0.06] rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                        <p className="text-sm text-white/40 mb-6 leading-relaxed">{description}</p>
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 h-9 bg-white/[0.03] hover:bg-white/[0.06] text-white/50 font-medium rounded-xl transition-all text-sm border border-white/[0.04]"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                className={`flex-1 h-9 font-medium rounded-xl transition-all text-sm ${confirmColors}`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
