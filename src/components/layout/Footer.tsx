"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { GithubIcon, HeartIcon } from "../shared/Icons";

interface PublicSettings {
    site_name?: string;
    github_url?: string;
    contact_email?: string;
    author_name?: string;
    author_url?: string;
    copyright_text?: string;
    copyright_year?: string;
}

interface FooterProps {
    serverSettings?: Record<string, string>;
}

export function Footer({ serverSettings = {} }: FooterProps) {
    const { t } = useTranslation();
    const settings = serverSettings;

    const siteName = settings.site_name || "";
    const githubUrl = settings.github_url || "";
    const contactEmail = settings.contact_email || "";
    const authorName = settings.author_name || "";
    const authorUrl = settings.author_url || "";
    const copyrightText = settings.copyright_text || siteName;
    const copyrightYear = settings.copyright_year || new Date().getFullYear().toString();
    const yearDisplay = copyrightYear;

    return (
        <footer className="w-full mt-4 border-t border-[var(--border-color)] bg-[var(--card-bg)]/80 backdrop-blur-lg">
            <div className="max-w-[1200px] mx-auto px-6 py-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                    {/* Left */}
                    <div className="flex flex-col gap-3 max-w-md items-center md:items-start">
                        <div className="flex items-center gap-2">
                            <Image src="/optwin.png" alt={siteName || "Logo"} width={28} height={28} className="h-7 w-auto" />
                            {siteName && <span className="text-lg font-black text-gradient">{siteName}</span>}
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
                            <a href="/#about" className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors">{t["nav.about"]}</a>
                            <Link href="/contact" className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors">{t["footer.contactUs"]}</Link>
                            {contactEmail && <a href={`mailto:${contactEmail}`} className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors">{contactEmail}</a>}
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-8 pt-6 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-[11px] text-[var(--text-secondary)]">© {yearDisplay} {copyrightText}. {t["footer.allRights"]}</span>
                    <div className="text-[11px] text-[var(--text-secondary)] flex items-center gap-3">
                        {githubUrl && (
                            <a
                                href={githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 hover:text-[var(--accent-color)] transition-colors"
                            >
                                <GithubIcon size={12} /> GitHub
                            </a>
                        )}
                        {authorName && (
                            <span className="flex items-center gap-1">
                                Made with <HeartIcon size={11} className="text-red-500 inline-block" /> by{" "}
                                {authorUrl ? (
                                    <a
                                        href={authorUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[var(--accent-color)] hover:text-purple-400 font-semibold transition-colors"
                                    >
                                        {authorName}
                                    </a>
                                ) : (
                                    <span className="font-semibold">{authorName}</span>
                                )}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </footer>
    );
}
