"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    ChevronLeft,
    Save,
    RotateCcw,
    Loader2,
    Check,
    AlertCircle,
    X,
    Plus,
    Languages,
} from "lucide-react";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { AdminIconPicker } from "@/components/admin/AdminIconPicker";
import { AdminActionBar } from "@/components/admin/AdminActionBar";
import { Loader } from "@/components/shared/Loader";
import { useUnsavedChanges } from "@/components/admin/UnsavedChangesContext";
import { AdminLangPicker } from "@/components/admin/AdminLangPicker";
import { generateScriptMessage } from "@/lib/powershell-safe";

type Category = {
    id: string;
    slug: string;
    translations: { lang: string; name: string }[];
};

export default function NewFeaturePage() {
    const router = useRouter();
    const { setHasUnsavedChanges } = useUnsavedChanges();

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");
    const [displayLang, setDisplayLang] = useState("en");

    const ALL_LANGS = ["en", "tr", "de", "es", "fr", "hi", "zh"];

    const INITIAL_FORM = {
        slug: "",
        categoryId: "",
        icon: "settings",
        iconType: "solid",
        risk: "low",
        noRisk: false,
        enabled: true,
        newBadge: true,
        translations: Object.fromEntries(ALL_LANGS.map(l => [l, { title: "", desc: "" }])),
        commands: Object.fromEntries(ALL_LANGS.map(l => [l, { command: "", scriptMessage: "" }])),
    };

    const [form, setForm] = useState(INITIAL_FORM);

    useEffect(() => {
        fetch("/api/admin/categories")
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    setCategories(data.categories);
                    if (data.categories.length > 0) {
                        setForm(prev => ({ ...prev, categoryId: data.categories[0].id }));
                    }
                }
                setLoading(false);
            });
    }, []);

    const isComplete = useMemo(() => {
        return form.slug.length > 2 && form.translations.en.title.length > 2 && !!form.categoryId;
    }, [form.slug, form.translations.en.title, form.categoryId]);

    const hasChanges = useMemo(() => {
        return form.slug !== "" || form.translations.en.title !== "";
    }, [form.slug, form.translations.en.title]);

    useEffect(() => {
        setHasUnsavedChanges(hasChanges);
        return () => setHasUnsavedChanges(false);
    }, [hasChanges, setHasUnsavedChanges]);

    const handleSubmit = async () => {
        if (!isComplete) return;
        setSaving(true);
        setError("");
        try {
            const data = {
                ...form,
                translations: Object.entries(form.translations).map(([lang, t]) => ({ lang, ...t })),
                commands: Object.entries(form.commands).map(([lang, c]) => ({ lang, ...c })),
            };
            const res = await fetch("/api/admin/features", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const result = await res.json();
            if (result.success) {
                setSaved(true);
                setHasUnsavedChanges(false);
                setTimeout(() => router.push("/admin/features"), 1200);
            } else {
                setError(result.error || "Oluşturma başarısız");
            }
        } catch {
            setError("Sunucu hatası");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center p-20"><Loader size={32} /></div>;

    const inputCls = "w-full h-10 px-4 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white/80 placeholder-white/10 focus:outline-none focus:border-[#6b5be6]/40 transition-all";
    const labelCls = "block text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1.5 ml-1";

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6 pb-24">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => router.push("/admin/features")} className="size-11 flex items-center justify-center rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] text-white/40 hover:text-white transition-all">
                    <ChevronLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter italic">Yeni Özellik</h1>
                    <p className="text-xs text-white/20 font-medium tracking-wide">Optimizasyon listesine yeni bir girdi ekleyin</p>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
                    <AlertCircle size={18} /> {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left: Settings */}
                <div className="md:col-span-1 space-y-6">
                    <div className="p-6 rounded-3xl border border-white/[0.05] bg-white/[0.015] space-y-5">
                        <h3 className="text-[11px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2">
                             Yapılandırma
                        </h3>
                        
                        <div>
                            <label className={labelCls}>Slug (ID)</label>
                            <input 
                                value={form.slug} 
                                onChange={e => setForm(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                                placeholder="telemetry-disable" 
                                className={inputCls} 
                            />
                        </div>

                        <div>
                            <label className={labelCls}>Kategori</label>
                            <AdminSelect 
                                options={categories.map(c => ({ value: c.id, label: c.translations.find(t => t.lang === "en")?.name || c.slug }))}
                                value={form.categoryId}
                                onChange={v => setForm(prev => ({ ...prev, categoryId: v }))}
                            />
                        </div>

                        <div>
                            <label className={labelCls}>İkon</label>
                            <AdminIconPicker value={form.icon} onChange={v => setForm(prev => ({ ...prev, icon: v }))} />
                        </div>

                        <div className="pt-2 flex flex-col gap-3">
                            <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] cursor-pointer hover:bg-white/[0.06] transition-all">
                                <span className="text-xs font-bold text-white/40 uppercase tracking-wider">Yeni Rozeti</span>
                                <input type="checkbox" checked={form.newBadge} onChange={e => setForm(prev => ({ ...prev, newBadge: e.target.checked }))} className="size-4 accent-[#6b5be6]" />
                            </label>
                            <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] cursor-pointer hover:bg-white/[0.06] transition-all">
                                <span className="text-xs font-bold text-white/40 uppercase tracking-wider">Aktif</span>
                                <input type="checkbox" checked={form.enabled} onChange={e => setForm(prev => ({ ...prev, enabled: e.target.checked }))} className="size-4 accent-emerald-500" />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Right: Content & Commands */}
                <div className="md:col-span-2 space-y-6">
                    {/* Translations */}
                    <div className="p-6 rounded-3xl border border-white/[0.05] bg-white/[0.015] space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[11px] font-black text-white/20 uppercase tracking-widest">Çeviriler</h3>
                            <AdminLangPicker value={displayLang} onChange={setDisplayLang} />
                        </div>
                        
                        <div>
                            <label className={labelCls}>Başlık ({displayLang.toUpperCase()})</label>
                            <input 
                                value={form.translations[displayLang].title}
                                onChange={e => {
                                    const val = e.target.value;
                                    setForm(prev => {
                                        const next = { ...prev };
                                        next.translations[displayLang].title = val;
                                        // Auto-generate script message if empty
                                        if (val && !next.commands[displayLang].scriptMessage) {
                                            next.commands[displayLang].scriptMessage = generateScriptMessage(val, displayLang as any);
                                        }
                                        return next;
                                    });
                                }}
                                placeholder="Örn: Telemetriyi Kapat"
                                className={inputCls}
                            />
                        </div>

                        <div>
                            <label className={labelCls}>Açıklama ({displayLang.toUpperCase()})</label>
                            <textarea 
                                value={form.translations[displayLang].desc}
                                onChange={e => setForm(prev => ({ ...prev, translations: { ...prev.translations, [displayLang]: { ...prev.translations[displayLang], desc: e.target.value } } }))}
                                placeholder="Bu özellik ne işe yarar?"
                                className="w-full h-24 p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white/80 placeholder-white/10 focus:outline-none focus:border-[#6b5be6]/40 transition-all resize-none"
                            />
                        </div>
                    </div>

                    {/* Commands */}
                    <div className="p-6 rounded-3xl border border-white/[0.05] bg-white/[0.015] space-y-4">
                        <h3 className="text-[11px] font-black text-white/20 uppercase tracking-widest">PowerShell Komutu</h3>
                        
                        <div>
                            <label className={labelCls}>Komut (Tüm diller için ortak)</label>
                            <textarea 
                                value={form.commands.en.command}
                                onChange={e => {
                                    const val = e.target.value;
                                    setForm(prev => {
                                        const next = { ...prev };
                                        for (const l of ALL_LANGS) next.commands[l].command = val;
                                        return next;
                                    });
                                }}
                                className="w-full h-32 p-4 bg-black/40 border border-white/[0.06] rounded-xl text-xs font-mono text-[#6b5be6] placeholder-white/5 focus:outline-none focus:border-[#6b5be6]/40 transition-all resize-none"
                                placeholder="Get-Service | Where-Object..."
                            />
                        </div>

                        <div>
                            <label className={labelCls}>Script Mesajı ({displayLang.toUpperCase()})</label>
                            <input 
                                value={form.commands[displayLang].scriptMessage}
                                onChange={e => setForm(prev => ({ ...prev, commands: { ...prev.commands, [displayLang]: { ...prev.commands[displayLang], scriptMessage: e.target.value } } }))}
                                placeholder="Optimizasyon uygulanıyor..."
                                className={inputCls}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <AdminActionBar
                show={isComplete}
                saving={saving}
                saved={saved}
                onSave={handleSubmit}
                onCancel={() => router.push("/admin/features")}
                saveText="Özellik Oluştur"
            />
        </motion.div>
    );
}
