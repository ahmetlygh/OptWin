export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // This is a minimal root layout. The actual HTML/body/head
    // structure is handled by [locale]/layout.tsx and admin/layout.tsx
    // Next.js requires a root layout in the app directory.
    return children;
}
