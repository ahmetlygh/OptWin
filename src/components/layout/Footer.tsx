import { getSettings } from "@/lib/settings";
import { prisma } from "@/lib/db";
import { TranslatableText } from "../shared/TranslatableText";
import Link from "next/link";
import { GithubIcon, InfoIcon } from "../shared/Icons";

export async function Footer() {
    // Parallel fetch
    const [settings, uiTranslations] = await Promise.all([
        getSettings(["site_version", "contact_email"]),
        prisma.uiTranslation.findMany({
            where: { key: "footer.text" }
        }),
    ]);

    return (
        <footer className="w-full border-t border-[var(--border-color)] bg-[rgba(13,13,18,0.7)] backdrop-blur-xl mt-auto">
            <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-12">
                <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-10">

                    {/* Brand Section */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4 max-w-sm">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="h-10 w-auto flex items-center justify-center">
                                <img src="/optwin.png" alt="OptWin Logo" className="h-full w-auto object-contain drop-shadow-[0_0_10px_rgba(107,91,230,0.3)] group-hover:drop-shadow-[0_0_15px_rgba(107,91,230,0.6)]" style={{ transition: "filter 0.3s" }} />
                            </div>
                            <h2 className="text-[var(--text-primary)] text-2xl font-extrabold tracking-tight">
                                OptWin
                            </h2>
                        </Link>
                        <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                            <TranslatableText
                                en="Ultimate open-source Windows optimization suite. Secure, fast, and reliable system tuning for Gamers and Professionals."
                                tr="Açık kaynaklı nihai Windows optimizasyon aracı. Oyuncular ve Profesyoneller için güvenli, hızlı ve güvenilir sistem ince ayarı."
                            />
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-col sm:flex-row gap-10 sm:gap-20 text-center md:text-left">
                        {/* Legal */}
                        <div className="flex flex-col gap-3">
                            <h3 className="text-[var(--text-primary)] font-bold text-sm tracking-widest uppercase mb-1">
                                <TranslatableText en="Legal" tr="Yasal" />
                            </h3>
                            <Link href="/privacy" className="text-[var(--text-secondary)] hover:text-[var(--accent-color)] text-sm font-medium" style={{ transition: "color 0.2s" }}>
                                <TranslatableText en="Privacy Policy" tr="Gizlilik Politikası" />
                            </Link>
                            <Link href="/terms" className="text-[var(--text-secondary)] hover:text-[var(--accent-color)] text-sm font-medium" style={{ transition: "color 0.2s" }}>
                                <TranslatableText en="Terms of Service" tr="Hizmet Şartları" />
                            </Link>
                        </div>

                        {/* Support */}
                        <div className="flex flex-col gap-3">
                            <h3 className="text-[var(--text-primary)] font-bold text-sm tracking-widest uppercase mb-1">
                                <TranslatableText en="Support" tr="Destek" />
                            </h3>
                            <Link href="/contact" className="text-[var(--text-secondary)] hover:text-[var(--accent-color)] text-sm font-medium" style={{ transition: "color 0.2s" }}>
                                <TranslatableText en="Contact Us" tr="Bize Ulaşın" />
                            </Link>
                            <a href={`mailto:${settings.contact_email || "contact@optwin.tech"}`} className="text-[var(--text-secondary)] hover:text-[var(--accent-color)] text-sm font-medium" style={{ transition: "color 0.2s" }}>
                                {settings.contact_email || "contact@optwin.tech"}
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-[var(--border-color)] flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-[var(--text-secondary)] text-xs font-medium">
                        &copy; 2026 OptWin. <TranslatableText en="All rights reserved." tr="Tüm hakları saklıdır." />
                    </div>

                    <div className="flex items-center gap-6">
                        <Link
                            href="https://github.com/ahmetlygh/optwin/releases"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-mono font-semibold flex items-center gap-1.5"
                            style={{ transition: "color 0.2s" }}
                        >
                            <InfoIcon size={14} />
                            {settings.site_version || "v1.3.0"}
                        </Link>
                        <a
                            href="https://github.com/ahmetlygh/optwin"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-2"
                            style={{ transition: "color 0.2s" }}
                        >
                            <GithubIcon size={18} />
                            <span className="text-xs font-semibold">GitHub</span>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
