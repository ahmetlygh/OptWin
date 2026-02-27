"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { DnsProvider } from "@/types/feature"; // Define properly
import { useState } from "react";
import { TranslatableText } from "../shared/TranslatableText";

export function DnsPanel({ providers }: { providers: DnsProvider[] }) {
    const { dnsProvider, setDnsProvider, selectedFeatures, lang } = useOptWinStore();
    const [isOpen, setIsOpen] = useState(false);

    // Only show if the actual feature is selected
    if (!selectedFeatures.has("changeDNS")) {
        return null;
    }

    return (
        <div className="my-10 animate-fade-in-up w-full max-w-4xl mx-auto">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between p-6 bg-gradient-to-br from-[var(--card-bg)] to-[#1a182e]/30 border-2 border-[var(--border-color)] rounded-2xl cursor-pointer hover:border-[var(--accent-color)] transition-all shadow-[var(--card-shadow)] hover:shadow-[0_10px_30px_rgba(108,92,231,0.15)] group"
            >
                <div className="flex items-center gap-4">
                    <i className="fa-solid fa-server text-2xl text-[var(--accent-color)]"></i>
                    <div>
                        <h3 className="text-xl font-bold text-[var(--text-primary)]">
                            <TranslatableText en="DNS Settings" tr="DNS Ayarları" />
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">
                            <TranslatableText
                                en={`Currently Selected: ${providers.find(p => p.slug === dnsProvider)?.name || "Default (None)"}`}
                                tr={`Şu An Seçili: ${providers.find(p => p.slug === dnsProvider)?.name || "Varsayılan (Yok)"}`}
                            />
                        </p>
                    </div>
                </div>
                <i className={`fa-solid fa-chevron-${isOpen ? "up" : "down"} text-[var(--text-secondary)] transition-transform`}></i>
            </div>

            {isOpen && (
                <div className="mt-4 p-6 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-[var(--card-shadow)] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-subtle-reveal">
                    <label
                        className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all border-2 ${dnsProvider === "default" ? "border-[var(--accent-color)] bg-[var(--accent-color)]/10 shadow-[0_0_15px_rgba(108,92,231,0.15)] scale-[1.02]" : "border-transparent hover:bg-white/5"}`}
                    >
                        <input
                            type="radio"
                            name="dns"
                            value="default"
                            checked={dnsProvider === "default"}
                            onChange={() => setDnsProvider("default")}
                            className="w-5 h-5 accent-[var(--accent-color)] rounded-full bg-[var(--bg-color)] border-[var(--border-color)]"
                        />
                        <span className="font-semibold text-[var(--text-primary)]">
                            <TranslatableText en="Default (None)" tr="Varsayılan (Hiçbiri)" />
                        </span>
                    </label>

                    {providers.map(p => (
                        <label
                            key={p.slug}
                            className={`flex flex-col p-4 rounded-xl cursor-pointer transition-all border-2 relative overflow-hidden ${dnsProvider === p.slug ? "border-[var(--accent-color)] bg-[var(--accent-color)]/10 shadow-[0_0_15px_rgba(108,92,231,0.15)] scale-[1.02]" : "border-[var(--border-color)] hover:border-[var(--accent-color)]/50 bg-[var(--card-bg)] hover:bg-white/5"}`}
                        >
                            {p.slug === "cloudflare" && (
                                <div className="absolute top-0 right-0 bg-[var(--accent-color)] text-white text-[0.6rem] font-bold px-2 py-0.5 rounded-bl-lg tracking-wider">
                                    {lang === "tr" ? "ÖNERİLEN" : "RECOMMENDED"}
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <input
                                    type="radio"
                                    name="dns"
                                    value={p.slug}
                                    checked={dnsProvider === p.slug}
                                    onChange={() => setDnsProvider(p.slug)}
                                    className="w-5 h-5 accent-[var(--accent-color)]"
                                />
                                <span className="font-semibold text-[var(--text-primary)]">{p.name}</span>
                            </div>
                            <div className="mt-2 ml-8 text-[0.7rem] text-[var(--text-secondary)] font-mono flex gap-2">
                                <span className="px-2 py-1 bg-white/5 rounded-md">{p.primary}</span>
                                <span className="px-2 py-1 bg-white/5 rounded-md">{p.secondary}</span>
                            </div>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}
