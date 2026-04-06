import { prisma } from "@/lib/db";
import { StatsDisplay } from "./StatsDisplay";
import { GlobeIcon, DownloadIcon, TerminalIcon } from "../shared/Icons";

interface StatsSectionProps {
    translations: Record<string, string>;
}

export async function StatsSection({ translations }: StatsSectionProps) {
    const stats = await prisma.siteStats.findUnique({ where: { id: "main" } });

    const totalVisits = stats?.totalVisits || 0;
    const totalScripts = stats?.totalScripts || 0;
    const totalDownloads = stats?.totalDownloads || 0;

    const statItems = [
        { icon: <GlobeIcon size={20} />, value: totalVisits, label: translations["stats.totalVisits"] || "Total Visits", color: "from-blue-500/20 to-blue-500/5" },
        { icon: <TerminalIcon size={20} />, value: totalScripts, label: translations["stats.scriptsCreated"] || "Scripts Created", color: "from-(--accent-color)/20 to-(--accent-color)/5" },
        { icon: <DownloadIcon size={20} />, value: totalDownloads, label: translations["stats.downloads"] || "Downloads", color: "from-emerald-500/20 to-emerald-500/5" },
    ];

    return (
        <section className="w-full animate-fade-in-up">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {statItems.map((stat, i) => (
                    <div
                        key={i}
                        className="relative overflow-hidden bg-(--card-bg)/80 border border-(--border-color) rounded-2xl p-5 flex items-center gap-4 group hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(0,0,0,0.15)] transition-all duration-300"
                    >
                        <div className={`absolute inset-0 bg-linear-to-br ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                        <div className="size-12 rounded-xl bg-(--border-color) flex items-center justify-center text-(--accent-color) shrink-0 relative z-10 group-hover:scale-110 transition-transform duration-300">
                            {stat.icon}
                        </div>
                        <div className="relative z-10">
                            <div className="text-2xl md:text-3xl font-black text-(--text-primary) tracking-tight">
                                <StatsDisplay value={stat.value} />
                            </div>
                            <div className="text-xs text-(--text-secondary) font-semibold uppercase tracking-wider mt-0.5">
                                {stat.label}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
