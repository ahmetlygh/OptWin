import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
    title: "OptWin - Admin Panel",
    description: "OptWin System Optimizer Administration",
};

export default function AdminRootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.variable} antialiased selection:bg-[#6c5ce7] selection:text-white`}>
                {children}
            </body>
        </html>
    );
}
