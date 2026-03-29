"use client";

import { use, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUnsavedChanges } from "@/components/admin/UnsavedChangesContext";
import { AdminActionBar } from "@/components/admin/AdminActionBar";
import { ArrowLeft, Bot, Globe, RefreshCw, Search, CheckCircle2, AlertCircle, Activity, Info } from "lucide-react";
import { useOptWinStore } from "@/store/useOptWinStore";
import { FlagIcon } from "@/components/shared/FlagIcon";
import { Language } from "@/components/admin/languages/LanguageDashboard";
import { motion, AnimatePresence } from "framer-motion";
import { Loader } from "@/components/shared/Loader";
import { LanguageEditorModal } from "@/components/admin/languages/LanguageEditorModal";
import { FileDown, FileUp, Code as CodeIcon, Settings2, Sparkles } from "lucide-react";

export default function LanguageTranslationPage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = use(params);
    const router = useRouter();
    const { showToast } = useOptWinStore();
    const unsavedCtx = useUnsavedChanges();

    const [language, setLanguage] = useState<Language | null>(null);
    const [originalLanguage, setOriginalLanguage] = useState<Language | null>(null);
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

    const [isJsonMode, setIsJsonMode] = useState(false);
    const [jsonContent, setJsonContent] = useState("");
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [pendingCode, setPendingCode] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            try {
                const resLangs = await fetch("/api/admin/languages");
                const langsData = await resLangs.json();
                
                if (Array.isArray(langsData)) {
                    const langs: Language[] = langsData;
                    const curr = langs.find((l) => l.code === code);
                    const def = langs.find((l) => l.isDefault) || langs[0];
                    if (curr) {
                        setLanguage(curr);
                        setOriginalLanguage(JSON.parse(JSON.stringify(curr)));
                        
                        const seo = (curr as any).seoMetadata || {};
                        setSeoTitle(seo.title || ""); setOrigSeoTitle(seo.title || "");
                        setSeoDesc(seo.description || ""); setOrigSeoDesc(seo.description || "");
                        setSeoKeywords(seo.keywords || ""); setOrigSeoKeywords(seo.keywords || "");
                    }
                    if (def) setDefaultLang(def);

                    const [resCurr, resDef] = await Promise.all([
                        fetch(`/api/admin/languages/translations?code=${code}`),
                        fetch(`/api/admin/languages/translations?code=${def.code}`)
                    ]);

                    const dataCurr = await resCurr.json();
                    const dataDef = await resDef.json();

                    // Cleanup meta keys from translations if they exist there too
                    const cleanTrans = { ...(dataCurr.translations || {}) };
                    const filterMeta = (obj: any) => {
                        const next = { ...obj };
                        delete next["seo.title"]; delete next["seo.description"]; delete next["seo.keywords"];
                        return next;
                    };

                    setDefaultTrans(filterMeta(dataDef.translations || {}));
                    setTranslations(filterMeta(cleanTrans));
                    setOriginalTranslations(filterMeta(cleanTrans));
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
        const trChanged = JSON.stringify(translations) !== JSON.stringify(originalTranslations);
        const seoChanged = seoTitle !== origSeoTitle || seoDesc !== origSeoDesc || seoKeywords !== origSeoKeywords;
        const codeChanged = (pendingCode !== null && pendingCode !== code);
        const metaChanged = language?.isActive !== originalLanguage?.isActive || language?.isDefault !== originalLanguage?.isDefault || language?.turkishName !== originalLanguage?.turkishName || language?.name !== originalLanguage?.name || language?.nativeName !== originalLanguage?.nativeName;
        
        return trChanged || seoChanged || codeChanged || metaChanged;
    }, [translations, originalTranslations, seoTitle, origSeoTitle, seoDesc, origSeoDesc, seoKeywords, origSeoKeywords, pendingCode, code, language, originalLanguage]);

    useEffect(() => {
        unsavedCtx.setHasUnsavedChanges(hasChanges);
        return () => unsavedCtx.setHasUnsavedChanges(false);
    }, [hasChanges, unsavedCtx]);

    const handleSave = async () => {
        if (!hasChanges) return;
        setSaving(true);
        setError(null);
        
        try {
            // Task 4: Enforce valid default language state at save
            if (originalLanguage?.isDefault && language?.isDefault === false) {
                throw new Error("Varsayılan dil durumu doğrudan kaldırılamaz. Lütfen başka bir dili varsayılan olarak seçin.");
            }

            // Sync SEO keys to translations as well for redundancy/100% calculation
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
                if (language) {
                    await fetch("/api/admin/languages", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ 
                            ...language, 
                            id: language.id, 
                            newCode: pendingCode,
                            seoMetadata: { title: seoTitle, description: seoDesc, keywords: seoKeywords }
                        })
                    });
                }

                setOriginalTranslations({ ...translations });
                setOrigSeoTitle(seoTitle); setOrigSeoDesc(seoDesc); setOrigSeoKeywords(seoKeywords);
                if (language) setOriginalLanguage(JSON.parse(JSON.stringify(language)));
                setSaved(true);
                showToast("Dil verileri başarıyla güncellendi.", "success");
                window.dispatchEvent(new CustomEvent('optwin:languages-updated'));
                if (pendingCode && pendingCode !== code) router.replace(`/admin/languages/${pendingCode}`);
                else setTimeout(() => setSaved(false), 2000);
            } else throw new Error(data.error || "Sunucu hatası");
        } catch (e: any) {
            setError(e.message);
            showToast(e.message, "error");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setTranslations({ ...originalTranslations });
        setSeoTitle(origSeoTitle); setSeoDesc(origSeoDesc); setSeoKeywords(origSeoKeywords);
        if (originalLanguage) setLanguage(JSON.parse(JSON.stringify(originalLanguage)));
        setError(null);
    };

    unsavedCtx.onSave.current = handleSave;
    unsavedCtx.onDiscard.current = handleCancel;

    const allKeys = Object.keys(defaultTrans);
    const missingKeys = allKeys.filter(k => !translations[k]);

    const filteredKeys = useMemo(() => {
        return allKeys.filter(k => {
            const tr = translations[k] || "";
            const def = defaultTrans[k] || "";
            const isMissingInDb = originalTranslations[k] === undefined || originalTranslations[k] === null || originalTranslations[k] === "";
            if (showMissingOnly && !isMissingInDb) return false;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                if (!k.toLowerCase().includes(q) && !tr.toLowerCase().includes(q) && !def.toLowerCase().includes(q)) return false;
            }
            return true;
        });
    }, [allKeys, translations, originalTranslations, defaultTrans, showMissingOnly, searchQuery]);

    useEffect(() => {
        if (isJsonMode) {
            const out: Record<string, string> = {};
            filteredKeys.forEach(k => out[k] = translations[k] || "");
            setJsonContent(JSON.stringify(out, null, 4));
        }
    }, [isJsonMode, filteredKeys, translations]);

    const handleUpdateTranslation = (key: string, val: string) => setTranslations(prev => ({ ...prev, [key]: val }));

    const handleRawJsonChange = (val: string) => {
        setJsonContent(val);
        try {
            const parsed = JSON.parse(val);
            setTranslations(prev => ({ ...prev, ...parsed }));
        } catch { /* Typing */ }
    };

    const toggleJsonMode = () => {
        setIsJsonMode(!isJsonMode);
    };

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(translations, null, 4));
        const anchor = document.createElement('a');
        anchor.setAttribute("href", dataStr);
        anchor.setAttribute("download", `translations_${code}.json`);
        document.body.appendChild(anchor);
        anchor.click(); anchor.remove();
        showToast("JSON dışa aktarıldı.", "success");
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const json = JSON.parse(ev.target?.result as string);
                setTranslations(prev => ({ ...prev, ...json }));
                showToast("JSON içeriği senkronize edildi.", "success");
            } catch { showToast("Geçersiz JSON dosyası.", "error"); }
        };
        reader.readAsText(file);
    };

    const handleAITranslate = async () => {
        if (missingKeys.length === 0 || !language || !defaultLang) return;
        setIsTranslating(true); setError(null);
        try {
            const res = await fetch("/api/admin/languages/ai-translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    targetLang: language.nativeName,
                    sourceLang: defaultLang.nativeName,
                    translations: Object.fromEntries(missingKeys.map(k => [k, defaultTrans[k]]))
                })
            });
            const data = await res.json();
            if (data.success) {
                setTranslations(prev => ({ ...prev, ...data.translations }));
                showToast(`${Object.keys(data.translations).length} anahtar çevrildi.`, "success");
            } else setError(data.error);
        } catch { setError("AI hatası."); } finally { setIsTranslating(false); }
    };

    if (loading) return <div className="flex items-center justify-center p-20"><Loader /></div>;
    if (!language || !defaultLang) return <div className="p-10 text-white/50 text-center">Dil bulunamadı.</div>;

    const completionRate = Math.round(((allKeys.length - missingKeys.length) / (allKeys.length || 1)) * 100);

    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-full mx-auto pb-20 px-4 md:px-8">
            <AdminActionBar show={hasChanges} saving={saving} saved={saved} onSave={handleSave} onCancel={handleCancel} error={error || undefined} />

            <div className="flex items-center justify-between border-b border-white/[0.05] pb-4">
                <div className="flex items-center gap-3">
                    <button onClick={() => hasChanges ? unsavedCtx.openModal(() => router.push("/admin/languages")) : router.push("/admin/languages")} className="w-9 h-9 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] flex items-center justify-center text-white/50 hover:text-white transition-all"><ArrowLeft size={16} /></button>
                    <div className="flex items-center gap-2">
                        <FlagIcon flagSvg={language.flagSvg} size="lg" />
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-black text-white leading-none flex items-baseline gap-1.5 pt-0.5">{language.nativeName}<span className="text-white/20 font-medium text-sm">({language.turkishName || language.name})</span></h1>
                            <div className="flex items-center gap-1">
                                {language.isDefault && <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">Varsayılan</span>}
                                {!language.isActive && <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-red-500/10 text-red-500 border border-red-500/20">Pasif</span>}
                            </div>
                            <button onClick={() => setIsInfoModalOpen(true)} className="flex items-center gap-1.5 px-2 py-1 bg-white/[0.03] hover:bg-white/[0.1] text-white/40 hover:text-white border border-white/[0.05] rounded-lg text-[9px] font-bold uppercase transition-all"><Settings2 size={11} /> Düzenle</button>
                        </div>
                    </div>
                </div>

                {/* Import/Export buttons - Task 2: Visible in both modes */}
                <div className="flex items-center gap-2">
                    <input type="file" id="importJson" className="hidden" accept=".json" onChange={handleImport} />
                    <label htmlFor="importJson" className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-[10px] font-bold cursor-pointer transition-all uppercase tracking-wider"><FileUp size={12} /> İçe Aktar</label>
                    <button onClick={handleExport} className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl text-[10px] font-bold transition-all uppercase tracking-wider"><FileDown size={12} /> Dışa Aktar</button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                <div className="xl:col-span-3 space-y-4 flex flex-col min-h-[70vh]">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border border-white/[0.04] bg-white/[0.015]">
                        <div className="relative w-full sm:w-80"><Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" /><input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Çevirilerde ara..." className="w-full bg-white/[0.01] border border-white/[0.06] focus:border-[#6b5be6]/40 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white/80 focus:outline-none transition-all" /></div>
                        <div className="flex items-center gap-4 shrink-0">
                            <button onClick={toggleJsonMode} className={`flex items-center gap-2 px-3.5 py-2.5 ${isJsonMode ? "bg-[#6b5be6] text-white" : "bg-white/[0.01] text-white/40 border-white/[0.06]"} border rounded-xl text-[10px] font-black uppercase group transition-all`}>{isJsonMode ? "UI MODUNA DÖN" : "RAW JSON MODU"}</button>
                            <div className="h-8 w-px bg-white/[0.05]" />
                            <div className="flex items-center gap-3"><span className={`text-[10px] font-black uppercase tracking-widest ${showMissingOnly ? "text-amber-500" : "text-white/20"}`}>Eksikler</span><button onClick={() => setShowMissingOnly(!showMissingOnly)} className={`w-9 h-5 rounded-full transition-all relative ${showMissingOnly ? "bg-amber-500" : "bg-white/[0.04] border border-white/[0.06]"}`}><span className={`absolute top-[2px] w-[15px] h-[15px] rounded-full bg-white transition-all ${showMissingOnly ? "left-[18px]" : "left-[2px]"}`} /></button></div>
                        </div>
                    </div>
                    
                    <div className="flex-1 bg-[#0a0a0f] border border-white/[0.06] rounded-2xl overflow-hidden shadow-2xl relative min-h-[65vh]">
                        <AnimatePresence mode="wait">
                            {!isJsonMode ? (
                                <motion.div key="ui-mode" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.2 }} className="flex flex-col h-full absolute inset-0">
                                    <div className="grid grid-cols-2 gap-px bg-white/[0.08] border-b border-white/[0.08] sticky top-0 z-20">
                                        <div className="p-4 bg-[#08080c] min-w-0"><h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] flex items-center gap-2"><FlagIcon flagSvg={defaultLang.flagSvg} size="sm" />REFERANS</h3></div>
                                        <div className="p-4 bg-[#08080c] border-l border-white/[0.08] min-w-0"><h3 className="text-[10px] font-black text-[#6b5be6] uppercase tracking-[0.2em] flex items-center gap-2"><FlagIcon flagSvg={language.flagSvg} size="sm" />HEDEF ÇEVİRİ</h3></div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-white/[0.05]">
                                        <AnimatePresence mode="popLayout" initial={false}>
                                        {filteredKeys.map(k => (
                                            <motion.div layout layoutId={k} key={k} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 gap-px bg-white/[0.005] hover:bg-white/[0.015] items-stretch relative">
                                                <div className="p-6 break-words text-[12px] text-white/50 font-medium leading-relaxed bg-[#050508] min-w-0"><div className="text-[9px] font-mono text-white/10 mb-3 uppercase tracking-widest">{k}</div>{defaultTrans[k]}</div>
                                                <div className={`p-6 border-l border-white/[0.08] flex items-center min-w-0 ${!translations[k] ? 'bg-amber-500/[0.02] ring-1 ring-inset ring-amber-500/10' : 'bg-white/[0.002]'}`}>
                                                    <textarea value={translations[k] || ""} onChange={e => handleUpdateTranslation(k, e.target.value)} placeholder="Çeviriyi buraya giriniz..." rows={defaultTrans[k]?.length > 80 ? 3 : 1} className={`w-full bg-white/[0.02] border rounded-xl p-3 text-[13px] text-white placeholder-white/5 focus:outline-none focus:border-[#6b5be6]/40 transition-all resize-none custom-scrollbar ${!translations[k] ? "border-amber-500/30" : "border-white/[0.08]"}`} />
                                                    {!translations[k] && <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-amber-500 text-black text-[8px] font-black uppercase animate-pulse">Eksik Veri</div>}
                                                </div>
                                            </motion.div>
                                        ))}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div key="json-mode" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.2 }} className="flex flex-col h-full absolute inset-0 p-8">
                                    <textarea value={jsonContent} onChange={e => handleRawJsonChange(e.target.value)} spellCheck={false} className="w-full h-full bg-[#050508] border border-white/[0.08] focus:border-[#6b5be6]/40 rounded-2xl p-8 font-mono text-[13px] text-zinc-100 focus:outline-none custom-scrollbar resize-none" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-[#12121a] border border-white/[0.06] rounded-2xl p-5 shadow-xl relative overflow-hidden group">
                        <h3 className="text-xs font-black text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2"><Activity size={14} className="text-blue-500/50" /> Dil Durumu</h3>
                        <div className="space-y-5">
                            <div className="flex items-center justify-between pr-2">
                                <div className="flex-1 pr-2"><p className="text-[11px] font-black text-white/70 uppercase leading-none">Aktif</p><p className="text-[10px] text-white/20 mt-1">Sitede yayınlanır.</p></div>
                                <button type="button" disabled={originalLanguage?.isDefault} onClick={() => setLanguage(prev => prev ? ({ ...prev, isActive: !prev.isActive }) : null)} className={`w-9 h-5 rounded-full transition-all relative ${language.isActive ? "bg-[#6b5be6]" : "bg-white/[0.06] border border-white/[0.05]"} ${originalLanguage?.isDefault ? "opacity-30 cursor-not-allowed" : "hover:scale-105"}`}><span className={`absolute top-[2px] w-4 h-4 rounded-full bg-white transition-all ${language.isActive ? "left-[18px]" : "left-[2px]"}`} /></button>
                            </div>
                            {originalLanguage?.isDefault && <p className="text-[9px] text-amber-500/50 mt-1.5 font-medium leading-tight">Bu dil şu an sistem varsayılanıdır. Pasife alınamaz.</p>}

                            <div className="flex items-center justify-between border-t border-white/[0.05] pt-5">
                                <div className="flex-1 pr-2"><p className="text-[11px] font-black text-white/70 uppercase leading-none">Varsayılan</p><p className="text-[10px] text-white/20 mt-1">Ana giriş dili.</p></div>
                                <button type="button" onClick={() => setLanguage(prev => prev ? ({ ...prev, isDefault: !prev.isDefault, isActive: !prev.isDefault ? true : prev.isActive }) : null)} className={`w-9 h-5 rounded-full transition-all relative ${language.isDefault ? "bg-amber-500" : "bg-white/[0.06] border border-white/[0.05]"} hover:scale-105`}><span className={`absolute top-[2px] w-4 h-4 rounded-full bg-white transition-all ${language.isDefault ? "left-[18px]" : "left-[2px]"}`} /></button>
                            </div>
                            {language.isDefault && (
                                <p className="text-[9px] text-amber-500/50 mt-1.5 font-medium leading-tight">Bu dil şu an varsayılan olarak işaretlendi (Taslak).</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-[#12121a] border border-white/[0.06] rounded-2xl p-5 shadow-xl">
                        <div className="flex items-center justify-between mb-3"><h3 className="text-[10px] font-black text-white/30 uppercase">İlerleme</h3><span className={`text-lg font-black ${completionRate === 100 ? "text-emerald-400" : "text-amber-400"}`}>{completionRate}%</span></div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden"><motion.div animate={{ width: `${completionRate}%` }} className={`h-full rounded-full ${completionRate === 100 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-amber-500"}`} /></div>
                        <p className="text-[10px] text-white/20 mt-3 flex items-center gap-1.5 font-bold uppercase">{completionRate === 100 ? <><CheckCircle2 size={12} className="text-emerald-500/50" /> TÜMÜ ÇEVRİLDİ</> : <><AlertCircle size={12} className="text-amber-500/50" /> {missingKeys.length} EKSİK ANAHTAR</>}</p>
                    </div>

                    <div className="bg-[#12121a] border border-white/[0.06] rounded-2xl p-5 shadow-xl"><h3 className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4 flex items-center gap-2"><Globe size={14} className="text-emerald-500/50" /> SEO META VERİLERİ</h3>
                        <div className="space-y-4">
                            <div><label className="text-[9px] font-black text-white/15 uppercase tracking-widest pl-1 mb-1 block">Title</label><input type="text" value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder="Site başlığı" className={`w-full bg-white/[0.01] border rounded-xl px-4 py-2.5 text-xs text-white/80 focus:outline-none transition-all ${seoTitle === "" ? "border-amber-500/20 bg-amber-500/[0.01]" : "border-white/[0.06] focus:border-[#6b5be6]/30"}`} /></div>
                            <div><label className="text-[9px] font-black text-white/15 uppercase tracking-widest pl-1 mb-1 block">Description</label><textarea value={seoDesc} onChange={e => setSeoDesc(e.target.value)} placeholder="SEO açıklaması" rows={2} className={`w-full bg-white/[0.01] border rounded-xl px-4 py-2.5 text-xs text-white/80 focus:outline-none transition-all resize-none ${seoDesc === "" ? "border-amber-500/20 bg-amber-500/[0.01]" : "border-white/[0.06] focus:border-[#6b5be6]/30"}`} /></div>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>{isInfoModalOpen && <LanguageEditorModal language={language} displayOnly={true} onClose={() => setIsInfoModalOpen(false)} onSave={(up) => { setIsInfoModalOpen(false); if (up) { setLanguage({ ...up }); if (up.code !== code) setPendingCode(up.code); } showToast("Bilgiler güncellendi.", "warning"); }} />}</AnimatePresence>
        </motion.div>
    );
}
