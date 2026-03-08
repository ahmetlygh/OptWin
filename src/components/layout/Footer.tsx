"use client";

import { useTranslation } from "@/i18n/useTranslation";
import Link from "next/link";
import Image from "next/image";
import { GithubIcon, HeartIcon } from "../shared/Icons";

export function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="w-full mt-4 border-t border-[var(--border-color)] bg-[var(--card-bg)]/80 backdrop-blur-lg">
            <div className="max-w-[1200px] mx-auto px-6 py-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                    {/* Left */}
                    <div className="flex flex-col gap-3 max-w-md items-center md:items-start">
                        <div className="flex items-center gap-2">
                            <Image src="/optwin.png" alt="OptWin" width={28} height={28} className="h-7 w-auto" />
                            <span className="text-lg font-black text-gradient">OptWin</span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                            {t["footer.description"]}
                        </p>
                    </div>

                    {/* Right */}
                    <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 text-sm justify-center">
                        <div className="flex flex-col gap-2.5 items-center md:items-start">
                            <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">{t["footer.legal"]}</span>
                            <Link href="/privacy" className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors">{t["footer.privacy"]}</Link>
                            <Link href="/terms" className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors">{t["footer.terms"]}</Link>
                        </div>
                        <div className="flex flex-col gap-2.5 items-center md:items-start">
                            <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">{t["footer.support"]}</span>
                            <Link href="/contact" className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors">{t["footer.contactUs"]}</Link>
                            <a href="mailto:contact@optwin.tech" className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors">contact@optwin.tech</a>
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-8 pt-6 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-[11px] text-[var(--text-secondary)]">© {new Date().getFullYear()} OptWin. {t["footer.allRights"]}</span>
                    <div className="text-[11px] text-[var(--text-secondary)] flex items-center gap-3">
                        <a
                            href="https://github.com/ahmetlygh/OptWin"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 hover:text-[var(--accent-color)] transition-colors"
                        >
                            <GithubIcon size={12} /> GitHub
                        </a>
                        <span className="flex items-center gap-1">
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
            </div>
        </footer>
    );
}
