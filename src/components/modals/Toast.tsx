"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { useEffect, useState } from "react";
import { CheckCircleIcon, AlertCircleIcon, XIcon } from "../shared/Icons";
import { AlertTriangle } from "lucide-react";

export function Toast() {
    const { toast, hideToast } = useOptWinStore();
    const [internalToast, setInternalToast] = useState(toast);
    const [phase, setPhase] = useState<"hidden" | "entering" | "visible" | "exiting">("hidden");

    useEffect(() => {
        if (toast) {
            setInternalToast(toast);
            setPhase("entering");
            requestAnimationFrame(() => setPhase("visible"));
        } else if (phase === "visible") {
            setPhase("exiting");
            const timer = setTimeout(() => {
                setPhase("hidden");
                setInternalToast(null);
            }, 400);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    if (phase === "hidden" || !internalToast) return null;
    const isVisible = phase === "visible";

    const getIconAndColor = () => {
        switch (internalToast.type) {
            case "success":
                return { Icon: CheckCircleIcon, color: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-500/30" };
            case "error":
                return { Icon: AlertCircleIcon, color: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/30" };
            case "warning":
            default:
                return { Icon: AlertTriangle, color: "text-[#FFDD00]", bg: "bg-[#FFDD00]/20", border: "border-[#FFDD00]/30" };
        }
    };

    const { Icon, color, bg, border } = getIconAndColor();

    return (
        <div
            className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[210] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-8 opacity-0 scale-95 pointer-events-none"}`}
        >
            <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.6)] bg-[var(--card-bg)]/95 border ${border} backdrop-blur-xl`}>
                <div className={`flex items-center justify-center size-8 rounded-full ${bg} ${color} animate-pop-in`}>
                    <Icon size={18} />
                </div>
                <div className="text-[var(--text-primary)] font-medium text-sm md:text-base">
                    {internalToast.message}
                </div>
                <button
                    onClick={hideToast}
                    className="ml-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 transition-colors duration-200"
                >
                    <XIcon size={16} />
                </button>
            </div>
        </div>
    );
}
