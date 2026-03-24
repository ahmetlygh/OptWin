"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { useTranslation } from "@/i18n/useTranslation";
import { useState } from "react";
import { useModalPhase } from "@/hooks/useModalPhase";
import { XIcon, CheckIcon, LoaderIcon, RestoreIcon } from "../shared/Icons";

export function RestorePointModal() {
    const {
        isRestoreModalOpen, setRestoreModalOpen, setScriptOverlayOpen,
        selectedFeatures, dnsProvider, lang, setPreviewCode, showToast
    } = useOptWinStore();
    const { t } = useTranslation();
    const [isGenerating, setIsGenerating] = useState(false);
    const handleClose = () => setRestoreModalOpen(false);
    const { isVisible, isMounted, phase, containerRef } = useModalPhase(isRestoreModalOpen, handleClose);

    if (!isMounted) return null;

    const generateAndOpenScript = async (createRestorePoint: boolean) => {
        setIsGenerating(true);
        try {
            const res = await fetch("/api/generate-script", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    features: Object.keys(selectedFeatures),
                    dnsProvider, lang, createRestorePoint
                })
            });
            const data = await res.json();
            
            if (res.status === 503 && data.maintenance) {
                window.location.reload();
                return;
            }

            if (data.script) {
                setPreviewCode(data.script);
                setRestoreModalOpen(false);
                setTimeout(() => setScriptOverlayOpen(true), 350);
                fetch("/api/stats?action=script", { method: "POST" }).catch(() => { });
            } else {
                showToast(t["restore.errorGenerate"], "error");
            }
        } catch {
            showToast(t["restore.errorDuring"], "error");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div
            ref={containerRef}
            className={`fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md ${isVisible ? 'modal-backdrop-enter' : phase === 'exiting' ? 'modal-backdrop-exit' : ''}`}
            onClick={handleClose}
        >
            <div
                className={`w-full max-w-lg bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden ${isVisible ? 'modal-content-enter' : phase === 'exiting' ? 'modal-content-exit' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--accent-color)]/10 rounded-full blur-[50px] pointer-events-none"></div>

                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-2 hover:rotate-90 transition-all duration-200"
                >
                    <XIcon size={20} />
                </button>

                <div className="flex flex-col items-center text-center gap-6 relative z-10">
                    <div className="size-20 rounded-full bg-[var(--accent-color)]/20 text-[var(--accent-color)] flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(108,92,231,0.3)] border border-[var(--accent-color)]/30 animate-pop-in">
                        <RestoreIcon size={36} />
                    </div>

                    <h3 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
                        {t["restore.title"]}
                    </h3>

                    <p className="text-[var(--text-secondary)] leading-relaxed text-base pb-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                        {t["restore.description"]}
                    </p>

                    <div className="flex flex-col sm:flex-row w-full gap-4 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
                        <button
                            onClick={() => generateAndOpenScript(true)}
                            disabled={isGenerating}
                            className={`flex-1 py-4 text-white font-bold text-lg rounded-xl shadow-[0_10px_20px_rgba(108,92,231,0.2)] hover:shadow-[0_15px_30px_rgba(108,92,231,0.4)] flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-0.5 ${isGenerating ? "bg-gray-600 opacity-70 cursor-not-allowed" : "bg-[var(--accent-color)] hover:bg-[var(--accent-hover)]"}`}
                        >
                            {isGenerating ? <LoaderIcon size={18} className="animate-spin" /> : <CheckIcon size={18} />}
                            {isGenerating ? t["restore.loading"] : t["restore.yesCreate"]}
                        </button>
                        <button
                            onClick={() => generateAndOpenScript(false)}
                            disabled={isGenerating}
                            className="flex-1 py-4 bg-transparent border-2 border-[var(--border-color)] hover:border-[var(--text-secondary)] text-[var(--text-primary)] font-bold text-lg rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all duration-300 hover:-translate-y-0.5"
                        >
                            {t["restore.noSkip"]}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
