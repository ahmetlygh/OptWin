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

    const hasSelections = Object.keys(selectedFeatures).length > 0;
    const shouldShow = hasSelections && !isDnsModalOpen;
    const hasDnsSelected = !!selectedFeatures["changeDNS"];

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
            className={`fixed bottom-0 left-0 right-0 px-3 sm:px-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] sm:pb-6 pointer-events-none flex justify-center z-[110] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${shouldShow ? "-translate-y-6 sm:-translate-y-4 opacity-100" : "translate-y-full opacity-0"}`}
        >
            <div className="pointer-events-auto w-auto max-w-[640px] bg-card/95 backdrop-blur-2xl border border-[var(--border-color)] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.35),0_0_30px_rgba(107,91,230,0.1)] flex items-center gap-2 sm:gap-1.5 p-2 sm:p-1.5 animate-scale-in">
                {/* Selection Counter */}
                <div className="h-12 sm:h-11 px-4 sm:px-4 flex items-center gap-1.5 sm:gap-2 rounded-xl bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/20 shrink-0">
                    <span className="text-[var(--accent-color)] font-black text-xl sm:text-lg leading-none tabular-nums">{Object.keys(selectedFeatures).length}</span>
                    <span className="text-[var(--accent-color)]/80 text-[10px] uppercase font-bold tracking-wider leading-none hidden sm:inline">
                        {t["action.selected"]}
                    </span>
                </div>

                {/* DNS Switcher — only visible when changeDNS feature is selected */}
                <div className={`overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] ${hasDnsSelected ? "max-w-[100px] sm:max-w-[200px] opacity-100 scale-100" : "max-w-0 opacity-0 scale-90"}`}>
                    <button
                        onClick={() => setDnsModalOpen(true)}
                        className="h-12 sm:h-11 flex items-center gap-2 px-3 sm:px-3 rounded-xl bg-[var(--border-color)]/50 hover:bg-[var(--border-color)] transition-all group shrink-0 whitespace-nowrap"
                    >
                        <div className="flex flex-col items-center justify-center leading-none">
                            <div className="size-8 sm:size-7 rounded-lg bg-[var(--accent-color)]/15 text-[var(--accent-color)] flex items-center justify-center group-hover:scale-110 transition-transform">
                                <GlobeIcon size={16} />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-wide text-[var(--text-secondary)] md:hidden mt-0.5">DNS</span>
                        </div>
                        <div className="flex-col items-start leading-tight hidden md:flex">
                            <span className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-tight opacity-70">DNS</span>
                            <span className="text-[11px] text-[var(--text-primary)] font-bold">{dnsDisplayName[dnsProvider] || dnsProvider}</span>
                        </div>
                    </button>
                </div>

                {/* Generate Button */}
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className={`h-12 sm:h-11 px-5 sm:px-7 rounded-xl text-white font-bold text-base sm:text-base flex items-center gap-2 sm:gap-2 transition-all duration-300 shrink-0 ${hasSelections
                        ? "bg-gradient-to-r from-[var(--accent-color)] to-[#a855f7] hover:shadow-[0_0_30px_rgba(107,91,230,0.5)] hover:-translate-y-0.5 cursor-pointer"
                        : "bg-gradient-to-r from-slate-600 to-slate-700 cursor-not-allowed opacity-70"
                        }`}
                >
                    {isGenerating ? (
                        <>
                            <LoaderIcon size={18} className="animate-spin" />
                            <span className="hidden sm:inline">{t["action.generating"]}</span>
                        </>
                    ) : (
                        <>
                            <TerminalIcon size={18} />
                            <span className="sm:hidden">{t["action.createShort"]}</span>
                            <span className="hidden sm:inline">{t["action.createScript"]}</span>
                        </>
                    )}
                </button>

                {/* Clear Button */}
                <button
                    onClick={clearFeatures}
                    className="size-12 sm:size-11 flex items-center justify-center rounded-xl bg-[var(--border-color)]/50 text-[var(--text-secondary)] hover:bg-red-500/15 hover:text-red-400 transition-colors duration-200 shrink-0"
                    title="Clear selections"
                >
                    <XIcon size={16} />
                </button>
            </div>
        </div>
    );
}
