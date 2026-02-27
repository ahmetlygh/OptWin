"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { TranslatableText } from "../shared/TranslatableText";
import { useState } from "react";
// import { generateScript } from "@/lib/script-generator";

export function ActionArea() {
    const { selectedFeatures, setWarningModalOpen, setRestoreModalOpen } = useOptWinStore();
    const [isGenerating, setIsGenerating] = useState(false);

    const hasSelections = selectedFeatures.size > 0;

    const handleGenerate = async () => {
        if (!hasSelections) {
            setWarningModalOpen(true);
            return;
        }
        setIsGenerating(true);

        // UX delay to simulate gathering selections before prompting restore point
        setTimeout(() => {
            setIsGenerating(false);
            setRestoreModalOpen(true);
        }, 800);
    };

    return (
        <div className={`fixed bottom-0 left-0 w-full p-6 pointer-events-none flex justify-center z-[100] transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${hasSelections ? "-translate-y-8 opacity-100" : "translate-y-full opacity-0"}`}>
            <div className="pointer-events-auto bg-[var(--card-bg)]/90 backdrop-blur-xl border border-[var(--border-color)] p-2.5 rounded-2xl shadow-[0_10px_40px_rgba(107,91,230,0.2)] flex items-center gap-4 transition-all">
                <div className="px-5 text-sm font-medium text-white hidden sm:block">
                    <span className="text-[var(--accent-color)] font-bold text-lg">{selectedFeatures.size}</span>
                    <span className="ml-1 text-[var(--text-secondary)]">
                        <TranslatableText en="optimizations selected" tr="optimizasyon seçildi" />
                    </span>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className={`glow-button h-12 px-8 rounded-xl text-white font-bold text-lg flex items-center gap-2 transition-all ${hasSelections
                        ? "bg-gradient-to-r from-[var(--accent-color)] to-[#a855f7] cursor-pointer hover:shadow-[0_0_25px_rgba(107,91,230,0.6)]"
                        : "bg-gradient-to-r from-slate-600 to-slate-700 cursor-not-allowed opacity-70"
                        }`}
                >
                    {isGenerating ? (
                        <>
                            <span className="material-symbols-outlined animate-spin text-xl">sync</span>
                            <TranslatableText en="Generating..." tr="Oluşturuluyor..." noSpan />
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-xl">terminal</span>
                            <TranslatableText en="Create Script" tr="Scripti Oluştur" noSpan />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
