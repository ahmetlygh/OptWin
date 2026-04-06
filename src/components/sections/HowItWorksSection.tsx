import { cacheService } from "@/lib/cache-service";
import { Settings2, Terminal, Play } from "lucide-react";

interface HowItWorksSectionProps {
    locale: string;
    translations: Record<string, string>;
}

export async function HowItWorksSection({ locale, translations }: HowItWorksSectionProps) {
    const data = await cacheService.getPageContent("home-how-it-works", locale);
    
    if (!data || data.length === 0) return null;

    const icons = [Settings2, Terminal, Play];

    return (
        <section className="w-full py-8 md:py-12 px-4 animate-fade-in-up">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-3">
                        {translations["howItWorks.section.title"] || "How It Works"}
                    </h2>
                    <p className="text-(--text-secondary) text-sm font-medium">{translations["howItWorks.subtitle"] || "As simple as 1, 2, 3."}</p>
                </div>
                
                <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-2 hide-scrollbar md:flex-row md:overflow-visible md:snap-none items-start justify-between relative">
                    {/* Connecting Line (Only visible on MD+) */}
                    <div className="hidden md:block absolute top-[28px] left-[15%] w-[70%] h-px bg-white/10 z-0"></div>

                    {data.map((step: { title: string, content: string[] }, index: number) => {
                        const Icon = icons[index % icons.length];
                        const description = step.content[0] || "";
                        const badgeKey = `howItWorks.step${index + 1}.title` as keyof typeof translations;

                        return (
                            <div key={index} className="relative z-10 flex flex-col items-center gap-4 text-center group snap-start min-w-[200px] shrink-0 md:shrink md:min-w-0 w-full md:w-1/3">
                                {/* Number Sphere */}
                                <div className="shrink-0 size-14 rounded-full bg-[#0d0d12]/80 border-2 border-white/5 flex items-center justify-center text-white/40 group-hover:bg-(--accent-color)/10 group-hover:border-(--accent-color)/30 group-hover:text-(--accent-color) transition-all duration-300 shadow-xl backdrop-blur-sm">
                                    <Icon size={24} strokeWidth={1.5} />
                                </div>

                                <div className="flex flex-col md:items-center">
                                    <div className="inline-flex px-2 py-0.5 bg-white/5 rounded border border-white/5 text-[9px] font-bold text-white/50 uppercase mb-2">
                                        {translations[badgeKey] || `Step ${index + 1}`}
                                    </div>
                                    <h3 className="text-[16px] font-bold text-white mb-1 tracking-tight">
                                        {step.title}
                                    </h3>
                                    <p className="text-(--text-secondary) text-[13px] leading-snug">
                                        {description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
