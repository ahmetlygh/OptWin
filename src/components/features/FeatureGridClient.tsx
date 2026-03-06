"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { FeatureCard } from "./FeatureCard";
import { TranslatableText } from "../shared/TranslatableText";
import { Feature } from "@/types/feature";
import { CategoryIcon } from "../shared/Icons";

type CategoryData = {
    id: string;
    slug: string;
    icon: string | null;
    translations: { lang: string; name: string }[];
    features: any[];
};

export function FeatureGridClient({ categories }: { categories: CategoryData[] }) {
    const searchQuery = useOptWinStore(state => state.searchQuery);
    const query = searchQuery.toLowerCase().trim();

    const filteredCategories = categories.map(cat => {
        const filteredFeatures = cat.features.filter(f => {
            if (!query) return true;
            const titleEn = f.translations?.find((t: any) => t.lang === "en")?.title?.toLowerCase() || f.slug.toLowerCase();
            const titleTr = f.translations?.find((t: any) => t.lang === "tr")?.title?.toLowerCase() || f.slug.toLowerCase();
            const descEn = f.translations?.find((t: any) => t.lang === "en")?.desc?.toLowerCase() || "";
            const descTr = f.translations?.find((t: any) => t.lang === "tr")?.desc?.toLowerCase() || "";
            return titleEn.includes(query) || descEn.includes(query) || titleTr.includes(query) || descTr.includes(query) || f.slug.toLowerCase().includes(query);
        });
        return { ...cat, features: filteredFeatures };
    }).filter(cat => cat.features.length > 0);

    return (
        <div className="w-full space-y-12">
            {filteredCategories.length === 0 && query && (
                <div className="flex flex-col items-center justify-center p-12 text-center bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl animate-fade-in-up">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-secondary)] mb-4 opacity-50"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                        <TranslatableText en="No results found." tr="Sonuç bulunamadı." />
                    </h3>
                    <p className="text-[var(--text-secondary)]">
                        <TranslatableText en="We couldn't find any features matching your search query." tr="Arama kriterlerinize uyan bir özellik bulamadık." />
                    </p>
                </div>
            )}

            {filteredCategories.map((cat, catIdx) => {
                const nameEn = cat.translations.find(t => t.lang === "en")?.name || cat.slug;
                const nameTr = cat.translations.find(t => t.lang === "tr")?.name || cat.slug;

                return (
                    <section
                        key={`${cat.id}-${query}`}
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${catIdx * 0.06}s` }}
                        id={cat.slug}
                    >
                        <div className="flex items-center gap-3 mb-5">
                            <CategoryIcon icon={cat.icon} className="text-[var(--accent-color)]" />
                            <h3 className="text-xl font-bold text-[var(--text-primary)]">
                                <TranslatableText en={nameEn} tr={nameTr} />
                            </h3>
                            <div className="h-px flex-1 bg-[var(--border-color)]"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
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

