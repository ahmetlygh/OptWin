"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { TranslatableText } from "../shared/TranslatableText";
import { useEffect, useState } from "react";

export function WarningModal() {
    const { isWarningModalOpen, setWarningModalOpen } = useOptWinStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !isWarningModalOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div
                className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-8 shadow-2xl relative overflow-hidden animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-[40px] pointer-events-none"></div>

                <button
                    onClick={() => setWarningModalOpen(false)}
                    className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-2"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                <div className="flex flex-col items-center text-center gap-4 relative z-10">
                    <div className="size-16 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center text-3xl mb-2 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                        <i className="fa-solid fa-circle-exclamation"></i>
                    </div>

                    <h3 className="text-2xl font-bold text-[var(--text-primary)]">
                        <TranslatableText en="No Features Selected" tr="Özellik Seçilmedi" />
                    </h3>

                    <p className="text-[var(--text-secondary)] leading-relaxed">
                        <TranslatableText
                            en="Please select at least one optimization feature from the list above before generating your custom script."
                            tr="Lütfen özel betiğinizi oluşturmadan önce yukarıdaki listeden en az bir optimizasyon özelliği seçin."
                        />
                    </p>

                    <button
                        onClick={() => setWarningModalOpen(false)}
                        className="mt-4 w-full py-3 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white font-bold rounded-xl transition-all shadow-lg shadow-[var(--accent-color)]/20"
                    >
                        <TranslatableText en="Got it" tr="Anladım" noSpan />
                    </button>
                </div>
            </div>
        </div>
    );
}
