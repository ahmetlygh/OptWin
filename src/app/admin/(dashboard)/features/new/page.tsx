"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft,
    Check,
    AlertCircle,
    X,
    Languages,
    Loader2,
} from "lucide-react";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { AdminLangPicker } from "@/components/admin/AdminLangPicker";
import { AdminIconPicker } from "@/components/admin/AdminIconPicker";
import { generateScriptMessage } from "@/lib/powershell-safe";
import { useUnsavedChanges } from "@/components/admin/UnsavedChangesContext";
import { AdminActionBar } from "@/components/admin/AdminActionBar";
import { Loader } from "@/components/shared/Loader";

type Category = {
    id: string;
    slug: string;
    translations: { lang: string; name: string }[];
};

export default function NewFeaturePage() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/categories").then(r => r.json()).then(cData => {
            if (cData.success) setCategories(cData.categories);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader />
            </div>
        );
    }

    return (
        <NewFeatureEditor
            categories={categories}
            onCancel={() => router.push("/admin/features")}
        />
    );
}

function NewFeatureEditor({
    categories,
    onCancel,
}: {
    categories: Category[];
    onCancel: () => void;
}) {
    const availableLangs = ["en", "tr", "de", "es", "fr", "hi", "zh"];

    const buildInitialState = useCallback(() => ({
        slug: "",
        categoryId: categories[0]?.id || "",
        icon: "settings",
        iconType: "solid",
        risk: "low",
        noRisk: false,
        order: 0,
        enabled: true,
        newBadge: false,
        newBadgeExpiry: "",
        translations: Object.fromEntries(
            availableLangs.map(lang => [lang, { title: "", desc: "" }])
        ),
        commands: Object.fromEntries(
            availableLangs.map(lang => [lang, { command: "", scriptMessage: "" }])
        ),
    }), [categories]);

    const [translationLang, setTranslationLang] = useState("en");
    const [commandLang, setCommandLang] = useState("en");
    const [saving, setSaving] = useState(false);
    const [translating, setTranslating] = useState(false);
    const [translateToast, setTranslateToast] = useState("");
    const [error, setError] = useState("");
    const [saved, setSaved] = useState(false);
    
    const { hasUnsavedChanges, setHasUnsavedChanges, onSave: registerOnSave, onDiscard: registerOnDiscard, openModal } = useUnsavedChanges();
    const [form, setForm] = useState(buildInitialState);
    const [original, setOriginal] = useState(buildInitialState);
    const hasChanges = JSON.stringify(form) !== JSON.stringify(original);

    useEffect(() => {
        setHasUnsavedChanges(hasChanges);
        return () => setHasUnsavedChanges(false);
    }, [hasChanges, setHasUnsavedChanges]);

    const handleSubmitRef = useRef<(() => Promise<void>) | null>(null);
    const buildInitRef = useRef(buildInitialState);
    buildInitRef.current = buildInitialState;

    useEffect(() => {
        registerOnSave.current = async () => { if (handleSubmitRef.current) await handleSubmitRef.current(); };
        registerOnDiscard.current = () => { setForm(buildInitRef.current()); };
        return () => { registerOnSave.current = null; registerOnDiscard.current = null; };
    }, [registerOnSave, registerOnDiscard]);

    const tryNavigate = (navFn: () => void) => {
        if (hasUnsavedChanges) {
            openModal(navFn);
        } else {
            navFn();
        }
    };

    const updateField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const updateTranslation = (lang: string, field: "title" | "desc", value: string) => {
        setForm(prev => ({
            ...prev,
            translations: { ...prev.translations, [lang]: { ...prev.translations[lang], [field]: value } },
        }));
    };

    const updateCommand = (lang: string, field: "command" | "scriptMessage", value: string) => {
        setForm(prev => {
            const updated = { ...prev.commands };
            if (field === "command") {
                for (const l of availableLangs) {
                    updated[l] = { ...updated[l], command: value };
                }
            } else {
                updated[lang] = { ...updated[lang], [field]: value };
            }
            return { ...prev, commands: updated };
        });
    };

    const handleAutoTranslate = async () => {
        const title = form.translations[translationLang]?.title;
        const desc = form.translations[translationLang]?.desc;
        if (!title && !desc) return;

        setTranslating(true);
        const otherLangs = availableLangs.filter(l => l !== translationLang);
        const translatedLangNames: string[] = [];

        const LANG_DISPLAY: Record<string, string> = {
            en: "EN", tr: "TR", zh: "ZH", es: "ES", hi: "HI", de: "DE", fr: "FR",
        };

        try {
            if (title) {
                const res = await fetch("/api/admin/translate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text: title, sourceLang: translationLang, targetLangs: otherLangs }),
                });
                const data = await res.json();
                if (data.success) {
                    Object.entries(data.translations as Record<string, string>).forEach(([lang, translated]) => {
                        setForm(prev => ({
                            ...prev,
                            translations: {
                                ...prev.translations,
                                [lang]: { ...prev.translations[lang], title: translated },
                            },
                        }));
                    });
                    data.translatedLangs?.forEach((l: string) => {
                        if (!translatedLangNames.includes(LANG_DISPLAY[l] || l)) {
                            translatedLangNames.push(LANG_DISPLAY[l] || l);
                        }
                    });
                }
            }
            if (desc) {
                const res = await fetch("/api/admin/translate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text: desc, sourceLang: translationLang, targetLangs: otherLangs }),
                });
                const data = await res.json();
                if (data.success) {
                    Object.entries(data.translations as Record<string, string>).forEach(([lang, translated]) => {
                        setForm(prev => ({
                            ...prev,
                            translations: {
                                ...prev.translations,
                                [lang]: { ...prev.translations[lang], desc: translated },
                            },
                        }));
                    });
                    data.translatedLangs?.forEach((l: string) => {
                        if (!translatedLangNames.includes(LANG_DISPLAY[l] || l)) {
                            translatedLangNames.push(LANG_DISPLAY[l] || l);
                        }
                    });
                }
            }
            if (translatedLangNames.length > 0) {
                setTranslateToast(`${translatedLangNames.join(", ")} dillerine çeviriler eklendi`);
                setTimeout(() => setTranslateToast(""), 3000);
            }
        } catch {
            setError("Çeviri başarısız oldu");
        } finally {
            setTranslating(false);
        }
    };

    const [translatingScript, setTranslatingScript] = useState(false);
    const handleTranslateScriptMsg = async () => {
        const msg = form.commands[commandLang]?.scriptMessage;
        if (!msg) return;
        setTranslatingScript(true);
        const otherLangs = availableLangs.filter(l => l !== commandLang);
        try {
            const res = await fetch("/api/admin/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: msg, sourceLang: commandLang, targetLangs: otherLangs }),
            });
            const data = await res.json();
            if (data.success) {
                Object.entries(data.translations as Record<string, string>).forEach(([lang, translated]) => {
                    setForm(prev => ({
                        ...prev,
                        commands: { ...prev.commands, [lang]: { ...prev.commands[lang], scriptMessage: translated } },
                    }));
                });
                const LANG_DISPLAY: Record<string, string> = { en: "EN", tr: "TR", zh: "ZH", es: "ES", hi: "HI", de: "DE", fr: "FR" };
                const names = (data.translatedLangs || otherLangs).map((l: string) => LANG_DISPLAY[l] || l);
                setTranslateToast(`Script mesajı ${names.join(", ")} dillerine çevrildi`);
                setTimeout(() => setTranslateToast(""), 3000);
            }
        } catch {
            setError("Script mesajı çevirisi başarısız");
        } finally {
            setTranslatingScript(false);
        }
    };

    const isComplete = useMemo(() => {
        return form.slug.length > 2 && form.translations.en.title.length > 2 && !!form.categoryId;
    }, [form.slug, form.translations.en.title, form.categoryId]);

    const handleSubmit = async () => {
        if (!isComplete) return;
        setSaving(true);
        setError("");
        try {
            const data = {
                slug: form.slug, categoryId: form.categoryId, icon: form.icon, iconType: form.iconType,
                risk: form.risk, noRisk: form.noRisk, order: form.order, enabled: form.enabled,
                newBadge: form.newBadge, newBadgeExpiry: form.newBadgeExpiry || null,
                translations: Object.entries(form.translations).map(([lang, t]) => ({ lang, title: t.title, desc: t.desc })),
                commands: Object.entries(form.commands).map(([lang, c]) => ({ lang, command: c.command, scriptMessage: c.scriptMessage })),
            };
            const res = await fetch("/api/admin/features", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const result = await res.json();
            if (result.success) {
                setSaved(true);
                setOriginal(JSON.parse(JSON.stringify(form)));
                setTimeout(() => { setSaved(false); onCancel(); }, 1200);
            } else {
                setError(result.error || "Oluşturma başarısız");
            }
        } catch {
            setError("Özellik oluşturulamadı");
        } finally {
            setSaving(false);
        }
    };

    handleSubmitRef.current = handleSubmit;

    const categoryOptions = categories.map(c => ({
        value: c.id,
        label: c.translations.find(t => t.lang === "en")?.name || c.slug,
    }));

    const riskOptions = [
        { value: "low", label: "Düşük Risk" },
        { value: "medium", label: "Orta Risk" },
        { value: "high", label: "Yüksek Risk" },
    ];

    const inputCls = "w-full h-9 px-3 bg-white/[0.02] border border-white/[0.04] rounded-xl text-sm text-white/80 placeholder-white/15 focus:outline-none focus:border-[#6b5be6]/30 transition-colors";
    const textareaCls = "w-full p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl text-sm text-white/80 placeholder-white/15 focus:outline-none focus:border-[#6b5be6]/30 transition-colors resize-none";
    const labelCls = "block text-[10px] font-bold text-white/20 uppercase tracking-wider mb-1.5";

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-5"
        >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => tryNavigate(onCancel)}
                        className="size-9 flex items-center justify-center rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-white/40 hover:text-white/70 transition-all border border-white/[0.04]"
                    >
                        <ChevronLeft size={16} />
                    </motion.button>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight">Yeni Özellik</h1>
                        <p className="text-[10px] text-white/20 uppercase tracking-wide mt-0.5">Optimizasyon listesine girdi ekleyin</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <AdminActionBar
                        show={hasChanges}
                        saving={saving}
                        saved={saved}
                        onSave={handleSubmit}
                        onCancel={() => setForm(buildInitialState())}
                        saveText="Özellik Oluştur"
                    />
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/[0.06] border border-red-500/10 text-red-400 text-sm">
                    <AlertCircle size={14} />
                    {error}
                    <button onClick={() => setError("")} className="ml-auto"><X size={14} /></button>
                </div>
            )}

            {/* Basic Information */}
            <div className="rounded-2xl border border-white/[0.04] bg-white/[0.015] p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-bold text-white/25 uppercase tracking-wider">Temel Bilgiler</h3>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <span className="text-[10px] text-white/30 font-medium">Yeni Badge</span>
                            <button
                                type="button"
                                onClick={() => updateField("newBadge", !form.newBadge)}
                                className={`w-9 h-[20px] rounded-full transition-all duration-300 relative ${form.newBadge ? "bg-amber-500/80" : "bg-white/[0.06]"}`}
                            >
                                <span className={`absolute top-[3px] w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-all duration-300 ${form.newBadge ? "left-[19px]" : "left-[3px]"}`} />
                            </button>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <span className="text-[10px] text-white/30 font-medium">Risksiz</span>
                            <button
                                type="button"
                                onClick={() => updateField("noRisk", !form.noRisk)}
                                className={`w-9 h-[20px] rounded-full transition-all duration-300 relative ${form.noRisk ? "bg-blue-500/80" : "bg-white/[0.06]"}`}
                            >
                                <span className={`absolute top-[3px] w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-all duration-300 ${form.noRisk ? "left-[19px]" : "left-[3px]"}`} />
                            </button>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <span className="text-[10px] text-white/30 font-medium">Aktif</span>
                            <button
                                type="button"
                                onClick={() => updateField("enabled", !form.enabled)}
                                className={`w-9 h-[20px] rounded-full transition-all duration-300 relative ${form.enabled ? "bg-emerald-500/80" : "bg-white/[0.06]"}`}
                            >
                                <span className={`absolute top-[3px] w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-all duration-300 ${form.enabled ? "left-[19px]" : "left-[3px]"}`} />
                            </button>
                        </label>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className={labelCls}>Slug (benzersiz ID)</label>
                        <input value={form.slug} onChange={e => {
                            const sanitized = e.target.value
                                .replace(/ğ/gi, 'g').replace(/Ğ/g, 'G')
                                .replace(/ü/gi, 'u').replace(/Ü/g, 'U')
                                .replace(/ş/gi, 's').replace(/Ş/g, 'S')
                                .replace(/ı/g, 'i').replace(/İ/g, 'I')
                                .replace(/ö/gi, 'o').replace(/Ö/g, 'O')
                                .replace(/ç/gi, 'c').replace(/Ç/g, 'C')
                                .replace(/\s+/g, '-')
                                .replace(/[^a-zA-Z0-9\-_]/g, '');
                            updateField("slug", sanitized);
                        }} placeholder="disableTelemetry" className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>Kategori</label>
                        <AdminSelect options={categoryOptions} value={form.categoryId} onChange={v => updateField("categoryId", v)} placeholder="Kategori seçin" />
                    </div>
                    <div>
                        <label className={labelCls}>İkon</label>
                        <AdminIconPicker value={form.icon} onChange={v => updateField("icon", v)} />
                    </div>
                    <AnimatePresence initial={false}>
                        {!form.noRisk && (
                            <motion.div
                                key="risk-field"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <label className={labelCls}>Risk Seviyesi</label>
                                <AdminSelect options={riskOptions} value={form.risk} onChange={v => updateField("risk", v)} placeholder="Risk seçin" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <AnimatePresence initial={false}>
                        {form.newBadge && (
                            <motion.div
                                key="badge-section"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                className="col-span-full overflow-hidden"
                            >
                                <div className="mt-1 space-y-3">
                                    <label className={labelCls}>Badge Bitiş Zamanı (opsiyonel)</label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {[3, 6, 12, 24, 48, 72].map(h => (
                                            <button
                                                key={h}
                                                type="button"
                                                onClick={() => {
                                                    const d = new Date(Date.now() + h * 3600000);
                                                    updateField("newBadgeExpiry", d.toISOString());
                                                }}
                                                className="h-7 px-2.5 rounded-lg text-[10px] font-bold bg-white/[0.03] text-white/40 hover:text-white/70 hover:bg-white/[0.06] border border-white/[0.04] transition-all"
                                            >
                                                {h} saat
                                            </button>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => updateField("newBadgeExpiry", "")}
                                            className="h-7 px-2.5 rounded-lg text-[10px] font-bold bg-red-500/[0.06] text-red-400/60 hover:text-red-400 hover:bg-red-500/10 border border-red-500/[0.06] transition-all"
                                        >
                                            Temizle
                                        </button>
                                    </div>
                                    <div className="flex gap-2 items-end">
                                        <div className="flex-1 max-w-[180px]">
                                            <label className="block text-[9px] font-bold text-white/15 uppercase tracking-wider mb-1">Tarih</label>
                                            <input
                                                type="date"
                                                value={form.newBadgeExpiry ? new Date(form.newBadgeExpiry).toISOString().slice(0, 10) : ""}
                                                onChange={e => {
                                                    if (!e.target.value) { updateField("newBadgeExpiry", ""); return; }
                                                    const existing = form.newBadgeExpiry ? new Date(form.newBadgeExpiry) : new Date();
                                                    const [y, m, d] = e.target.value.split("-").map(Number);
                                                    existing.setFullYear(y, m - 1, d);
                                                    updateField("newBadgeExpiry", existing.toISOString());
                                                }}
                                                className={`${inputCls} [color-scheme:dark]`}
                                            />
                                        </div>
                                        <div className="flex-1 max-w-[140px]">
                                            <label className="block text-[9px] font-bold text-white/15 uppercase tracking-wider mb-1">Saat</label>
                                            <input
                                                type="time"
                                                value={form.newBadgeExpiry ? new Date(form.newBadgeExpiry).toTimeString().slice(0, 5) : ""}
                                                onChange={e => {
                                                    if (!e.target.value || !form.newBadgeExpiry) return;
                                                    const existing = new Date(form.newBadgeExpiry);
                                                    const [h, m] = e.target.value.split(":").map(Number);
                                                    existing.setHours(h, m, 0, 0);
                                                    updateField("newBadgeExpiry", existing.toISOString());
                                                }}
                                                className={`${inputCls} [color-scheme:dark]`}
                                            />
                                        </div>
                                    </div>
                                    {form.newBadgeExpiry && (
                                        <p className="text-[10px] text-amber-400/50">
                                            Bitiş: {new Date(form.newBadgeExpiry).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" })}
                                        </p>
                                    )}
                                    <p className="text-[9px] text-white/15">Boş bırakılırsa badge manuel kapatılana kadar görünür</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Translate Toast */}
            {translateToast && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="fixed top-4 right-4 z-[999] px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-sm font-medium shadow-lg backdrop-blur-xl"
                >
                    ✓ {translateToast}
                </motion.div>
            )}

            {/* Translations */}
            <div className="rounded-2xl border border-white/[0.04] bg-white/[0.015] p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h3 className="text-[11px] font-bold text-white/25 uppercase tracking-wider">Çeviriler</h3>
                        <button
                            type="button"
                            onClick={handleAutoTranslate}
                            disabled={translating || (!form.translations[translationLang]?.title && !form.translations[translationLang]?.desc)}
                            className="h-7 px-3 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/15 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
                        >
                            {translating ? <Loader2 size={11} className="animate-spin" /> : <Languages size={11} />}
                            {translating ? "Çevriliyor..." : "Diğer Dillere Çevir"}
                        </button>
                    </div>
                    <AdminLangPicker value={translationLang} onChange={setTranslationLang} availableLangs={availableLangs} />
                </div>
                <div className="space-y-3">
                    <div>
                        <label className={labelCls}>Başlık</label>
                        <input
                            value={form.translations[translationLang]?.title || ""}
                            onChange={e => updateTranslation(translationLang, "title", e.target.value)}
                            placeholder="Özellik başlığı..."
                            className={inputCls}
                        />
                    </div>
                    <div>
                        <label className={labelCls}>Açıklama</label>
                        <textarea
                            value={form.translations[translationLang]?.desc || ""}
                            onChange={e => updateTranslation(translationLang, "desc", e.target.value)}
                            rows={2}
                            placeholder="Özellik açıklaması..."
                            className={textareaCls}
                        />
                    </div>
                </div>
            </div>

            {/* Commands */}
            <div className="rounded-2xl border border-white/[0.04] bg-white/[0.015] p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-bold text-white/25 uppercase tracking-wider">PowerShell Komut</h3>
                    <AdminLangPicker value={commandLang} onChange={setCommandLang} availableLangs={availableLangs} />
                </div>

                {/* Script Message */}
                <div>
                    <label className={labelCls}>Script Mesajı <span className="text-white/15 font-normal">(dile göre değişir)</span></label>
                    <div className="flex gap-2">
                        <input
                            value={form.commands[commandLang]?.scriptMessage || ""}
                            onChange={e => updateCommand(commandLang, "scriptMessage", e.target.value)}
                            placeholder="Optimizasyon uygulanıyor..."
                            className={`${inputCls} flex-1`}
                        />
                        <button
                            type="button"
                            onClick={handleTranslateScriptMsg}
                            disabled={translatingScript || !form.commands[commandLang]?.scriptMessage}
                            className="shrink-0 h-9 px-3 rounded-xl text-[11px] font-bold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/15 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                            title="Script mesajını diğer dillere çevir"
                        >
                            {translatingScript ? <Loader2 size={11} className="animate-spin" /> : <Languages size={11} />}
                            Çevir
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const allAuto = availableLangs.every(lang => {
                                    const title = form.translations[lang]?.title || "";
                                    const msg = form.commands[lang]?.scriptMessage || "";
                                    return title && msg && msg === generateScriptMessage(title, lang);
                                });
                                if (allAuto) {
                                    for (const lang of availableLangs) {
                                        updateCommand(lang, "scriptMessage", "");
                                    }
                                } else {
                                    for (const lang of availableLangs) {
                                        const title = form.translations[lang]?.title || "";
                                        if (title) {
                                            updateCommand(lang, "scriptMessage", generateScriptMessage(title, lang));
                                        }
                                    }
                                }
                            }}
                            className={`shrink-0 h-9 px-3 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1.5 ${
                                availableLangs.every(lang => {
                                    const title = form.translations[lang]?.title || "";
                                    const msg = form.commands[lang]?.scriptMessage || "";
                                    return title && msg && msg === generateScriptMessage(title, lang);
                                })
                                    ? "bg-[#6b5be6]/20 text-[#6b5be6] border-[#6b5be6]/30"
                                    : "bg-[#6b5be6]/10 text-[#6b5be6]/70 border-[#6b5be6]/15 hover:bg-[#6b5be6]/20"
                            }`}
                            title="Tüm diller için başlıktan otomatik oluştur / kaldır"
                        >
                            {availableLangs.every(lang => {
                                const title = form.translations[lang]?.title || "";
                                const msg = form.commands[lang]?.scriptMessage || "";
                                return title && msg && msg === generateScriptMessage(title, lang);
                            }) ? <Check size={11} /> : null}
                            Otomatik
                        </button>
                    </div>
                </div>

                {/* Command */}
                <div className="border-t border-white/[0.04] pt-4">
                    <label className={labelCls}>Komut <span className="text-white/15 font-normal">(tüm dillerde aynı)</span></label>
                    <textarea
                        value={form.commands[commandLang]?.command || ""}
                        onChange={e => updateCommand(commandLang, "command", e.target.value)}
                        rows={6}
                        placeholder="PowerShell komutu..."
                        className={`${textareaCls} font-mono text-xs`}
                    />
                </div>
            </div>
        </motion.div>
    );
}
