"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { TranslatableText } from "../shared/TranslatableText";
import { useEffect, useState } from "react";

export function RestorePointModal() {
    const {
        isRestoreModalOpen, setRestoreModalOpen, setScriptOverlayOpen,
        selectedFeatures, dnsProvider, lang, setPreviewCode, showToast
    } = useOptWinStore();
    const [mounted, setMounted] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !isRestoreModalOpen) return null;

    const generateAndOpendoScript = async (createRestorePoint: boolean) => {
        setIsGenerating(true);
        try {
            const res = await fetch("/api/generate-script", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    features: Array.from(selectedFeatures),
                    dnsProvider,
                    lang,
                    createRestorePoint
                })
            });

            const data = await res.json();
            if (data.script) {
                setPreviewCode(data.script);
                setRestoreModalOpen(false);
                setScriptOverlayOpen(true);

                // Register stat for script generation
                fetch("/api/stats?action=script", { method: "POST" }).catch(() => console.error("Stat error"));
            } else {
                showToast("Failed to generate script", "error");
            }
        } catch (err) {
            showToast("Error during script generation", "error");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleYes = () => generateAndOpendoScript(true);
    const handleNo = () => generateAndOpendoScript(false);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div
                className="w-full max-w-lg bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--accent-color)]/10 rounded-full blur-[50px] pointer-events-none"></div>

                <button
                    onClick={() => setRestoreModalOpen(false)}
                    className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-2"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                <div className="flex flex-col items-center text-center gap-6 relative z-10">
                    <div className="size-20 rounded-full bg-[var(--accent-color)]/20 text-[var(--accent-color)] flex items-center justify-center text-4xl mb-2 shadow-[0_0_20px_rgba(108,92,231,0.3)] border border-[var(--accent-color)]/30">
                        <i className="fa-solid fa-clock-rotate-left"></i>
                    </div>

                    <h3 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
                        <TranslatableText en="Create Restore Point?" tr="Geri Yükleme Noktası?" />
                    </h3>

                    <p className="text-[var(--text-secondary)] leading-relaxed text-lg pb-4">
                        <TranslatableText
                            en="Do you want to create a System Restore Point before applying the selected optimizations? This is highly recommended for safety."
                            tr="Seçilen optimizasyonları uygulamadan önce bir Sistem Geri Yükleme Noktası oluşturmak ister misiniz? Güvenlik için şiddetle tavsiye edilir."
                        />
                    </p>

                    <div className="flex flex-col sm:flex-row w-full gap-4">
                        <button
                            onClick={handleYes}
                            disabled={isGenerating}
                            className={`flex-1 py-4 text-white font-bold text-lg rounded-xl transition-all shadow-[0_10px_20px_rgba(108,92,231,0.2)] hover:shadow-[0_15px_30px_rgba(108,92,231,0.4)] flex items-center justify-center gap-2 ${isGenerating ? "bg-gray-600 opacity-70 cursor-not-allowed" : "bg-[var(--accent-color)] hover:bg-[var(--accent-hover)]"}`}
                        >
                            {isGenerating ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-check"></i>}
                            <TranslatableText en={isGenerating ? "Loading..." : "Yes, Create"} tr={isGenerating ? "Oluşturuluyor..." : "Evet, Oluştur"} noSpan />
                        </button>
                        <button
                            onClick={handleNo}
                            disabled={isGenerating}
                            className="flex-1 py-4 bg-transparent border-2 border-[var(--border-color)] hover:border-[var(--text-secondary)] text-[var(--text-primary)] font-bold text-lg rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <TranslatableText en="No, Skip" tr="Hayır, Atla" noSpan />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
