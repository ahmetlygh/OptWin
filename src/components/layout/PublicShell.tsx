"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings } from "lucide-react";
import { Header } from "./Header";
import { Footer } from "./Footer";

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

    // SSE EventSource for zero-latency maintenance status updates
    useEffect(() => {
        if (isAdmin) return;

        // Still do one initial HTTP fetch to sync details (reason, estimatedEnd) if needed, 
        // though the stream will keep the boolean logic perfectly in sync.
        const check = async () => {
            try {
                const res = await fetch("/api/maintenance");
                const data = await res.json();
                setMReason(data.reason || null);
                setMEstimatedEnd(data.estimatedEnd || null);
                
                const newState = data.maintenance === true;
                if (prevMaintenance.current !== null && prevMaintenance.current !== newState) {
                    setTransitioning(true);
                    setTimeout(() => { window.location.href = window.location.pathname; }, 400);
                } else {
                    setMaintenance(newState);
                }
                prevMaintenance.current = newState;
                setChecked(true);
            } catch { /* ignore */ }
        };

        if (!serverMaintenance) check();

        const es = new EventSource("/api/maintenance/stream");
        es.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (typeof data.maintenance === "boolean") {
                    const newState = data.maintenance;
                    if (prevMaintenance.current !== null && prevMaintenance.current !== newState) {
                        setTransitioning(true);
                        setTimeout(() => { window.location.href = window.location.pathname; }, 400);
                    } else {
                        setMaintenance(newState);
                        setChecked(true);
                    }
                    prevMaintenance.current = newState;
                }
            } catch { /* ignore */ }
        };

        return () => es.close();
    }, [isAdmin, serverMaintenance]);

    if (isAdmin) {
        return <>{children}</>;
    }

    // Hide public UI children if rendering a normal path under maintenance (the rewritten /maintenance page doesn't use PublicShell wrapper directly since layout renders it inside but we don't want the Header/Footer)
    // Wait, if the rewritten /maintenance page IS running, its pathname is still the original e.g. /en. So how do we hide Header/Footer?
    // We can conditionally hide Header/Footer inside PublicShell if maintenance is active!
    // But wait, if maintenance is active, does the rewritten /maintenance page render INSIDE PublicShell's children? Yes.
    // So if maintenance is true, we ONLY render children (which is the MaintenanceUI page).

    return (
        <>
            <AnimatePresence>
                {transitioning && <TransitionSpinner key="spinner" />}
            </AnimatePresence>

            {checked && !transitioning && maintenance && (
                <>
                    {children}
                </>
            )}

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
