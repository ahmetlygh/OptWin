import { prisma } from "@/lib/db";

export default async function AdminDashboard() {
    const [stats, featuresCount, categoriesCount, messagesCount, unreadCount] = await Promise.all([
        prisma.siteStats.findUnique({ where: { id: "main" } }),
        prisma.feature.count(),
        prisma.category.count(),
        prisma.contactMessage.count(),
        prisma.contactMessage.count({ where: { read: false, deleted: false } }),
    ]);

    const cards = [
        {
            title: "Total Visits",
            value: stats?.totalVisits?.toLocaleString() || "0",
            color: "from-blue-500 to-blue-600",
            bgGlow: "bg-blue-500/10",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" />
                </svg>
            ),
        },
        {
            title: "Scripts Downloaded",
            value: stats?.totalScripts?.toLocaleString() || "0",
            color: "from-emerald-500 to-emerald-600",
            bgGlow: "bg-emerald-500/10",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
            ),
        },
        {
            title: "Features",
            value: featuresCount.toString(),
            color: "from-[var(--accent-color)] to-purple-500",
            bgGlow: "bg-[var(--accent-color)]/10",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" />
                </svg>
            ),
        },
        {
            title: "Categories",
            value: categoriesCount.toString(),
            color: "from-amber-500 to-orange-500",
            bgGlow: "bg-amber-500/10",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" />
                </svg>
            ),
        },
        {
            title: "Messages",
            value: messagesCount.toString(),
            color: "from-pink-500 to-rose-500",
            bgGlow: "bg-pink-500/10",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
            ),
            badge: unreadCount > 0 ? unreadCount : undefined,
        },
        {
            title: "Unread Messages",
            value: unreadCount.toString(),
            color: "from-red-500 to-red-600",
            bgGlow: "bg-red-500/10",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0" />
                </svg>
            ),
        },
    ];

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Dashboard</h2>
                <p className="text-sm text-[#a19eb7] mt-1">Overview of your OptWin application</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map((card) => (
                    <div
                        key={card.title}
                        className="relative bg-[#1a1a24]/80 border border-[#2b2938] rounded-2xl p-5 overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-xl group"
                    >
                        {/* Glow */}
                        <div className={`absolute top-0 right-0 w-32 h-32 ${card.bgGlow} rounded-full blur-[50px] pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-500`}></div>

                        <div className="relative z-10 flex items-start justify-between">
                            <div>
                                <p className="text-xs text-[#a19eb7] font-medium uppercase tracking-wider mb-2">{card.title}</p>
                                <p className="text-3xl font-black text-white tracking-tight">{card.value}</p>
                            </div>
                            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-lg`}>
                                {card.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-[#1a1a24]/80 border border-[#2b2938] rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                        { label: "Manage Features", href: "/admin/features", color: "var(--accent-color)" },
                        { label: "View Messages", href: "/admin/messages", color: "#ec4899" },
                        { label: "Edit Translations", href: "/admin/translations", color: "#3b82f6" },
                        { label: "Site Settings", href: "/admin/settings", color: "#f59e0b" },
                    ].map((action) => (
                        <a
                            key={action.label}
                            href={action.href}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 hover:bg-white/5 text-sm font-medium text-[#a19eb7] hover:text-white transition-all duration-300 group"
                        >
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: action.color }}></div>
                            {action.label}
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
