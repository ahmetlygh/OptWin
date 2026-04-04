"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X } from "lucide-react";

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
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    /* ── ESC to close ── */
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape" && open) onClose();
        };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [open, onClose]);

    const isDanger = variant === "danger";
    const accentColor = isDanger ? "red" : "#6b5be6";

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-9999 flex items-center justify-center p-4" onClick={onClose}>
                    {/* ── backdrop ── */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-black/70 backdrop-blur-md"
                    />

                    {/* ── modal content ── */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 20 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                        className="relative bg-[#0d0d12]/95 backdrop-blur-2xl border border-white/6 rounded-2xl w-full max-w-sm overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* ambient glow */}
                        <div
                            className="absolute top-0 right-0 w-32 h-32 blur-3xl pointer-events-none"
                            style={{ background: isDanger ? "rgba(239,68,68,0.08)" : "rgba(107,91,230,0.08)" }}
                        />

                        <div className="p-6 relative z-10">
                            {/* header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`size-10 rounded-xl flex items-center justify-center ${isDanger ? "bg-red-500/10 border border-red-500/20" : "bg-[#6b5be6]/10 border border-[#6b5be6]/20"
                                        }`}>
                                        <AlertCircle size={18} className={isDanger ? "text-red-400" : "text-[#6b5be6]"} />
                                    </div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-tight">{title}</h3>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="size-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/20 hover:text-white/60 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* description */}
                            <p className="text-[13px] text-white/40 leading-relaxed font-medium mb-6">{description}</p>

                            {/* actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 h-10 bg-white/3 hover:bg-white/6 text-white/50 hover:text-white/70 font-bold text-[12px] uppercase tracking-wider rounded-xl transition-all border border-white/6"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    onClick={onConfirm}
                                    className={`flex-1 h-10 font-bold text-[12px] uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 ${isDanger
                                            ? "bg-red-500/80 hover:bg-red-500 text-white shadow-red-500/15"
                                            : "bg-[#6b5be6] hover:bg-[#5a4bd4] text-white shadow-[#6b5be6]/15"
                                        }`}
                                >
                                    {confirmText}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
