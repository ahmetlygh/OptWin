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
    const pathname = usePathname();
    const settings = serverSettings;
    
    const siteName = settings.site_name || "OptWin";
    const siteVersion = settings.site_version || "";
    const githubUrl = settings.github_url || "";
    const contactEmail = settings.contact_email || "";
    const copyrightText = settings.copyright_text || siteName;
    const copyrightYear = settings.copyright_year || new Date().getFullYear().toString();

    return (
        <footer className="w-full mt-4 pb-12 sm:pb-8 relative overflow-hidden group">
            {/* Ambient Background subtle glow - Widened */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-px bg-linear-to-r from-transparent via-(--accent-color)/30 to-transparent"></div>
            
            <div className="max-w-[1600px] mx-auto px-4 sm:px-10 pt-16">
                <div className="bg-(--card-bg)/40 backdrop-blur-2xl border border-(--border-color) rounded-[3.5rem] p-12 md:p-16 shadow-2xl relative isolation min-h-[450px] flex flex-col justify-between">
                    <div className="absolute inset-0 bg-linear-to-br from-(--accent-color)/4 to-transparent pointer-events-none rounded-[3.5rem]"></div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-start relative z-10">
                        {/* Branding */}
                        <div className="md:col-span-4 space-y-7 text-center md:text-left">
                            <Link href={`/${lang}`} className="inline-flex items-center gap-4 group/logo">
                                <div className="size-14 flex items-center justify-center relative">
                                    <Image 
                                        src={settings.site_logo_url || "/optwin.png"} 
                                        alt={siteName} 
                                        width={56} 
                                        height={56} 
                                        className="object-contain group-hover/logo:scale-110 drop-shadow-[0_0_20px_rgba(107,91,230,0.6)] transition-all duration-500" 
                                    />
                                    <div className="absolute inset-0 bg-(--accent-color)/10 blur-2xl rounded-full opacity-0 group-hover/logo:opacity-100 transition-opacity"></div>
                                </div>
                                <span className="text-3xl font-black text-gradient tracking-tight">{siteName}</span>
                            </Link>
                            <p className="text-[14px] text-(--text-secondary) leading-relaxed max-w-sm mx-auto md:mx-0 opacity-80 font-medium tracking-tight">
                                {t["footer.description"]}
                            </p>
                        </div>

                        {/* Navigation / Links */}
                        <div className="md:col-span-8 grid grid-cols-2 lg:grid-cols-3 gap-10 text-center md:text-left">
                            <div className="space-y-6">
                                <span className="text-[11px] font-black text-(--text-primary) uppercase tracking-[0.2em] opacity-30">{t["footer.legal"]}</span>
                                <div className="flex flex-col gap-4">
                                    <Link href="/privacy" className="text-sm font-semibold text-(--text-secondary) hover:text-(--accent-color) transition-all flex items-center gap-3 group/link sm:justify-start justify-center">
                                        <span className="size-1.5 rounded-full bg-(--border-color) group-hover/link:bg-(--accent-color) group-hover/link:scale-150 transition-all"></span>
                                        {t["footer.privacy"]}
                                    </Link>
                                    <Link href="/terms" className="text-sm font-semibold text-(--text-secondary) hover:text-(--accent-color) transition-all flex items-center gap-3 group/link sm:justify-start justify-center">
                                        <span className="size-1.5 rounded-full bg-(--border-color) group-hover/link:bg-(--accent-color) group-hover/link:scale-150 transition-all"></span>
                                        {t["footer.terms"]}
                                    </Link>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <span className="text-[11px] font-black text-(--text-primary) uppercase tracking-[0.2em] opacity-30">{t["footer.support"]}</span>
                                <div className="flex flex-col gap-4">
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
                                        className="text-sm font-semibold text-(--text-secondary) hover:text-(--accent-color) transition-all flex items-center gap-3 group/link sm:justify-start justify-center"
                                    >
                                        <span className="size-1.5 rounded-full bg-(--border-color) group-hover/link:bg-(--accent-color) group-hover/link:scale-150 transition-all"></span>
                                        {t["nav.about"]}
                                    </Link>
                                    <Link href="/contact" className="text-sm font-semibold text-(--text-secondary) hover:text-(--accent-color) transition-all flex items-center gap-3 group/link sm:justify-start justify-center">
                                        <span className="size-1.5 rounded-full bg-(--border-color) group-hover/link:bg-(--accent-color) group-hover/link:scale-150 transition-all"></span>
                                        {t["footer.contactUs"]}
                                    </Link>
                                </div>
                            </div>

                            <div className="col-span-2 lg:col-span-1 border-t lg:border-t-0 border-(--border-color) pt-10 lg:pt-0 space-y-6">
                                <span className="text-[11px] font-black text-(--text-primary) uppercase tracking-[0.2em] opacity-30">{t["footer.contact"]}</span>
                                <div className="flex flex-col gap-3">
                                    {contactEmail ? (
                                        <a href={`mailto:${contactEmail}`} className="text-[15px] font-bold text-(--accent-color) hover:opacity-80 transition-all break-all sm:justify-start justify-center flex items-center tracking-tight">
                                            {contactEmail}
                                        </a>
                                    ) : (
                                        <span className="text-sm font-semibold text-(--text-secondary) opacity-50 italic">info@optwin.tech</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom strip */}
                    <div className="mt-16 pt-10 border-t border-(--border-color) flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-5 text-center md:text-left">
                            <span className="text-[13px] font-bold text-(--text-secondary) opacity-50 whitespace-nowrap">
                                © {copyrightYear} {copyrightText}
                            </span>
                            <span className="hidden md:inline size-1 rounded-full bg-(--border-color) opacity-60"></span>
                            <span className="text-[13px] font-bold text-(--text-secondary) opacity-50">
                                {t["footer.allRights"]}
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            {siteVersion && (
                                <div className="px-4 py-1.5 rounded-full bg-(--accent-color)/5 border border-(--accent-color)/10 flex items-center gap-2.5">
                                    <div className="size-1.5 rounded-full bg-(--accent-color) animate-pulse"></div>
                                    <span className="text-[11px] font-bold text-(--accent-color) tracking-widest uppercase">v{siteVersion}</span>
                                </div>
                            )}
                            
                            {githubUrl && (
                                <a
                                    href={githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="size-11 flex items-center justify-center rounded-2xl bg-(--border-color)/40 text-(--text-secondary) hover:bg-(--accent-color) hover:text-white hover:-translate-y-1 transition-all duration-300 shadow-lg shadow-(--accent-color)/5"
                                >
                                    <GithubIcon size={20} />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
