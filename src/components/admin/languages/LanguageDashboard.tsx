"use client";

import { useEffect, useState, useMemo } from "react";
import { Plus, Trash2, CheckCircle2, AlertCircle, Activity, Settings, GripVertical, ListOrdered, Save, X, Settings2 } from "lucide-react";
import { useOptWinStore } from "@/store/useOptWinStore";
import { LanguageEditorModal } from "./LanguageEditorModal";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Loader } from "@/components/shared/Loader";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";
import { FlagIcon } from "@/components/shared/FlagIcon";
import { calculateProgress } from "@/lib/translationUtils";

export interface Language {
    id: string;
    code: string;
    name: string;
    nativeName: string;
    turkishName: string;
    flagSvg: string;
    utcOffset: number;
    isActive: boolean;
    isDefault: boolean;
    sortOrder: number;
    translations?: Record<string, string>;
    seoMetadata?: any;
}

// Dedicated Sorting Modal
const SortingModal = ({ languages, onClose, onSave }: { languages: Language[], onClose: () => void, onSave: (items: Language[]) => void }) => {
    const [items, setItems] = useState<Language[]>([]);
    useEffect(() => { setItems([...languages]); }, [languages]);

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-[#0d0d12] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-5 border-b border-white/[0.05] flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-2"><ListOrdered size={18} className="text-[#6b5be6]" /><h2 className="text-lg font-bold text-white uppercase tracking-tighter">SIRALAMAYI DÜZENLE</h2></div>
                    <button onClick={onClose} className="p-2 text-white/30 hover:text-white transition-colors"><X size={20} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-2">
                        {items.map((lang) => (
                            <Reorder.Item key={lang.id} value={lang} className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl flex items-center gap-3 cursor-grab active:cursor-grabbing hover:bg-white/[0.05] transition-colors">
                                <GripVertical size={16} className="text-white/15" />
                                <FlagIcon flagSvg={lang.flagSvg} size="sm" />
                                <span className="text-sm font-bold text-white/80 flex-1 uppercase tracking-tight">{lang.nativeName}</span>
                                <span className="text-[10px] text-white/20 font-mono uppercase">{lang.code}</span>
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>
                </div>
                <div className="p-4 border-t border-white/[0.05] bg-white/[0.01] flex gap-3">
                    <button onClick={() => onSave(items)} className="flex-1 py-3 bg-[#6b5be6] hover:bg-[#5a4cc2] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-purple-900/20 transition-all active:scale-95">KAYDET</button>
                </div>
            </motion.div>
        </div>
    );
};

export function LanguageDashboard() {
    const router = useRouter();
    const { showToast } = useOptWinStore();
    const [languages, setLanguages] = useState<Language[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSortingMode, setIsSortingMode] = useState(false);
    
    const defaultLang = useMemo(() => languages.find(l => l.isDefault), [languages]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [activeLang, setActiveLang] = useState<Language | null>(null);
    const [langToDelete, setLangToDelete] = useState<Language | null>(null);

    useEffect(() => {
        fetchLanguages();
    }, []);

    const fetchLanguages = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/languages");
            if (res.ok) {
                const data = await res.json();
                setLanguages(data);
                window.dispatchEvent(new CustomEvent('optwin:languages-updated'));
            } else {
                showToast("Diller getirilemedi.", "error");
            }
        } catch {
            showToast("Veri çekme hatası.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveOrder = async (reordered: Language[]) => {
        const updatePayload = reordered.map((l, i) => ({ id: l.id, sortOrder: i }));
        try {
            const res = await fetch("/api/admin/languages", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reorder: updatePayload })
            });
            if (!res.ok) throw new Error();
            setLanguages([...reordered]);
            setIsSortingMode(false);
            showToast("Sıralama güncellendi.", "success");
        } catch {
            showToast("Sıralama güncellenemedi.", "error");
        }
    };

    const handleDelete = async (lang: Language) => {
        try {
            const res = await fetch(`/api/admin/languages?id=${lang.id}`, { method: "DELETE" });
            if (res.ok) {
                showToast("Dil silindi", "success");
                setLangToDelete(null);
                fetchLanguages();
                window.dispatchEvent(new CustomEvent('optwin:languages-updated'));
            } else {
                const data = await res.json();
                showToast(data.error || "Silinirken hata oluştu", "error");
            }
        } catch {
            showToast("Ağ hatası", "error");
        }
    };

    if (isLoading) return <div className="flex items-center justify-center p-20"><Loader /></div>;

    const defaultKeys = Object.keys(defaultLang?.translations || {});

    return (
        <div className="p-5 md:p-6 lg:p-8 h-full flex flex-col space-y-6 overflow-y-auto custom-scrollbar">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-2xl font-black tracking-tighter text-white mb-1 uppercase">DİL YÖNETİMİ</h1>
                    <p className="text-xs text-white/30 font-bold uppercase tracking-widest">Platform dillerini ve sıralamasını optimize edin.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsSortingMode(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] hover:bg-white/[0.08] text-white/40 hover:text-white border border-white/[0.06] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                    >
                        <ListOrdered size={14} /> SIRALAMAYI DÜZENLE
                    </button>
                    <button
                        onClick={() => { setActiveLang(null); setIsEditModalOpen(true); }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#6b5be6] hover:bg-[#5a4cc2] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-purple-900/20 transition-all active:scale-95"
                    >
                        <Plus size={14} /> YENİ DİL EKLE
                    </button>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {languages.map((lang) => {
                        const { percentage } = calculateProgress(lang.translations, lang.seoMetadata, defaultKeys);
                        const isSuccess = percentage >= 90;
                        const isCaution = percentage >= 50 && percentage < 90;
                        const barColorClass = isSuccess ? "bg-gradient-to-r from-[#04d16d] to-[#00f8da] shadow-[0_0_15px_rgba(0,248,218,0.3)]" : isCaution ? "bg-amber-500" : "bg-orange-600";
                        const textColorClass = isSuccess ? "text-[#00f8da]" : isCaution ? "text-amber-400" : "text-orange-500";

                        return (
                            <motion.div 
                                key={lang.id} 
                                initial={{ opacity: 0, scale: 0.98 }} 
                                animate={{ opacity: 1, scale: 1 }} 
                                transition={{ duration: 0.2 }} // Optimized lightweight animation (Task 2)
                                className={`bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 hover:bg-white/[0.04] transition-colors relative overflow-hidden group shadow-2xl ${!lang.isActive ? "opacity-60 saturate-50" : ""}`}
                            >
                                {lang.isDefault && (
                                    <div className="absolute top-0 right-0 px-3 py-1 bg-amber-500 text-black text-[9px] font-black uppercase tracking-wider rounded-bl-xl z-10 shadow-lg">VARSAYILAN</div>
                                )}
                                {!lang.isActive && !lang.isDefault && (
                                    <div className="absolute top-0 right-0 px-3 py-1 bg-white/10 backdrop-blur-md text-white/40 border-b border-l border-white/5 text-[9px] font-black uppercase tracking-wider rounded-bl-xl z-10">PASİF</div>
                                )}
                                
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    {/* Task 1: Info Left */}
                                    <div className="flex items-center gap-4">
                                        <div className="shrink-0"><FlagIcon flagSvg={lang.flagSvg} size="lg" /></div>
                                        <div>
                                            <h3 className="text-base font-black text-white leading-tight uppercase tracking-tight">{lang.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[9px] font-mono text-white/30 truncate uppercase">{lang.nativeName}</span>
                                                <span className="text-[9px] font-mono text-purple-400 uppercase bg-purple-400/10 px-1 rounded">{lang.code}</span>
                                            </div>
                                            <p className="text-[9px] text-white/15 mt-1 font-bold tracking-widest uppercase">UTC {lang.utcOffset > 0 ? `+${lang.utcOffset}` : lang.utcOffset}</p>
                                        </div>
                                    </div>

                                    {/* Task 1: Buttons Right-Stacked */}
                                    <div className="flex flex-col gap-2 shrink-0">
                                        <button
                                            onClick={() => router.push(`/admin/languages/${lang.code}`)}
                                            className="px-3 py-2 bg-white/[0.03] hover:bg-[#6b5be6] text-white/40 hover:text-white border border-white/[0.06] hover:border-[#6b5be6] rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 shrink-0 group/btn"
                                        >
                                            <Settings2 size={12} className="text-white/20 group-hover/btn:text-white" /> DİL AYARLARI
                                        </button>
                                        {!lang.isDefault && (
                                            <button
                                                onClick={() => setLangToDelete(lang)}
                                                className="px-3 py-2 bg-red-500/5 hover:bg-red-500/20 text-red-500/40 hover:text-red-500 border border-red-500/10 hover:border-red-500/30 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 group/del"
                                            >
                                                <Trash2 size={12} className="opacity-40 group-hover/del:opacity-100" /> SİL
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Task 3: Animated Progress Bar */}
                                <div className="w-full space-y-2 mt-4">
                                    <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
                                        <span>YÜZDE</span>
                                        <span className={textColorClass}>%{percentage}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }} 
                                            animate={{ width: `${percentage}%` }} 
                                            transition={{ duration: 1.2, ease: "circOut" }} // Fill-up animation (Task 3)
                                            className={`h-full rounded-full ${barColorClass}`} 
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            <AnimatePresence>{isSortingMode && <SortingModal languages={languages} onClose={() => setIsSortingMode(false)} onSave={handleSaveOrder} />}</AnimatePresence>
            <AnimatePresence>{isEditModalOpen && <LanguageEditorModal language={activeLang} onClose={() => setIsEditModalOpen(false)} onSave={() => { setIsEditModalOpen(false); fetchLanguages(); }} />}</AnimatePresence>
            <AdminConfirmModal 
                open={!!langToDelete} 
                onClose={() => setLangToDelete(null)} 
                onConfirm={() => langToDelete && handleDelete(langToDelete)} 
                title="DİLİ KALICI OLARAK SİL?" 
                description={`Bu işlem geri alınamaz. "${langToDelete?.turkishName}" diline ait tüm çeviriler, SEO ayarları ve yapılandırmalar tamamen silinecektir. Devam etmek istediğine emin misin?`} 
                confirmText="EVET, HER ŞEYİ SİL" 
                cancelText="VAZGEÇ"
                variant="danger" 
            />
        </div>
    );
}
