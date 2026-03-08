"use client";

import { useTranslation } from "@/i18n/useTranslation";
import Link from "next/link";
import { GithubIcon, HeartIcon } from "../shared/Icons";

export function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="w-full mt-4 border-t border-[var(--border-color)] bg-[var(--card-bg)]/80 backdrop-blur-lg">
            <div className="max-w-[1200px] mx-auto px-6 py-10">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    {/* Left */}
                    <div className="flex flex-col gap-3 max-w-md">
                        <div className="flex items-center gap-2">
                            <img src="/optwin.png" alt="OptWin" className="h-7 w-auto" />
                            <span className="text-lg font-black text-gradient">OptWin</span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                            {t["footer.description"]}
                        </p>
                    </div>

                    {/* Right */}
                    <div className="flex gap-12 text-sm">
                        <div className="flex flex-col gap-2.5">
                            <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">{t["footer.legal"]}</span>
                            <Link href="/privacy" className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors">{t["footer.privacy"]}</Link>
                            <Link href="/terms" className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors">{t["footer.terms"]}</Link>
                        </div>
                        <div className="flex flex-col gap-2.5">
                            <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">{t["footer.support"]}</span>
                            <Link href="/contact" className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors">{t["footer.contactUs"]}</Link>
                            <a href="https://github.com/ahmetly" target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors flex items-center gap-1.5">
                                <GithubIcon size={12} /> GitHub
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-8 pt-6 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-[11px] text-[var(--text-secondary)]">© {new Date().getFullYear()} OptWin. {t["footer.allRights"]}</span>
                    <span className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1">
                        Made with <HeartIcon size={11} className="text-red-500 inline-block" /> by{" "}
                        <a
                            href="https://www.ahmetly.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--accent-color)] hover:text-purple-400 font-semibold transition-colors"
                        >
                            ahmetly_
                        </a>
                    </span>
                </div>
            </div>
        </footer>
    );
}
