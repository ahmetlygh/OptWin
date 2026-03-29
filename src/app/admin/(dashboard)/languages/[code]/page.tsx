"use client";

import { use, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUnsavedChanges } from "@/components/admin/UnsavedChangesContext";
import { AdminActionBar } from "@/components/admin/AdminActionBar";
import { ArrowLeft, Bot, Globe, RefreshCw, Search, CheckCircle2, AlertCircle } from "lucide-react";
import { useOptWinStore } from "@/store/useOptWinStore";
import { Language } from "@/components/admin/languages/LanguageDashboard";
import { motion } from "framer-motion";
import { Loader } from "@/components/shared/Loader";

export default function LanguageTranslationPage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = use(params);
    const router = useRouter();
    const { showToast } = useOptWinStore();
    const unsavedCtx = useUnsavedChanges();

    const [language, setLanguage] = useState<Language | null>(null);
    const [defaultLang, setDefaultLang] = useState<Language | null>(null);
    
    const [defaultTrans, setDefaultTrans] = useState<Record<string, string>>({});
    const [translations, setTranslations] = useState<Record<string, string>>({});
    const [originalTranslations, setOriginalTranslations] = useState<Record<string, string>>({});

    const [seoTitle, setSeoTitle] = useState("");
    const [seoDesc, setSeoDesc] = useState("");
    const [seoKeywords, setSeoKeywords] = useState("");

    const [origSeoTitle, setOrigSeoTitle] = useState("");
    const [origSeoDesc, setOrigSeoDesc] = useState("");
    const [origSeoKeywords, setOrigSeoKeywords] = useState("");

    const [searchQuery, setSearchQuery] = useState("");
    const [showMissingOnly, setShowMissingOnly] = useState(false);

    const [isTranslating, setIsTranslating] = useState(false);
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            try {
                const resLangs = await fetch("/api/admin/languages");
                const langsData = await resLangs.json();
                
                if (Array.isArray(langsData)) {
                    const langs: Language[] = langsData;
                    const curr = langs.find((l) => l.code === code);
                    const def = langs.find((l) => l.isDefault) || langs[0];
                    if (curr) setLanguage(curr);
                    if (def) setDefaultLang(def);

                    const [resCurr, resDef] = await Promise.all([
                        fetch(`/api/admin/languages/translations?code=${code}`),
                        fetch(`/api/admin/languages/translations?code=${def.code}`)
                    ]);

                    const dataCurr = await resCurr.json();
                    const dataDef = await resDef.json();

                    let currTrans = dataCurr.translations || {};
                    let defTrans = dataDef.translations || {};

                    const st = currTrans["seo.title"] || "";
                    const sd = currTrans["seo.description"] || "";
                    const sk = currTrans["seo.keywords"] || "";
                    
                    setSeoTitle(st); setOrigSeoTitle(st);
                    setSeoDesc(sd); setOrigSeoDesc(sd);
                    setSeoKeywords(sk); setOrigSeoKeywords(sk);

                    const cleanCurr = { ...currTrans };
                    delete cleanCurr["seo.title"];
                    delete cleanCurr["seo.description"];
                    delete cleanCurr["seo.keywords"];
                    
                    const cleanDef = { ...defTrans };
                    delete cleanDef["seo.title"];
                    delete cleanDef["seo.description"];
                    delete cleanDef["seo.keywords"];

                    setDefaultTrans(cleanDef);
                    setTranslations(cleanCurr);
                    setOriginalTranslations(cleanCurr);
                }
            } catch (err) {
                console.error(err);
                setError("Veriler yüklenirken hata oluştu.");
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [code]);

    const hasChanges = useMemo(() => {
        return JSON.stringify(translations) !== JSON.stringify(originalTranslations) ||
               seoTitle !== origSeoTitle ||
               seoDesc !== origSeoDesc ||
               seoKeywords !== origSeoKeywords;
    }, [translations, originalTranslations, seoTitle, origSeoTitle, seoDesc, origSeoDesc, seoKeywords, origSeoKeywords]);

    useEffect(() => {
        unsavedCtx.setHasUnsavedChanges(hasChanges);
        return () => unsavedCtx.setHasUnsavedChanges(false);
    }, [hasChanges, unsavedCtx]);

    const handleSave = async () => {
        if (!hasChanges) return;
        setSaving(true);
        setError(null);
        
        try {
            const merged = {
                ...translations,
                "seo.title": seoTitle,
                "seo.description": seoDesc,
                "seo.keywords": seoKeywords,
            };

            const res = await fetch("/api/admin/languages/translations", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: code, translations: merged })
            });

            const data = await res.json();
            if (data.success) {
                setOriginalTranslations({ ...translations });
                setOrigSeoTitle(seoTitle);
                setOrigSeoDesc(seoDesc);
                setOrigSeoKeywords(seoKeywords);
                
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
                showToast("Çeviriler başarıyla güncellendi.", "success");
                window.dispatchEvent(new CustomEvent('optwin:languages-updated'));
            } else {
                throw new Error(data.error || "Sunucu hatası");
            }
        } catch (e: any) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setTranslations({ ...originalTranslations });
        setSeoTitle(origSeoTitle);
        setSeoDesc(origSeoDesc);
        setSeoKeywords(origSeoKeywords);
        setError(null);
    };

    unsavedCtx.onSave.current = handleSave;
    unsavedCtx.onDiscard.current = handleCancel;

    // Derived State
    const allKeys = Object.keys(defaultTrans);
    const missingKeys = allKeys.filter(k => !translations[k]?.trim());

    const filteredKeys = useMemo(() => {
        return allKeys.filter(k => {
            const tr = translations[k] || "";
            const def = defaultTrans[k] || "";
            const isMissing = !tr.trim();
            
            if (showMissingOnly && !isMissing) return false;
            
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                if (!k.toLowerCase().includes(q) && 
                    !tr.toLowerCase().includes(q) && 
                    !def.toLowerCase().includes(q)) return false;
            }
            return true;
        });
    }, [allKeys, translations, defaultTrans, showMissingOnly, searchQuery]);

    const handleUpdateTranslation = (key: string, val: string) => {
        setTranslations(prev => ({ ...prev, [key]: val }));
    };

    const handleAITranslate = async () => {
        if (missingKeys.length === 0 || !language || !defaultLang) return;
        setIsTranslating(true);
        setError(null);

        try {
            const toTranslate: Record<string, string> = {};
            for (const key of missingKeys) {
                if (defaultTrans[key]) toTranslate[key] = defaultTrans[key];
            }

            const reqBody = {
                targetLang: language.nativeName,
                sourceLang: defaultLang.nativeName,
                translations: toTranslate
            };

            const res = await fetch("/api/admin/languages/ai-translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(reqBody)
            });

            const data = await res.json();
            if (data.success) {
                setTranslations(prev => ({ ...prev, ...data.translations }));
                showToast(`${Object.keys(data.translations).length} anahtar AI ile çevrildi.`, "success");
            } else {
                setError(data.error || "AI çevirisi başarısız oldu.");
            }
        } catch {
            setError("AI çevirisi sırasında bir hata oluştu.");
        } finally {
            setIsTranslating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader />
            </div>
        );
    }

    if (!language || !defaultLang) {
        return <div className="p-10 text-white/50 text-center">Dil bulunamadı.</div>;
    }

    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6 max-w-[1600px] mx-auto pb-20">
            <AdminActionBar
                show={hasChanges}
                saving={saving}
                saved={saved}
                onSave={handleSave}
                onCancel={handleCancel}
                error={error || undefined}
            />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.05] pb-5">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => {
                            if (hasChanges) {
                                unsavedCtx.openModal(() => router.push("/admin/languages"));
                            } else {
                                router.push("/admin/languages");
                            }
                        }}
                        className="w-10 h-10 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] flex items-center justify-center text-white/50 hover:text-white transition-all"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            {language.flagSvg ? (
                                <span className="flex items-center justify-center w-6 h-4 shrink-0 rounded-[2px] overflow-hidden [&>svg]:w-full [&>svg]:h-full [&>svg]:object-cover" dangerouslySetInnerHTML={{ __html: language.flagSvg }} />
                            ) : null}
                            <h1 className="text-xl font-black text-white">{language.name} <span className="text-white/40 font-medium">({language.nativeName})</span></h1>
                        </div>
                        <p className="text-[11px] text-white/40 uppercase tracking-widest mt-1">GELİŞMİŞ ÇEVİRİ VE SEO YÖNETİMİ</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                
                {/* Center pane: Split View Editor */}
                <div className="xl:col-span-3 space-y-4 flex flex-col min-h-[60vh]">
                    
                    {/* Toolbar */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border border-white/[0.04] bg-white/[0.015]">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="relative w-full sm:w-80">
                                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                                <input 
                                    type="text" 
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Çevirilerde ara..." 
                                    className="w-full bg-white/[0.02] border border-white/[0.06] focus:border-[#6b5be6]/40 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[12px] font-bold text-white/70 tracking-wide">Sadece Eksikleri Göster</span>
                            <button
                                type="button"
                                onClick={() => setShowMissingOnly(!showMissingOnly)}
                                className={`w-10 h-5 rounded-full transition-all duration-300 relative ${showMissingOnly ? "bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]" : "bg-white/[0.06] border border-white/[0.05]"}`}
                            >
                                <span className={`absolute top-[2px] w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${showMissingOnly ? "left-[22px]" : "left-[2px]"}`} />
                            </button>
                        </div>
                    </div>
                    
                    {/* Split View */}
                    <div className="flex-1 bg-[#12121a] border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col shadow-xl">
                        <div className="grid grid-cols-2 gap-px bg-white/[0.06] border-b border-white/[0.06]">
                            <div className="p-3 bg-white/[0.015]">
                                <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-4 h-3 rounded-sm overflow-hidden flex [&>svg]:w-full [&>svg]:h-full [&>svg]:object-cover" dangerouslySetInnerHTML={{ __html: defaultLang.flagSvg || "" }} />
                                    Referans ({defaultLang.nativeName})
                                </h3>
                            </div>
                            <div className="p-3 bg-white/[0.015]">
                                <h3 className="text-xs font-bold text-[#6b5be6] uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-4 h-3 rounded-sm overflow-hidden flex [&>svg]:w-full [&>svg]:h-full [&>svg]:object-cover" dangerouslySetInnerHTML={{ __html: language.flagSvg || "" }} />
                                    Hedef Çeviri
                                </h3>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto max-h-[70vh] custom-scrollbar bg-[#0f0f18] divide-y divide-white/[0.03]">
                            {filteredKeys.length === 0 ? (
                                <div className="p-10 text-center text-white/30 text-sm">Eşleşen sonuç bulunamadı.</div>
                            ) : (
                                filteredKeys.map(k => {
                                    const defText = defaultTrans[k] || "";
                                    const trText = translations[k] || "";
                                    const isMissing = !trText.trim();
                                    const isTextarea = defText.length > 80 || defText.includes("\n");

                                    return (
                                        <div key={k} className="grid grid-cols-2 gap-px bg-white/[0.02] hover:bg-white/[0.04] transition-colors relative">
                                            {/* Key Label */}
                                            <div className="absolute top-1 left-2 text-[9px] font-mono text-white/20 px-1.5 py-0.5 rounded-md mix-blend-screen pointer-events-none">
                                                {k}
                                            </div>

                                            {/* Reference Pane */}
                                            <div className="p-4 pt-6 bg-transparent break-words text-[13px] text-white/60 font-medium leading-relaxed">
                                                {defText}
                                            </div>

                                            {/* Editor Pane */}
                                            <div className={`p-4 pt-5 bg-transparent border-l border-white/[0.02] relative transition-all duration-300 ${isMissing ? 'bg-amber-500/[0.02]' : ''}`}>
                                                {isTextarea ? (
                                                    <textarea 
                                                        value={trText}
                                                        onChange={e => handleUpdateTranslation(k, e.target.value)}
                                                        placeholder="Çeviriyi buraya giriniz..."
                                                        rows={3}
                                                        className={`w-full bg-white/[0.03] border rounded-xl p-3 text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-[#6b5be6]/50 transition-all resize-none custom-scrollbar ${
                                                            isMissing 
                                                                ? "border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]" 
                                                                : "border-white/[0.05]"
                                                        }`}
                                                    />
                                                ) : (
                                                    <input 
                                                        type="text"
                                                        value={trText}
                                                        onChange={e => handleUpdateTranslation(k, e.target.value)}
                                                        placeholder="Çeviriyi buraya giriniz..."
                                                        className={`w-full bg-white/[0.03] border rounded-xl px-3 py-2.5 text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-[#6b5be6]/50 transition-all ${
                                                            isMissing 
                                                                ? "border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)] bg-amber-500/[0.02]" 
                                                                : "border-white/[0.05]"
                                                        }`}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Right pane: Tools */}
                <div className="space-y-6">
                    {/* Completion Status */}
                    <div className="bg-[#12121a] border border-white/[0.06] rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">Çeviri İlerlemesi</h3>
                            <span className={`text-xl font-black ${missingKeys.length === 0 ? "text-emerald-400" : missingKeys.length > allKeys.length / 2 ? "text-pink-400" : "text-amber-400"}`}>
                                {Math.round(((allKeys.length - missingKeys.length) / (allKeys.length || 1)) * 100)}%
                            </span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${((allKeys.length - missingKeys.length) / (allKeys.length || 1)) * 100}%` }}
                                transition={{ duration: 1, delay: 0.2 }}
                                className={`h-full rounded-full ${
                                    missingKeys.length === 0 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" :
                                    missingKeys.length > allKeys.length / 2 ? "bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]" : "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                                }`}
                            />
                        </div>
                        <p className="text-[11px] text-white/40 mt-3 flex items-center gap-1">
                            {missingKeys.length === 0 ? (
                                <><CheckCircle2 size={12} className="text-emerald-400" /> Tamamlandı</>
                            ) : (
                                <><AlertCircle size={12} className="text-amber-400" /> {missingKeys.length} çeviri eksik</>
                            )}
                        </p>
                    </div>

                    {/* AI Translation */}
                    <div className="bg-gradient-to-br from-[#12121a] to-[#0f0f18] border border-white/[0.06] rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                            <Bot size={16} className="text-purple-400" /> AI Auto-Translate
                        </h3>
                        <p className="text-[11px] text-white/50 mb-5 leading-relaxed">
                            Eksik olan {missingKeys.length > 0 ? <span className="text-pink-400 font-black px-1.5 py-0.5 bg-pink-500/10 rounded-md">{missingKeys.length}</span> : "0"} çeviriyi Gemini Flash modeli aracılığıyla otomatik oluşturun.
                        </p>
                        
                        <button
                            onClick={handleAITranslate}
                            disabled={isTranslating || missingKeys.length === 0}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-[#6b5be6]/10 hover:bg-[#6b5be6]/20 text-[#6b5be6] border border-[#6b5be6]/20 rounded-xl text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            {isTranslating ? <RefreshCw size={14} className="animate-spin" /> : <Bot size={14} />}
                            {isTranslating ? "Çevriliyor..." : "Eksikleri Çevir"}
                        </button>
                    </div>

                    {/* SEO Metadata */}
                    <div className="bg-[#12121a] border border-white/[0.06] rounded-2xl p-6 shadow-xl">
                        <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
                            <Globe size={16} className="text-emerald-400" /> SEO Meta Verileri
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest pl-1 mb-1 block">Title</label>
                                <input
                                    type="text"
                                    value={seoTitle}
                                    onChange={e => setSeoTitle(e.target.value)}
                                    placeholder="Site başlığı"
                                    className={`w-full bg-white/[0.02] border rounded-xl px-4 py-3 text-sm text-white/80 placeholder-white/20 focus:outline-none transition-all ${
                                        !seoTitle.trim() ? "border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)] bg-amber-500/[0.02]" : "border-white/[0.06] focus:border-[#6b5be6]/40"
                                    }`}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest pl-1 mb-1 block">Description</label>
                                <textarea
                                    value={seoDesc}
                                    onChange={e => setSeoDesc(e.target.value)}
                                    placeholder="Arama sonuçlarında görünen açıklama"
                                    rows={3}
                                    className={`w-full bg-white/[0.02] border rounded-xl px-4 py-3 text-sm text-white/80 placeholder-white/20 focus:outline-none transition-all resize-none custom-scrollbar ${
                                        !seoDesc.trim() ? "border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)] bg-amber-500/[0.02]" : "border-white/[0.06] focus:border-[#6b5be6]/40"
                                    }`}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest pl-1 mb-1 block">Keywords</label>
                                <input
                                    type="text"
                                    value={seoKeywords}
                                    onChange={e => setSeoKeywords(e.target.value)}
                                    placeholder="optwin, windows optimizer..."
                                    className={`w-full bg-white/[0.02] border rounded-xl px-4 py-3 text-sm text-white/80 placeholder-white/20 focus:outline-none transition-all ${
                                        !seoKeywords.trim() ? "border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)] bg-amber-500/[0.02]" : "border-white/[0.06] focus:border-[#6b5be6]/40"
                                    }`}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
