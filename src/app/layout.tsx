import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { PublicShell } from "@/components/layout/PublicShell";
import { isMaintenanceMode } from "@/lib/maintenance";
import { headers } from "next/headers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
    title: "OptWin - Windows System Optimizer",
    description: "Free, open-source browser-based Windows optimizer. Select from 60+ optimizations and generate a custom PowerShell script. No installation needed.",
    keywords: ["windows optimizer", "powershell", "system optimization", "windows performance", "pc optimizer", "free optimizer"],
    metadataBase: new URL("https://optwin.tech"),
    alternates: {
        canonical: "/",
    },
    openGraph: {
        title: "OptWin - Windows System Optimizer",
        description: "Free, open-source Windows optimizer. 60+ optimizations, custom PowerShell scripts, no installation.",
        url: "https://optwin.tech",
        siteName: "OptWin",
        type: "website",
        locale: "en_US",
        images: [
            {
                url: "/optwin.png",
                width: 512,
                height: 512,
                alt: "OptWin Logo",
            },
        ],
    },
    twitter: {
        card: "summary",
        title: "OptWin - Windows System Optimizer",
        description: "Free, open-source Windows optimizer. 60+ optimizations, custom PowerShell scripts.",
        images: ["/optwin.png"],
    },
    icons: {
        icon: "/favicon.ico",
    },
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const headersList = await headers();
    const pathname = headersList.get("x-next-pathname") || "";
    const isAdmin = pathname.startsWith("/admin");
    const maintenance = isAdmin ? false : await isMaintenanceMode();

    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.variable} antialiased selection:bg-[#6c5ce7] selection:text-white`}>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "SoftwareApplication",
                            "name": "OptWin",
                            "applicationCategory": "UtilitiesApplication",
                            "operatingSystem": "Windows",
                            "url": "https://optwin.tech",
                            "description": "Free, open-source browser-based Windows optimizer. Select from 60+ optimizations and generate a custom PowerShell script.",
                            "offers": {
                                "@type": "Offer",
                                "price": "0",
                                "priceCurrency": "USD",
                            },
                            "author": {
                                "@type": "Person",
                                "name": "ahmetly",
                                "url": "https://www.ahmetly.com",
                            },
                        }),
                    }}
                />
                <ClientProviders>
                    <PublicShell serverMaintenance={maintenance}>
                        {children}
                    </PublicShell>
                </ClientProviders>
            </body>
        </html>
    );
}
