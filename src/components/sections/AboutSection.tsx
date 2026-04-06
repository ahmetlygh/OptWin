"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { useOptWinStore } from "@/store/useOptWinStore";
import { ShieldIcon, CodeIcon, EyeOffIcon, HeartIcon } from "../shared/Icons";
import type { TranslationKeys } from "@/i18n/locales/en";

interface ValueCardProps {
    icon: React.ReactNode;
    titleKey: TranslationKeys;
    descKey: TranslationKeys;
    accentColor: string;
}

function ValueCard({ icon, titleKey, descKey, accentColor }: ValueCardProps) {
    const { t } = useTranslation();

    return (
        <div className={`bg-(--card-bg)/80 backdrop-blur-sm border border-(--border-color) p-6 rounded-lg hover:-translate-y-1 group shadow-sm hover:shadow-md relative overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]`}>
            <div className={`absolute top-0 right-0 w-24 h-24 ${accentColor}/10 rounded-full blur-2xl pointer-events-none group-hover:${accentColor}/20`} style={{ transition: "background-color 0.3s" }}></div>
            <div className={`w-12 h-12 rounded-lg ${accentColor}/20 text-${accentColor.replace('bg-', '')} flex items-center justify-center mb-4 shadow-inner ring-1 ${accentColor}/50`}>
                {icon}
            </div>
            <h3 className="text-lg font-semibold text-(--text-primary) mb-2 tracking-tight">{t[titleKey]}</h3>
            <p className="text-(--text-secondary) leading-relaxed text-xs">{t[descKey]}</p>
        </div>
    );
}

const VALUES = [
    {
        icon: <ShieldIcon size={22} />,
        titleKey: "about.safeSecure" as TranslationKeys,
        descKey: "about.safeSecureDesc" as TranslationKeys,
        bgClass: "bg-blue-500",
        textClass: "text-blue-400",
        ringClass: "ring-blue-500/50",
    },
    {
        icon: <CodeIcon size={22} />,
        titleKey: "about.openSource" as TranslationKeys,
        descKey: "about.openSourceDesc" as TranslationKeys,
        bgClass: "bg-emerald-500",
        textClass: "text-emerald-400",
        ringClass: "ring-emerald-500/50",
    },
    {
        icon: <EyeOffIcon size={22} />,
        titleKey: "about.transparent" as TranslationKeys,
        descKey: "about.transparentDesc" as TranslationKeys,
        bgClass: "bg-(--accent-color)",
        textClass: "text-(--accent-color)",
        ringClass: "ring-(--accent-color)/50",
    },
] as const;

export function AboutSection() {
    const { t } = useTranslation();
    const { setSupportModalOpen } = useOptWinStore();

    return (
        <section id="about" className="w-full flex flex-col items-center gap-10 mt-12 mb-6 animate-fade-in-up">
            {/* Header — Centered */}
            <div className="max-w-2xl text-center space-y-3">
                <h2 className="text-3xl md:text-4xl font-semibold text-(--text-primary) tracking-tight">
                    {t["about.title"]}
                </h2>
                <p className="text-base text-(--text-secondary) leading-relaxed font-medium">
                    {t["about.description"]}
                </p>
            </div>

            {/* Values Grid — DRY via map */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                {VALUES.map((v, i) => (
                    <div
                        key={i}
                        className="h-full flex flex-col bg-(--card-bg)/80 backdrop-blur-sm border border-(--border-color) p-6 rounded-lg hover:-translate-y-1 group shadow-sm hover:shadow-md relative overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 ${v.bgClass}/10 rounded-full blur-2xl pointer-events-none group-hover:${v.bgClass}/20`} style={{ transition: "background-color 0.3s" }}></div>
                        <div className={`w-12 h-12 rounded-lg ${v.bgClass}/20 ${v.textClass} flex items-center justify-center mb-4 shadow-inner ring-1 ${v.ringClass}`}>
                            {v.icon}
                        </div>
                        <h3 className="text-lg font-semibold text-(--text-primary) mb-2 tracking-tight">{t[v.titleKey]}</h3>
                        <p className="text-(--text-secondary) leading-relaxed text-xs grow">{t[v.descKey]}</p>
                    </div>
                ))}
            </div>

            {/* Support CTA */}
            <div id="support" className="w-full max-w-md">
                <button
                    onClick={() => setSupportModalOpen(true)}
                    className="w-full group bg-linear-to-r from-(--accent-color)/10 to-pink-500/10 border border-(--border-color) hover:border-(--accent-color)/40 rounded-lg p-6 text-center flex flex-col items-center gap-3 hover:-translate-y-1 hover:shadow-md relative overflow-hidden cursor-pointer hover:bg-white/2 active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
                >
                    <div className="absolute inset-0 bg-linear-to-r from-(--accent-color)/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="size-12 rounded-full bg-pink-500/15 text-pink-500 flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                        <HeartIcon size={22} />
                    </div>
                    <span className="text-lg font-semibold text-(--text-primary) relative z-10">{t["support.title"]}</span>
                    <span className="text-xs text-(--text-secondary) relative z-10 max-w-xs">{t["support.description"]}</span>
                </button>
            </div>
        </section>
    );
}
