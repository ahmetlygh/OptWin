"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { FeatureCard } from "./FeatureCard";
import { TranslatableText } from "../shared/TranslatableText";
import { useEffect, useState } from "react";
import { Feature } from "@/types/feature";

type CategoryData = {
    id: string;
    slug: string;
    icon: string | null;
    translations: { lang: string; name: string }[];
    features: any[];
};

export function FeatureGridClient({ categories }: { categories: CategoryData[] }) {
    const { searchQuery, lang } = useOptWinStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        // Return unfiltered version until mounted
        return (
            <div className="w-full space-y-12">
                {categories.map((cat) => {
                    if (cat.features.length === 0) return null;
                    const nameEn = cat.translations.find(t => t.lang === "en")?.name || cat.slug;
                    const nameTr = cat.translations.find(t => t.lang === "tr")?.name || cat.slug;

                    return (
                        <section key={cat.id} className="animate-fade-in-up" id={cat.slug}>
                            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-3">
                                {cat.icon && <i className={`fa-solid ${cat.icon} text-[var(--accent-color)]`}></i>}
                                <TranslatableText en={nameEn} tr={nameTr} />
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {cat.features.map(f => (
                                    <FeatureCard key={f.id} feature={f as unknown as Feature} />
                                ))}
                            </div>
                        </section>
                    );
                })}
            </div>
        );
    }

    const query = searchQuery.toLowerCase().trim();

    // Filter logic
    const filteredCategories = categories.map(cat => {
        const filteredFeatures = cat.features.filter(f => {
            if (!query) return true;

            const titleEn = f.translations?.find((t: any) => t.lang === "en")?.title?.toLowerCase() || f.slug.toLowerCase();
            const titleTr = f.translations?.find((t: any) => t.lang === "tr")?.title?.toLowerCase() || f.slug.toLowerCase();
            const descEn = f.translations?.find((t: any) => t.lang === "en")?.desc?.toLowerCase() || "";
            const descTr = f.translations?.find((t: any) => t.lang === "tr")?.desc?.toLowerCase() || "";

            // Check based on current language or both
            const matchesEn = titleEn.includes(query) || descEn.includes(query);
            const matchesTr = titleTr.includes(query) || descTr.includes(query);

            return matchesEn || matchesTr || f.slug.toLowerCase().includes(query);
        });

        return {
            ...cat,
            features: filteredFeatures
        };
    }).filter(cat => cat.features.length > 0);

    return (
        <div className="w-full space-y-12">
            {filteredCategories.length === 0 && query && (
                <div className="flex flex-col items-center justify-center p-12 text-center bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl animate-fade-in">
                    <i className="fa-solid fa-magnifying-glass text-4xl text-[var(--text-secondary)] mb-4 opacity-50"></i>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                        {lang === "tr" ? "Sonuç bulunamadı." : "No results found."}
                    </h3>
                    <p className="text-[var(--text-secondary)]">
                        {lang === "tr" ? "Arama kriterlerinize uyan bir özellik bulamadık." : "We couldn't find any features matching your search query."}
                    </p>
                </div>
            )}

            {filteredCategories.map((cat) => {
                const nameEn = cat.translations.find(t => t.lang === "en")?.name || cat.slug;
                const nameTr = cat.translations.find(t => t.lang === "tr")?.name || cat.slug;

                return (
                    <section key={`${cat.id}-${query}`} className="animate-fade-in-up" id={cat.slug}>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-3">
                            {cat.icon && <i className={`fa-solid ${cat.icon} text-[var(--accent-color)]`}></i>}
                            <TranslatableText en={nameEn} tr={nameTr} />
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {cat.features.map(f => (
                                <FeatureCard key={f.id} feature={f as unknown as Feature} />
                            ))}
                        </div>
                    </section>
                )
            })}
        </div>
    );
}
