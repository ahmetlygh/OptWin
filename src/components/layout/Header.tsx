"use client";

import Link from "next/link";
import { useOptWinStore } from "@/store/useOptWinStore";
import { TranslatableText } from "../shared/TranslatableText";
import { useEffect, useState } from "react";
import { MobileNav } from "./MobileNav";

export function Header() {
    const { lang, setLang, theme, toggleTheme } = useOptWinStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <header className="sticky top-0 z-50 w-full bg-transparent">
            <div className="absolute inset-0 bg-[var(--bg-color)]/60 backdrop-blur-xl border-b border-[var(--border-color)]"></div>
            <div className="relative px-4 md:px-10 py-4 max-w-[1440px] mx-auto flex items-center justify-between">

                {/* Left: Logo */}
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-3 group">
                        {/* Adjust logo size to accurately represent aspect ratio without squishing */}
                        <div className="h-10 w-auto flex items-center justify-center transition-transform group-hover:scale-105">
                            <img src="/optwin.png" alt="OptWin Logo" className="h-full w-auto object-contain drop-shadow-[0_0_12px_rgba(107,91,230,0.5)]" />
                        </div>
                        <h2 className="text-[var(--text-primary)] text-2xl font-extrabold tracking-tight mt-0.5">
                            OptWin
                        </h2>
                    </Link>
                </div>

                {/* Middle: Navigation */}
                <nav className="hidden md:flex items-center gap-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <a
                        href="#about"
                        onClick={(e) => {
                            e.preventDefault();
                            document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium transition-colors"
                    >
                        {mounted ? <TranslatableText en="About" tr="Hakkımızda" noSpan /> : "About"}
                    </a>
                </nav>



                {/* Right: Controls */}
                <div className="flex items-center gap-4">

                    {/* Language Switch */}
                    {mounted && (
                        <div className="flex items-center gap-2 text-sm font-semibold select-none cursor-pointer text-[var(--text-secondary)] transition-colors">
                            <span
                                className={lang === "tr" ? "text-[var(--accent-color)]" : "hover:text-[var(--accent-color)]"}
                                onClick={() => setLang("tr")}
                            >
                                TR
                            </span>
                            <span className="opacity-50">/</span>
                            <span
                                className={lang === "en" ? "text-[var(--accent-color)]" : "hover:text-[var(--accent-color)]"}
                                onClick={() => setLang("en")}
                            >
                                EN
                            </span>
                        </div>
                    )}

                    {/* Theme Toggle */}
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="flex items-center justify-center size-9 rounded-lg text-[var(--text-primary)] hover:bg-[var(--accent-color)]/10 hover:text-[var(--accent-color)] transition-all overflow-hidden"
                    >
                        {mounted ? (
                            <span className="material-symbols-outlined text-xl">
                                {theme === "dark" ? "light_mode" : "dark_mode"}
                            </span>
                        ) : null}
                    </button>

                    <MobileNav />
                </div>

            </div>
        </header>
    );
}
