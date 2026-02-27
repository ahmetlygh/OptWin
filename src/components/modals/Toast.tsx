"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { TranslatableText } from "../shared/TranslatableText";
import { useEffect, useState } from "react";

export function Toast() {
    const { toast, hideToast, lang } = useOptWinStore();
    const [mounted, setMounted] = useState(false);
    const [internalToast, setInternalToast] = useState(toast);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (toast) {
            setInternalToast(toast);
            // Small delay to ensure render before animating in
            setTimeout(() => setIsVisible(true), 10);
        } else {
            setIsVisible(false);
        }
    }, [toast]);

    if (!mounted || !internalToast) return null;

    const getIconAndColor = () => {
        switch (internalToast.type) {
            case "success":
                return { icon: "check_circle", color: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-500/30" };
            case "error":
                return { icon: "error", color: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/30" };
            case "warning":
            default:
                return { icon: "warning", color: "text-[#FFDD00]", bg: "bg-[#FFDD00]/20", border: "border-[#FFDD00]/30" };
        }
    };

    const { icon, color, bg, border } = getIconAndColor();

    return (
        <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[110] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-8 opacity-0 scale-95 pointer-events-none"}`}>
            <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.6)] bg-[var(--card-bg)]/95 border ${border} backdrop-blur-xl`}>
                <div className={`flex items-center justify-center size-8 rounded-full ${bg} ${color}`}>
                    <span className="material-symbols-outlined text-lg">{icon}</span>
                </div>
                <div className="text-[var(--text-primary)] font-medium text-sm md:text-base">
                    {internalToast.message}
                </div>
                <button
                    onClick={hideToast}
                    className="ml-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-1"
                >
                    <span className="material-symbols-outlined text-lg">close</span>
                </button>
            </div>
        </div>
    );
}
