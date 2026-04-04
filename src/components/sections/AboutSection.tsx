"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { useOptWinStore } from "@/store/useOptWinStore";
import { ShieldIcon, CodeIcon, EyeOffIcon, HeartIcon } from "../shared/Icons";

export function AboutSection() {
    const { t } = useTranslation();
    const { setSupportModalOpen } = useOptWinStore();

    return (
        <section id="about" className="w-full flex flex-col items-center gap-10 mt-12 mb-6 animate-fade-in-up">
            {/* Header — Centered */}
            <div className="max-w-2xl text-center space-y-3">
                <h2 className="text-3xl md:text-4xl font-black text-(--text-primary) tracking-tight">
                    {t["about.title"]}
                </h2>
                <p className="text-base text-(--text-secondary) leading-relaxed font-medium">
                    {t["about.description"]}
                </p>
            </div>

            {/* Values Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                {/* Card 1 */}
                <div className="bg-(--card-bg)/80 backdrop-blur-sm border border-(--border-color) p-6 rounded-2xl hover:-translate-y-2 group shadow-lg hover:shadow-[0_20px_40px_rgba(108,92,231,0.15)] relative overflow-hidden transition-all duration-500 cubic-bezier(0.23, 1, 0.32, 1)">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/20" style={{ transition: "background-color 0.3s" }}></div>
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4 shadow-inner ring-1 ring-blue-500/50">
                        <ShieldIcon size={22} />
                    </div>
                    <h3 className="text-lg font-bold text-(--text-primary) mb-2 tracking-tight">{t["about.safeSecure"]}</h3>
                    <p className="text-(--text-secondary) leading-relaxed text-xs">{t["about.safeSecureDesc"]}</p>
                </div>

                {/* Card 2 */}
                <div className="bg-(--card-bg)/80 backdrop-blur-sm border border-(--border-color) p-6 rounded-2xl hover:-translate-y-2 group shadow-lg hover:shadow-[0_20px_40px_rgba(108,92,231,0.15)] relative overflow-hidden transition-all duration-500 cubic-bezier(0.23, 1, 0.32, 1)">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20" style={{ transition: "background-color 0.3s" }}></div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 shadow-inner ring-1 ring-emerald-500/50">
                        <CodeIcon size={22} />
                    </div>
                    <h3 className="text-lg font-bold text-(--text-primary) mb-2 tracking-tight">{t["about.openSource"]}</h3>
                    <p className="text-(--text-secondary) leading-relaxed text-xs">{t["about.openSourceDesc"]}</p>
                </div>

                {/* Card 3 */}
                <div className="bg-(--card-bg)/80 backdrop-blur-sm border border-(--border-color) p-6 rounded-2xl hover:-translate-y-2 group shadow-lg hover:shadow-[0_20px_40px_rgba(108,92,231,0.15)] relative overflow-hidden transition-all duration-500 cubic-bezier(0.23, 1, 0.32, 1)">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-(--accent-color)/10 rounded-full blur-2xl pointer-events-none group-hover:bg-(--accent-color)/20" style={{ transition: "background-color 0.3s" }}></div>
                    <div className="w-12 h-12 rounded-xl bg-(--accent-color)/20 text-(--accent-color) flex items-center justify-center mb-4 shadow-inner ring-1 ring-(--accent-color)/50">
                        <EyeOffIcon size={22} />
                    </div>
                    <h3 className="text-lg font-bold text-(--text-primary) mb-2 tracking-tight">{t["about.transparent"]}</h3>
                    <p className="text-(--text-secondary) leading-relaxed text-xs">{t["about.transparentDesc"]}</p>
                </div>
            </div>

            {/* Task 4: Enhance Support CTA Interactivity */}
            <div id="support" className="w-full max-w-md">
                <button
                    onClick={() => setSupportModalOpen(true)}
                    className="w-full group bg-linear-to-r from-(--accent-color)/10 to-pink-500/10 border border-(--border-color) hover:border-(--accent-color)/40 rounded-2xl p-6 text-center flex flex-col items-center gap-3 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(107,91,230,0.15)] relative overflow-hidden cursor-pointer hover:bg-white/2 active:scale-[0.98]"
                    style={{ transition: "all 0.4s cubic-bezier(0.23, 1, 0.32, 1)" }}
                >
                    <div className="absolute inset-0 bg-linear-to-r from-(--accent-color)/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="size-12 rounded-full bg-pink-500/15 text-pink-500 flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                        <HeartIcon size={22} />
                    </div>
                    <span className="text-lg font-bold text-(--text-primary) relative z-10">{t["support.title"]}</span>
                    <span className="text-xs text-(--text-secondary) relative z-10 max-w-xs">{t["support.description"]}</span>
                </button>
            </div>
        </section>
    );
}
