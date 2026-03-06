"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { TranslatableText } from "../shared/TranslatableText";
import { useState } from "react";
import { TerminalIcon, LoaderIcon, XIcon } from "../shared/Icons";

export function ActionArea() {
    const { selectedFeatures, setWarningModalOpen, setRestoreModalOpen, clearFeatures, isDnsModalOpen } = useOptWinStore();
    const [isGenerating, setIsGenerating] = useState(false);

    const hasSelections = selectedFeatures.size > 0;
    const shouldShow = hasSelections && !isDnsModalOpen;

    const handleGenerate = async () => {
        if (!hasSelections) {
            setWarningModalOpen(true);
            return;
        }
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            setRestoreModalOpen(true);
        }, 800);
    };

    return (
        <div
            className={`fixed bottom-0 left-0 w-full p-6 pointer-events-none flex justify-center z-[100] transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${shouldShow ? "-translate-y-8 opacity-100" : "translate-y-full opacity-0"}`}
        >
            <div className="pointer-events-auto bg-[var(--card-bg)]/90 backdrop-blur-xl border border-[var(--border-color)] p-2.5 rounded-2xl shadow-[0_10px_40px_rgba(107,91,230,0.2)] flex items-center gap-3 animate-scale-in">
                {/* Clear Selections Button */}
                <button
                    onClick={clearFeatures}
                    className="size-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-[var(--text-secondary)] hover:bg-white/10 hover:text-white hover:border-white/10 hover:rotate-90 transition-all duration-300 shrink-0"
                    title="Clear selections"
                >
                    <XIcon size={14} />
                </button>

                <div className="px-3 text-sm font-medium text-[var(--text-primary)] hidden sm:block">
                    <span className="text-[var(--accent-color)] font-bold text-lg">{selectedFeatures.size}</span>
                    <span className="ml-1 text-[var(--text-secondary)]">
                        <TranslatableText en="optimizations selected" tr="optimizasyon seçildi" />
                    </span>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className={`glow-button h-12 px-8 rounded-xl text-white font-bold text-lg flex items-center gap-2 transition-all duration-300 ${hasSelections
                        ? "bg-gradient-to-r from-[var(--accent-color)] to-[#a855f7] cursor-pointer hover:shadow-[0_0_25px_rgba(107,91,230,0.6)]"
                        : "bg-gradient-to-r from-slate-600 to-slate-700 cursor-not-allowed opacity-70"
                        }`}
                >
                    {isGenerating ? (
                        <>
                            <LoaderIcon size={20} className="animate-spin" />
                            <TranslatableText en="Generating..." tr="Oluşturuluyor..." noSpan />
                        </>
                    ) : (
                        <>
                            <TerminalIcon size={20} />
                            <TranslatableText en="Create Script" tr="Scripti Oluştur" noSpan />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
