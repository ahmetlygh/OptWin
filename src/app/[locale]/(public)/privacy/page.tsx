import Link from "next/link";
import { ArrowLeftIcon, ShieldIcon } from "@/components/shared/Icons";
import { getSettings } from "@/lib/settings";

export default async function Privacy({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    
    // Fallback to English if undefined
    const safeLocale = locale || 'en';
    
    // Fetch dynamically mapped localized content
    const settings = await getSettings([`privacy_policy_content_${safeLocale}`, `privacy_policy_title_${safeLocale}`, `last_updated_${safeLocale}`]);
    
    // Map fallbacks
    let title = settings[`privacy_policy_title_${safeLocale}`];
    let contentStr = settings[`privacy_policy_content_${safeLocale}`];
    let lastUpdated = settings[`last_updated_${safeLocale}`] || "2026";
    
    // Deep fallback layer mapping to default English if the target parameter is missing on DB DB
    if (!title || !contentStr) {
        const fallbacks = await getSettings(["privacy_policy_content_en", "privacy_policy_title_en"]);
        title = title || fallbacks["privacy_policy_title_en"] || "Privacy Policy";
        contentStr = contentStr || fallbacks["privacy_policy_content_en"] || "[(Section 1): No dynamic DB content provided.]";
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
                    <div className="size-16 rounded-2xl bg-(--accent-color)/10 text-(--accent-color) flex items-center justify-center mx-auto mb-4">
                        <ShieldIcon size={28} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-(--text-primary)">
                        {title}
                    </h1>
                </div>

                <div className="space-y-6">
                    <div className="bg-(--card-bg) border border-(--border-color) p-6 rounded-2xl">
                        <div className="space-y-4">
                            {blocks.map((line, j) => (
                                <p key={j} className={`text-sm leading-relaxed ${line.match(/^\d+\./) ? 'font-semibold text-(--text-primary) mt-3 text-lg' : 'text-(--text-secondary)'}`}>
                                    {line}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>

                <p className="text-center text-xs text-(--text-secondary) mt-6 opacity-70">
                    Last Updated: {lastUpdated}
                </p>

                <div className="mt-8 text-center">
                    <Link
                        href={`/${safeLocale}`}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-(--border-color)/50 text-(--text-primary) font-semibold hover:bg-(--border-color) transition-all"
                    >
                        <ArrowLeftIcon size={16} />
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
