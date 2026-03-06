"use client";

import { TranslatableText } from "../shared/TranslatableText";
import Link from "next/link";
import { ShieldIcon, CodeIcon, EyeOffIcon, HeartIcon, UsersIcon, CoffeeIcon } from "../shared/Icons";

export function AboutSection() {
    return (
        <section id="about" className="w-full flex flex-col gap-10 mt-12 mb-16 animate-fade-in-up">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto space-y-3">
                <h2 className="text-3xl md:text-4xl font-black text-[var(--text-primary)] tracking-tight">
                    <TranslatableText en="About OptWin" tr="OptWin Hakkında" />
                </h2>
                <p className="text-base text-[var(--text-secondary)] leading-relaxed font-medium">
                    <TranslatableText
                        en="Our mission is to empower Windows users with transparent, safe, and open-source optimization tools. We build utilities gamers and professionals can completely trust."
                        tr="Misyonumuz, Windows kullanıcılarını şeffaf, güvenli ve açık kaynaklı optimizasyon araçlarıyla güçlendirmektir. Oyuncuların ve profesyonellerin tamamen güvenebileceği araçlar üretiyoruz."
                    />
                </p>
            </div>

            {/* Values Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1 */}
                <div className="bg-[var(--card-bg)]/80 backdrop-blur-sm border border-[var(--border-color)] p-6 rounded-2xl hover:-translate-y-2 group shadow-lg hover:shadow-[0_20px_40px_rgba(108,92,231,0.15)] relative overflow-hidden transition-all duration-500 cubic-bezier(0.23, 1, 0.32, 1)">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-blue-500/20" style={{ transition: "background-color 0.3s" }}></div>
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4 shadow-inner ring-1 ring-blue-500/50">
                        <ShieldIcon size={22} />
                    </div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 tracking-tight">
                        <TranslatableText en="Safe & Secure" tr="Güvenli" />
                    </h3>
                    <p className="text-[var(--text-secondary)] leading-relaxed text-xs">
                        <TranslatableText
                            en="Every optimization is carefully vetted. Your system's security is our priority. We never deploy risky registry hacks blindly."
                            tr="Her optimizasyon özenle incelenir. Sisteminizin güvenliği bizim önceliğimizdir. Bilinmeyen riskli kayıt defteri ayarlarını asla körü körüne uygulamayız."
                        />
                    </p>
                </div>

                {/* Card 2 */}
                <div className="bg-[var(--card-bg)]/80 backdrop-blur-sm border border-[var(--border-color)] p-6 rounded-2xl hover:-translate-y-2 group shadow-lg hover:shadow-[0_20px_40px_rgba(108,92,231,0.15)] relative overflow-hidden transition-all duration-500 cubic-bezier(0.23, 1, 0.32, 1)">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-emerald-500/20" style={{ transition: "background-color 0.3s" }}></div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 shadow-inner ring-1 ring-emerald-500/50">
                        <CodeIcon size={22} />
                    </div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 tracking-tight">
                        <TranslatableText en="Open Source" tr="Açık Kaynak" />
                    </h3>
                    <p className="text-[var(--text-secondary)] leading-relaxed text-xs">
                        <TranslatableText
                            en="Our code is 100% transparent. Inspect, audit, and contribute on GitHub. You own the code that modifies your machine."
                            tr="Kodumuz %100 şeffaftır. GitHub üzerinden inceleyebilir, denetleyebilir ve katkıda bulunabilirsiniz. Bilgisayarınızı değiştiren koda siz sahipsiniz."
                        />
                    </p>
                </div>

                {/* Card 3 */}
                <div className="bg-[var(--card-bg)]/80 backdrop-blur-sm border border-[var(--border-color)] p-6 rounded-2xl hover:-translate-y-2 group shadow-lg hover:shadow-[0_20px_40px_rgba(108,92,231,0.15)] relative overflow-hidden transition-all duration-500 cubic-bezier(0.23, 1, 0.32, 1)">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--accent-color)]/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-[var(--accent-color)]/20" style={{ transition: "background-color 0.3s" }}></div>
                    <div className="w-12 h-12 rounded-xl bg-[var(--accent-color)]/20 text-[var(--accent-color)] flex items-center justify-center mb-4 shadow-inner ring-1 ring-[var(--accent-color)]/50">
                        <EyeOffIcon size={22} />
                    </div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 tracking-tight">
                        <TranslatableText en="Transparent" tr="Şeffaf" />
                    </h3>
                    <p className="text-[var(--text-secondary)] leading-relaxed text-xs">
                        <TranslatableText
                            en="No hidden background services or bloatware. Generate plain text batch scripts and see exactly what executes."
                            tr="Gizli arka plan servisleri veya gereksiz uygulamalar yok. Salt metin formunda script oluşturur ve ne çalıştırıldığını tam olarak görürsünüz."
                        />
                    </p>
                </div>
            </div>

            {/* Support / Donation Card */}
            <div className="max-w-3xl mx-auto w-full border border-[var(--border-color)] bg-gradient-to-br from-[var(--card-bg)] to-[#1a182e]/50 rounded-[1.5rem] p-8 md:p-10 shadow-xl relative overflow-hidden flex flex-col items-center text-center gap-5 backdrop-blur-md">

                {/* Decorative glows */}
                <div className="absolute -top-32 -right-32 w-48 h-48 bg-[var(--accent-color)]/20 rounded-full blur-[60px] pointer-events-none"></div>
                <div className="absolute -bottom-32 -left-32 w-48 h-48 bg-pink-500/10 rounded-full blur-[60px] pointer-events-none"></div>

                <div className="w-16 h-16 rounded-full bg-[var(--accent-color)]/10 text-[var(--accent-color)] flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(108,92,231,0.3)]">
                    <HeartIcon size={28} className="animate-pulse" />
                </div>

                <div className="space-y-2 z-10">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
                        <TranslatableText en="Support OptWin Development" tr="OptWin Geliştirmesini Destekle" />
                    </h2>
                    <p className="text-[var(--text-secondary)] text-sm max-w-xl mx-auto leading-relaxed">
                        <TranslatableText
                            en="OptWin is entirely free and open-source forever. Your contribution directly fuels new features and keeps the servers running for everyone."
                            tr="OptWin sonsuza dek tamamen ücretsiz ve açık kaynaktır. Katkılarınız doğrudan yeni özellikleri güçlendirir ve sunucuların herkes için çalışmasını sağlar."
                        />
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 my-2 z-10">
                    <div className="flex items-center gap-2 bg-[var(--bg-color)]/50 border border-[var(--border-color)] px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-primary)] shadow-sm">
                        <UsersIcon size={14} className="text-[var(--accent-color)]" /> 100% Free
                    </div>
                    <div className="flex items-center gap-2 bg-[var(--bg-color)]/50 border border-[var(--border-color)] px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-primary)] shadow-sm">
                        <CodeIcon size={14} className="text-blue-400" /> Open Source
                    </div>
                </div>

                <a
                    href="https://www.buymeacoffee.com/ahmetly_"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="z-10 mt-2 px-6 py-3 bg-[#FFDD00] hover:bg-[#ffea4d] text-[#000000] font-black tracking-wide rounded-xl shadow-[0_10px_20px_rgba(255,221,0,0.3)] hover:shadow-[0_15px_30px_rgba(255,221,0,0.4)] hover:-translate-y-1 flex items-center gap-2"
                    style={{ transition: "all 0.3s" }}
                >
                    <CoffeeIcon size={18} />
                    <TranslatableText en="Buy Me a Coffee" tr="Bana Bir Kahve Ismarla" noSpan />
                </a>

            </div>

        </section>
    );
}
