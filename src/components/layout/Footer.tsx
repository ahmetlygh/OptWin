"use client";

import { useTranslation } from "@/i18n/useTranslation";
import Link from "next/link";
import Image from "next/image";
import { GithubIcon } from "../shared/Icons";
import { useOptWinStore } from "@/store/useOptWinStore";
import { useRouter, usePathname } from "next/navigation";

interface FooterProps {
    serverSettings?: Record<string, string>;
}

export function Footer({ serverSettings = {} }: FooterProps) {
    const { t } = useTranslation();
    const { lang } = useOptWinStore();
    const router = useRouter();
    const pathname = usePathname();
    const settings = serverSettings;
    
    const siteName = settings.site_name || "OptWin";
    const siteVersion = settings.site_version || "";
    const githubUrl = settings.github_url || "";
    const contactEmail = settings.contact_email || "";
    const copyrightText = settings.copyright_text || siteName;
    const copyrightYear = settings.copyright_year || new Date().getFullYear().toString();

    return (
        <footer className="w-full mt-2 pb-10 sm:pb-6 relative overflow-hidden group">
            {/* Ambient Background subtle glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[1px] bg-gradient-to-r from-transparent via-[var(--accent-color)]/20 to-transparent"></div>
            
            <div className="max-w-[1400px] mx-auto px-6 pt-12">
                <div className="bg-[var(--card-bg)]/40 backdrop-blur-xl border border-[var(--border-color)] rounded-[3rem] p-10 md:p-14 shadow-xl relative isolation min-h-[400px] flex flex-col justify-between">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-color)]/[0.03] to-transparent pointer-events-none rounded-[2.5rem]"></div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-4 items-start relative z-10">
                        {/* Branding */}
                        <div className="md:col-span-5 space-y-5 text-center md:text-left">
                            <Link href={`/${lang}`} className="inline-flex items-center gap-3 group/logo">
                                <div className="size-10 flex items-center justify-center overflow-hidden">
                                    <Image src={settings.site_logo_url || "/optwin.png"} alt={siteName} width={40} height={40} className="object-contain group-hover/logo:scale-110 drop-shadow-[0_0_15px_rgba(107,91,230,0.5)] transition-transform duration-500" />
                                </div>
                                <span className="text-2xl font-black text-gradient tracking-tight">{siteName}</span>
                            </Link>
                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-sm mx-auto md:mx-0 opacity-80 font-medium">
                                {t["footer.description"]}
                            </p>
                        </div>

                        {/* Navigation / Links */}
                        <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 text-center md:text-left">
                            <div className="space-y-4">
                                <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest opacity-40">{t["footer.legal"]}</span>
                                <div className="flex flex-col gap-2.5">
                                    <Link href="/privacy" className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-all flex items-center gap-2 group/link sm:justify-start justify-center">
                                        <span className="size-1 rounded-full bg-[var(--border-color)] group-hover/link:bg-[var(--accent-color)] group-hover/link:scale-150 transition-all"></span>
                                        {t["footer.privacy"]}
                                    </Link>
                                    <Link href="/terms" className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-all flex items-center gap-2 group/link sm:justify-start justify-center">
                                        <span className="size-1 rounded-full bg-[var(--border-color)] group-hover/link:bg-[var(--accent-color)] group-hover/link:scale-150 transition-all"></span>
                                        {t["footer.terms"]}
                                    </Link>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest opacity-40">{t["footer.support"]}</span>
                                <div className="flex flex-col gap-2.5">
                                    <Link 
                                        href={`/${lang}#about`}
                                        onClick={(e) => {
                                            const homePath = `/${lang}`;
                                            const isHome = pathname === "/" || pathname === homePath || pathname === homePath + "/";
                                            if (isHome) {
                                                e.preventDefault();
                                                const element = document.getElementById('about');
                                                if (element) {
                                                    element.scrollIntoView({ behavior: 'smooth' });
                                                    window.history.pushState(null, "", `#about`);
                                                }
                                            }
                                        }}
                                        className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-all flex items-center gap-2 group/link sm:justify-start justify-center"
                                    >
                                        <span className="size-1 rounded-full bg-[var(--border-color)] group-hover/link:bg-[var(--accent-color)] group-hover/link:scale-150 transition-all"></span>
                                        {t["nav.about"]}
                                    </Link>
                                    <Link href="/contact" className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-all flex items-center gap-2 group/link sm:justify-start justify-center">
                                        <span className="size-1 rounded-full bg-[var(--border-color)] group-hover/link:bg-[var(--accent-color)] group-hover/link:scale-150 transition-all"></span>
                                        {t["footer.contactUs"]}
                                    </Link>
                                </div>
                            </div>

                            <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 border-[var(--border-color)] pt-8 sm:pt-0 space-y-4">
                                <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest opacity-40">Contact</span>
                                <div className="flex flex-col gap-2.5">
                                    {contactEmail ? (
                                        <a href={`mailto:${contactEmail}`} className="text-xs font-bold text-[var(--accent-color)] hover:opacity-80 transition-all break-all sm:justify-start justify-center flex items-center truncate">
                                            {contactEmail}
                                        </a>
                                    ) : (
                                        <span className="text-xs font-semibold text-[var(--text-secondary)] opacity-50 italic">info@optwin.tech</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom strip */}
                    <div className="mt-10 pt-8 border-t border-[var(--border-color)] flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                        <div className="flex flex-col md:flex-row items-center gap-1 md:gap-4 text-center md:text-left">
                            <span className="text-[11px] font-bold text-[var(--text-secondary)] opacity-40 whitespace-nowrap">
                                © {copyrightYear} {copyrightText}
                            </span>
                            <span className="hidden md:inline size-1 rounded-full bg-[var(--border-color)] opacity-50"></span>
                            <span className="text-[11px] font-bold text-[var(--text-secondary)] opacity-40">
                                {t["footer.allRights"]}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            {siteVersion && (
                                <div className="px-3 py-1 rounded-full bg-[var(--accent-color)]/5 border border-[var(--accent-color)]/10 flex items-center gap-2">
                                    <div className="size-1 rounded-full bg-[var(--accent-color)] animate-pulse"></div>
                                    <span className="text-[10px] font-black text-[var(--accent-color)] tracking-widest uppercase">v{siteVersion}</span>
                                </div>
                            )}
                            
                            {githubUrl && (
                                <a
                                    href={githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="size-10 flex items-center justify-center rounded-xl bg-[var(--border-color)]/30 text-[var(--text-secondary)] hover:bg-[var(--accent-color)] hover:text-white hover:-translate-y-1 transition-all duration-300 shadow-sm"
                                >
                                    <GithubIcon size={18} />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
