"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { useTranslation } from "@/i18n/useTranslation";
import { TranslatableText } from "../shared/TranslatableText";
import { StarIcon, GamepadIcon, ResetIcon, CheckAllIcon, CheckIcon, GlobeIcon, XIcon } from "../shared/Icons";
import { useState, useRef, useEffect } from "react";
import { DnsProvider } from "@/types/feature";

type PresetDef = {
    id: string;
    slug: string;
    featureSlugs: string[];
    translations: { lang: string; name: string }[];
};

export function PresetControls({ presets, allFeatureSlugs, dnsProviders }: { presets: PresetDef[], allFeatureSlugs: string[], dnsProviders: DnsProvider[] }) {
    const { selectFeatures, clearFeatures, showToast, dnsProvider, setDnsProvider } = useOptWinStore();
    const { t, lang } = useTranslation();

    // Simple boolean: should DNS bar be open?
    const [dnsOpen, setDnsOpen] = useState(false);
    // Has the bar ever been shown? (prevents enter animation on first mount)
    const [dnsEverShown, setDnsEverShown] = useState(false);
    // Controls the actual CSS state (separated by 1 frame for enter animation)
    const [dnsAnimated, setDnsAnimated] = useState(false);
    const frameRef = useRef<number>(0);

    useEffect(() => {
        if (dnsOpen) {
            setDnsEverShown(true);
            // Delay 1 frame so the element mounts at opacity:0 first, then transitions to opacity:1
            frameRef.current = requestAnimationFrame(() => {
                frameRef.current = requestAnimationFrame(() => {
                    setDnsAnimated(true);
                });
            });
        } else {
            setDnsAnimated(false);
        }
        return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
    }, [dnsOpen]);

    const handleApplyPreset = (featureSlugs: string[]) => {
        selectFeatures(featureSlugs);
        setDnsOpen(false);
    };

    const getPresetButtonStyle = (slug: string) => {
        switch (slug) {
            case "recommended":
                return "bg-gradient-to-br from-[#6c5ce7] to-[#a29bfe] border-[#6c5ce7] text-white hover:border-[#6c5ce7] hover:shadow-[0_0_15px_rgba(108,92,231,0.3)]";
            case "gamer":
                return "bg-gradient-to-br from-[#e84118] to-[#f39c12] border-[#e84118] text-white hover:border-[#c23616] hover:shadow-[0_0_15px_rgba(232,65,24,0.4)]";
            default:
                return "border-[var(--border-color)] bg-transparent text-[var(--text-primary)] hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] hover:shadow-[0_0_15px_rgba(108,92,231,0.3)]";
        }
    };

    const getPresetIcon = (slug: string) => {
        switch (slug) {
            case "recommended": return <StarIcon size={18} />;
            case "gamer": return <GamepadIcon size={18} />;
            default: return null;
        }
    };

    const handleSelectAll = () => {
        const filtered = allFeatureSlugs.filter(f => f !== "highPerformance");
        selectFeatures(filtered);
        showToast(t["preset.selectAllWarning"], "warning");
        setDnsOpen(true);
    };

    return (
        <div className="flex flex-col w-full animate-fade-in-up stagger-children">
            <div className="flex flex-col md:flex-row flex-wrap gap-3 justify-center items-center">
                {presets.map((preset) => (
                    <button
                        key={preset.id}
                        onClick={() => handleApplyPreset(preset.featureSlugs)}
                        className={`w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 border-2 rounded-xl font-semibold transition-all duration-300 hover:-translate-y-[2px] active:scale-95 ${getPresetButtonStyle(preset.slug)}`}
                    >
                        {getPresetIcon(preset.slug)}
                        <span className="whitespace-nowrap">
                            {t[`preset.${preset.slug}` as keyof typeof t] || preset.translations.find(tr => tr.lang === lang)?.name || preset.slug}
                        </span>
                    </button>
                ))}

                <button
                    onClick={() => { clearFeatures(); setDnsOpen(false); }}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 border-2 border-[var(--border-color)] bg-transparent text-[var(--text-primary)] rounded-xl font-semibold hover:border-red-500 hover:text-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:-translate-y-[2px] active:scale-95 transition-all duration-300"
                >
                    <ResetIcon size={18} />
                    {t["preset.clearAll"]}
                </button>

                <button
                    onClick={handleSelectAll}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 border-2 border-[var(--border-color)] bg-transparent text-[var(--text-primary)] rounded-xl font-semibold hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] hover:shadow-[0_0_15px_rgba(108,92,231,0.3)] hover:-translate-y-[2px] active:scale-95 transition-all duration-300"
                >
                    <CheckAllIcon size={18} />
                    {t["preset.selectAll"]}
                </button>
            </div>

            {/* 
                DNS Selector — ALWAYS in DOM once shown, uses CSS grid-template-rows for smooth height animation.
                This approach guarantees transitions work because the element never unmounts.
            */}
            {dnsEverShown && (
                <div
                    className="w-full grid mt-3"
                    style={{
                        gridTemplateRows: dnsAnimated ? '1fr' : '0fr',
                        opacity: dnsAnimated ? 1 : 0,
                        transition: 'grid-template-rows 300ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 250ms ease-out',
                        pointerEvents: dnsAnimated ? 'auto' : 'none',
                    }}
                >
                    <div className="overflow-hidden flex justify-center">
                        <div className="max-w-full flex items-center bg-[var(--card-bg)] border border-[var(--accent-color)]/30 rounded-xl p-1.5 shadow-[0_0_20px_rgba(107,91,230,0.15)] overflow-x-auto snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            <div className="flex items-center px-3 border-r border-[var(--border-color)] mr-1.5 gap-2 shrink-0 h-10">
                                <GlobeIcon size={16} className="text-[var(--accent-color)]" />
                                <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                                    DNS
                                </span>
                            </div>

                            <div className="flex gap-1.5 shrink-0">
                                <button
                                    onClick={() => setDnsProvider("default")}
                                    className={`flex items-center gap-2 px-3 h-10 rounded-lg text-sm font-bold transition-all whitespace-nowrap snap-center ${dnsProvider === "default"
                                        ? "bg-[var(--accent-color)] text-white shadow-md shadow-[var(--accent-color)]/30"
                                        : "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)]"}
                                    `}
                                >
                                    <div className={`flex items-center justify-center w-3.5 h-3.5 rounded-full border ${dnsProvider === "default" ? "border-white" : "border-[var(--text-secondary)]"}`}>
                                        {dnsProvider === "default" && <CheckIcon size={8} strokeWidth={4} />}
                                    </div>
                                    {t["preset.default"]}
                                </button>

                                {dnsProviders.map(p => (
                                    <button
                                        key={p.slug}
                                        onClick={() => setDnsProvider(p.slug)}
                                        className={`flex items-center gap-2 px-3 h-10 rounded-lg text-sm font-bold transition-all whitespace-nowrap snap-center ${dnsProvider === p.slug
                                            ? "bg-[var(--accent-color)] text-white shadow-md shadow-[var(--accent-color)]/30"
                                            : "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)]"}
                                        `}
                                    >
                                        <div className={`flex items-center justify-center w-3.5 h-3.5 rounded-full border ${dnsProvider === p.slug ? "border-white" : "border-[var(--text-secondary)]"}`}>
                                            {dnsProvider === p.slug && <CheckIcon size={8} strokeWidth={4} />}
                                        </div>
                                        {p.name}
                                    </button>
                                ))}
                            </div>

                            {/* Close button */}
                            <div className="flex items-center pl-1.5 ml-1.5 border-l border-[var(--border-color)] shrink-0">
                                <button
                                    onClick={() => setDnsOpen(false)}
                                    className="size-8 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-red-500/15 hover:text-red-400 transition-colors duration-200"
                                    title="Close DNS"
                                >
                                    <XIcon size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
