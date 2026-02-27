"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { TranslatableText } from "../shared/TranslatableText";
import { useEffect, useState } from "react";

export function Toast() {
    const { toast, hideToast, lang } = useOptWinStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !toast || !toast.show) return null;

    const getIconAndColor = () => {
        switch (toast.type) {
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
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-fade-in-up">
            <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-[var(--card-bg)] border ${border} backdrop-blur-md`}>
                <div className={`flex items-center justify-center size-8 rounded-full ${bg} ${color}`}>
                    <span className="material-symbols-outlined text-lg">{icon}</span>
                </div>
                <div className="text-[var(--text-primary)] font-medium text-sm md:text-base">
                    {toast.message}
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
