"use client";

import { Settings } from "lucide-react";
import { useOptWinStore } from "@/store/useOptWinStore";

const LOADING_TEXT: Record<string, string> = {
    en: "Loading...",
    tr: "Yükleniyor...",
    de: "Wird geladen...",
    fr: "Chargement...",
    es: "Cargando...",
    zh: "加载中...",
    hi: "लोड हो रहा है...",
};

export default function Loading() {
    const lang = useOptWinStore((state) => state.lang);
    const text = LOADING_TEXT[lang] || LOADING_TEXT.en;

    return (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-[var(--bg-color)]">
            <div className="flex flex-col items-center gap-5">
                {/* Spinning gear — fast spin like maintenance overlay */}
                <div className="animate-spin" style={{ animationDuration: "2s" }}>
                    <Settings size={56} className="text-[var(--accent-color)] opacity-35" strokeWidth={1.5} />
                </div>
                <p className="text-sm font-medium text-[var(--text-secondary)] animate-pulse">
                    {text}
                </p>
            </div>
        </div>
    );
}
