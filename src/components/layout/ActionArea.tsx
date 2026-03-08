"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { useTranslation } from "@/i18n/useTranslation";
import { useState } from "react";
import { TerminalIcon, LoaderIcon, XIcon, GlobeIcon } from "../shared/Icons";

export function ActionArea() {
    const {
        selectedFeatures,
        setWarningModalOpen,
        setRestoreModalOpen,
        clearFeatures,
        isDnsModalOpen,
        dnsProvider,
        setDnsModalOpen
    } = useOptWinStore();
    const { t } = useTranslation();
    const [isGenerating, setIsGenerating] = useState(false);

    const hasSelections = selectedFeatures.size > 0;
    const shouldShow = hasSelections && !isDnsModalOpen;
    const hasDnsSelected = selectedFeatures.has("changeDNS");

    const dnsDisplayName: Record<string, string> = {
        default: "Default",
        cloudflare: "Cloudflare",
        google: "Google",
        opendns: "OpenDNS",
        quad9: "Quad9",
        adguard: "AdGuard",
    };

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
            className={`fixed bottom-0 left-0 w-full p-4 sm:p-6 pointer-events-none flex justify-center z-[110] transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${shouldShow ? "-translate-y-6 opacity-100" : "translate-y-full opacity-0"}`}
        >
            <div className="pointer-events-auto bg-[var(--card-bg)] backdrop-blur-2xl border border-[var(--border-color)] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.35),0_0_30px_rgba(107,91,230,0.1)] flex items-center gap-1.5 p-1.5 animate-scale-in">
                {/* Selection Counter */}
                <div className="h-11 px-4 flex items-center gap-2 rounded-xl bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/20 shrink-0">
                    <span className="text-[var(--accent-color)] font-black text-lg leading-none tabular-nums">{selectedFeatures.size}</span>
                    <span className="text-[var(--accent-color)]/80 text-[10px] uppercase font-bold tracking-wider leading-none hidden sm:inline">
                        {t["action.selected"]}
                    </span>
                </div>

                {/* DNS Switcher — only visible when changeDNS feature is selected */}
                <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${hasDnsSelected ? "max-w-[200px] opacity-100 scale-100" : "max-w-0 opacity-0 scale-75"}`}>
                    <button
                        onClick={() => setDnsModalOpen(true)}
                        className="h-11 flex items-center gap-2 px-3 rounded-xl bg-[var(--border-color)]/50 hover:bg-[var(--border-color)] transition-all group shrink-0 whitespace-nowrap"
                    >
                        <div className="size-7 rounded-lg bg-[var(--accent-color)]/15 text-[var(--accent-color)] flex items-center justify-center group-hover:scale-110 transition-transform">
                            <GlobeIcon size={14} />
                        </div>
                        <div className="flex flex-col items-start leading-tight hidden md:flex">
                            <span className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-tight opacity-70">DNS</span>
                            <span className="text-[11px] text-[var(--text-primary)] font-bold">{dnsDisplayName[dnsProvider] || dnsProvider}</span>
                        </div>
                    </button>
                </div>

                {/* Generate Button */}
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className={`h-11 px-5 sm:px-7 rounded-xl text-white font-bold text-sm sm:text-base flex items-center gap-2 transition-all duration-300 shrink-0 ${hasSelections
                        ? "bg-gradient-to-r from-[var(--accent-color)] to-[#a855f7] hover:shadow-[0_0_30px_rgba(107,91,230,0.5)] hover:-translate-y-0.5 cursor-pointer"
                        : "bg-gradient-to-r from-slate-600 to-slate-700 cursor-not-allowed opacity-70"
                        }`}
                >
                    {isGenerating ? (
                        <>
                            <LoaderIcon size={16} className="animate-spin" />
                            <span className="hidden sm:inline">{t["action.generating"]}</span>
                        </>
                    ) : (
                        <>
                            <TerminalIcon size={16} />
                            <span className="hidden sm:inline">{t["action.createScript"]}</span>
                        </>
                    )}
                </button>

                {/* Clear Button */}
                <button
                    onClick={clearFeatures}
                    className="size-11 flex items-center justify-center rounded-xl bg-[var(--border-color)]/50 text-[var(--text-secondary)] hover:bg-red-500/20 hover:text-red-400 hover:rotate-90 transition-all duration-300 shrink-0"
                    title="Clear selections"
                >
                    <XIcon size={14} />
                </button>
            </div>
        </div>
    );
}
