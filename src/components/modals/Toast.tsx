"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { useEffect, useState } from "react";
import { CheckCircleIcon, AlertCircleIcon, XIcon } from "../shared/Icons";
import { AlertTriangle } from "lucide-react";

type ToastData = { show: boolean; message: string; type: "success" | "warning" | "error" };

export function Toast() {
    const { toast, hideToast } = useOptWinStore();
    const [internalToast, setInternalToast] = useState<ToastData | null>(toast);
    const [phase, setPhase] = useState<"hidden" | "visible" | "exiting">("hidden");
    const [prevToast, setPrevToast] = useState<ToastData | null>(toast);

    // Render-time derivation: detect toast appearing/disappearing
    if (toast && toast !== prevToast) {
        setPrevToast(toast);
        setInternalToast(toast);
        setPhase("visible");
    }
    if (!toast && prevToast) {
        setPrevToast(null);
        if (phase === "visible") {
            setPhase("exiting");
        }
    }

    // "exiting" → "hidden" after animation duration
    useEffect(() => {
        if (phase === "exiting") {
            const timer = setTimeout(() => {
                setPhase("hidden");
                setInternalToast(null);
            }, 400);
            return () => clearTimeout(timer);
        }
    }, [phase]);

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
            role="status"
            aria-live="polite"
            className={`fixed bottom-36 left-1/2 z-300 pointer-events-none ${phase === "visible" ? "animate-toast-in" : "animate-toast-out"}`}
        >
            <div className={`pointer-events-auto flex items-center gap-3 px-6 py-3.5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-(--card-bg)/95 border ${border} backdrop-blur-xl min-w-[300px] max-w-[90vw]`}>
                <div className={`flex items-center justify-center size-9 rounded-xl ${bg} ${color} shrink-0`}>
                    <Icon size={20} />
                </div>
                <div className="flex-1 text-(--text-primary) font-bold text-sm md:text-base leading-tight pr-2">
                    {internalToast.message}
                </div>
                <button
                    onClick={hideToast}
                    className="size-7 flex items-center justify-center rounded-lg text-(--text-secondary) hover:bg-(--text-secondary)/10 hover:text-(--text-primary) transition-all shrink-0"
                >
                    <XIcon size={14} />
                </button>
            </div>
            {/* Subtle glow effect behind toast */}
            <div className={`absolute -inset-4 ${bg} blur-3xl opacity-20 -z-10 rounded-full`} />
        </div>
    );
}
