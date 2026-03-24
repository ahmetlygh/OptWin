"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { useTranslation } from "@/i18n/useTranslation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeftIcon, BookOpenIcon } from "@/components/shared/Icons";

interface PageSection {
    sectionOrder: number;
    title: string;
    content: string;
    disclaimer: string | null;
    lastUpdated: string;
}

// No static fallback content anymore. Fetched fully from API.

export default function Terms() {
    const lang = useOptWinStore((s) => s.lang);
    const { t } = useTranslation();
    const [dbData, setDbData] = useState<PageSection[] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/page-content?page=terms&lang=${lang}`)
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

    // Use DB data only
    const disclaimer = dbData?.[0]?.disclaimer || undefined;
    const lastUpdated = dbData?.[0]?.lastUpdated || "2026";

    const sections = dbData
        ? dbData.map(s => ({
            title: s.title,
            content: (() => { try { return JSON.parse(s.content); } catch { return [s.content]; } })() as string[]
        }))
        : [];

    return (
        <div className="flex flex-col items-center w-full animate-fade-in-up mt-8 mb-16">
            <div className="w-full max-w-3xl px-4">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="size-16 rounded-2xl bg-[var(--accent-color)]/10 text-[var(--accent-color)] flex items-center justify-center mx-auto mb-4">
                        <BookOpenIcon size={28} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[var(--text-primary)]">
                        {t["terms.title"]}
                    </h1>
                    {disclaimer && (
                        <p className="text-sm text-amber-500/80 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2 inline-block mb-4">
                            {disclaimer}
                        </p>
                    )}
                </div>

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
                        <div className="space-y-6">
                            {sections.map((section, i) => (
                                <div key={i} className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-2xl">
                                    <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3">
                                        {section.title}
                                    </h2>
                                    <div className="space-y-2">
                                        {section.content.map((line, j) => (
                                            <p key={j} className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                                {line}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <p className="text-center text-xs text-[var(--text-secondary)] mt-6">
                            Last Updated: {lastUpdated}
                        </p>
                    </>
                )}

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
