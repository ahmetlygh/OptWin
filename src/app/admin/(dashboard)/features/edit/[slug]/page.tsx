"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    ChevronLeft,
    Save,
    RotateCcw,
    Loader2,
    Check,
    AlertCircle,
    X,
    Trash2,
} from "lucide-react";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";
import { AdminLangPicker } from "@/components/admin/AdminLangPicker";
import { AdminIconPicker } from "@/components/admin/AdminIconPicker";

type Feature = {
    id: string;
    slug: string;
    categoryId: string;
    icon: string;
    iconType: string;
    risk: string;
    noRisk: boolean;
    order: number;
    enabled: boolean;
    translations: { id: string; lang: string; title: string; desc: string }[];
    commands: { id: string; lang: string; command: string; scriptMessage: string }[];
    category: { id: string; slug: string; translations: { lang: string; name: string }[] };
};

type Category = {
    id: string;
    slug: string;
    translations: { lang: string; name: string }[];
};

export default function FeatureEditBySlugPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [feature, setFeature] = useState<Feature | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        Promise.all([
            fetch("/api/admin/features").then(r => r.json()),
            fetch("/api/admin/categories").then(r => r.json()),
        ]).then(([fData, cData]) => {
            if (cData.success) setCategories(cData.categories);
            if (fData.success) {
                const found = fData.features.find((f: Feature) => f.slug.toLowerCase() === slug.toLowerCase());
                if (found) {
                    setFeature(found);
                } else {
                    setNotFound(true);
                }
            }
            setLoading(false);
        });
    }, [slug]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={24} className="text-[#6b5be6] animate-spin" />
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <p className="text-white/30 text-sm">Özellik bulunamadı: <span className="font-mono text-white/50">{slug}</span></p>
                <button
                    onClick={() => router.push("/admin/features")}
                    className="h-9 px-5 bg-[#6b5be6] hover:bg-[#5a4bd4] text-white font-bold text-sm rounded-xl transition-colors"
                >
                    Listeye Dön
                </button>
            </div>
        );
    }

    return (
        <SlugFeatureEditor
            feature={feature!}
            categories={categories}
            onSave={() => router.push("/admin/features")}
            onCancel={() => router.push("/admin/features")}
            onDelete={() => router.push("/admin/features")}
        />
    );
}

