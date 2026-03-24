"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings } from "lucide-react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MaintenanceOverlay } from "./MaintenanceOverlay";
import { SupportModal } from "@/components/modals/SupportModal";
import { ScrollToTop } from "./ScrollToTop";
import { ScrollRestorer } from "@/components/shared/ScrollRestorer";

/* ── Transition spinner between states ────────────────────────── */
function TransitionSpinner() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] bg-[#08080d] flex items-center justify-center"
        >
            <div className="optwin-spinner">
                <Settings size={32} className="text-[#6b5be6]" />
            </div>
        </motion.div>
    );
}

/* ── Ambient Background ──────────────────────────────────────── */
function AmbientBackground() {
    return (
        <div className="fixed inset-0 pointer-events-none z-[-1] bg-[var(--bg-color)]">
            <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full bg-[radial-gradient(circle,rgba(107,91,230,0.12)_0%,transparent_70%)]"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-[radial-gradient(circle,rgba(147,51,234,0.12)_0%,transparent_70%)]"></div>
            <div className="absolute top-[40%] left-[30%] w-[70vw] h-[70vw] max-w-[1000px] max-h-[1000px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.08)_0%,transparent_70%)]"></div>
        </div>
    );
}

/* ── Public Shell ─────────────────────────────────────────────── */
export function PublicShell({ children, serverMaintenance = false, adminSession = null, serverSettings = {} }: { children: React.ReactNode; serverMaintenance?: boolean; adminSession?: { name: string | null; image: string | null } | null; serverSettings?: Record<string, string> }) {
    const pathname = usePathname();
    const isAdmin = pathname.startsWith("/admin");
    const [maintenance, setMaintenance] = useState(serverMaintenance);
    const [checked, setChecked] = useState(serverMaintenance || isAdmin);
    const [transitioning, setTransitioning] = useState(false);
    const prevMaintenance = useRef<boolean | null>(serverMaintenance ? true : null);
    const [mReason, setMReason] = useState<string | null>(null);
    const [mEstimatedEnd, setMEstimatedEnd] = useState<string | null>(null);

    // Poll maintenance status for public pages
    useEffect(() => {
        if (isAdmin) return;

        const check = async () => {
            try {
                const res = await fetch("/api/maintenance");
                const data = await res.json();
                const newState = data.maintenance === true;
                setMReason(data.reason || null);
                setMEstimatedEnd(data.estimatedEnd || null);

                // Show transition spinner when switching between states (not on first load)
                if (prevMaintenance.current !== null && prevMaintenance.current !== newState) {
                    setTransitioning(true);
                    setTimeout(() => {
                        setMaintenance(newState);
                        setTimeout(() => setTransitioning(false), 400);
                    }, 600);
                } else {
                    setMaintenance(newState);
                }
                prevMaintenance.current = newState;
            } catch { /* ignore */ }
            setChecked(true);
        };

        // If server already told us maintenance is on, don't need initial fetch
        if (!serverMaintenance) {
            check();
        }
        const poll = setInterval(check, 5000);
        return () => clearInterval(poll);
    }, [isAdmin, serverMaintenance]);

    if (isAdmin) {
        return <>{children}</>;
    }

    return (
        <>
            {/* Transition spinner — shown during state change */}
            <AnimatePresence>
                {transitioning && <TransitionSpinner key="spinner" />}
            </AnimatePresence>

            {/* Maintenance overlay */}
            <AnimatePresence>
                {maintenance && checked && !transitioning && <MaintenanceOverlay key="maintenance" reason={mReason} estimatedEnd={mEstimatedEnd} />}
            </AnimatePresence>

            {/* Normal site — no wrapper animation to avoid breaking position:fixed children (ActionArea, modals) */}
            {checked && !transitioning && !maintenance && (
                    <>
                        <AmbientBackground />

                        <div className="flex flex-col min-h-screen relative">
                            <Header adminSession={adminSession} serverSettings={serverSettings} />
                            <main className="flex-1 w-full max-w-[1200px] mx-auto pt-6 pb-12 px-6">
                                {children}
                            </main>
                            <Footer serverSettings={serverSettings} />
                        </div>

                        <SupportModal serverSettings={serverSettings} />
                        <ScrollToTop />
                        <ScrollRestorer />
                    </>
                )}

            {/* Initial loading */}
            {!checked && (
                <div className="fixed inset-0 z-[9999] bg-[var(--bg-color)]" />
            )}
        </>
    );
}
