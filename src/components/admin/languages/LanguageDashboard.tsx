"use client";

import { useEffect, useState, useMemo } from "react";
import { Plus, Edit2, Download, Upload, Trash2, CheckCircle2, AlertCircle, Bot, Loader2, Languages, Activity, Settings } from "lucide-react";
import { useOptWinStore } from "@/store/useOptWinStore";
import { LanguageEditorModal } from "./LanguageEditorModal";
import { useRouter } from "next/navigation";
import { useUnsavedChanges } from "@/components/admin/UnsavedChangesContext";
import { motion, AnimatePresence } from "framer-motion";
import { Loader } from "@/components/shared/Loader";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";

export interface Language {
    id: string;
    code: string;
    name: string;
    nativeName: string;
    flagSvg: string;
    utcOffset: number;
    isActive: boolean;
    isDefault: boolean;
    sortOrder: number;
    translations?: Record<string, string>;
}

export function LanguageDashboard() {
    const router = useRouter();
    const { showToast } = useOptWinStore();
    const [languages, setLanguages] = useState<Language[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Default language logic
    const defaultLang = useMemo(() => languages.find(l => l.isDefault), [languages]);
    const [defaultTranslations, setDefaultTranslations] = useState<Record<string, string>>({});
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [activeLang, setActiveLang] = useState<Language | null>(null);

    const [langToDelete, setLangToDelete] = useState<Language | null>(null);

    useEffect(() => {
        fetchLanguages();
    }, []);

    useEffect(() => {
        if (defaultLang) {
            fetch(`/api/admin/languages/translations?code=${defaultLang.code}`)
                .then(res => res.json())
                .then(data => {
                    if (data.translations) {
                        setDefaultTranslations(data.translations);
                    }
                })
                .catch(console.error);
        }
    }, [defaultLang]);

    const fetchLanguages = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/languages");
            if (res.ok) {
                setLanguages(await res.json());
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

    const openCreateModal = () => {
        setActiveLang(null);
        setIsEditModalOpen(true);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader />
            </div>
        );
    }

    const defaultTransKeys = Object.keys(defaultTranslations || {}).filter(k => !k.startsWith("seo."));
    const totalCount = defaultTransKeys.length || 1;

    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Dil Yönetimi</h1>
                    <p className="text-sm text-white/50">Tüm arayüz dillerini, SEO verilerini ve çeviri anahtarlarını yönetin (Dynamic JSONB).</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 transition-colors rounded-xl text-white font-medium text-sm shadow-xl shadow-purple-900/20 ring-1 ring-white/10"
                >
                    <Plus size={16} />
                    Yeni Dil Ekle
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {languages.map((lang) => (
                    <div key={lang.id} className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-5 hover:bg-white/[0.04] transition-all relative overflow-hidden group">
                        {lang.isDefault && (
                            <div className="absolute top-0 right-0 px-3 py-1 bg-purple-500/20 text-purple-400 text-[10px] font-bold uppercase rounded-bl-lg">
                                Varsayılan
                            </div>
                        )}
                        <div className="flex items-center gap-4 mb-4">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-white/10 bg-white/5 [&>svg]:absolute [&>svg]:inset-0 [&>svg]:w-full [&>svg]:h-full [&>svg]:object-cover" dangerouslySetInnerHTML={{ __html: lang.flagSvg || '<svg viewBox="0 0 40 40" width="100%" height="100%" fill="gray"><rect width="40" height="40" /></svg>' }} />
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    {lang.name}
                                    <span className="text-xs uppercase bg-white/10 text-white/60 px-1.5 py-0.5 rounded font-mono">{lang.code}</span>
                                </h3>
                                <p className="text-xs text-white/50">{lang.nativeName} • UTC {lang.utcOffset > 0 ? `+${lang.utcOffset}` : lang.utcOffset}</p>
                            </div>
                        </div>

                        {/* Translation Completion Tracking */}
                        <div className="mt-4 mb-2">
                            <div className="flex items-center justify-between text-[11px] mb-1.5">
                                <span className="text-white/40 font-bold uppercase tracking-wider flex items-center gap-1.5"><Activity size={12}/> Çeviri Durumu</span>
                                <span className={`font-black ${
                                    (() => {
                                        const langKeys = Object.keys(lang.translations || {}).filter(k => !k.startsWith("seo.") && lang.translations![k]);
                                        const percentage = Math.round((langKeys.length / totalCount) * 100);
                                        if (percentage >= 100) return "text-emerald-400";
                                        if (percentage >= 70) return "text-amber-400";
                                        return "text-pink-400";
                                    })()
                                }`}>
                                    {(() => {
                                        const langKeys = Object.keys(lang.translations || {}).filter(k => !k.startsWith("seo.") && lang.translations![k]);
                                        return `%${Math.round((langKeys.length / totalCount) * 100)}`;
                                    })()}
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.round((Object.keys(lang.translations || {}).filter(k => !k.startsWith("seo.") && lang.translations![k]).length / totalCount) * 100)}%` }}
                                    transition={{ duration: 1, delay: 0.2 }}
                                    className={`h-full rounded-full ${
                                        Math.round((Object.keys(lang.translations || {}).filter(k => !k.startsWith("seo.") && lang.translations![k]).length / totalCount) * 100) >= 100 ? "bg-emerald-500" :
                                        Math.round((Object.keys(lang.translations || {}).filter(k => !k.startsWith("seo.") && lang.translations![k]).length / totalCount) * 100) >= 70 ? "bg-amber-500" : "bg-pink-500"
                                    }`}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/[0.05]">
                            <button
                                onClick={() => router.push(`/admin/languages/${lang.code}`)}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#6b5be6]/10 hover:bg-[#6b5be6]/20 text-[#6b5be6] border border-[#6b5be6]/20 rounded-lg text-sm font-medium transition-colors"
                            >
                                <Settings size={14} /> Dil Ayarları
                            </button>
                            {!lang.isDefault && (
                                <button
                                    onClick={() => setLangToDelete(lang)}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-sm text-white/40 transition-colors"
                                >
                                    <Trash2 size={14} /> Sil
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {isEditModalOpen && (
                    <LanguageEditorModal
                        language={activeLang}
                        onClose={() => setIsEditModalOpen(false)}
                        onSave={() => {
                            setIsEditModalOpen(false);
                            fetchLanguages();
                        }}
                    />
                )}
            </AnimatePresence>

            <AdminConfirmModal
                open={!!langToDelete}
                onClose={() => setLangToDelete(null)}
                onConfirm={() => langToDelete && handleDelete(langToDelete)}
                title="Dili Sil"
                description={`Bu işlemi onaylarsanız, ${langToDelete?.name} dili ve çevirileri kalıcı olarak silinecektir. Sistem içerik düzenleme sorunlarına yol açabilir. Devam etmek istiyor musunuz?`}
                confirmText="Evet, Sil"
                variant="danger"
            />
        </motion.div>
    );
}
