"use client";

import { useOptWinStore, Lang } from "@/store/useOptWinStore";
import { useTranslation } from "@/i18n/useTranslation";
import { useEffect, useState, useRef, useCallback, useSyncExternalStore, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronDownIcon, SunIcon, MoonIcon, HeartIcon } from "../shared/Icons";
import { MobileNav } from "./MobileNav";
import { ShieldCheck, LogOut, PanelLeft } from "lucide-react";
import { signOut } from "next-auth/react";
import { sanitizeSvg } from "@/lib/sanitize";

interface LanguageItem {
    code: string;
    name: string;
    nativeName: string;
    flagSvg: string;
    utcOffset: number;
}

interface HeaderProps {
    adminSession?: { name: string | null; image: string | null } | null;
    serverSettings?: Record<string, string>;
}

export function Header({ adminSession = null, serverSettings = {} }: HeaderProps) {
    const { lang, setLang, theme, toggleTheme, setSupportModalOpen, setIsChangingLocale } = useOptWinStore();
    const { t } = useTranslation();
    const router = useRouter();
    const pathname = usePathname();
    
    const mounted = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false
    );
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [isLangClosing, setIsLangClosing] = useState(false);
    const langRef = useRef<HTMLDivElement>(null);

    // Admin dropdown
    const [isAdminOpen, setIsAdminOpen] = useState(false);
    const [isAdminClosing, setIsAdminClosing] = useState(false);
    const adminRef = useRef<HTMLDivElement>(null);

    // Dynamic Site Name
    const siteName = serverSettings.site_name || "OptWin";

    // Parse dynamic languages from serverSettings (injected by SSR layout)
    const languages: LanguageItem[] = useMemo(() => {
        try {
            if (serverSettings._languagesData) {
                return JSON.parse(serverSettings._languagesData);
            }
        } catch { /* ignore */ }
        // Fallback if no data available
        return [
            { code: "tr", nativeName: "Türkçe", flagSvg: "", utcOffset: 3 },
            { code: "en", nativeName: "English", flagSvg: "", utcOffset: 0 },
        ];
    }, [serverSettings._languagesData]);

    // Derive locale codes from dynamic data
    const localeCodes = useMemo(() => languages.map(l => l.code), [languages]);

    const closeLangDropdown = useCallback(() => {
        if (!isLangOpen) return;
        setIsLangClosing(true);
        setTimeout(() => {
            setIsLangOpen(false);
            setIsLangClosing(false);
        }, 150);
    }, [isLangOpen]);

    const handleLangSwitch = (newLang: Lang) => {
        if (newLang === lang) { closeLangDropdown(); return; }
        
        setIsChangingLocale(true);
        closeLangDropdown();

        // Give some time for the exit animation of dropdown and entrance of loader
        setTimeout(() => {
            if (pathname) {
                const segments = pathname.split('/');
                if (segments.length > 1 && localeCodes.includes(segments[1])) {
                    segments[1] = newLang;
                    // Note: We DON'T call setLang(newLang) here anymore.
                    // ClientProviders will sync lang with the URL after navigation.
                    router.push(segments.join('/') || '/');
                    return;
                }
            }
            // Fallback for non-localized paths
            router.push(`/${newLang}`);
        }, 50);
    };

    const closeAdminDropdown = useCallback(() => {
        if (!isAdminOpen) return;
        setIsAdminClosing(true);
        setTimeout(() => {
            setIsAdminOpen(false);
            setIsAdminClosing(false);
        }, 150);
    }, [isAdminOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (langRef.current && !langRef.current.contains(event.target as Node)) {
                closeLangDropdown();
            }
            if (adminRef.current && !adminRef.current.contains(event.target as Node)) {
                closeAdminDropdown();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [closeLangDropdown, closeAdminDropdown]);

    const toggleLangDropdown = () => {
        if (isLangOpen) {
            closeLangDropdown();
        } else {
            setIsLangOpen(true);
            setIsLangClosing(false);
        }
    };

    const toggleAdminDropdown = () => {
        if (isAdminOpen) {
            closeAdminDropdown();
        } else {
            setIsAdminOpen(true);
            setIsAdminClosing(false);
        }
    };

    const handleLogoClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const homePath = `/${lang}`;
        if (pathname === "/" || pathname === homePath) {
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            router.push(homePath);
        }
    };

    const currentLang = languages.find(l => l.code === lang) || languages[0];

    return (
        <header className="glass-header sticky top-0 z-50 border-b border-(--border-color) w-full bg-(--bg-color)/60 backdrop-blur-2xl">
            <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">

                {/* Left: Logo — scroll to top when clicked */}
                <div className="flex items-center gap-3">
                    <Link href="/" onClick={handleLogoClick} className="flex items-center gap-3 group cursor-pointer">
                        <div className="h-9 w-auto flex items-center justify-center">
                            <Image src={serverSettings.site_logo_url || "/optwin.png"} alt={`${siteName} Logo`} width={36} height={36} priority className="object-contain drop-shadow-[0_0_12px_rgba(107,91,230,0.5)] group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent text-gradient mt-0.5">
                            {siteName}
                        </span>
                    </Link>
                </div>

                {/* Right */}
                <div className="flex items-center gap-4 md:gap-6">
                    <nav className="hidden md:flex items-center gap-6">
                        <Link
                            href={`/${lang}#about`}
                            className="text-sm font-medium text-(--text-secondary) hover:text-(--accent-color) transition-colors duration-200"
                            onClick={(e) => {
                                const targetPath = `/${lang}`;
                                const isHome = pathname === "/" || pathname === targetPath || pathname === targetPath + "/";
                                
                                if (isHome) {
                                    e.preventDefault();
                                    const element = document.getElementById('about');
                                    if (element) {
                                        element.scrollIntoView({ behavior: 'smooth' });
                                        window.history.pushState(null, "", `#about`);
                                    }
                                }
                                // If not home, let Next.js navigate normally to /${lang}#about
                            }}
                        >
                            {mounted ? t["nav.about"] : "About"}
                        </Link>
                        <Link
                            href="/contact"
                            className="text-sm font-medium text-(--text-secondary) hover:text-(--accent-color) transition-colors duration-200"
                        >
                            {mounted ? t["nav.contact"] : "Contact"}
                        </Link>
                        <button
                            onClick={() => setSupportModalOpen(true)}
                            className="text-sm font-medium text-(--text-secondary) hover:text-(--accent-color) transition-colors duration-200 flex items-center gap-1.5 cursor-pointer"
                        >
                            <HeartIcon size={14} className="text-pink-500" style={{ position: 'relative', top: '0.5px' }} />
                            {mounted ? t["nav.support"] : "Support"}
                        </button>
                    </nav>

                    {/* Language Switch Dropdown */}
                    {mounted && (
                        <div className="relative" ref={langRef}>
                            <button
                                onClick={toggleLangDropdown}
                                aria-label={(t as any)["aria.language"] || "Change language"}
                                className="cursor-pointer flex items-center gap-2 p-2 rounded-lg hover:bg-(--border-color)/80 text-(--text-primary) text-sm font-medium transition-colors duration-200"
                            >
                                {currentLang.flagSvg ? (
                                    <span className="w-5 h-3.5 flex items-center justify-center shrink-0 rounded-[2px] overflow-hidden [&>svg]:w-full [&>svg]:h-full [&>svg]:object-cover" dangerouslySetInnerHTML={{ __html: sanitizeSvg(currentLang.flagSvg).replace('<svg', '<svg width="20" height="14"') }} />
                                ) : (
                                    <span className="w-5 h-3.5 bg-gray-500/20 rounded-[2px]" />
                                )}
                                <span className="uppercase">{currentLang.code}</span>
                                <ChevronDownIcon
                                    size={16}
                                    className={`transition-transform duration-250 ${isLangOpen ? 'rotate-180' : 'rotate-0'}`}
                                />
                            </button>

                            {isLangOpen && (
                                <div className={`absolute right-0 mt-2 w-40 bg-(--card-bg) border border-(--border-color) rounded-xl shadow-xl overflow-hidden ${isLangClosing ? 'dropdown-exit' : 'dropdown-enter'}`}>
                                    <div className="py-1">
                                        {languages.map((l) => (
                                            <button
                                                key={l.code}
                                                onClick={() => handleLangSwitch(l.code as Lang)}
                                                className={`cursor-pointer w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 ${lang === l.code ? 'bg-(--accent-color)/10 text-(--accent-color) font-bold' : 'text-(--text-secondary) hover:bg-(--border-color) hover:text-(--text-primary)'}`}
                                            >
                                                {l.flagSvg ? (
                                                    <span className="w-5 h-3.5 flex items-center justify-center shrink-0 rounded-[2px] overflow-hidden [&>svg]:w-full [&>svg]:h-full [&>svg]:object-cover" dangerouslySetInnerHTML={{ __html: sanitizeSvg(l.flagSvg).replace('<svg', '<svg width="20" height="14"') }} />
                                                ) : (
                                                    <span className="w-5 h-3.5 bg-gray-500/20 rounded-[2px]" />
                                                )}
                                                <span>{l.nativeName}</span>
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
                        aria-label={(t as any)["aria.theme"] || "Toggle theme"}
                        className="cursor-pointer flex items-center justify-center p-2 rounded-lg hover:bg-(--border-color)/80 text-(--text-primary) overflow-hidden transition-colors duration-200"
                    >
                        {mounted ? (
                            <div className="relative w-5 h-5">
                                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${theme === "dark" ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-50"}`}>
                                    <SunIcon size={20} />
                                </div>
                                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${theme === "light" ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"}`}>
                                    <MoonIcon size={20} />
                                </div>
                            </div>
                        ) : null}
                    </button>

                    {/* Admin Profile Badge — only shown when logged in as admin */}
                    {mounted && adminSession && (
                        <div className="relative" ref={adminRef}>
                            <button
                                onClick={toggleAdminDropdown}
                                aria-label={(t as any)["aria.admin"] || "Admin menu"}
                                className="cursor-pointer flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-(--accent-color)/8 hover:bg-(--accent-color)/15 border border-(--accent-color)/15 hover:border-(--accent-color)/30 transition-all duration-200 group"
                            >
                                {adminSession.image ? (
                                    <Image
                                        src={adminSession.image}
                                        alt={adminSession.name || "Admin"}
                                        width={22}
                                        height={22}
                                        className="rounded-full ring-1 ring-(--accent-color)/30"
                                    />
                                ) : (
                                    <div className="w-[22px] h-[22px] rounded-full bg-(--accent-color)/20 flex items-center justify-center">
                                        <ShieldCheck size={12} className="text-(--accent-color)" />
                                    </div>
                                )}
                                <span className="hidden sm:inline text-xs font-bold text-(--accent-color)">
                                    {t["admin.role"]}
                                </span>
                                <ChevronDownIcon
                                    size={13}
                                    className={`text-(--accent-color)/50 transition-transform duration-250 ${isAdminOpen ? 'rotate-180' : 'rotate-0'}`}
                                />
                            </button>

                            {isAdminOpen && (
                                <div className={`absolute right-0 mt-2 w-48 bg-(--card-bg) border border-(--border-color) rounded-xl shadow-xl overflow-hidden ${isAdminClosing ? 'dropdown-exit' : 'dropdown-enter'}`}>
                                    <div className="px-4 py-3 border-b border-(--border-color)">
                                        <p className="text-xs font-bold text-(--text-primary) truncate">
                                            {adminSession.name || "Admin"}
                                        </p>
                                        <p className="text-[10px] text-(--accent-color) font-medium mt-0.5 flex items-center gap-1">
                                            <ShieldCheck size={10} />
                                            {t["admin.account"]}
                                        </p>
                                    </div>
                                    <div className="py-1">
                                        <Link
                                            href="/admin"
                                            onClick={() => closeAdminDropdown()}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-(--text-secondary) hover:bg-(--border-color) hover:text-(--text-primary) transition-colors"
                                        >
                                            <PanelLeft size={15} />
                                            {t["admin.panel"]}
                                        </Link>
                                        <button
                                            onClick={() => {
                                                closeAdminDropdown();
                                                signOut({ callbackUrl: "/" });
                                            }}
                                            className="cursor-pointer w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                                        >
                                            <LogOut size={15} />
                                            {t["admin.logout"]}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Mobile Navigation */}
                    <MobileNav />
                </div>

            </div>
        </header>
    );
}
