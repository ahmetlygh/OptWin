import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { PublicShell } from "@/components/layout/PublicShell";
import { isMaintenanceMode } from "@/lib/maintenance";
import { headers } from "next/headers";
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
            icon: "/favicon.ico",
        },
    };
}

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const headersList = await headers();
    const pathname = headersList.get("x-next-pathname") || "";
    const isAdmin = pathname.startsWith("/admin");
    const [maintenance, session, settings] = await Promise.all([
        isAdmin ? Promise.resolve(false) : isMaintenanceMode(),
        auth(),
        getSettings(["site_name", "author_name", "author_url", "site_description"])
    ]);
    const adminSession = session?.isAdmin ? {
        name: session.user?.name || null,
        image: session.user?.image || null,
    } : null;

    const siteName = settings.site_name || "OptWin";
    const authorName = settings.author_name || "ahmetly_";
    const authorUrl = settings.author_url || "https://www.ahmetly.com";
    const siteDescription = settings.site_description || "Free, open-source browser-based Windows optimizer. Select from 60+ optimizations and generate a custom PowerShell script.";

    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.variable} antialiased selection:bg-[#6c5ce7] selection:text-white`}>
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
                <ClientProviders>
                    <PublicShell serverMaintenance={maintenance} adminSession={adminSession}>
                        {children}
                    </PublicShell>
                </ClientProviders>
            </body>
        </html>
    );
}
