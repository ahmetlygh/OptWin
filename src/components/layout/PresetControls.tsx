"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { useTranslation } from "@/i18n/useTranslation";
import { StarIcon, GamepadIcon, ResetIcon, CheckAllIcon, CheckIcon, GlobeIcon, XIcon } from "../shared/Icons";
import { useState } from "react";
import { DnsProvider } from "@/types/feature";

type PresetDef = {
    id: string;
    slug: string;
    featureSlugs: string[];
    translations: { lang: string; name: string }[];
};

export function PresetControls({ presets, allFeatureSlugs, dnsProviders }: { presets: PresetDef[], allFeatureSlugs: string[], dnsProviders: DnsProvider[] }) {
    const { selectFeatures, clearFeatures, showToast, dnsProvider, setDnsProvider, setDnsModalOpen, selectedFeatures } = useOptWinStore();
    const { t, lang } = useTranslation();

    // Simple booleans for DNS bar visibility and first reveal
    const [dnsOpen, setDnsOpen] = useState(false);
    const [dnsEverShown, setDnsEverShown] = useState(false);

    const hasDnsSelected = selectedFeatures.has("changeDNS");
    const showDnsBar = dnsEverShown && dnsOpen && hasDnsSelected;

    const handleApplyPreset = (featureSlugs: string[]) => {
        const validSlugs = featureSlugs.filter(s => allFeatureSlugs.includes(s));
        selectFeatures(validSlugs);
        if (!validSlugs.includes("changeDNS")) {
            setDnsOpen(false);
        }
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
        setDnsEverShown(true);
        setDnsOpen(true);
    };

    const dnsDisplayName: Record<string, string> = {
        default: "Default",
        cloudflare: "Cloudflare",
        google: "Google",
        opendns: "OpenDNS",
        quad9: "Quad9",
        adguard: "AdGuard",
    };

    return (
        <div className="flex flex-col items-center w-full animate-fade-in-up stagger-children">
            <div className="flex flex-col md:flex-row flex-wrap gap-3 justify-center items-center w-full md:w-auto px-4 md:px-0">
                {presets.map((preset) => (
                    <button
                        key={preset.id}
                        onClick={() => handleApplyPreset(preset.featureSlugs)}
                        className={`w-full max-w-[320px] md:max-w-none md:w-auto flex items-center justify-center gap-2 px-6 py-3 border-2 rounded-xl font-semibold transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:shadow-lg active:scale-95 ${getPresetButtonStyle(preset.slug)}`}
                    >
                        {getPresetIcon(preset.slug)}
                        <span className="whitespace-nowrap">
                            {t[`preset.${preset.slug}` as keyof typeof t] || preset.translations.find(tr => tr.lang === lang)?.name || preset.slug}
                        </span>
                    </button>
                ))}

                <button
                    onClick={() => { clearFeatures(); setDnsOpen(false); }}
                    className="w-full max-w-[320px] md:max-w-none md:w-auto flex items-center justify-center gap-2 px-6 py-3 border-2 border-[var(--border-color)] bg-transparent text-[var(--text-primary)] rounded-xl font-semibold hover:border-red-500 hover:text-red-500 hover:shadow-lg active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                >
                    <ResetIcon size={18} />
                    {t["preset.clearAll"]}
                </button>

                <button
                    onClick={handleSelectAll}
                    className="w-full max-w-[320px] md:max-w-none md:w-auto flex items-center justify-center gap-2 px-6 py-3 border-2 border-[var(--border-color)] bg-transparent text-[var(--text-primary)] rounded-xl font-semibold hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] hover:shadow-lg active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                >
                    <CheckAllIcon size={18} />
                    {t["preset.selectAll"]}
                </button>
            </div>

            {/* DNS Selector — full inline on PC; compact "DNS Seç" button on mobile that opens modal */}
            {dnsEverShown && (
                <div
                    className="w-full grid mt-3"
                    style={{
                        gridTemplateRows: showDnsBar ? '1fr' : '0fr',
                        opacity: showDnsBar ? 1 : 0,
                        transition: 'grid-template-rows 350ms cubic-bezier(0.4, 0, 0.2, 1), opacity 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                        pointerEvents: showDnsBar ? 'auto' : 'none',
                    }}
                >
                    <div className="overflow-hidden flex justify-center">
                        {/* Mobile: single "DNS Seç" button that opens modal */}
                        <button
                            onClick={() => setDnsModalOpen(true)}
                            className="md:hidden w-full flex items-center justify-center gap-3 px-5 py-3 bg-[var(--card-bg)] border border-[var(--accent-color)]/30 rounded-xl shadow-[0_0_20px_rgba(107,91,230,0.15)] active:scale-95 transition-all duration-200"
                        >
                            <GlobeIcon size={16} className="text-[var(--accent-color)]" />
                            <span className="text-sm font-bold text-[var(--text-primary)]">
                                {t["dns.select"] || "DNS Seç"}
                            </span>
                            <span className="text-xs font-bold text-[var(--accent-color)] bg-[var(--accent-color)]/10 px-2.5 py-1 rounded-lg">
                                {dnsDisplayName[dnsProvider] || dnsProvider}
                            </span>
                        </button>

                        {/* PC: full inline provider selector */}
                        <div className="hidden md:block w-auto max-w-full bg-[var(--card-bg)] border border-[var(--accent-color)]/30 rounded-xl p-1.5 shadow-[0_0_20px_rgba(107,91,230,0.15)]">
                            <div className="flex items-center gap-1.5">
                                <div className="flex items-center px-3 gap-2 shrink-0 h-10 border-r border-[var(--border-color)] mr-1">
                                    <GlobeIcon size={15} className="text-[var(--accent-color)]" />
                                    <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">DNS</span>
                                </div>

                                <div className="flex gap-1.5">
                                    <button
                                        onClick={() => setDnsProvider("default")}
                                        className={`flex items-center gap-2 px-3 h-10 rounded-lg text-sm font-bold transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] whitespace-nowrap ${dnsProvider === "default"
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
                                            className={`flex items-center gap-2 px-3 h-10 rounded-lg text-sm font-bold transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] whitespace-nowrap ${dnsProvider === p.slug
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
                </div>
            )}
        </div>
    );
}
