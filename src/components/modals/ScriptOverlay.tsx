"use client";

import { useState, useEffect, useCallback } from "react";
import { useOptWinStore } from "@/store/useOptWinStore";
import { useTranslation } from "@/i18n/useTranslation";
import { useModalPhase } from "@/hooks/useModalPhase";
import { XIcon, CheckIcon, BookOpenIcon, DownloadIcon, RepeatIcon, CopyIcon, CoffeeIcon, HeartIcon, LoaderIcon } from "../shared/Icons";
import { MonitorCog, MessageSquare } from "lucide-react";

const SUPPORT_SHOWN_KEY = "optwin-support-shown";

export function ScriptOverlay() {
    const {
        isScriptOverlayOpen, setScriptOverlayOpen,
        previewCode, showToast
    } = useOptWinStore();
    const { t } = useTranslation();
    const handleClose = () => { setScriptOverlayOpen(false); };
    const { isVisible, isMounted, phase, containerRef } = useModalPhase(isScriptOverlayOpen, handleClose);
    const [supportPhase, setSupportPhase] = useState<"hidden" | "entering" | "visible" | "exiting">("hidden");
    const [isDownloading, setIsDownloading] = useState(false);
    const [settings, setSettings] = useState<Record<string, string>>({});

    // Fetch settings once
    useEffect(() => {
        fetch("/api/public-settings")
            .then(r => r.json())
            .then(d => { if (d.success) setSettings(d.settings); })
            .catch(() => {});
    }, []);

    // Reset support prompt when overlay closes
    useEffect(() => {
        if (!isScriptOverlayOpen) setSupportPhase("hidden");
    }, [isScriptOverlayOpen]);

    const dismissSupport = useCallback(() => {
        setSupportPhase("exiting");
        localStorage.setItem(SUPPORT_SHOWN_KEY, "1");
        setTimeout(() => setSupportPhase("hidden"), 250);
    }, []);

    const handleDownload = async () => {
        if (isDownloading) return;
        setIsDownloading(true);
        // 1s spin delay — ensures unique timestamp per click
        await new Promise(r => setTimeout(r, 1000));
        const blob = new Blob([previewCode], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const now = new Date();
        const ts = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`;
        const siteName = settings.site_name || "OptWin";
        a.download = `${siteName}_${ts}.bat`;
        a.click();
        URL.revokeObjectURL(url);
        setIsDownloading(false);
        showToast(t["script.downloadToast"], "success");
        fetch("/api/stats?action=download", { method: "POST" }).catch(() => { });
        // Show support prompt only once ever
        if (typeof window !== "undefined" && !localStorage.getItem(SUPPORT_SHOWN_KEY)) {
            setTimeout(() => {
                setSupportPhase("entering");
                requestAnimationFrame(() => setSupportPhase("visible"));
            }, 400);
        }
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(previewCode);
        showToast(t["script.copiedToast"], "success");
    };

    if (!isMounted) return null;

    const supportVisible = supportPhase === "entering" || supportPhase === "visible";
    const supportExiting = supportPhase === "exiting";

    return (
        <div
            ref={containerRef}
            className={`fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl ${isVisible ? 'modal-backdrop-enter' : phase === 'exiting' ? 'modal-backdrop-exit' : ''}`}
            onClick={handleClose}
        >
            <div
                className={`w-full max-w-6xl bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-2xl shadow-[var(--accent-color)]/10 relative flex flex-col md:flex-row h-[85vh] md:h-[80vh] ${isVisible ? 'modal-content-enter' : phase === 'exiting' ? 'modal-content-exit' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-20 size-8 flex items-center justify-center rounded-full bg-[var(--text-secondary)]/10 text-[var(--text-secondary)] hover:bg-[var(--text-secondary)]/20 hover:text-[var(--text-primary)] hover:rotate-90 transition-all duration-200"
                >
                    <XIcon size={14} />
                </button>

                {/* Left Side: Instructions */}
                <div className="w-full md:w-[28%] bg-[var(--bg-color)] p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[var(--border-color)] relative shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent-color)]/5 to-transparent pointer-events-none"></div>
                    <div className="space-y-8 relative z-10">
                        <div className="animate-fade-in-up">
                            <h2 className="text-3xl font-black text-[var(--text-primary)] mb-2 tracking-tight">{t["script.ready"]}</h2>
                            <div className="flex flex-wrap gap-2 text-xs font-semibold">
                                <span className="bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-md border border-emerald-500/20 flex items-center gap-1 animate-pop-in" style={{ animationDelay: "0.1s" }}>
                                    <CheckIcon size={12} /> {t["script.safe"]}
                                </span>
                                <span className="bg-blue-500/10 text-blue-500 px-2.5 py-1 rounded-md border border-blue-500/20 flex items-center gap-1 animate-pop-in" style={{ animationDelay: "0.15s" }}>
                                    <RepeatIcon size={12} /> {t["script.reusable"]}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                            <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                                <BookOpenIcon size={18} className="text-[var(--accent-color)]" />
                                {t["script.howToUse"]}
                            </h3>
                            <ul className="space-y-4 text-[var(--text-secondary)] text-sm stagger-children">
                                <li className="flex gap-3">
                                    <span className="shrink-0 size-6 rounded-full bg-[var(--accent-color)]/20 text-[var(--accent-color)] font-bold flex items-center justify-center">1</span>
                                    <span>{t["script.step1"]}</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="shrink-0 size-6 rounded-full bg-[var(--accent-color)]/20 text-[var(--accent-color)] font-bold flex items-center justify-center">2</span>
                                    <span>{t["script.step2"]} <b className="text-[var(--text-primary)]">{t["script.runAsAdmin"]}</b>.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="shrink-0 size-6 rounded-full bg-[var(--accent-color)]/20 text-[var(--accent-color)] font-bold flex items-center justify-center">3</span>
                                    <span>{t["script.step3"]}</span>
                                </li>
                            </ul>
                        </div>

                        {/* Mobile download button — right below step 3 */}
                        <div className="md:hidden animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
                            <button
                                onClick={handleDownload}
                                disabled={isDownloading}
                                className="w-full flex items-center justify-center gap-2 h-12 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white font-bold rounded-xl shadow-[0_5px_15px_rgba(168,85,247,0.3)] transition-all duration-200 disabled:opacity-70"
                            >
                                {isDownloading ? <LoaderIcon size={18} className="animate-spin" /> : <DownloadIcon size={18} />} {t["script.download"]}
                            </button>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-[var(--border-color)] hidden md:block animate-fade-in-up relative z-10" style={{ animationDelay: "0.2s" }}>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleDownload}
                                disabled={isDownloading}
                                className="w-full flex items-center justify-center gap-2 h-12 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white font-bold rounded-xl shadow-[0_5px_15px_rgba(168,85,247,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(168,85,247,0.4)] disabled:opacity-70"
                            >
                                {isDownloading ? <LoaderIcon size={18} className="animate-spin" /> : <DownloadIcon size={18} />} {t["script.download"]}
                            </button>
                            <button
                                onClick={handleClose}
                                className="w-full flex items-center justify-center gap-2 h-12 bg-transparent border border-[var(--border-color)] hover:border-[var(--text-secondary)] text-[var(--text-primary)] font-bold rounded-xl transition-all duration-200"
                            >
                                {t["script.cancel"]}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side: Code Preview */}
                <div className="w-full md:w-[72%] p-4 md:p-6 flex flex-col min-h-0 bg-[var(--card-bg)]">
                    <div className="flex items-center justify-between bg-[var(--bg-color)]/50 border border-[var(--border-color)] rounded-t-xl px-4 py-3 shrink-0 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
                        <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)]">
                            <MonitorCog size={14} className="text-purple-500" /> {settings.site_name || "OptWin"}.bat
                        </div>
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)] bg-[var(--text-secondary)]/10 hover:bg-[var(--text-secondary)]/20 px-3 py-1.5 rounded-lg border border-[var(--border-color)] transition-all duration-200 hover:scale-105"
                        >
                            <CopyIcon size={14} />
                            {t["script.copy"]}
                        </button>
                    </div>
                    <div className="flex-1 min-h-0 bg-[#1e1e2e] dark:bg-[#0a0a0f] border-x border-b border-[var(--border-color)] rounded-b-xl overflow-auto script-scrollbar">
                        <pre className="p-6 m-0">
                            <code className="text-purple-300 dark:text-purple-400 font-mono text-xs md:text-sm whitespace-pre selection:bg-[var(--accent-color)]/30">{previewCode}</code>
                        </pre>
                    </div>
                </div>

                {/* Support Prompt Overlay — shown once after first download */}
                {(supportVisible || supportExiting) && (
                    <div
                        className={`absolute inset-0 z-30 flex items-center justify-center transition-all duration-250 ${supportExiting ? "opacity-0" : "opacity-100"}`}
                        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
                        onClick={dismissSupport}
                    >
                        <div
                            className={`w-[90%] max-w-sm bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6 shadow-2xl shadow-[var(--accent-color)]/20 text-center transition-all duration-250 ${supportExiting ? "opacity-0 scale-95" : "animate-pop-in"}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                    <HeartIcon size={18} className="text-amber-500" />
                                </div>
                                <h3 className="text-lg font-black text-[var(--text-primary)]">{t["script.supportPromptTitle"]}</h3>
                            </div>
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
                                {t["script.supportPromptDesc"]}
                            </p>
                            <div className="flex flex-col gap-2.5">
                                <a
                                    href={settings.bmc_url || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => { localStorage.setItem(SUPPORT_SHOWN_KEY, "1"); }}
                                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:-translate-y-0.5 flex items-center justify-center gap-2 transition-all duration-300"
                                >
                                    <CoffeeIcon size={16} />
                                    {t["script.supportDonate"]}
                                </a>
                                <button
                                    disabled
                                    className="w-full py-3 bg-[var(--text-secondary)]/5 text-[var(--text-secondary)]/40 font-bold text-sm rounded-xl border border-[var(--border-color)] flex items-center justify-center gap-2 cursor-not-allowed"
                                >
                                    <MessageSquare size={16} />
                                    {t["script.supportReview"]}
                                </button>
                                <button
                                    onClick={dismissSupport}
                                    className="w-full py-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-medium transition-colors"
                                >
                                    {t["script.supportDismiss"]}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
