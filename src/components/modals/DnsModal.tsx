"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { DnsProvider } from "@/types/feature";
import { useState, useEffect } from "react";
import { TranslatableText } from "../shared/TranslatableText";

export function DnsModal({ providers }: { providers: DnsProvider[] }) {
    const { isDnsModalOpen, setDnsModalOpen, dnsProvider, setDnsProvider, lang } = useOptWinStore();
    const [mounted, setMounted] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isDnsModalOpen) {
            setTimeout(() => setIsVisible(true), 10);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isDnsModalOpen]);

    if (!mounted || (!isDnsModalOpen && !isVisible)) return null;

    const handleSelect = (slug: string) => {
        setDnsProvider(slug);
        setTimeout(() => setDnsModalOpen(false), 400); // 400ms delay to show the selection visually
    };

    return (
        <div className={`fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300 ${isDnsModalOpen && isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div
                className={`w-full max-w-2xl bg-[#0f0e1a]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform ${isDnsModalOpen && isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="absolute top-0 right-0 w-40 h-40 bg-[radial-gradient(circle,rgba(107,91,230,0.2)_0%,transparent_70%)] rounded-full blur-[40px] pointer-events-none"></div>

                <div className="flex justify-between items-center mb-8 relative z-10">
                    <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                        <span className="size-10 rounded-2xl bg-[var(--accent-color)]/20 text-[var(--accent-color)] flex items-center justify-center border border-[var(--accent-color)]/30 shadow-[0_0_15px_rgba(107,91,230,0.3)]">
                            <span className="material-symbols-outlined font-black">dns</span>
                        </span>
                        <TranslatableText en="Select DNS Provider" tr="DNS Sağlayıcısı Seçin" />
                    </h3>

                    <button
                        onClick={() => setDnsModalOpen(false)}
                        className="size-10 flex items-center justify-center rounded-full bg-white/5 border border-white/5 text-[var(--text-secondary)] hover:bg-white/10 hover:text-white hover:border-white/10 transition-all shadow-sm"
                    >
                        <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10 max-h-[60vh] overflow-y-auto px-1 -mx-1 custom-scrollbar">
                    <label
                        className={`flex flex-col p-4 rounded-xl cursor-pointer transition-all border-2 relative overflow-hidden group ${dnsProvider === "default" ? "border-[var(--accent-color)] bg-[var(--accent-color)]/10 shadow-[0_0_20px_rgba(107,91,230,0.2)] scale-[1.02] z-10" : "border-white/5 bg-black/40 hover:bg-white/5 hover:border-white/10"}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`relative flex items-center justify-center w-5 h-5 rounded-full border-[2px] transition-all duration-300 ${dnsProvider === "default" ? 'border-[var(--accent-color)] bg-[var(--accent-color)]' : 'border-[var(--text-secondary)] bg-transparent'}`}>
                                <span className={`material-symbols-outlined text-white text-[12px] font-black transition-all duration-300 ${dnsProvider === "default" ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>check</span>
                            </div>
                            <div>
                                <span className={`font-bold text-base block leading-tight ${dnsProvider === "default" ? "text-white" : "text-[var(--text-secondary)]"}`}>
                                    <TranslatableText en="Default (Reset)" tr="Varsayılan (Sıfırla)" />
                                </span>
                            </div>
                        </div>
                        <input
                            type="radio"
                            name="dns"
                            value="default"
                            className="sr-only"
                            checked={dnsProvider === "default"}
                            onChange={() => handleSelect("default")}
                        />
                    </label>

                    {providers.map(p => (
                        <label
                            key={p.slug}
                            className={`flex flex-col p-4 rounded-xl cursor-pointer transition-all border-2 relative overflow-hidden group ${dnsProvider === p.slug ? "border-[var(--accent-color)] bg-[var(--accent-color)]/10 shadow-[0_0_20px_rgba(107,91,230,0.2)] scale-[1.02] z-10" : "border-white/5 bg-black/40 hover:bg-white/5 hover:border-white/10"}`}
                        >
                            {p.slug === "cloudflare" && (
                                <div className="absolute top-0 right-0 bg-[var(--accent-color)] text-white text-[10px] font-black px-3 py-0.5 rounded-bl-xl tracking-widest shadow-lg z-10">
                                    {lang === "tr" ? "ÖNERİLEN" : "RECOMMENDED"}
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <div className={`relative flex items-center justify-center w-5 h-5 rounded-full border-[2px] transition-all duration-300 mb-auto mt-0.5 ${dnsProvider === p.slug ? 'border-[var(--accent-color)] bg-[var(--accent-color)]' : 'border-[var(--text-secondary)] bg-transparent group-hover:border-[var(--accent-color)]/50'}`}>
                                    <span className={`material-symbols-outlined text-white text-[12px] font-black transition-all duration-300 ${dnsProvider === p.slug ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>check</span>
                                </div>
                                <div className="flex-1 pr-4">
                                    <span className={`font-bold text-base block leading-tight ${dnsProvider === p.slug ? "text-white" : "text-[var(--text-primary)]"}`}>{p.name}</span>
                                    <div className="mt-2 text-[11px] text-[var(--text-secondary)] font-mono flex flex-wrap gap-1.5 opacity-90">
                                        <span className="px-2 py-0.5 bg-black/50 rounded-md border border-white/5">{p.primary}</span>
                                        <span className="px-2 py-0.5 bg-black/50 rounded-md border border-white/5">{p.secondary}</span>
                                    </div>
                                </div>
                            </div>
                            <input
                                type="radio"
                                name="dns"
                                value={p.slug}
                                className="sr-only"
                                checked={dnsProvider === p.slug}
                                onChange={() => handleSelect(p.slug)}
                            />
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
}
