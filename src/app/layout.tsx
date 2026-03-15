import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { PublicShell } from "@/components/layout/PublicShell";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
    title: "OptWin - Windows System Optimizer",
    description: "Maximize your gaming performance with the ultimate open-source Windows optimization suite.",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.variable} antialiased selection:bg-[#6c5ce7] selection:text-white`}>
                <ClientProviders>
                    <PublicShell>
                        {children}
                    </PublicShell>
                </ClientProviders>
            </body>
        </html>
    );
}
