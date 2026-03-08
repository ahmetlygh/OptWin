"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { useTranslation } from "@/i18n/useTranslation";
import { useState, useEffect, useCallback } from "react";
import { XIcon, HeartIcon, CoffeeIcon, StarIcon, UsersIcon, ExternalLinkIcon, CheckIcon } from "../shared/Icons";

export function SupportModal() {
    const { isSupportModalOpen, setSupportModalOpen } = useOptWinStore();
    const { t } = useTranslation();
    const [phase, setPhase] = useState<"closed" | "entering" | "open" | "exiting">("closed");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isSupportModalOpen && phase === "closed") {
            setPhase("entering");
            requestAnimationFrame(() => setPhase("open"));
        } else if (!isSupportModalOpen && (phase === "open" || phase === "entering")) {
            setPhase("exiting");
            const timer = setTimeout(() => setPhase("closed"), 300);
            return () => clearTimeout(timer);
        }
    }, [isSupportModalOpen]);

    const handleClose = useCallback(() => {
        setSupportModalOpen(false);
    }, [setSupportModalOpen]);

    // ESC to close
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") handleClose();
        };
        if (phase !== "closed") {
            document.addEventListener("keydown", onKeyDown);
            return () => document.removeEventListener("keydown", onKeyDown);
        }
    }, [phase, handleClose]);

    // Lock body scroll
    useEffect(() => {
        if (phase !== "closed") {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [phase]);

    if (phase === "closed") return null;
    const isVisible = phase === "open";

    const handleCopyLink = () => {
        navigator.clipboard.writeText("https://optwin.app");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const ways = [
        {
            icon: <CoffeeIcon size={20} />,
            text: t["support.way1"],
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            onClick: () => window.open("https://www.buymeacoffee.com/ahmetly_", "_blank"),
        },
        {
            icon: <StarIcon size={20} />,
            text: t["support.way2"],
            color: "text-yellow-500",
            bg: "bg-yellow-500/10",
            onClick: () => window.open("https://github.com/ahmetly", "_blank"),
        },
        {
            icon: copied ? <CheckIcon size={20} /> : <UsersIcon size={20} />,
            text: copied ? "Link copied!" : t["support.way3"],
            color: copied ? "text-emerald-500" : "text-blue-500",
            bg: copied ? "bg-emerald-500/10" : "bg-blue-500/10",
            onClick: handleCopyLink,
        },
    ];

    return (
        <div
            className={`fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl ${isVisible ? 'modal-backdrop-enter' : phase === 'exiting' ? 'modal-backdrop-exit' : ''}`}
            onClick={handleClose}
        >
            <div
                className={`w-full max-w-md bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-8 shadow-2xl relative overflow-hidden ${isVisible ? 'modal-content-enter' : phase === 'exiting' ? 'modal-content-exit' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Glow */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-pink-500/10 rounded-full blur-[50px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[var(--accent-color)]/10 rounded-full blur-[40px] pointer-events-none"></div>

                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 size-8 flex items-center justify-center rounded-full bg-[var(--text-secondary)]/10 text-[var(--text-secondary)] hover:bg-[var(--text-secondary)]/20 hover:text-[var(--text-primary)] hover:rotate-90 transition-all duration-200"
                >
                    <XIcon size={14} />
                </button>

                <div className="flex flex-col items-center text-center gap-5 relative z-10">
                    {/* Icon */}
                    <div className="size-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-[var(--accent-color)]/20 text-pink-500 flex items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.2)] border border-pink-500/20 animate-pop-in">
                        <HeartIcon size={28} />
                    </div>

                    {/* Title */}
                    <div className="animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
                        <h3 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight mb-2">
                            {t["support.modalTitle"]}
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                            {t["support.modalDesc"]}
                        </p>
                    </div>

                    {/* Ways to support — each clickable */}
                    <div className="w-full space-y-2.5 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                        <h4 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest text-left mb-3">
                            {t["support.howToSupport"]}
                        </h4>
                        {ways.map((way, i) => (
                            <button
                                key={i}
                                onClick={way.onClick}
                                className="w-full flex items-start gap-3 p-3 rounded-xl bg-[var(--border-color)]/30 border border-[var(--border-color)]/50 hover:bg-[var(--border-color)]/60 hover:border-[var(--border-color)] transition-all duration-200 cursor-pointer text-left group"
                            >
                                <div className={`size-9 rounded-lg ${way.bg} ${way.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                    {way.icon}
                                </div>
                                <div className="flex items-center gap-2 pt-1.5">
                                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed group-hover:text-[var(--text-primary)] transition-colors">
                                        {way.text}
                                    </p>
                                    <ExternalLinkIcon size={12} className="text-[var(--text-secondary)]/40 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="flex flex-col gap-3 w-full animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
                        <a
                            href="https://www.buymeacoffee.com/ahmetly_"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-base rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:-translate-y-0.5 flex items-center justify-center gap-2 transition-all duration-300"
                        >
                            <CoffeeIcon size={18} />
                            {t["support.buyMeCoffee"]}
                            <ExternalLinkIcon size={14} className="opacity-60" />
                        </a>
                        <button
                            onClick={handleClose}
                            className="w-full py-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium text-sm rounded-xl transition-all"
                        >
                            {t["support.close"]}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
