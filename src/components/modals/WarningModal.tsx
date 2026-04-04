"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { useTranslation } from "@/i18n/useTranslation";
import { useModalPhase } from "@/hooks/useModalPhase";
import { XIcon, AlertCircleIcon } from "../shared/Icons";

export function WarningModal() {
    const { isWarningModalOpen, setWarningModalOpen } = useOptWinStore();
    const { t } = useTranslation();
    const handleClose = () => setWarningModalOpen(false);
    const { isVisible, isMounted, phase, containerRef } = useModalPhase(isWarningModalOpen, handleClose);

    if (!isMounted) return null;

    return (
        <div
            ref={containerRef}
            className={`fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm ${isVisible ? 'modal-backdrop-enter' : phase === 'exiting' ? 'modal-backdrop-exit' : ''}`}
            onClick={handleClose}
        >
            <div
                className={`w-full max-w-md bg-(--card-bg) border border-(--border-color) rounded-3xl p-8 shadow-2xl relative overflow-hidden ${isVisible ? 'modal-content-enter' : phase === 'exiting' ? 'modal-content-exit' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none"></div>

                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-(--text-secondary) hover:text-(--text-primary) p-2 hover:rotate-90 transition-all duration-200"
                >
                    <XIcon size={20} />
                </button>

                <div className="flex flex-col items-center text-center gap-4 relative z-10">
                    <div className="size-16 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pop-in">
                        <AlertCircleIcon size={32} />
                    </div>

                    <h3 className="text-2xl font-bold text-(--text-primary) animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
                        {t["warning.title"]}
                    </h3>

                    <p className="text-(--text-secondary) leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                        {t["warning.description"]}
                    </p>

                    <button
                        onClick={handleClose}
                        className="mt-4 w-full py-3 bg-(--accent-color) hover:bg-(--accent-hover) text-white font-bold rounded-xl shadow-lg shadow-(--accent-color)/20 transition-all duration-200 hover:-translate-y-0.5 animate-fade-in-up"
                        style={{ animationDelay: "0.15s" }}
                    >
                        {t["warning.gotIt"]}
                    </button>
                </div>
            </div>
        </div>
    );
}
