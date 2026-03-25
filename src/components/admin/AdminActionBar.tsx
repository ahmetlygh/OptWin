"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, RotateCcw, Loader2, Check, AlertCircle } from "lucide-react";

interface AdminActionBarProps {
    show: boolean;
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
    const [isInternalVisible, setIsInternalVisible] = useState(false);
    const [showSavedAnimation, setShowSavedAnimation] = useState(false);

    useEffect(() => {
        if (show || saving) {
            setIsInternalVisible(true);
            setShowSavedAnimation(false);
        }
    }, [show, saving]);

    useEffect(() => {
        if (saved) {
            setShowSavedAnimation(true);
            const timer = setTimeout(() => {
                setIsInternalVisible(false);
            }, 750); // 0.75s delay (0.25s for animation + 0.5s dwell as requested)
            return () => clearTimeout(timer);
        }
    }, [saved]);

    const isVisible = isInternalVisible || saving;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ translateY: "120%", opacity: 0 }}
                    animate={{ translateY: -24, opacity: 1 }}
                    exit={{ translateY: "120%", opacity: 0 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    className="fixed bottom-0 left-[260px] xl:left-[280px] 2xl:left-[300px] right-0 flex justify-center z-[110] pointer-events-none px-6"
                >
                    <div className="pointer-events-auto flex flex-col items-center gap-2">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs shadow-2xl backdrop-blur-xl"
                            >
                                <AlertCircle size={14} />
                                {error}
                            </motion.div>
                        )}
                        
                        <div className="bg-[#0a0a10]/95 backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_30px_rgba(107,91,230,0.15)] flex items-center gap-2 p-2 overflow-hidden relative">
                            {/* CANCEL BUTTON */}
                            <button
                                onClick={onCancel}
                                disabled={saving || showSavedAnimation}
                                className="h-11 px-5 rounded-xl text-xs font-bold text-white/40 hover:text-white/80 hover:bg-white/[0.05] transition-all flex items-center gap-2 disabled:opacity-30 relative z-10"
                            >
                                <motion.div animate={{ rotate: saving ? 180 : 0 }}>
                                    <RotateCcw size={14} />
                                </motion.div>
                                {cancelText}
                            </button>
                            
                            <div className="w-px h-6 bg-white/10 relative z-10" />
                            
                            {/* SAVE BUTTON */}
                            <button
                                onClick={onSave}
                                disabled={saving || showSavedAnimation}
                                className={`h-11 px-6 rounded-xl text-white font-bold text-xs flex items-center gap-2 transition-all duration-300 shadow-lg relative z-10 overflow-hidden ${
                                    showSavedAnimation 
                                        ? "bg-transparent" 
                                        : "bg-[#6b5be6] hover:bg-[#5a4bd4] shadow-[#6b5be6]/20 hover:-translate-y-0.5"
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {/* Green Circle Expansion Animation */}
                                <AnimatePresence>
                                    {showSavedAnimation && (
                                        <motion.div
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 4, opacity: 1 }}
                                            transition={{ duration: 0.4, ease: "easeOut" }}
                                            className="absolute inset-0 bg-emerald-500 rounded-full z-[-1] origin-center"
                                        />
                                    )}
                                </AnimatePresence>

                                <div className="flex items-center gap-2 relative z-10">
                                    {saving ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : showSavedAnimation ? (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 500, delay: 0.1 }}
                                        >
                                            <Check size={16} />
                                        </motion.div>
                                    ) : (
                                        <Save size={16} />
                                    )}
                                    <span>
                                        {saving ? "Kaydediliyor..." : showSavedAnimation ? "Kaydedildi!" : saveText}
                                    </span>
                                </div>
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

