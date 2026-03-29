import Link from "next/link";
import { ArrowLeftIcon, BookOpenIcon } from "@/components/shared/Icons";
import { getSettings } from "@/lib/settings";

export default async function Terms({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    
    // Fallback to English if undefined
    const safeLocale = locale || 'en';
    
    // Fetch dynamically mapped localized content
    const settings = await getSettings([`terms_of_service_content_${safeLocale}`, `terms_of_service_title_${safeLocale}`, `last_updated_${safeLocale}`]);
    
    // Map fallbacks
    let title = settings[`terms_of_service_title_${safeLocale}`];
    let contentStr = settings[`terms_of_service_content_${safeLocale}`];
    let lastUpdated = settings[`last_updated_${safeLocale}`] || "2026";
    
    // Deep fallback layer mapping to default English if the target parameter is missing on DB DB
    if (!title || !contentStr) {
        const fallbacks = await getSettings(["terms_of_service_content_en", "terms_of_service_title_en"]);
        title = title || fallbacks["terms_of_service_title_en"] || "Terms of Service";
        contentStr = contentStr || fallbacks["terms_of_service_content_en"] || "[(Section 1): No dynamic DB content provided.]";
    }
    
    // Parse JSON arrays for paragraph blocks or fallback to splitting newlines gracefully
    let blocks: string[] = [];
    try {
        blocks = JSON.parse(contentStr);
        if (!Array.isArray(blocks)) blocks = [contentStr];
    } catch {
        blocks = contentStr.split('\n').filter((b: string) => b.trim() !== "");
    }

    return (
        <div className="flex flex-col items-center w-full animate-fade-in-up mt-8 mb-16 px-4">
            <div className="w-full max-w-3xl">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="size-16 rounded-2xl bg-[var(--accent-color)]/10 text-[var(--accent-color)] flex items-center justify-center mx-auto mb-4">
                        <BookOpenIcon size={28} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[var(--text-primary)]">
                        {title}
                    </h1>
                </div>

                <div className="space-y-6">
                    <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-2xl">
                        <div className="space-y-4">
                            {blocks.map((line, j) => (
                                <p key={j} className={`text-sm leading-relaxed ${line.match(/^\d+\./) ? 'font-semibold text-[var(--text-primary)] mt-3 text-lg' : 'text-[var(--text-secondary)]'}`}>
                                    {line}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>

                <p className="text-center text-xs text-[var(--text-secondary)] mt-6 opacity-70">
                    Last Updated: {lastUpdated}
                </p>

                <div className="mt-8 text-center">
                    <Link
                        href={`/${safeLocale}`}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--border-color)]/50 text-[var(--text-primary)] font-semibold hover:bg-[var(--border-color)] transition-all"
                    >
                        <ArrowLeftIcon size={16} />
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
