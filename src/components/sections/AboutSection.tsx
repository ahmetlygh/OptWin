"use client";

import { TranslatableText } from "../shared/TranslatableText";
import Link from "next/link";

export function AboutSection() {
    return (
        <section id="about" className="w-full flex flex-col gap-16 mt-20 mb-20 animate-fade-in-up">

            {/* Header */}
            <div className="text-center max-w-2xl mx-auto space-y-4">
                <h2 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight">
                    <TranslatableText en="About OptWin" tr="OptWin Hakkında" />
                </h2>
                <p className="text-lg text-[var(--text-secondary)] leading-relaxed font-medium">
                    <TranslatableText
                        en="Our mission is to empower Windows users with transparent, safe, and open-source optimization tools. We build utilities gamers and professionals can completely trust."
                        tr="Misyonumuz, Windows kullanıcılarını şeffaf, güvenli ve açık kaynaklı optimizasyon araçlarıyla güçlendirmektir. Oyuncuların ve profesyonellerin tamamen güvenebileceği araçlar üretiyoruz."
                    />
                </p>
            </div>

            {/* Values Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Card 1 */}
                <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-8 rounded-3xl transition-transform hover:-translate-y-2 group shadow-xl hover:shadow-[0_20px_40px_rgba(108,92,231,0.1)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[50px] pointer-events-none group-hover:bg-blue-500/20 transition-colors"></div>
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-2xl mb-6 shadow-inner ring-1 ring-blue-500/50">
                        <i className="fa-solid fa-shield-halved"></i>
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3 tracking-tight">
                        <TranslatableText en="Safe & Secure" tr="Güvenli" />
                    </h3>
                    <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
                        <TranslatableText
                            en="Every optimization is carefully vetted. Your system's security is our priority. We never deploy risky registry hacks blindly."
                            tr="Her optimizasyon özenle incelenir. Sisteminizin güvenliği bizim önceliğimizdir. Bilinmeyen riskli kayıt defteri ayarlarını asla körü körüne uygulamayız."
                        />
                    </p>
                </div>

                {/* Card 2 */}
                <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-8 rounded-3xl transition-transform hover:-translate-y-2 group shadow-xl hover:shadow-[0_20px_40px_rgba(108,92,231,0.1)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[50px] pointer-events-none group-hover:bg-emerald-500/20 transition-colors"></div>
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mb-6 shadow-inner ring-1 ring-emerald-500/50">
                        <i className="fa-solid fa-code"></i>
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3 tracking-tight">
                        <TranslatableText en="Open Source" tr="Açık Kaynak" />
                    </h3>
                    <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
                        <TranslatableText
                            en="Our code is 100% transparent. Inspect, audit, and contribute on GitHub. You own the code that modifies your machine."
                            tr="Kodumuz %100 şeffaftır. GitHub üzerinden inceleyebilir, denetleyebilir ve katkıda bulunabilirsiniz. Bilgisayarınızı değiştiren koda siz sahipsiniz."
                        />
                    </p>
                </div>

                {/* Card 3 */}
                <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-8 rounded-3xl transition-transform hover:-translate-y-2 group shadow-xl hover:shadow-[0_20px_40px_rgba(108,92,231,0.1)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-color)]/10 rounded-full blur-[50px] pointer-events-none group-hover:bg-[var(--accent-color)]/20 transition-colors"></div>
                    <div className="w-14 h-14 rounded-2xl bg-[var(--accent-color)]/20 text-[var(--accent-color)] flex items-center justify-center text-2xl mb-6 shadow-inner ring-1 ring-[var(--accent-color)]/50">
                        <i className="fa-solid fa-eye-low-vision"></i>
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3 tracking-tight">
                        <TranslatableText en="Transparent" tr="Şeffaf" />
                    </h3>
                    <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
                        <TranslatableText
                            en="No hidden background services or bloatware. Generate plain text batch scripts and see exactly what executes."
                            tr="Gizli arka plan servisleri veya gereksiz uygulamalar yok. Salt metin formunda script oluşturur ve ne çalıştırıldığını tam olarak görürsünüz."
                        />
                    </p>
                </div>
            </div>

            {/* Support / Donation Card */}
            <div className="max-w-4xl mx-auto w-full border border-[var(--border-color)] bg-gradient-to-br from-[var(--card-bg)] to-[#1a182e]/50 rounded-[2rem] p-10 md:p-14 shadow-2xl relative overflow-hidden flex flex-col items-center text-center gap-6">

                {/* Decorative glows */}
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-[var(--accent-color)]/20 rounded-full blur-[80px] pointer-events-none"></div>
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-pink-500/10 rounded-full blur-[80px] pointer-events-none"></div>

                <div className="w-20 h-20 rounded-full bg-[var(--accent-color)]/10 text-[var(--accent-color)] flex items-center justify-center text-4xl mb-4 shadow-[0_0_30px_rgba(108,92,231,0.5)]">
                    <i className="fa-solid fa-heart animate-pulse"></i>
                </div>

                <div className="space-y-3 z-10">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">
                        <TranslatableText en="Support OptWin Development" tr="OptWin Geliştirmesini Destekle" />
                    </h2>
                    <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto leading-relaxed">
                        <TranslatableText
                            en="OptWin is entirely free and open-source forever. Your contribution directly fuels new features and keeps the servers running for everyone."
                            tr="OptWin sonsuza dek tamamen ücretsiz ve açık kaynaktır. Katkılarınız doğrudan yeni özellikleri güçlendirir ve sunucuların herkes için çalışmasını sağlar."
                        />
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 my-4 z-10">
                    <div className="flex items-center gap-2 bg-[var(--card-bg)] border border-[var(--border-color)] px-4 py-2 rounded-xl text-sm font-semibold text-[var(--text-primary)] shadow-sm">
                        <i className="fa-solid fa-users text-[var(--accent-color)]"></i> 100% Free
                    </div>
                    <div className="flex items-center gap-2 bg-[var(--card-bg)] border border-[var(--border-color)] px-4 py-2 rounded-xl text-sm font-semibold text-[var(--text-primary)] shadow-sm">
                        <i className="fa-solid fa-code text-blue-400"></i> Open Source
                    </div>
                    <div className="flex items-center gap-2 bg-[var(--card-bg)] border border-[var(--border-color)] px-4 py-2 rounded-xl text-sm font-semibold text-[var(--text-primary)] shadow-sm">
                        <i className="fa-solid fa-shield-halved text-emerald-400"></i> Secure
                    </div>
                </div>

                <a
                    href="https://www.buymeacoffee.com/ahmetly_"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="z-10 mt-4 px-8 py-4 bg-[#FFDD00] hover:bg-[#ffea4d] text-[#000000] font-black tracking-wide rounded-2xl transition-all shadow-[0_10px_20px_rgba(255,221,0,0.3)] hover:shadow-[0_15px_30px_rgba(255,221,0,0.4)] flex items-center gap-3"
                >
                    <i className="fa-solid fa-mug-hot text-xl"></i>
                    <TranslatableText en="Buy Me a Coffee" tr="Bana Bir Kahve Ismarla" noSpan />
                </a>

            </div>

        </section>
    );
}
