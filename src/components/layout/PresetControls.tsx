"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { TranslatableText } from "../shared/TranslatableText";

// Type definition missing in current context so recreating it here
// We pass fetched presets as props from Server to Client
type PresetDef = {
    id: string;
    slug: string; // e.g., 'recommended', 'gamer', etc.
    featureSlugs: string[];
    en: string; // name
    tr: string; // name
};

export function PresetControls({ presets, allFeatureSlugs }: { presets: PresetDef[], allFeatureSlugs: string[] }) {
    const { selectFeatures, clearFeatures, showToast, lang } = useOptWinStore();

    const handleApplyPreset = (featureSlugs: string[]) => {
        selectFeatures(featureSlugs);
    };

    const getPresetButtonStyle = (slug: string) => {
        switch (slug) {
            case "recommended":
                return "bg-gradient-to-br from-[#6c5ce7] to-[#a29bfe] border-[#6c5ce7] text-white hover:border-[#6c5ce7] hover:shadow-[0_0_15px_rgba(108,92,231,0.3)]";
            case "gamer":
                return "bg-gradient-to-br from-[#e84118] to-[#f39c12] border-[#e84118] text-white hover:border-[#c23616] hover:-translate-y-[2px] hover:shadow-[0_0_15px_rgba(232,65,24,0.4)]";
            default:
                return "border-[var(--border-color)] bg-transparent text-[var(--text-primary)] hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] hover:shadow-[0_0_15px_rgba(108,92,231,0.3)] hover:-translate-y-[2px]";
        }
    };

    return (
        <div className="flex flex-wrap gap-3 justify-center md:justify-center">
            {presets.map((preset) => (
                <button
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset.featureSlugs)}
                    className={`flex items-center gap-2 px-6 py-3 border-2 rounded-xl font-semibold transition-all duration-300 ${getPresetButtonStyle(preset.slug)}`}
                >
                    {preset.slug === "recommended" && <span className="material-symbols-outlined">star</span>}
                    {preset.slug === "gamer" && <span className="material-symbols-outlined">sports_esports</span>}
                    <TranslatableText en={preset.en} tr={preset.tr} noSpan />
                </button>
            ))}

            <button
                onClick={clearFeatures}
                className="flex items-center gap-2 px-6 py-3 border-2 border-[var(--border-color)] bg-transparent text-[var(--text-primary)] rounded-xl font-semibold transition-all duration-300 hover:border-red-500 hover:text-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:-translate-y-[2px]"
            >
                <span className="material-symbols-outlined">restart_alt</span>
                <TranslatableText en="Clear All" tr="Hepsini Sıfırla" noSpan />
            </button>

            {/* Select All */}
            <button
                onClick={() => {
                    const filtered = allFeatureSlugs.filter(f => f !== "highPerformance");
                    selectFeatures(filtered);
                    const msg = lang === "tr"
                        ? "Tüm ayarlar sisteminizde istenmeyen değişiklikler yapabilir. Lütfen çalıştırmadan önce inceleyin."
                        : "All settings may cause unwanted changes. Please review before running.";
                    showToast(msg, "warning");
                }}
                className="flex items-center gap-2 px-6 py-3 border-2 border-[var(--border-color)] bg-transparent text-[var(--text-primary)] rounded-xl font-semibold transition-all duration-300 hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] hover:shadow-[0_0_15px_rgba(108,92,231,0.3)] hover:-translate-y-[2px]"
            >
                <span className="material-symbols-outlined">done_all</span>
                <TranslatableText en="Select All" tr="Hepsini Seç" noSpan />
            </button>
        </div>
    );
}
