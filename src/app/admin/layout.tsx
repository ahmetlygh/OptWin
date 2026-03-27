import type { Metadata } from "next";

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
        <>
            {children}
        </>
    );
}
