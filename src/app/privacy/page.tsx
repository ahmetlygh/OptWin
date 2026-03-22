"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { useTranslation } from "@/i18n/useTranslation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeftIcon, ShieldIcon } from "@/components/shared/Icons";

interface PageSection {
    sectionOrder: number;
    title: string;
    content: string; // JSON array of paragraphs
    disclaimer: string | null;
    lastUpdated: string;
}

// Static fallback content — used until DB data loads
const FALLBACK: Record<string, { disclaimer?: string; lastUpdated: string; sections: { title: string; content: string[] }[] }> = {
    en: {
        lastUpdated: "March 2026",
        sections: [
            { title: "1. Introduction", content: ["OptWin is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our website and application."] },
            { title: "2. Information We Collect", content: ["We track anonymous page visit counts solely for homepage statistics. No IP addresses or device identifiers are stored. We use only essential cookies for theme and language preferences."] },
            { title: "3. How We Use Your Information", content: ["To display anonymous aggregated statistics. To remember your preferences. To generate optimization scripts. We do not sell or share your data."] },
            { title: "4. Generated Scripts", content: ["All scripts are generated on our server and sent directly to your browser. We do not store or analyze any generated scripts."] },
            { title: "5. Data Security", content: ["HTTPS encryption for all data. No personal data collected. Regular security audits."] },
            { title: "6. Contact Us", content: ["If you have questions, please contact us via the Contact page."] },
        ],
    },
};

export default function Privacy() {
    const lang = useOptWinStore((s) => s.lang);
    const { t } = useTranslation();
    const [dbData, setDbData] = useState<PageSection[] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/page-content?page=privacy&lang=${lang}`)
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data && Array.isArray(data) && data.length > 0) {
                    setDbData(data);
                } else {
                    setDbData(null);
                }
            })
            .catch(() => setDbData(null))
            .finally(() => setLoading(false));
    }, [lang]);

    // Use DB data if available, otherwise static fallback
    const fallback = FALLBACK[lang] || FALLBACK.en;
    const disclaimer = dbData?.[0]?.disclaimer || (lang !== "en" ? t["privacy.intro"] : undefined);
    const lastUpdated = dbData?.[0]?.lastUpdated || fallback.lastUpdated;

    const sections = dbData
        ? dbData.map(s => ({
            title: s.title,
            content: (() => { try { return JSON.parse(s.content); } catch { return [s.content]; } })() as string[]
        }))
        : fallback.sections;

    return (
        <div className="flex flex-col items-center w-full animate-fade-in-up mt-8 mb-16">
            <div className="w-full max-w-3xl px-4">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="size-16 rounded-2xl bg-[var(--accent-color)]/10 text-[var(--accent-color)] flex items-center justify-center mx-auto mb-4">
                        <ShieldIcon size={28} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[var(--text-primary)]">
                        {t["privacy.title"]}
                    </h1>
                    {disclaimer && (
                        <p className="text-sm text-amber-500/80 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2 inline-block mb-4">
                            {disclaimer}
                        </p>
                    )}
                </div>

                {/* Content loading state */}
                {loading ? (
                    <div className="space-y-6">
                        {[1,2,3].map(i => (
                            <div key={i} className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-2xl animate-pulse">
                                <div className="h-5 bg-[var(--border-color)] rounded w-1/3 mb-4" />
                                <div className="h-4 bg-[var(--border-color)] rounded w-full mb-2" />
                                <div className="h-4 bg-[var(--border-color)] rounded w-3/4" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Sections */}
                        <div className="space-y-6">
                            {sections.map((section, i) => (
                                <div key={i} className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-2xl">
                                    <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3">
                                        {section.title}
                                    </h2>
                                    <div className="space-y-2">
                                        {section.content.map((line, j) => (
                                            <p key={j} className={`text-sm leading-relaxed ${line.match(/^\d+\.\d+/) ? 'font-semibold text-[var(--text-primary)] mt-3' : 'text-[var(--text-secondary)]'}`}>
                                                {line}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Last updated */}
                        <p className="text-center text-xs text-[var(--text-secondary)] mt-6">
                            {t["privacy.title"] !== "privacy.title" ? `${t["privacy.intro"] ? "" : ""}` : ""}
                            Last Updated: {lastUpdated}
                        </p>
                    </>
                )}

                {/* Back link */}
                <div className="mt-6 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--border-color)]/50 text-[var(--text-primary)] font-semibold hover:bg-[var(--border-color)] transition-all"
                    >
                        <ArrowLeftIcon size={16} />
                        {t["contact.backHome"]}
                    </Link>
                </div>
            </div>
        </div>
    );
}
