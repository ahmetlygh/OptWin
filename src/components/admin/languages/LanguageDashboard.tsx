"use client";

import { useEffect, useState, useMemo } from "react";
import { Plus, Trash2, GripVertical, ListOrdered, X, Settings2 } from "lucide-react";
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

    /* ESC to close */
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
            <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="relative bg-[#0d0d12]/95 backdrop-blur-2xl border border-white/[0.06] rounded-2xl w-full max-w-md shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col max-h-[80vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* ambient glow */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#6b5be6]/8 blur-3xl pointer-events-none" />

                <div className="relative z-10 p-5 border-b border-white/[0.04] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-[#6b5be6]/10 border border-[#6b5be6]/20 flex items-center justify-center">
                            <ListOrdered size={18} className="text-[#6b5be6]" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-white uppercase tracking-tight">Sıralamayı Düzenle</h2>
                            <p className="text-[10px] text-white/25 font-bold uppercase tracking-[0.15em] mt-0.5">Sürükle ve bırak</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="size-8 flex items-center justify-center rounded-lg hover:bg-white/[0.05] text-white/20 hover:text-white/60 transition-colors">
                        <X size={16} />
                    </button>
                </div>
                <div className="relative z-10 flex-1 overflow-y-auto p-4 admin-scrollbar">
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
                <div className="relative z-10 p-4 border-t border-white/[0.04] flex gap-3">
                    <button onClick={onClose} className="flex-1 h-10 bg-white/[0.03] hover:bg-white/[0.06] text-white/50 font-bold text-[12px] uppercase tracking-wider rounded-xl transition-all border border-white/[0.06]">Vazgeç</button>
                    <button onClick={() => onSave(items)} className="flex-1 h-10 bg-[#6b5be6] hover:bg-[#5a4bd4] text-white font-bold text-[12px] uppercase tracking-wider rounded-xl shadow-lg shadow-[#6b5be6]/15 transition-all active:scale-95">Kaydet</button>
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

    // Extra data for comprehensive progress
    type FeatureData = { translations: { lang: string; title: string; desc: string }[]; commands: { lang: string; scriptMessage: string }[] };
    type CategoryData = { translations: { lang: string; name: string }[] };
    const [features, setFeatures] = useState<FeatureData[]>([]);
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [scriptLabels, setScriptLabels] = useState<Record<string, Record<string, string>>>({});
    const [enLabelKeys, setEnLabelKeys] = useState<string[]>([]);

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setIsLoading(true);
        try {
            const [langRes, featRes, catRes, labRes] = await Promise.all([
                fetch("/api/admin/languages"),
                fetch("/api/admin/features"),
                fetch("/api/admin/categories"),
                fetch("/api/admin/script-labels"),
            ]);
            const langData = await langRes.json();
            const featData = await featRes.json();
            const catData = await catRes.json();
            const labData = await labRes.json();

            if (Array.isArray(langData)) setLanguages(langData);
            if (featData.success) setFeatures(featData.features || []);
            if (catData.success) setCategories(catData.categories || []);
            if (labData.success) {
                setScriptLabels(labData.labels || {});
                setEnLabelKeys(Object.keys(labData.labels?.en || {}));
            }
            window.dispatchEvent(new CustomEvent('optwin:languages-updated'));
        } catch {
            showToast("Veri çekme hatası.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchLanguages = async () => {
        try {
            const res = await fetch("/api/admin/languages");
            if (res.ok) {
                const data = await res.json();
                setLanguages(data);
                window.dispatchEvent(new CustomEvent('optwin:languages-updated'));
            }
        } catch { /* ignore */ }
    };

    // Compute extra progress data per language
    const getExtraData = (langCode: string): import("@/lib/translationUtils").ExtraProgressData => {
        if (langCode === (defaultLang?.code || "en")) {
            // Default language is always 100% filled
            const totalFeats = features.length * 3; // title + desc + scriptMessage
            const totalCats = categories.length;
            return {
                totalFeatures: totalFeats, filledFeatures: totalFeats,
                totalScriptLabels: enLabelKeys.length, filledScriptLabels: enLabelKeys.length,
                totalCategories: totalCats, filledCategories: totalCats,
            };
        }

        // Features: count title, desc, scriptMessage separately
        let totalFeatureFields = 0;
        let filledFeatureFields = 0;
        for (const f of features) {
            const enTr = f.translations.find(t => t.lang === "en");
            if (!enTr?.title) continue;
            // Title always counts
            totalFeatureFields++;
            const tr = f.translations.find(t => t.lang === langCode);
            if (tr?.title?.trim()) filledFeatureFields++;
            // Desc only counts if EN has it
            if (enTr.desc?.trim()) {
                totalFeatureFields++;
                if (tr?.desc?.trim()) filledFeatureFields++;
            }
            // ScriptMessage
            const enCmd = f.commands.find(c => c.lang === "en");
            if (enCmd?.scriptMessage?.trim()) {
                totalFeatureFields++;
                const cmd = f.commands.find(c => c.lang === langCode);
                if (cmd?.scriptMessage?.trim()) filledFeatureFields++;
            }
        }

        // Script labels
        const filledLabels = enLabelKeys.filter(k => {
            const val = scriptLabels[langCode]?.[k];
            return val && val.trim() !== "";
        }).length;

        // Categories
        let totalCats = 0;
        let filledCats = 0;
        for (const cat of categories) {
            const enName = cat.translations.find(t => t.lang === "en")?.name;
            if (!enName) continue;
            totalCats++;
            const tr = cat.translations.find(t => t.lang === langCode);
            if (tr?.name?.trim()) filledCats++;
        }

        return {
            totalFeatures: totalFeatureFields,
            filledFeatures: filledFeatureFields,
            totalScriptLabels: enLabelKeys.length,
            filledScriptLabels: filledLabels,
            totalCategories: totalCats,
            filledCategories: filledCats,
        };
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
                fetchAll();
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
        <div className="h-full flex flex-col space-y-6 overflow-y-auto custom-scrollbar">
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }} className="w-full bg-white/[0.02] backdrop-blur-md border border-white/[0.05] rounded-2xl p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-[0_4px_30px_rgba(0,0,0,0.1)] shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#6b5be6]/10 border border-[#6b5be6]/20 flex items-center justify-center">
                        <ListOrdered size={18} className="text-[#6b5be6]" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black tracking-tight text-white uppercase leading-tight">Dil Yönetimi</h1>
                        <p className="text-[10px] text-white/25 font-bold uppercase tracking-[0.15em] mt-0.5">Platform dillerini ve sıralamasını optimize edin</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsSortingMode(true)}
                        className="flex items-center gap-2 h-9 px-4 bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white/80 border border-white/[0.06] rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95"
                    >
                        <ListOrdered size={14} /> Sıralamayı Düzenle
                    </button>
                    <button
                        onClick={() => { setActiveLang(null); setIsEditModalOpen(true); }}
                        className="flex items-center gap-2 h-9 px-5 bg-[#6b5be6] hover:bg-[#5a4bd4] text-white rounded-xl text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-[#6b5be6]/20 transition-all active:scale-95"
                    >
                        <Plus size={14} /> Yeni Dil Ekle
                    </button>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {languages.map((lang) => {
                        const extra = getExtraData(lang.code);
                        const { percentage } = calculateProgress(lang.translations, lang.seoMetadata, defaultKeys, extra);
                        const isSuccess = percentage >= 90;
                        const isCaution = percentage >= 50 && percentage < 90;
                        const barColorClass = isSuccess ? "bg-gradient-to-r from-[#04d16d] to-[#00f8da] shadow-[0_0_15px_rgba(0,248,218,0.3)]" : isCaution ? "bg-amber-500" : "bg-orange-600";
                        const textColorClass = isSuccess ? "text-[#00f8da]" : isCaution ? "text-amber-400" : "text-orange-500";

                        return (
                            <motion.div 
                                key={lang.id} 
                                initial={{ opacity: 0, scale: 0.98 }} 
                                animate={{ opacity: 1, scale: 1 }} 
                                transition={{ duration: 0.2 }}
                                className={`bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 hover:bg-white/[0.04] transition-colors relative overflow-hidden group shadow-2xl ${!lang.isActive ? "opacity-60 saturate-50" : ""}`}
                            >
                                {lang.isDefault && (
                                    <div className="absolute top-0 right-0 px-3 py-1 bg-amber-500 text-black text-[9px] font-black uppercase tracking-wider rounded-bl-xl z-10 shadow-lg">VARSAYILAN</div>
                                )}
                                {!lang.isActive && !lang.isDefault && (
                                    <div className="absolute top-0 right-0 px-3 py-1 bg-white/10 backdrop-blur-md text-white/40 border-b border-l border-white/5 text-[9px] font-black uppercase tracking-wider rounded-bl-xl z-10">PASİF</div>
                                )}
                                
                                <div className="flex items-start justify-between gap-4 mb-4">
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

                                {/* Progress Bar */}
                                <div className="w-full space-y-2 mt-4">
                                    <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
                                        <span>YÜZDE</span>
                                        <span className={textColorClass}>%{percentage}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }} 
                                            animate={{ width: `${percentage}%` }} 
                                            transition={{ duration: 1.2, ease: "circOut" }}
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
