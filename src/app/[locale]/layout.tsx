import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { languageService } from "@/lib/languageService";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://optwin.tech";

/** OpenGraph locale mapping for all supported languages */
const OG_LOCALE_MAP: Record<string, string> = {
    en: "en_US",
    tr: "tr_TR",
    de: "de_DE",
    fr: "fr_FR",
    es: "es_ES",
    zh: "zh_CN",
    hi: "hi_IN",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const settings = await getSettings(["site_name", "site_description", "site_keywords", "site_favicon_url"]);
    
    // Get localized SEO Metadata from DB
    const languages = await languageService.getActiveLanguages();
    const currentLang = languages.find(l => l.code === locale) || languages.find(l => l.isDefault) || languages[0];
    
    const localizedSeo = currentLang?.seoMetadata || {};
    const siteName = settings.site_name || "OptWin";
    
    // Dynamic Metadata Generation Logic
    const globalTitle = localizedSeo.title || `${siteName} - Windows System Optimizer`;
    const description = localizedSeo.description || settings.site_description || "Free, open-source browser-based Windows optimizer.";
    const keywordsStr = localizedSeo.keywords || settings.site_keywords || "windows optimizer, powershell";
    const keywords = keywordsStr.split(",").map((k: string) => k.trim());

    const ogTitle = localizedSeo.ogTitle || globalTitle;
    const ogDesc = localizedSeo.ogDesc || description;
    const twitterCard = (localizedSeo.twitterCard as any) || "summary";

    // Build hreflang alternates from active languages
    const languageAlternates: Record<string, string> = {};
    for (const lang of languages) {
        languageAlternates[lang.code] = `${siteUrl}/${lang.code}`;
    }

    return {
        title: globalTitle,
        description,
        keywords,
        metadataBase: new URL(siteUrl),
        alternates: { 
            canonical: `${siteUrl}/${locale}`,
            languages: languageAlternates,
        },
        openGraph: {
            title: ogTitle,
            description: ogDesc,
            url: `${siteUrl}/${locale}`,
            siteName,
            type: "website",
            locale: OG_LOCALE_MAP[locale] || "en_US",
            images: [{ url: "/optwin.png", width: 512, height: 512, alt: `${siteName} Logo` }],
        },
        twitter: {
            card: twitterCard,
            title: ogTitle,
            description: ogDesc,
            images: ["/optwin.png"],
        },
        icons: {
            icon: settings.site_favicon_url || "/favicon.ico",
        },
    };
}

export default async function RootLayout({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}>) {
    const { locale } = await params;
    const PUBLIC_KEYS = [
        "site_url", "site_name", "site_description", "site_keywords", "site_version", 
        "site_logo_url", "site_favicon_url", "github_url", "bmc_url", "contact_email", 
        "author_name", "author_url", "bmc_widget_enabled", "copyright_text", "copyright_year",
        "default_lang", "default_theme", "theme_primary_color", "maintenanceMode"
    ];
    const settings = await getSettings(PUBLIC_KEYS);

    return (
        <>
            {settings.theme_primary_color && (
                <style dangerouslySetInnerHTML={{ __html: `:root { --accent-color: ${settings.theme_primary_color}; }` }} />
            )}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": settings.site_name || "OptWin",
                        "applicationCategory": "UtilitiesApplication",
                        "operatingSystem": "Windows",
                        "url": siteUrl,
                        "description": settings.site_description,
                        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
                        "author": { "@type": "Person", "name": settings.author_name || "ahmetly_", "url": settings.author_url || "https://www.ahmetly.com" },
                    }),
                }}
            />
            {children}
        </>
    );
}
