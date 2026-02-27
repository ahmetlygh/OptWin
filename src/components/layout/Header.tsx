"use client";

import Link from "next/link";
import { useOptWinStore, Lang } from "@/store/useOptWinStore";
import { TranslatableText } from "../shared/TranslatableText";
import { useEffect, useState, useRef } from "react";
import { MobileNav } from "./MobileNav";

export function Header() {
    const { lang, setLang, theme, toggleTheme } = useOptWinStore();
    const [mounted, setMounted] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);
    const langRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
        const handleClickOutside = (event: MouseEvent) => {
            if (langRef.current && !langRef.current.contains(event.target as Node)) {
                setIsLangOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const languages: { code: Lang; label: string; flag: string }[] = [
        { code: "en", label: "English", flag: "🇺🇸" },
        { code: "zh", label: "中文", flag: "🇨🇳" },
        { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
        { code: "es", label: "Español", flag: "🇪🇸" },
        { code: "tr", label: "Türkçe", flag: "🇹🇷" },
    ];

    const currentLang = languages.find(l => l.code === lang) || languages[0];

    return (
        <header className="glass-header sticky top-0 z-50 border-b border-[var(--border-color)] w-full bg-[var(--bg-color)]/60 backdrop-blur-2xl">
            <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">

                {/* Left: Logo */}
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="h-9 w-auto flex items-center justify-center transition-transform group-hover:scale-105">
                            <img src="/optwin.png" alt="OptWin Logo" className="h-full w-auto object-contain drop-shadow-[0_0_12px_rgba(107,91,230,0.5)]" />
                        </div>
                        <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent text-gradient mt-0.5">
                            OptWin
                        </h1>
                    </Link>
                </div>

                {/* Right: Navigation & Controls */}
                <div className="flex items-center gap-4 md:gap-6">
                    <nav className="hidden md:flex items-center gap-6">
                        <a
                            href="#about"
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors"
                        >
                            {mounted ? <TranslatableText en="About" tr="Hakkında" noSpan /> : "About"}
                        </a>
                    </nav>

                    {/* Language Switch Dropdown */}
                    {mounted && (
                        <div className="relative" ref={langRef}>
                            <button
                                onClick={() => setIsLangOpen(!isLangOpen)}
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--border-color)]/80 text-[var(--text-primary)] transition-colors text-sm font-medium"
                            >
                                <span>{currentLang.flag}</span>
                                <span className="uppercase">{currentLang.code}</span>
                                <span className="material-symbols-outlined text-[16px]">expand_more</span>
                            </button>

                            {isLangOpen && (
                                <div className="absolute right-0 mt-2 w-40 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <div className="py-1">
                                        {languages.map((l) => (
                                            <button
                                                key={l.code}
                                                onClick={() => {
                                                    setLang(l.code);
                                                    setIsLangOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${lang === l.code ? 'bg-[var(--accent-color)]/10 text-[var(--accent-color)] font-bold' : 'text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)]'}`}
                                            >
                                                <span>{l.flag}</span>
                                                <span>{l.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Theme Toggle */}
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="flex items-center justify-center p-2 rounded-lg hover:bg-[var(--border-color)]/80 text-[var(--text-primary)] transition-colors overflow-hidden"
                    >
                        {mounted ? (
                            <span className="material-symbols-outlined text-[20px]">
                                {theme === "dark" ? "light_mode" : "dark_mode"}
                            </span>
                        ) : null}
                    </button>

                    <div className="md:hidden">
                        <MobileNav />
                    </div>
                </div>

            </div>
        </header>
    );
}
