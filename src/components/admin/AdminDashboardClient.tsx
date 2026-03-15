"use client";

import { motion } from "framer-motion";
import {
    Eye,
    Download,
    FileCode2,
    Puzzle,
    FolderOpen,
    Globe,
    MessageSquare,
    Bell,
    ArrowRight,
    Clock,
} from "lucide-react";
import Link from "next/link";

type DashboardData = {
    totalVisits: number;
    totalScripts: number;
    totalDownloads: number;
    featuresCount: number;
    enabledFeaturesCount: number;
    categoriesCount: number;
    totalMessages: number;
    unreadMessages: number;
    recentMessages: {
        id: string;
        name: string;
        subject: string;
        read: boolean;
        createdAt: string;
    }[];
    dnsCount: number;
    topFeatures: {
        id: string;
        slug: string;
        title: string;
        category: string;
        selectCount: number;
    }[];
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

function formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toLocaleString();
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Az önce";
    if (minutes < 60) return `${minutes}dk önce`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}sa önce`;
    const days = Math.floor(hours / 24);
    return `${days}g önce`;
}

export function AdminDashboardClient({ data, userName = "Admin" }: { data: DashboardData; userName?: string }) {
    const stats = [
        {
            label: "Toplam Ziyaret",
            value: formatNumber(data.totalVisits),
            icon: <Eye size={18} />,
            color: "#3b82f6",
            glow: "rgba(59,130,246,0.12)",
        },
        {
            label: "Oluşturulan Script",
            value: formatNumber(data.totalScripts),
            icon: <FileCode2 size={18} />,
            color: "#10b981",
            glow: "rgba(16,185,129,0.12)",
        },
        {
            label: "İndirme",
            value: formatNumber(data.totalDownloads),
            icon: <Download size={18} />,
            color: "#8b5cf6",
            glow: "rgba(139,92,246,0.12)",
        },
        {
            label: "Aktif Özellik",
            value: `${data.enabledFeaturesCount}`,
            subtext: `${data.featuresCount} toplam`,
            icon: <Puzzle size={18} />,
            color: "#6b5be6",
            glow: "rgba(107,91,230,0.12)",
        },
        {
            label: "Kategoriler",
            value: data.categoriesCount.toString(),
            icon: <FolderOpen size={18} />,
            color: "#f59e0b",
            glow: "rgba(245,158,11,0.12)",
        },
        {
            label: "DNS Sağlayıcı",
            value: data.dnsCount.toString(),
            icon: <Globe size={18} />,
            color: "#06b6d4",
            glow: "rgba(6,182,212,0.12)",
        },
    ];

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Günaydın";
        if (hour < 18) return "İyi günler";
        return "İyi akşamlar";
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {/* Welcome Header */}
            <motion.div variants={itemVariants}>
                <div className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle,rgba(107,91,230,0.06),transparent_70%)] pointer-events-none" />
                    <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight">
                                {getGreeting()} <span className="text-gradient">{userName.split(" ")[0]}</span>
                            </h1>
                            <p className="text-sm text-white/30 mt-1">
                                OptWin yönetim paneline hoş geldiniz. Uygulamanızın genel durumunu buradan takip edebilirsiniz.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/[0.06] border border-emerald-500/10">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[11px] font-semibold text-emerald-400/80">Sistem Aktif</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Unread Messages Alert */}
            {data.unreadMessages > 0 && (
                <motion.div variants={itemVariants}>
                    <div className="relative overflow-hidden rounded-2xl border border-red-500/15 bg-red-500/[0.04] p-4">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle,rgba(239,68,68,0.1),transparent_70%)] pointer-events-none" />
                        <div className="relative flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                                <Bell size={18} className="text-red-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-white">
                                    {data.unreadMessages} okunmamış mesaj
                                </p>
                                <p className="text-xs text-white/30 mt-0.5">
                                    Yeni iletişim formu gönderileri var
                                </p>
                            </div>
                            <div className="text-xs text-white/15 bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/[0.04]">
                                Yakında
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Stats Grid */}
            <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
            >
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                        whileHover={{ y: -2, transition: { duration: 0.2 } }}
                        className="relative group rounded-2xl border border-white/[0.04] bg-white/[0.02] p-6 overflow-hidden"
                    >
                        {/* Hover glow */}
                        <div
                            className="absolute top-0 right-0 w-28 h-28 rounded-full blur-[40px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            style={{ backgroundColor: stat.glow }}
                        />

                        <div className="relative z-10 flex items-start justify-between">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-white/25 mb-2">
                                    {stat.label}
                                </p>
                                <p className="text-3xl font-black text-white tracking-tight">
                                    {stat.value}
                                </p>
                                {stat.subtext && (
                                    <p className="text-[11px] text-white/20 mt-1">{stat.subtext}</p>
                                )}
                            </div>
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{
                                    backgroundColor: stat.color + "12",
                                    color: stat.color,
                                }}
                            >
                                {stat.icon}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Top Features */}
            {data.topFeatures.length > 0 && (
                <motion.div variants={itemVariants}>
                    <div className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Puzzle size={16} className="text-white/20" />
                                <h3 className="text-sm font-bold text-white/70">En Çok Seçilen Özellikler</h3>
                            </div>
                            <Link
                                href="/admin/features"
                                className="text-[10px] font-medium text-[#6b5be6]/60 hover:text-[#6b5be6] transition-colors"
                            >
                                Tümünü gör
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {data.topFeatures.map((f, i) => {
                                const maxCount = data.topFeatures[0]?.selectCount || 1;
                                const pct = maxCount > 0 ? (f.selectCount / maxCount) * 100 : 0;
                                return (
                                    <motion.div
                                        key={f.id}
                                        initial={{ opacity: 0, x: -6 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + i * 0.04 }}
                                        className="relative overflow-hidden rounded-xl p-3 hover:bg-white/[0.02] transition-colors"
                                    >
                                        {/* Progress bar background */}
                                        <div
                                            className="absolute inset-y-0 left-0 bg-[#6b5be6]/[0.04] rounded-xl transition-all duration-700"
                                            style={{ width: `${pct}%` }}
                                        />
                                        <div className="relative z-10 flex items-center justify-between">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm text-white/70 font-medium truncate">{f.title}</p>
                                                <p className="text-[10px] text-white/15 mt-0.5">{f.category}</p>
                                            </div>
                                            <span className="text-xs font-bold text-[#6b5be6]/60 tabular-nums ml-3 shrink-0">
                                                {f.selectCount.toLocaleString()}
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                        {data.topFeatures.every(f => f.selectCount === 0) && (
                            <p className="text-xs text-white/15 text-center mt-3">
                                Henüz seçim verisi yok — kullanıcılar script oluşturdukça güncellenecek
                            </p>
                        )}
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Recent Messages */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-5"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <MessageSquare size={16} className="text-white/20" />
                            <h3 className="text-sm font-bold text-white/70">Son Mesajlar</h3>
                        </div>
                        {data.unreadMessages > 0 && (
                            <span className="text-[10px] font-bold bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full">
                                {data.unreadMessages} yeni
                            </span>
                        )}
                    </div>

                    {data.recentMessages.length === 0 ? (
                        <div className="text-center py-8">
                            <MessageSquare size={24} className="text-white/10 mx-auto mb-2" />
                            <p className="text-xs text-white/20">Henüz mesaj yok</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {data.recentMessages.map((msg, i) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + i * 0.05 }}
                                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.02] transition-colors"
                                >
                                    <div className={`w-2 h-2 rounded-full shrink-0 ${msg.read ? "bg-white/10" : "bg-red-400"}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white/70 font-medium truncate">
                                            {msg.subject}
                                        </p>
                                        <p className="text-[11px] text-white/20 truncate">
                                            from {msg.name}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-white/15 shrink-0">
                                        <Clock size={10} />
                                        {timeAgo(msg.createdAt)}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-5"
                >
                    <h3 className="text-sm font-bold text-white/70 mb-4">Hızlı İşlemler</h3>
                    <div className="space-y-2">
                        {[
                            { label: "Özellikleri Yönet", desc: "Optimizasyonları düzenle, aç/kapat", href: "/admin/features", color: "#6b5be6" },
                            { label: "Script Ayarları", desc: "Tüm diller için script metinlerini düzenle", href: "/admin/script-defaults", color: "#10b981" },
                        ].map((action, i) => (
                            <motion.div
                                key={action.href}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + i * 0.05 }}
                            >
                                <Link
                                    href={action.href}
                                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/[0.04] transition-all duration-200 group"
                                >
                                    <div
                                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: action.color + "12", color: action.color }}
                                    >
                                        <ArrowRight size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">
                                            {action.label}
                                        </p>
                                        <p className="text-[11px] text-white/20">{action.desc}</p>
                                    </div>
                                    <ArrowRight
                                        size={14}
                                        className="text-white/10 group-hover:text-white/30 transition-all group-hover:translate-x-1"
                                    />
                                </Link>
                            </motion.div>
                        ))}

                        {/* Disabled actions hint */}
                        <div className="mt-3 pt-3 border-t border-white/[0.04]">
                            <p className="text-[11px] text-white/15 text-center">
                                Daha fazla bölüm yakında — Kategoriler, Mesajlar, Ayarlar...
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
