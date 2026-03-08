"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { DnsProvider } from "@/types/feature";
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { XIcon, CheckIcon, GlobeIcon } from "../shared/Icons";

export function DnsModal({ providers }: { providers: DnsProvider[] }) {
    const { isDnsModalOpen, setDnsModalOpen, dnsProvider, setDnsProvider } = useOptWinStore();
    const { t } = useTranslation();
    const [phase, setPhase] = useState<"closed" | "entering" | "open" | "exiting">("closed");

    useEffect(() => {
        if (isDnsModalOpen && phase === "closed") {
            setPhase("entering");
            requestAnimationFrame(() => setPhase("open"));
        } else if (!isDnsModalOpen && (phase === "open" || phase === "entering")) {
            setPhase("exiting");
            const timer = setTimeout(() => setPhase("closed"), 300);
            return () => clearTimeout(timer);
        }
    }, [isDnsModalOpen]);

    useEffect(() => {
        if (phase !== "closed") {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [phase]);

    const handleClose = useCallback(() => {
        setDnsModalOpen(false);
    }, [setDnsModalOpen]);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") handleClose();
        };
        if (phase !== "closed") {
            document.addEventListener("keydown", onKeyDown);
            return () => document.removeEventListener("keydown", onKeyDown);
        }
    }, [phase, handleClose]);

    const handleSelect = (slug: string) => {
        setDnsProvider(slug);
    };

    if (phase === "closed") return null;
    const isVisible = phase === "open";

    return (
        <div
            className={`fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-xl ${isVisible ? 'modal-backdrop-enter' : phase === 'exiting' ? 'modal-backdrop-exit' : ''}`}
            onClick={handleClose}
        >
            <div
                className={`w-full max-w-4xl bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-2xl shadow-[var(--accent-color)]/10 relative flex flex-col md:flex-row max-h-[85vh] md:max-h-[75vh] ${isVisible ? 'modal-content-enter' : phase === 'exiting' ? 'modal-content-exit' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-20 size-8 flex items-center justify-center rounded-full bg-[var(--text-secondary)]/10 text-[var(--text-secondary)] hover:bg-[var(--text-secondary)]/20 hover:text-[var(--text-primary)] hover:rotate-90 transition-all duration-200"
                >
                    <XIcon size={14} />
                </button>

                {/* Left Side: Info */}
                <div className="w-full md:w-[32%] bg-[var(--bg-color)]/50 p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[var(--border-color)]">
                    <div className="space-y-6">
                        <div className="animate-fade-in-up">
                            <div className="size-12 rounded-2xl bg-[var(--accent-color)]/20 text-[var(--accent-color)] flex items-center justify-center mb-4 border border-[var(--accent-color)]/30 shadow-[0_0_15px_rgba(107,91,230,0.3)]">
                                <GlobeIcon size={22} />
                            </div>
                            <h2 className="text-2xl font-black text-[var(--text-primary)] mb-2 tracking-tight">
                                {t["dns.title"]}
                            </h2>
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                {t["dns.description"]}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs font-semibold animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                            <span className="bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-md border border-emerald-500/20 flex items-center gap-1">
                                <CheckIcon size={12} /> {t["dns.reversible"]}
                            </span>
                            <span className="bg-blue-500/10 text-blue-500 px-2.5 py-1 rounded-md border border-blue-500/20 flex items-center gap-1">
                                <GlobeIcon size={12} /> {t["dns.systemWide"]}
                            </span>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-[var(--border-color)] hidden md:block animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                        <button
                            onClick={handleClose}
                            className="w-full flex items-center justify-center gap-2 h-12 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white font-bold rounded-xl shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(107,91,230,0.4)]"
                        >
                            <CheckIcon size={18} strokeWidth={2.5} />
                            {t["dns.confirmSelection"]}
                        </button>
                    </div>
                </div>

                {/* Right Side: DNS Options */}
                <div className="w-full md:w-[68%] p-4 md:p-6 flex flex-col bg-[var(--card-bg)]">
                    <div className="flex items-center justify-between mb-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                        <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                            {t["dns.availableProviders"]}
                        </h3>
                        <span className="text-xs text-[var(--text-secondary)] bg-[var(--border-color)] px-2.5 py-1 rounded-lg">
                            {providers.length + 1} {t["dns.options"]}
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-2 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
                        {/* Default option */}
                        <label
                            className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer border-2 relative overflow-hidden group transition-all duration-300 ${dnsProvider === "default" ? "border-[var(--accent-color)] bg-[var(--accent-color)]/10 shadow-[0_0_20px_rgba(107,91,230,0.15)]" : "border-[var(--border-color)]/50 bg-[var(--border-color)]/20 hover:bg-[var(--border-color)]/40 hover:border-[var(--border-color)]"}`}
                        >
                            <div
                                className={`relative flex items-center justify-center w-5 h-5 rounded-full border-[2px] shrink-0 transition-all duration-300 ${dnsProvider === "default" ? 'border-[var(--accent-color)] bg-[var(--accent-color)]' : 'border-[var(--text-secondary)] bg-transparent'}`}
                            >
                                {dnsProvider === "default" && (
                                    <CheckIcon size={12} strokeWidth={3} className="text-white animate-check-bounce" />
                                )}
                            </div>
                            <div className="flex-1">
                                <span className={`font-bold text-sm ${dnsProvider === "default" ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
                                    {t["dns.defaultLabel"]}
                                </span>
                                <p className="text-[11px] text-[var(--text-secondary)]/70 mt-0.5">
                                    {t["dns.defaultDesc"]}
                                </p>
                            </div>
                            <input type="radio" name="dns" value="default" className="sr-only" checked={dnsProvider === "default"} onChange={() => handleSelect("default")} />
                        </label>

                        {providers.map(p => (
                            <label
                                key={p.slug}
                                className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer border-2 relative overflow-hidden group transition-all duration-300 ${dnsProvider === p.slug ? "border-[var(--accent-color)] bg-[var(--accent-color)]/10 shadow-[0_0_20px_rgba(107,91,230,0.15)]" : "border-[var(--border-color)]/50 bg-[var(--border-color)]/20 hover:bg-[var(--border-color)]/40 hover:border-[var(--border-color)]"}`}
                            >
                                {p.slug === "cloudflare" && (
                                    <div className="absolute top-0 right-0 bg-[var(--accent-color)] text-white text-[9px] font-black px-2.5 py-0.5 rounded-bl-xl tracking-widest shadow-lg z-10">
                                        {t["dns.recommended"]}
                                    </div>
                                )}
                                <div
                                    className={`relative flex items-center justify-center w-5 h-5 rounded-full border-[2px] shrink-0 transition-all duration-300 ${dnsProvider === p.slug ? 'border-[var(--accent-color)] bg-[var(--accent-color)]' : 'border-[var(--text-secondary)] bg-transparent group-hover:border-[var(--accent-color)]/50'}`}
                                >
                                    {dnsProvider === p.slug && (
                                        <CheckIcon size={12} strokeWidth={3} className="text-white animate-check-bounce" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className={`font-bold text-sm block ${dnsProvider === p.slug ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>{p.name}</span>
                                    <div className="mt-1.5 text-[11px] text-[var(--text-secondary)] font-mono flex flex-wrap gap-1.5">
                                        <span className="px-2 py-0.5 bg-[var(--border-color)] rounded-md border border-[var(--text-secondary)]/10 dark:border-white/5">{p.primary}</span>
                                        <span className="px-2 py-0.5 bg-[var(--border-color)] rounded-md border border-[var(--text-secondary)]/10 dark:border-white/5">{p.secondary}</span>
                                    </div>
                                </div>
                                <input type="radio" name="dns" value={p.slug} className="sr-only" checked={dnsProvider === p.slug} onChange={() => handleSelect(p.slug)} />
                            </label>
                        ))}
                    </div>

                    {/* Mobile Confirm */}
                    <div className="pt-4 flex md:hidden">
                        <button
                            onClick={handleClose}
                            className="w-full flex items-center justify-center gap-2 h-12 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white font-bold rounded-xl shadow-lg transition-all duration-200"
                        >
                            <CheckIcon size={18} strokeWidth={2.5} />
                            {t["dns.confirm"]}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