function SlugFeatureEditor({
    feature,
    categories,
    onSave,
    onCancel,
    onDelete: onDeleteCallback,
}: {
    feature: Feature;
    categories: Category[];
    onSave: () => void;
    onCancel: () => void;
    onDelete: () => void;
}) {
    const availableLangs = useMemo(() => {
        const langs = new Set<string>();
        feature.translations.forEach(t => langs.add(t.lang));
        feature.commands.forEach(c => langs.add(c.lang));
        if (!langs.has("en")) langs.add("en");
        if (!langs.has("tr")) langs.add("tr");
        return Array.from(langs).sort();
    }, [feature]);

    const [activeLang, setActiveLang] = useState("en");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [saved, setSaved] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const buildInitialState = useCallback(() => ({
        slug: feature.slug,
        categoryId: feature.categoryId || categories[0]?.id || "",
        icon: feature.icon || "settings",
        iconType: feature.iconType || "solid",
        risk: feature.risk || "low",
        noRisk: feature.noRisk || false,
        order: feature.order || 0,
        enabled: feature.enabled !== false,
        translations: Object.fromEntries(
            availableLangs.map(lang => [lang, {
                title: feature.translations.find(t => t.lang === lang)?.title || "",
                desc: feature.translations.find(t => t.lang === lang)?.desc || "",
            }])
        ),
        commands: Object.fromEntries(
            availableLangs.map(lang => [lang, {
                command: feature.commands.find(c => c.lang === lang)?.command || "",
                scriptMessage: feature.commands.find(c => c.lang === lang)?.scriptMessage || "",
            }])
        ),
    }), [feature, categories, availableLangs]);

    const [form, setForm] = useState(buildInitialState);
    const [original] = useState(buildInitialState);
    const hasChanges = JSON.stringify(form) !== JSON.stringify(original);

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
        setForm(prev => ({
            ...prev,
            commands: { ...prev.commands, [lang]: { ...prev.commands[lang], [field]: value } },
        }));
    };

    const handleSubmit = async () => {
        setSaving(true);
        setError("");
        try {
            const data = {
                id: feature.id,
                slug: form.slug, categoryId: form.categoryId, icon: form.icon, iconType: form.iconType,
                risk: form.risk, noRisk: form.noRisk, order: form.order, enabled: form.enabled,
                translations: Object.entries(form.translations).map(([lang, t]) => ({ lang, title: t.title, desc: t.desc })),
                commands: Object.entries(form.commands).map(([lang, c]) => ({ lang, command: c.command, scriptMessage: c.scriptMessage })),
            };
            const res = await fetch("/api/admin/features", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const result = await res.json();
            if (result.success) {
                setSaved(true);
                setTimeout(() => onSave(), 400);
            } else {
                setError(result.error || "Kaydetme başarısız");
            }
        } catch {
            setError("Özellik kaydedilemedi");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        await fetch(`/api/admin/features?id=${feature.id}`, { method: "DELETE" });
        setShowDeleteModal(false);
        onDeleteCallback();
    };

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
            className="space-y-5 max-w-5xl"
        >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onCancel}
                        className="size-9 flex items-center justify-center rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-white/40 hover:text-white/70 transition-all border border-white/[0.04]"
                    >
                        <ChevronLeft size={16} />
                    </motion.button>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight">Özellik Düzenle</h1>
                        <p className="text-[10px] text-white/20 font-mono mt-0.5">{feature.slug}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => setShowDeleteModal(true)}
                        className="h-9 px-3 rounded-xl text-sm font-medium text-red-400/60 hover:text-red-400 bg-red-500/[0.04] hover:bg-red-500/[0.08] border border-red-500/[0.08] transition-all flex items-center gap-1.5"
                    >
                        <Trash2 size={13} />
                        Sil
                    </motion.button>

                    {hasChanges && (
                        <motion.div
                            initial={{ opacity: 0, x: 8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-2"
                        >
                            <button
                                onClick={() => setForm(buildInitialState())}
                                className="h-9 px-4 rounded-xl text-sm font-medium text-white/40 hover:text-white/70 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] transition-all flex items-center gap-2"
                            >
                                <RotateCcw size={13} />
                                İptal
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={saving || !form.slug || !form.translations.en?.title}
                                className="h-9 px-5 rounded-xl text-sm font-bold text-white bg-[#6b5be6] hover:bg-[#5a4bd4] disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-[#6b5be6]/20"
                            >
                                {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Save size={14} />}
                                {saving ? "Kaydediliyor..." : saved ? "Kaydedildi!" : "Kaydet"}
                            </button>
                        </motion.div>
                    )}
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
                <h3 className="text-[11px] font-bold text-white/25 uppercase tracking-wider">Temel Bilgiler</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className={labelCls}>Slug (benzersiz ID)</label>
                        <input value={form.slug} onChange={e => updateField("slug", e.target.value)} placeholder="disableTelemetry" className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>Kategori</label>
                        <AdminSelect options={categoryOptions} value={form.categoryId} onChange={v => updateField("categoryId", v)} placeholder="Kategori seçin" />
                    </div>
                    <div>
                        <label className={labelCls}>İkon</label>
                        <AdminIconPicker value={form.icon} onChange={v => updateField("icon", v)} />
                    </div>
                    <div>
                        <label className={labelCls}>Risk Seviyesi</label>
                        <AdminSelect options={riskOptions} value={form.risk} onChange={v => updateField("risk", v)} placeholder="Risk seçin" />
                    </div>
                    <div>
                        <label className={labelCls}>Sıra</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={form.order}
                            onChange={e => updateField("order", parseInt(e.target.value) || 0)}
                            className={inputCls}
                        />
                    </div>
                    <div className="flex items-end gap-4 pb-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <button
                                type="button"
                                onClick={() => updateField("enabled", !form.enabled)}
                                className={`w-10 h-[22px] rounded-full transition-all duration-300 relative ${form.enabled ? "bg-emerald-500/80" : "bg-white/[0.06]"}`}
                            >
                                <span className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${form.enabled ? "left-[22px]" : "left-[3px]"}`} />
                            </button>
                            <span className="text-xs text-white/50">Aktif</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <button
                                type="button"
                                onClick={() => updateField("noRisk", !form.noRisk)}
                                className={`w-10 h-[22px] rounded-full transition-all duration-300 relative ${form.noRisk ? "bg-blue-500/80" : "bg-white/[0.06]"}`}
                            >
                                <span className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${form.noRisk ? "left-[22px]" : "left-[3px]"}`} />
                            </button>
                            <span className="text-xs text-white/50">Risksiz</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Translations */}
            <div className="rounded-2xl border border-white/[0.04] bg-white/[0.015] p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-bold text-white/25 uppercase tracking-wider">Çeviriler</h3>
                    <AdminLangPicker value={activeLang} onChange={setActiveLang} availableLangs={availableLangs} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className={labelCls}>Başlık</label>
                        <input
                            value={form.translations[activeLang]?.title || ""}
                            onChange={e => updateTranslation(activeLang, "title", e.target.value)}
                            placeholder="Özellik başlığı..."
                            className={inputCls}
                        />
                    </div>
                    <div>
                        <label className={labelCls}>Açıklama</label>
                        <textarea
                            value={form.translations[activeLang]?.desc || ""}
                            onChange={e => updateTranslation(activeLang, "desc", e.target.value)}
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
                    <AdminLangPicker value={activeLang} onChange={setActiveLang} availableLangs={availableLangs} />
                </div>
                <div>
                    <label className={labelCls}>Script Mesajı</label>
                    <input
                        value={form.commands[activeLang]?.scriptMessage || ""}
                        onChange={e => updateCommand(activeLang, "scriptMessage", e.target.value)}
                        placeholder="Optimizasyon uygulanıyor..."
                        className={inputCls}
                    />
                </div>
                <div>
                    <label className={labelCls}>Komut</label>
                    <textarea
                        value={form.commands[activeLang]?.command || ""}
                        onChange={e => updateCommand(activeLang, "command", e.target.value)}
                        rows={6}
                        placeholder="PowerShell komutu..."
                        className={`${textareaCls} font-mono text-xs`}
                    />
                </div>
            </div>

            {/* Delete Modal */}
            <AdminConfirmModal
                open={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Özelliği Sil"
                description="Bu işlem geri alınamaz. Tüm çeviriler ve komutlar kalıcı olarak silinecektir. Devam etmek istiyor musunuz?"
                confirmText="Evet, Sil"
                cancelText="İptal"
                variant="danger"
            />
        </motion.div>
    );
}
