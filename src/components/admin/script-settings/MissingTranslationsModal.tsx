import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Languages, X, Loader2, Sparkles, Check, RefreshCw } from "lucide-react";

interface MissingTranslationsModalProps {
    open: boolean;
    onClose: () => void;
    missingTranslations: Record<string, string[]>;
    translateProgress: string;
    translatingMissing: boolean;
    onTranslateLang: (lang: string) => void;
    onTranslateAll: () => void;
}

export function MissingTranslationsModal({
    open,
    onClose,
    missingTranslations,
    translateProgress,
    translatingMissing,
    onTranslateLang,
    onTranslateAll,
}: MissingTranslationsModalProps) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (open && e.key === "Escape" && !translatingMissing) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, translatingMissing, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-black/70 backdrop-blur-md"
                        onClick={() => !translatingMissing && onClose()}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="relative bg-[#0d0d12]/95 backdrop-blur-2xl border border-white/6 rounded-2xl p-6 max-w-lg w-full shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden"
                    >
                        {/* ambient glow */}
                        <div className="absolute top-0 left-0 w-40 h-40 bg-[#6b5be6]/8 blur-3xl pointer-events-none" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                        <Languages size={18} className="text-amber-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-white uppercase tracking-tight">Eksik Çeviriler</h3>
                                        <p className="text-[10px] text-white/30 mt-0.5">EN baz alınarak hesaplanmıştır</p>
                                    </div>
                                </div>
                                <button onClick={() => !translatingMissing && onClose()} className="size-8 rounded-lg bg-white/3 hover:bg-white/6 flex items-center justify-center transition-colors">
                                    <X size={14} className="text-white/40" />
                                </button>
                            </div>

                            {translateProgress && (
                                <div className="mb-4">
                                    <div className="px-3 py-2.5 rounded-xl bg-[#6b5be6]/10 border border-[#6b5be6]/20 text-[11px] text-[#6b5be6] font-bold flex items-center gap-2 relative overflow-hidden">
                                        <RefreshCw size={12} className="animate-spin" />
                                        <span className="relative z-10">{translateProgress}</span>
                                        <motion.div 
                                            className="absolute left-0 top-0 bottom-0 bg-[#6b5be6]/10" 
                                            initial={{ width: "0%" }}
                                            animate={{ width: translateProgress.includes("✓") ? "100%" : "50%" }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2 max-h-[70vh] overflow-y-auto admin-scrollbar pr-1">
                                {Object.entries(missingTranslations).map(([lang, keys]) => (
                                    <div key={lang} className="flex items-center justify-between px-3.5 py-3 rounded-xl bg-white/2 border border-white/4 hover:bg-white/3 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[11px] font-mono font-black text-amber-400 uppercase w-6">{lang}</span>
                                            <span className="text-[11px] text-white/40">
                                                <b className="text-amber-400">{keys.length}</b> eksik etiket
                                            </span>
                                        </div>
                                        {keys.length === 0 ? (
                                            <span className="h-7 px-3 flex items-center gap-1.5 rounded-lg text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                                <Check size={11} /> Tamamlandı
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => onTranslateLang(lang)}
                                                disabled={translatingMissing}
                                                className={`h-7 px-3 flex items-center gap-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                                                    translatingMissing
                                                        ? "bg-white/2 border-white/5 text-white/30 cursor-not-allowed"
                                                        : "bg-[#6b5be6]/10 border-[#6b5be6]/20 text-[#6b5be6] hover:bg-[#6b5be6]/20"
                                                }`}
                                            >
                                                {translatingMissing ? <RefreshCw size={11} className="animate-spin" /> : <Sparkles size={11} />}
                                                Çevir
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {Object.keys(missingTranslations).length === 0 && (
                                    <div className="text-center py-8">
                                        <Check size={24} className="mx-auto text-emerald-400 mb-2" />
                                        <p className="text-[12px] text-emerald-400 font-bold">Tüm çeviriler tamamlanmış!</p>
                                    </div>
                                )}
                            </div>

                            {Object.keys(missingTranslations).length > 1 && (
                                <div className="mt-4 pt-4 border-t border-white/4">
                                    <button
                                        onClick={onTranslateAll}
                                        disabled={translatingMissing}
                                        className="w-full h-10 flex items-center justify-center gap-2 rounded-xl text-[11px] font-bold bg-[#6b5be6] hover:bg-[#5a4bd4] text-white transition-all shadow-lg shadow-[#6b5be6]/15 active:scale-[0.98] disabled:opacity-30"
                                    >
                                        <Sparkles size={13} />
                                        Tüm Dilleri Otomatik Çevir
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
