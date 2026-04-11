import { cacheService } from "@/lib/cache-service";
import { X, Check } from "lucide-react";
import Image from "next/image";

interface BeforeAfterSectionProps {
    locale: string;
    translations: Record<string, string>;
}

export async function BeforeAfterSection({ locale, translations }: BeforeAfterSectionProps) {
    const data = await cacheService.getPageContent("home-before-after", locale);
    
    if (!data || data.length < 2) return null;

    const before = data[0];
    const after = data[1];

    return (
        <section className="w-full py-12 px-4 animate-fade-in-up">
            <div className="max-w-5xl mx-auto">
                <div className="bg-(--card-bg) dark:bg-[#09090b] border border-(--border-color) dark:border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
                    
                    {/* Before Half */}
                    <div className="flex-1 p-6 md:p-10 relative group border-b md:border-b-0 md:border-r border-(--border-color) dark:border-white/5 bg-linear-to-br from-red-500/5 to-transparent">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl pointer-events-none transition-colors"></div>
                        
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-extrabold uppercase tracking-widest mb-4">
                            {translations["beforeAfter.before.title"] || "Without OptWin"}
                        </div>
                        
                        <h3 className="text-xl font-bold text-(--text-primary) mb-5 tracking-tight">
                            {before.title}
                        </h3>
                        
                        <ul className="space-y-3">
                            {before.content.map((item: string, idx: number) => (
                                <li key={idx} className="flex gap-3 text-(--text-secondary) text-sm leading-snug">
                                    <div className="mt-0.5 text-red-500">
                                        <X size={14} strokeWidth={3} />
                                    </div>
                                    <span className="font-medium">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* After Half */}
                    <div className="flex-1 p-6 md:p-10 relative group bg-linear-to-br from-(--accent-color)/10 to-transparent">
                        <div className="absolute bottom-0 right-0 w-40 h-40 bg-(--accent-color)/20 rounded-full blur-3xl pointer-events-none transition-colors"></div>
                        
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-(--accent-color)/10 border border-(--accent-color)/20 text-(--accent-color) text-[11px] font-extrabold uppercase tracking-widest mb-4">
                            {translations["beforeAfter.after.title"] || "With OptWin"}
                        </div>
                        
                        <h3 className="text-xl font-bold text-(--text-primary) mb-5 tracking-tight">
                            {after.title}
                        </h3>
                        
                        <ul className="space-y-3">
                            {after.content.map((item: string, idx: number) => (
                                <li key={idx} className="flex gap-3 text-(--text-primary) font-medium text-sm leading-snug">
                                    <div className="mt-0.5 text-(--accent-color)">
                                        <Check size={14} strokeWidth={3} />
                                    </div>
                                    <span className="font-semibold text-[15px]">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
            
            {/* Visual Proof */}
            <div className="mt-12 rounded-3xl overflow-hidden border border-(--border-color) dark:border-white/10 shadow-[0_0_40px_rgba(108,92,231,0.1)] hover:shadow-[0_0_60px_rgba(108,92,231,0.25)] transition-shadow duration-500 relative aspect-16/7 max-w-5xl mx-auto p-2 bg-(--card-bg)/50 dark:bg-white/5 backdrop-blur-sm">
                <div className="relative w-full h-full rounded-2xl overflow-hidden border border-(--border-color) dark:border-white/5 bg-(--card-bg) dark:bg-[#09090b]">
                    <Image
                        src="/ram-comparison.png"
                        alt="RAM usage comparison: Before OptWin 4.2GB vs After OptWin 1.8GB"
                        fill
                        className="object-cover scale-[1.02] hover:scale-100 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, 1024px"
                        unoptimized
                    />
                </div>
            </div>
        </section>
    );
}
