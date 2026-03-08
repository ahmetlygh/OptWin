"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { useEffect, useState } from "react";
import { CheckCircleIcon, AlertCircleIcon, XIcon } from "../shared/Icons";
import { AlertTriangle } from "lucide-react";

export function Toast() {
    const { toast, hideToast } = useOptWinStore();
    const [internalToast, setInternalToast] = useState(toast);
    const [phase, setPhase] = useState<"hidden" | "visible" | "exiting">("hidden");

    useEffect(() => {
        if (toast) {
            setInternalToast(toast);
            setPhase("visible");
        } else if (phase === "visible") {
            setPhase("exiting");
            const timer = setTimeout(() => {
                setPhase("hidden");
                setInternalToast(null);
            }, 400); // Match animation duration
            return () => clearTimeout(timer);
        }
    }, [toast]);

    if (phase === "hidden" || !internalToast) return null;

    const getIconAndColor = () => {
        switch (internalToast.type) {
            case "success":
                return { Icon: CheckCircleIcon, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
            case "error":
                return { Icon: AlertCircleIcon, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" };
            case "warning":
            default:
                return { Icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" };
        }
    };

    const { Icon, color, bg, border } = getIconAndColor();

    return (
        <div
            className={`fixed bottom-36 left-1/2 z-[300] pointer-events-none ${phase === "visible" ? "animate-toast-in" : "animate-toast-out"}`}
        >
            <div className={`pointer-events-auto flex items-center gap-3 px-6 py-3.5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-[var(--card-bg)]/95 border ${border} backdrop-blur-xl min-w-[300px] max-w-[90vw]`}>
                <div className={`flex items-center justify-center size-9 rounded-xl ${bg} ${color} shrink-0`}>
                    <Icon size={20} />
                </div>
                <div className="flex-1 text-[var(--text-primary)] font-bold text-sm md:text-base leading-tight pr-2">
                    {internalToast.message}
                </div>
                <button
                    onClick={hideToast}
                    className="size-7 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--text-secondary)]/10 hover:text-[var(--text-primary)] transition-all shrink-0"
                >
                    <XIcon size={14} />
                </button>
            </div>
            {/* Subtle glow effect behind toast */}
            <div className={`absolute -inset-4 ${bg} blur-3xl opacity-20 -z-10 rounded-full`} />
        </div>
    );
}
