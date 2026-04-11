import { cacheService } from "@/lib/cache-service";
import { Zap, ShieldCheck, Rocket } from "lucide-react";

interface ValuePropositionSectionProps {
    locale: string;
}

export async function ValuePropositionSection({ locale }: ValuePropositionSectionProps) {
    const data = await cacheService.getPageContent("home-value-props", locale);
    const icons = [Zap, ShieldCheck, Rocket];
    
    // Güvenlik: Veritabanında henüz veri yoksa boş dön, sayfayı patlatma
    if (!data || data.length === 0) return null;

    return (
        <section className="w-full py-4 md:py-6 px-4 animate-fade-in-up border-b border-t border-(--border-color)/50 bg-(--bg-color)/90 backdrop-blur-md" id="value-props">
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 -mx-4 px-4 pb-2 hide-scrollbar md:grid md:grid-cols-3 md:px-0 md:overflow-visible md:snap-none max-w-7xl md:mx-auto">
                {data.map((item: { title: string, content: string[] }, index: number) => {
                    const Icon = icons[index % icons.length];
                    const description = item.content[0] || "";

                    return (
                        <div 
                            key={index} 
                            className="flex items-center gap-4 group snap-start min-w-[280px] md:min-w-0 p-5 rounded-2xl border border-(--border-color) bg-(--card-bg) hover:bg-(--card-bg)/80 hover:border-(--accent-color)/30 transition-all duration-300 shadow-sm hover:shadow-[0_4px_25px_rgba(108,92,231,0.15)]"
                        >
                            <div className="size-10 sm:size-12 shrink-0 rounded-xl bg-(--card-bg) border border-(--border-color) flex items-center justify-center text-(--accent-color) group-hover:scale-110 group-hover:bg-(--accent-color)/10 transition-all duration-300">
                                <Icon size={20} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h3 className="text-[15px] font-bold text-(--text-primary) mb-0.5 tracking-tight group-hover:text-(--accent-color) transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-(--text-secondary) leading-snug text-[13px]">
                                    {description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
