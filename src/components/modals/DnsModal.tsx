"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { DnsProvider } from "@/types/feature";
import { useState, useEffect, useCallback } from "react";
import { TranslatableText } from "../shared/TranslatableText";
import { XIcon, CheckIcon, GlobeIcon } from "../shared/Icons";

export function DnsModal({ providers }: { providers: DnsProvider[] }) {
    const { isDnsModalOpen, setDnsModalOpen, dnsProvider, setDnsProvider, lang } = useOptWinStore();
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

    // Lock body scroll
    useEffect(() => {
        if (phase !== "closed") {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [phase]);

    // ESC key to close
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
            className={`fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl ${isVisible ? 'modal-backdrop-enter' : phase === 'exiting' ? 'modal-backdrop-exit' : ''}`}
            onClick={handleClose}
        >
            <div
                className={`w-full max-w-4xl bg-[#131121] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-2xl shadow-[var(--accent-color)]/10 relative flex flex-col md:flex-row max-h-[85vh] md:max-h-[75vh] ${isVisible ? 'modal-content-enter' : phase === 'exiting' ? 'modal-content-exit' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-20 size-8 flex items-center justify-center rounded-full bg-white/5 text-[var(--text-secondary)] hover:bg-white/10 hover:text-white hover:rotate-90 transition-all duration-200"
                >
                    <XIcon size={14} />
                </button>

                {/* Left Side: Info */}
                <div className="w-full md:w-[32%] bg-gradient-to-b from-black/40 to-black/20 p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[var(--border-color)]">
                    <div className="space-y-6">
                        <div className="animate-fade-in-up">
                            <div className="size-12 rounded-2xl bg-[var(--accent-color)]/20 text-[var(--accent-color)] flex items-center justify-center mb-4 border border-[var(--accent-color)]/30 shadow-[0_0_15px_rgba(107,91,230,0.3)]">
                                <GlobeIcon size={22} />
                            </div>
                            <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
                                <TranslatableText en="DNS Provider" tr="DNS Sağlayıcısı" />
                            </h2>
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                <TranslatableText
                                    en="Choose a DNS provider for faster and more secure browsing. This changes your network adapter's DNS settings."
                                    tr="Daha hızlı ve güvenli gezinme için bir DNS sağlayıcısı seçin. Bu, ağ adaptörünüzün DNS ayarlarını değiştirir."
                                />
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs font-semibold animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                            <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-md border border-emerald-500/20 flex items-center gap-1">
                                <CheckIcon size={12} /> <TranslatableText en="Reversible" tr="Geri Alınabilir" noSpan />
                            </span>
                            <span className="bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-md border border-blue-500/20 flex items-center gap-1">
                                <GlobeIcon size={12} /> <TranslatableText en="System-wide" tr="Sistem Geneli" noSpan />
                            </span>
                        </div>
                    </div>

                    {/* Confirm Button (Desktop) */}
                    <div className="pt-6 border-t border-[var(--border-color)] hidden md:block animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                        <button
                            onClick={handleClose}
                            className="w-full flex items-center justify-center gap-2 h-12 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white font-bold rounded-xl shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(107,91,230,0.4)]"
                        >
                            <CheckIcon size={18} strokeWidth={2.5} />
                            <TranslatableText en="Confirm Selection" tr="Seçimi Onayla" noSpan />
                        </button>
                    </div>
                </div>

                {/* Right Side: DNS Options */}
                <div className="w-full md:w-[68%] p-4 md:p-6 flex flex-col bg-[#0a0a0f]">
                    <div className="flex items-center justify-between mb-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                            <TranslatableText en="Available Providers" tr="Mevcut Sağlayıcılar" />
                        </h3>
                        <span className="text-xs text-[var(--text-secondary)] bg-white/5 px-2.5 py-1 rounded-lg">
                            {providers.length + 1} <TranslatableText en="options" tr="seçenek" noSpan />
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-2 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
                        {/* Default option */}
                        <label
                            className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer border-2 relative overflow-hidden group transition-all duration-300 ${dnsProvider === "default" ? "border-[var(--accent-color)] bg-[var(--accent-color)]/10 shadow-[0_0_20px_rgba(107,91,230,0.15)]" : "border-white/5 bg-white/3 hover:bg-white/5 hover:border-white/10"}`}
                        >
                            <div
                                className={`relative flex items-center justify-center w-5 h-5 rounded-full border-[2px] shrink-0 transition-all duration-300 ${dnsProvider === "default" ? 'border-[var(--accent-color)] bg-[var(--accent-color)]' : 'border-[var(--text-secondary)] bg-transparent'}`}
                            >
                                {dnsProvider === "default" && (
                                    <CheckIcon size={12} strokeWidth={3} className="text-white animate-check-bounce" />
                                )}
                            </div>
                            <div className="flex-1">
                                <span className={`font-bold text-sm ${dnsProvider === "default" ? "text-white" : "text-[var(--text-secondary)]"}`}>
                                    <TranslatableText en="Default (Reset DNS)" tr="Varsayılan (DNS Sıfırla)" />
                                </span>
                                <p className="text-[11px] text-[var(--text-secondary)]/70 mt-0.5">
                                    <TranslatableText en="Use your ISP's default DNS" tr="İnternet sağlayıcınızın varsayılan DNS'ini kullan" />
                                </p>
                            </div>
                            <input type="radio" name="dns" value="default" className="sr-only" checked={dnsProvider === "default"} onChange={() => handleSelect("default")} />
                        </label>

                        {providers.map(p => (
                            <label
                                key={p.slug}
                                className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer border-2 relative overflow-hidden group transition-all duration-300 ${dnsProvider === p.slug ? "border-[var(--accent-color)] bg-[var(--accent-color)]/10 shadow-[0_0_20px_rgba(107,91,230,0.15)]" : "border-white/5 bg-white/3 hover:bg-white/5 hover:border-white/10"}`}
                            >
                                {p.slug === "cloudflare" && (
                                    <div className="absolute top-0 right-0 bg-[var(--accent-color)] text-white text-[9px] font-black px-2.5 py-0.5 rounded-bl-xl tracking-widest shadow-lg z-10">
                                        {lang === "tr" ? "ÖNERİLEN" : "RECOMMENDED"}
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
                                    <span className={`font-bold text-sm block ${dnsProvider === p.slug ? "text-white" : "text-[var(--text-primary)]"}`}>{p.name}</span>
                                    <div className="mt-1.5 text-[11px] text-[var(--text-secondary)] font-mono flex flex-wrap gap-1.5">
                                        <span className="px-2 py-0.5 bg-black/50 rounded-md border border-white/5">{p.primary}</span>
                                        <span className="px-2 py-0.5 bg-black/50 rounded-md border border-white/5">{p.secondary}</span>
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
                            <TranslatableText en="Confirm" tr="Onayla" noSpan />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
