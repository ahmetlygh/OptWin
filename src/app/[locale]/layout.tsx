import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { PublicShell } from "@/components/layout/PublicShell";
import { isMaintenanceMode } from "@/lib/maintenance";
import { headers, cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://optwin.tech";

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettings(["site_name", "site_description", "site_keywords"]);
    const siteName = settings.site_name || "OptWin";
    const description = settings.site_description || "Free, open-source browser-based Windows optimizer. Select from 60+ optimizations and generate a custom PowerShell script. No installation needed.";
    const keywordsStr = settings.site_keywords || "windows optimizer, powershell, system optimization, windows performance, pc optimizer, free optimizer";
    const keywords = keywordsStr.split(",").map(k => k.trim());

    return {
        title: `${siteName} - Windows System Optimizer`,
        description,
        keywords,
        metadataBase: new URL(siteUrl),
        alternates: {
            canonical: "/",
        },
        openGraph: {
            title: `${siteName} - Windows System Optimizer`,
            description,
            url: siteUrl,
            siteName,
            type: "website",
            locale: "en_US",
            images: [
                {
                    url: "/optwin.png",
                    width: 512,
                    height: 512,
                    alt: `${siteName} Logo`,
                },
            ],
        },
        twitter: {
            card: "summary",
            title: `${siteName} - Windows System Optimizer`,
            description,
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
    const headersList = await headers();
    const pathname = headersList.get("x-next-pathname") || "";
    const isAdmin = pathname.startsWith("/admin");
    const PUBLIC_KEYS = [
        "site_url", "site_name", "site_description", "site_keywords", "site_version", 
        "site_logo_url", "site_favicon_url", "github_url", "bmc_url", "contact_email", 
        "author_name", "author_url", "bmc_widget_enabled", "copyright_text", "copyright_year",
        "default_lang", "default_theme", "theme_primary_color",
    ];

    const [maintenance, session, settings] = await Promise.all([
        isAdmin ? Promise.resolve(false) : isMaintenanceMode(),
        auth(),
        getSettings(PUBLIC_KEYS)
    ]);
    const adminSession = session?.isAdmin ? {
        name: session.user?.name || null,
        image: session.user?.image || null,
    } : null;

    const cookieStore = await cookies();
    const finalLocale = locale || cookieStore.get("NEXT_LOCALE")?.value || settings.default_lang || "en";
    const theme = cookieStore.get("NEXT_THEME")?.value || settings.default_theme || "dark";

    const siteName = settings.site_name || "OptWin";
    const authorName = settings.author_name || "ahmetly_";
    const authorUrl = settings.author_url || "https://www.ahmetly.com";
    const siteDescription = settings.site_description || "Free, open-source browser-based Windows optimizer. Select from 60+ optimizations and generate a custom PowerShell script.";
    const themePrimaryColor = settings.theme_primary_color || null;

    return (
        <html lang={finalLocale} className={theme} suppressHydrationWarning>
            <body className={`${inter.variable} antialiased selection:bg-[#6c5ce7] selection:text-white theme-ready`}>
                {themePrimaryColor && (
                    <style dangerouslySetInnerHTML={{ __html: `:root { --accent-color: ${themePrimaryColor}; }` }} />
                )}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "SoftwareApplication",
                            "name": siteName,
                            "applicationCategory": "UtilitiesApplication",
                            "operatingSystem": "Windows",
                            "url": siteUrl,
                            "description": siteDescription,
                            "offers": {
                                "@type": "Offer",
                                "price": "0",
                                "priceCurrency": "USD",
                            },
                            "author": {
                                "@type": "Person",
                                "name": authorName,
                                "url": authorUrl,
                            },
                        }),
                    }}
                />
                <ClientProviders serverSettings={settings}>
                    {maintenance && !isAdmin ? children : (
                        <PublicShell serverMaintenance={maintenance} adminSession={adminSession} serverSettings={settings}>
                            {children}
                        </PublicShell>
                    )}
                </ClientProviders>
            </body>
        </html>
    );
}
