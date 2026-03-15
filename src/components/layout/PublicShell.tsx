"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings } from "lucide-react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { SupportModal } from "@/components/modals/SupportModal";
import { ScrollToTop } from "./ScrollToTop";
import { ScrollRestorer } from "@/components/shared/ScrollRestorer";

export function PublicShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const isAdmin = pathname.startsWith("/admin");
    const isMaintenance = pathname === "/maintenance";
    const [redirecting, setRedirecting] = useState(false);

    // Poll maintenance status for public pages (not admin, not already on /maintenance)
    useEffect(() => {
        if (isAdmin || isMaintenance) return;

        const check = async () => {
            try {
                const res = await fetch("/api/maintenance");
                const data = await res.json();
                if (data.maintenance) {
                    setRedirecting(true);
                    setTimeout(() => router.push("/maintenance"), 1200);
                }
            } catch { /* ignore */ }
        };

        check();
        const poll = setInterval(check, 10000);
        return () => clearInterval(poll);
    }, [isAdmin, isMaintenance, router]);

    if (isAdmin) {
        return <>{children}</>;
    }

    if (isMaintenance) {
        return <>{children}</>;
    }

    return (
        <>
            {/* Loading overlay when redirecting to maintenance */}
            <AnimatePresence>
                {redirecting && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] bg-[#08080d] flex items-center justify-center"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                                <Settings size={28} className="text-[#6b5be6]" />
                            </motion.div>
                            <p className="text-white/30 text-sm">Yükleniyor...</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Performant Ambient Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-[-1] bg-[var(--bg-color)]">
                <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full bg-[radial-gradient(circle,rgba(107,91,230,0.12)_0%,transparent_70%)]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-[radial-gradient(circle,rgba(147,51,234,0.12)_0%,transparent_70%)]"></div>
                <div className="absolute top-[40%] left-[30%] w-[70vw] h-[70vw] max-w-[1000px] max-h-[1000px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.08)_0%,transparent_70%)]"></div>
            </div>

            <div className="flex flex-col min-h-screen relative z-0">
                <Header />
                <main className="flex-1 w-full max-w-[1200px] mx-auto pt-6 pb-12 px-6">
                    {children}
                </main>
                <Footer />
            </div>

            <SupportModal />
            <ScrollToTop />
            <ScrollRestorer />
        </>
    );
}
