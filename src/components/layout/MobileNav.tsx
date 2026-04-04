"use client";

import { useOptWinStore, Lang } from "@/store/useOptWinStore";
import { useTranslation } from "@/i18n/useTranslation";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { MenuIcon, XIcon, HeartIcon } from "../shared/Icons";
import { USFlag, TRFlag, CNFlag, ESFlag, INFlag, DEFlag, FRFlag } from "../shared/Flags";

export function MobileNav() {
    const [isOpen, setIsOpen] = useState(false);
    const { lang, setLang, setSupportModalOpen } = useOptWinStore();
    const { t } = useTranslation();
    const router = useRouter();
    const pathname = usePathname();

    const languages: { code: Lang; label: string; flag: React.ReactNode }[] = [
        { code: "tr", label: "TR", flag: <TRFlag className="size-4 rounded-sm" /> },
        { code: "en", label: "EN", flag: <USFlag className="size-4 rounded-sm" /> },
        { code: "de", label: "DE", flag: <DEFlag className="size-4 rounded-sm" /> },
        { code: "fr", label: "FR", flag: <FRFlag className="size-4 rounded-sm" /> },
        { code: "zh", label: "ZH", flag: <CNFlag className="size-4 rounded-sm" /> },
        { code: "es", label: "ES", flag: <ESFlag className="size-4 rounded-sm" /> },
        { code: "hi", label: "HI", flag: <INFlag className="size-4 rounded-sm" /> },
    ];

    return (
        <div className="md:hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center size-10 rounded-lg text-(--text-primary) hover:bg-(--accent-color)/10 transition-colors"
            >
                {isOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
            </button>

            {isOpen && (
                <div className="fixed top-[65px] left-0 w-full bg-(--card-bg)/98 backdrop-blur-2xl border-b border-(--border-color) p-6 flex flex-col gap-6 shadow-[0_30px_60px_rgba(0,0,0,0.5)] z-50 animate-dropdown-enter">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-4 bg-(--accent-color) rounded-full" />
                            <span className="text-xs font-black text-(--text-secondary) uppercase tracking-widest">
                                {t["nav.language"]}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {languages.map((l) => (
                                <button
                                    key={l.code}
                                    onClick={() => setLang(l.code)}
                                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${lang === l.code
                                        ? "bg-(--accent-color)/10 border-(--accent-color)/30 text-(--accent-color) font-bold shadow-sm"
                                        : "bg-white/5 border-transparent text-(--text-secondary) active:scale-95"
                                        }`}
                                >
                                    <span className="text-sm tracking-tight">{l.label}</span>
                                    {l.flag}
                                </button>
                            ))}
                        </div>
                    </div>

                    <nav className="flex flex-col gap-2 pt-2 border-t border-(--border-color)">
                        <Link
                            href={`/${lang}#about`}
                            onClick={(e) => {
                                e.preventDefault();
                                setIsOpen(false);
                                const homePath = `/${lang}`;
                                if (pathname === '/' || pathname === homePath) {
                                                                    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                                } else {
                                                                    router.push(`/${lang}#about`);
                                }
                            }}
                            className="flex items-center justify-between p-4 rounded-xl bg-white/5 text-(--text-primary) font-bold active:scale-95 transition-all"
                        >
                            {t["nav.aboutOptwin"]}
                            <MenuIcon size={16} className="opacity-40" />
                        </Link>
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                setSupportModalOpen(true);
                            }}
                            className="flex items-center justify-between p-4 rounded-xl bg-white/5 text-(--text-primary) font-bold active:scale-95 transition-all text-left"
                        >
                            <span className="flex items-center gap-2">
                                <HeartIcon size={16} className="text-pink-500" />
                                {t["nav.support"]}
                            </span>
                            <MenuIcon size={16} className="opacity-40" />
                        </button>
                    </nav>
                </div>
            )}
        </div>
    );
}
