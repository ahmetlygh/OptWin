import { Inter } from "next/font/google";
import "./globals.css";
import { headers, cookies } from "next/headers";
import { getSettings } from "@/lib/settings";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const headersList = await headers();
    const pathname = headersList.get("x-next-pathname") || "";
    const isAdmin = pathname.startsWith("/admin");
    
    const settings = await getSettings(["default_lang", "default_theme"]);
    const cookieStore = await cookies();

    // Determine locale and theme for the root structure
    // (Actual feature injection happens in [locale]/layout.tsx)
    const lang = cookieStore.get("NEXT_LOCALE")?.value || settings.default_lang || "en";
    const theme = cookieStore.get("NEXT_THEME")?.value || (isAdmin ? "dark" : settings.default_theme) || "dark";

    return (
        <html lang={lang} className={theme} suppressHydrationWarning>
            <body className={`${inter.variable} antialiased selection:bg-[#6c5ce7] selection:text-white theme-ready`}>
                {children}
            </body>
        </html>
    );
}
