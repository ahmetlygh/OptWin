"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { TranslatableText } from "../shared/TranslatableText";
import { useState } from "react";
import Link from "next/link";

export function MobileNav() {
    const [isOpen, setIsOpen] = useState(false);
    const { lang, setLang } = useOptWinStore();

    return (
        <div className="md:hidden">
            {/* Hamburger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center size-10 rounded-lg text-[var(--text-primary)] hover:bg-[var(--accent-color)]/10 transition-colors"
            >
                <span className="material-symbols-outlined text-2xl">
                    {isOpen ? "close" : "menu"}
                </span>
            </button>

            {/* Flyout Menu */}
            {isOpen && (
                <div className="absolute top-[65px] left-0 w-full bg-[#131121]/95 backdrop-blur-xl border-b border-[var(--border-color)] p-4 flex flex-col gap-4 shadow-2xl z-50">
                    {/* Lang */}
                    <div className="flex items-center justify-between p-3">
                        <span className="text-sm text-[var(--text-secondary)]">
                            <TranslatableText en="Language" tr="Dil" />
                        </span>
                        <div className="flex gap-2 bg-[var(--card-bg)] p-1 rounded-lg border border-[var(--border-color)]">
                            <button
                                onClick={() => setLang("en")}
                                className={`py-1 px-3 text-sm rounded-md font-medium transition-colors ${lang === "en" ? "bg-[var(--accent-color)] text-white" : "text-[var(--text-secondary)] hover:text-white"}`}
                            >
                                EN
                            </button>
                            <button
                                onClick={() => setLang("tr")}
                                className={`py-1 px-3 text-sm rounded-md font-medium transition-colors ${lang === "tr" ? "bg-[var(--accent-color)] text-white" : "text-[var(--text-secondary)] hover:text-white"}`}
                            >
                                TR
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
