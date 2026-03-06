"use client";

import Link from "next/link";
import { useOptWinStore, Lang } from "@/store/useOptWinStore";
import { TranslatableText } from "../shared/TranslatableText";
import { useEffect, useState, useRef, useCallback } from "react";
import { MobileNav } from "./MobileNav";
import { ChevronDownIcon, SunIcon, MoonIcon } from "../shared/Icons";

export function Header() {
    const { lang, setLang, theme, toggleTheme } = useOptWinStore();
    const [mounted, setMounted] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [isLangClosing, setIsLangClosing] = useState(false);
    const langRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
        const handleClickOutside = (event: MouseEvent) => {
            if (langRef.current && !langRef.current.contains(event.target as Node)) {
                closeLangDropdown();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const closeLangDropdown = useCallback(() => {
        if (!isLangOpen) return;
        setIsLangClosing(true);
        setTimeout(() => {
            setIsLangOpen(false);
            setIsLangClosing(false);
        }, 150);
    }, [isLangOpen]);

    const toggleLangDropdown = () => {
        if (isLangOpen) {
            closeLangDropdown();
        } else {
            setIsLangOpen(true);
            setIsLangClosing(false);
        }
    };

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
                        <div className="h-9 w-auto flex items-center justify-center">
                            <img src="/optwin.png" alt="OptWin Logo" className="h-full w-auto object-contain drop-shadow-[0_0_12px_rgba(107,91,230,0.5)] group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent text-gradient mt-0.5">
                            OptWin
                        </h1>
                    </Link>
                </div>

                {/* Right */}
                <div className="flex items-center gap-4 md:gap-6">
                    <nav className="hidden md:flex items-center gap-6">
                        <a
                            href="#about"
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors duration-200"
                        >
                            {mounted ? <TranslatableText en="About" tr="Hakkında" noSpan /> : "About"}
                        </a>
                    </nav>

                    {/* Language Switch Dropdown */}
                    {mounted && (
                        <div className="relative" ref={langRef}>
                            <button
                                onClick={toggleLangDropdown}
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--border-color)]/80 text-[var(--text-primary)] text-sm font-medium transition-colors duration-200"
                            >
                                <span>{currentLang.flag}</span>
                                <span className="uppercase">{currentLang.code}</span>
                                <ChevronDownIcon
                                    size={16}
                                    className={`transition-transform duration-250 ${isLangOpen ? 'rotate-180' : 'rotate-0'}`}
                                />
                            </button>

                            {isLangOpen && (
                                <div className={`absolute right-0 mt-2 w-40 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-xl overflow-hidden ${isLangClosing ? 'dropdown-exit' : 'dropdown-enter'}`}>
                                    <div className="py-1">
                                        {languages.map((l) => (
                                            <button
                                                key={l.code}
                                                onClick={() => {
                                                    setLang(l.code);
                                                    closeLangDropdown();
                                                }}
                                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 ${lang === l.code ? 'bg-[var(--accent-color)]/10 text-[var(--accent-color)] font-bold' : 'text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)]'}`}
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
                        className="flex items-center justify-center p-2 rounded-lg hover:bg-[var(--border-color)]/80 text-[var(--text-primary)] overflow-hidden transition-colors duration-200"
                    >
                        {mounted ? (
                            <div className="relative w-5 h-5">
                                <div
                                    className={`absolute inset-0 flex items-center justify-center transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${theme === "dark" ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-50"}`}
                                >
                                    <SunIcon size={20} />
                                </div>
                                <div
                                    className={`absolute inset-0 flex items-center justify-center transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${theme === "light" ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"}`}
                                >
                                    <MoonIcon size={20} />
                                </div>
                            </div>
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
