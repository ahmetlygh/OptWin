import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Layout, ChevronDown } from "lucide-react";

interface SidebarSectionProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({ title, icon, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="bg-white/15 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.15)] relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#6b5be6]/3 blur-3xl pointer-events-none" />
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-white/1 hover:bg-white/3 transition-colors"
            >
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-[#6b5be6]/10 text-[#6b5be6]">{icon}</div>
                    <span className="text-[11px] font-black text-white/50 uppercase tracking-widest">{title}</span>
                </div>
                <ChevronDown size={14} className={`text-white/20 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 pt-0">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export function ScriptSettingsSidebar({ keysCount, totalMissing, activeLangFullName, activeLangData }: any) {
    const percentage = keysCount > 0 ? Math.round(((keysCount - (totalMissing || 0)) / keysCount) * 100) : 100;
    const progressColor = percentage >= 90 ? "text-[#00f8da]" : percentage >= 50 ? "text-amber-400" : "text-orange-500";
    const barGradient = percentage >= 90
        ? "bg-linear-to-r from-[#04d16d] to-[#00f8da] shadow-[0_0_20px_rgba(0,248,218,0.25)]"
        : percentage >= 50 
        ? "bg-linear-to-r from-amber-500 to-yellow-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
        : "bg-linear-to-r from-red-500 to-orange-500";

    return (
        <div className="h-full overflow-y-auto optwin-pro-scroll space-y-4 pr-1 pb-4 flex-1">
            <SidebarSection title="İlerleme Durumu" icon={<Activity size={12} />} defaultOpen={true}>
                 <div className="flex items-center justify-between mb-3 mt-2">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{activeLangFullName}</span>
                    <span className={`text-[12px] font-black tabular-nums ${progressColor}`}>%{percentage}</span>
                </div>
                <div className="h-1.5 w-full bg-white/4 rounded-full overflow-hidden mb-3">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 1.2, ease: "circOut" }} className={`h-full rounded-full ${barGradient}`} />
                </div>
                <div className="space-y-1.5 mb-2 mt-4 text-[10px]">
                    <div className="flex justify-between items-center">
                        <span className="text-white/25 font-bold uppercase tracking-wider">Toplam Etiket</span>
                        <span className="text-white/50">{keysCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-white/25 font-bold uppercase tracking-wider">Eksik Olanlar</span>
                        <span className={totalMissing > 0 ? "text-amber-400/80 font-bold" : "text-emerald-400"}>
                            {totalMissing > 0 ? `${totalMissing}` : "0"}
                        </span>
                    </div>
                </div>
            </SidebarSection>
            
            <SidebarSection title="Bilgi" icon={<Layout size={12} />} defaultOpen={true}>
                <p className="text-[10px] text-white/30 leading-relaxed font-mono">
                    Bu sayfa projedeki tüm batch/powershell çıktılarında, CLI mesajlarında ve konsol arayüzünde görünen çevirileri içerir. <br /><br />Eksik olanları doldurmak için <strong>"Eksikler"</strong> menüsünden veya tabloda yer alan otomatik çevirici özelliğinden faydalanabilirsiniz.
                </p>
            </SidebarSection>
        </div>
    );
}
