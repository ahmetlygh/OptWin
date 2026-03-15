"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Puzzle,
    Search,
    Plus,
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
import { generateScriptMessage } from "@/lib/powershell-safe";

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

const RISK_COLORS: Record<string, string> = {
    low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/15",
    medium: "bg-amber-500/10 text-amber-400 border-amber-500/15",
    high: "bg-red-500/10 text-red-400 border-red-500/15",
};

const RISK_LABELS: Record<string, string> = { low: "Düşük", medium: "Orta", high: "Yüksek" };

const LANG_NAMES: Record<string, string> = {
    en: "English", tr: "Türkçe", zh: "中文", es: "Español",
    hi: "हिन्दी", de: "Deutsch", fr: "Français",
};

export default function AdminFeaturesPage() {
    const router = useRouter();
    const [features, setFeatures] = useState<Feature[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [filterRisk, setFilterRisk] = useState("");
    const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const fetchFeatures = useCallback(async () => {
        const res = await fetch("/api/admin/features");
        const data = await res.json();
        if (data.success) setFeatures(data.features);
    }, []);

    const fetchCategories = useCallback(async () => {
        const res = await fetch("/api/admin/categories");
        const data = await res.json();
        if (data.success) setCategories(data.categories);
    }, []);

    useEffect(() => {
        Promise.all([fetchFeatures(), fetchCategories()]).then(() => setLoading(false));
    }, [fetchFeatures, fetchCategories]);

    const toggleEnabled = async (e: React.MouseEvent, feature: Feature) => {
        e.stopPropagation();
        const newEnabled = !feature.enabled;
        setFeatures(prev => prev.map(f => f.id === feature.id ? { ...f, enabled: newEnabled } : f));
        await fetch("/api/admin/features", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: feature.id, enabled: newEnabled }),
        });
    };

    const handleDelete = async (id: string) => {
        await fetch(`/api/admin/features?id=${id}`, { method: "DELETE" });
        setDeleteConfirm(null);
        fetchFeatures();
    };

    const filtered = useMemo(() => {
        let result = features;
        if (filterCategory) result = result.filter(f => f.categoryId === filterCategory);
        if (filterRisk) result = result.filter(f => f.risk === filterRisk);
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(f => {
                const titles = f.translations.map(t => t.title.toLowerCase());
                return f.slug.toLowerCase().includes(q) || titles.some(t => t.includes(q));
            });
        }
        return result;
    }, [features, filterCategory, filterRisk, search]);

    const getCategoryName = (cat: Feature["category"]) =>
        cat?.translations?.find(t => t.lang === "en")?.name || cat?.slug || "—";

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={24} className="text-[#6b5be6] animate-spin" />
            </div>
        );
    }

    if (editingFeature || isCreating) {
        return (
            <FeatureEditor
                feature={editingFeature}
                categories={categories}
                isCreating={isCreating}
                onSave={() => { setEditingFeature(null); setIsCreating(false); fetchFeatures(); }}
                onCancel={() => { setEditingFeature(null); setIsCreating(false); }}
                onDelete={(id) => { setEditingFeature(null); setIsCreating(false); handleDelete(id); }}
            />
        );
    }

    const categoryOptions = [
        { value: "", label: "Tüm Kategoriler" },
        ...categories.map(c => ({
            value: c.id,
            label: c.translations.find(t => t.lang === "en")?.name || c.slug,
        })),
    ];

    const riskOptions = [
        { value: "", label: "Tüm Risk Seviyeleri" },
        { value: "low", label: "Düşük" },
        { value: "medium", label: "Orta" },
        { value: "high", label: "Yüksek" },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-5"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#6b5be6]/10 flex items-center justify-center">
                        <Puzzle size={18} className="text-[#6b5be6]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight">Özellikler</h1>
                        <p className="text-xs text-white/30 mt-0.5">
                            {filtered.length} / {features.length} özellik
                        </p>
                    </div>
                </div>
                <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setIsCreating(true)}
                    className="h-9 px-5 bg-[#6b5be6] hover:bg-[#5a4bd4] text-white font-bold text-sm rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-[#6b5be6]/20"
                >
                    <Plus size={15} />
                    Yeni Özellik
                </motion.button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/15" />
                    <input
                        type="text"
                        placeholder="Özellik ara..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full h-9 pl-9 pr-4 bg-white/[0.02] border border-white/[0.04] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#6b5be6]/30 transition-colors"
                    />
                </div>
                <AdminSelect
                    options={categoryOptions}
                    value={filterCategory}
                    onChange={setFilterCategory}
                    placeholder="Tüm Kategoriler"
                    className="w-full sm:w-[200px]"
                />
                <AdminSelect
                    options={riskOptions}
                    value={filterRisk}
                    onChange={setFilterRisk}
                    placeholder="Tüm Risk Seviyeleri"
                    className="w-full sm:w-[180px]"
                />
            </div>

            {/* Features Table */}
            <div className="rounded-2xl border border-white/[0.04] bg-white/[0.015] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/[0.04]">
                                <th className="text-left px-5 py-3 text-[10px] font-bold text-white/20 uppercase tracking-wider">Özellik</th>
                                <th className="text-left px-5 py-3 text-[10px] font-bold text-white/20 uppercase tracking-wider hidden lg:table-cell">Kategori</th>
                                <th className="text-left px-5 py-3 text-[10px] font-bold text-white/20 uppercase tracking-wider hidden md:table-cell">Risk</th>
                                <th className="text-center px-5 py-3 text-[10px] font-bold text-white/20 uppercase tracking-wider">Durum</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((f, i) => {
                                const titleEn = f.translations.find(t => t.lang === "en")?.title || f.slug;
                                const titleTr = f.translations.find(t => t.lang === "tr")?.title;
                                return (
                                    <motion.tr
                                        key={f.id}
                                        initial={false}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.15 }}
                                        onClick={() => router.push(`/admin/features/edit/${f.slug}`)}
                                        className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer group"
                                    >
                                        <td className="px-5 py-3">
                                            <div>
                                                <p className="font-semibold text-white/80 group-hover:text-white transition-colors">{titleEn}</p>
                                                {titleTr && <p className="text-[11px] text-white/20 mt-0.5">{titleTr}</p>}
                                                <p className="text-[10px] text-white/10 font-mono mt-0.5">{f.slug}</p>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 hidden lg:table-cell">
                                            <span className="text-[11px] bg-white/[0.03] border border-white/[0.04] px-2 py-1 rounded-lg text-white/30">
                                                {getCategoryName(f.category)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 hidden md:table-cell">
                                            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg border ${RISK_COLORS[f.risk] || ""}`}>
                                                {RISK_LABELS[f.risk] || f.risk}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            <button
                                                onClick={(e) => toggleEnabled(e, f)}
                                                className={`w-10 h-[22px] rounded-full transition-all duration-300 relative ${f.enabled ? "bg-emerald-500/80" : "bg-white/[0.06]"}`}
                                            >
                                                <span className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${f.enabled ? "left-[22px]" : "left-[3px]"}`} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filtered.length === 0 && (
                    <div className="text-center py-12 text-white/20">Özellik bulunamadı</div>
                )}
            </div>

            {/* Delete Confirm Modal */}
            <AdminConfirmModal
                open={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
                title="Özelliği Sil"
                description="Bu işlem geri alınamaz. Tüm çeviriler ve komutlar kalıcı olarak silinecektir."
                confirmText="Sil"
                cancelText="İptal"
                variant="danger"
            />
        </motion.div>
    );
}

// ─── Feature Editor ──────────────────────────────────────────────────
function FeatureEditor({
    feature,
    categories,
    isCreating,
    onSave,
    onCancel,
    onDelete,
}: {
    feature: Feature | null;
    categories: Category[];
    isCreating: boolean;
    onSave: () => void;
    onCancel: () => void;
    onDelete: (id: string) => void;
}) {
    const availableLangs = useMemo(() => {
        if (!feature) return ["en", "tr"];
        const langs = new Set<string>();
        feature.translations.forEach(t => langs.add(t.lang));
        feature.commands.forEach(c => langs.add(c.lang));
        if (!langs.has("en")) langs.add("en");
        if (!langs.has("tr")) langs.add("tr");
        return Array.from(langs).sort();
    }, [feature]);

    const [translationLang, setTranslationLang] = useState("en");
    const [commandLang, setCommandLang] = useState("en");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [saved, setSaved] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const buildInitialState = useCallback(() => ({
        slug: feature?.slug || "",
        categoryId: feature?.categoryId || categories[0]?.id || "",
        icon: feature?.icon || "settings",
        iconType: feature?.iconType || "solid",
        risk: feature?.risk || "low",
        noRisk: feature?.noRisk || false,
        order: feature?.order || 0,
        enabled: feature?.enabled !== false,
        newBadge: (feature as any)?.newBadge ?? false,
        newBadgeExpiry: (feature as any)?.newBadgeExpiry || "",
        translations: Object.fromEntries(
            availableLangs.map(lang => [lang, {
                title: feature?.translations.find(t => t.lang === lang)?.title || "",
                desc: feature?.translations.find(t => t.lang === lang)?.desc || "",
            }])
        ),
        commands: Object.fromEntries(
            availableLangs.map(lang => [lang, {
                command: feature?.commands.find(c => c.lang === lang)?.command || "",
                scriptMessage: feature?.commands.find(c => c.lang === lang)?.scriptMessage || "",
            }])
        ),
    }), [feature, categories, availableLangs]);

    const [form, setForm] = useState(buildInitialState);
    const [original, setOriginal] = useState(buildInitialState);

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
        setForm(prev => {
            const updated = { ...prev.commands };
            if (field === "command") {
                // Command is language-independent — sync to all languages
                for (const l of availableLangs) {
                    updated[l] = { ...updated[l], command: value };
                }
            } else {
                updated[lang] = { ...updated[lang], [field]: value };
            }
            return { ...prev, commands: updated };
        });
    };

    const handleSubmit = async () => {
        setSaving(true);
        setError("");
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data: any = {
                slug: form.slug, categoryId: form.categoryId, icon: form.icon, iconType: form.iconType,
                risk: form.risk, noRisk: form.noRisk, order: form.order, enabled: form.enabled,
                newBadge: form.newBadge, newBadgeExpiry: form.newBadgeExpiry || null,
                translations: Object.entries(form.translations).map(([lang, t]) => ({ lang, title: t.title, desc: t.desc })),
                commands: Object.entries(form.commands).map(([lang, c]) => ({ lang, command: c.command, scriptMessage: c.scriptMessage })),
            };
            if (!isCreating) data.id = feature!.id;

            const res = await fetch("/api/admin/features", {
                method: isCreating ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const result = await res.json();
            if (result.success) {
                setSaved(true);
                setOriginal(JSON.parse(JSON.stringify(form)));
                setTimeout(() => onSave(), 1200);
            } else {
                setError(result.error || "Kaydetme başarısız");
            }
        } catch {
            setError("Özellik kaydedilemedi");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (hasChanges && !isCreating) {
            setForm(buildInitialState());
        }
        onCancel();
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
            className="space-y-5"
        >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCancel}
                        className="size-9 flex items-center justify-center rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-white/40 hover:text-white/70 transition-all border border-white/[0.04]"
                    >
                        <ChevronLeft size={16} />
                    </motion.button>
                    <h1 className="text-2xl font-black text-white tracking-tight">
                        {isCreating ? "Yeni Özellik" : "Özellik Düzenle"}
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    <AnimatePresence>
                        {hasChanges && !isCreating && (
                            <motion.div
                                key="cancel-btn"
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -8, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                            >
                                <button
                                    onClick={() => { setForm(buildInitialState()); setOriginal(buildInitialState()); }}
                                    className="h-9 px-4 rounded-xl text-sm font-medium text-white/40 hover:text-white/70 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] transition-all flex items-center gap-2"
                                >
                                    <RotateCcw size={13} />
                                    İptal
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <AnimatePresence>
                        {(hasChanges || isCreating) && (
                            <motion.div
                                key="save-btn"
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -8, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                            >
                                <button
                                    onClick={handleSubmit}
                                    disabled={saving || !form.slug || !form.translations.en?.title}
                                    className="h-9 px-5 rounded-xl text-sm font-bold text-white bg-[#6b5be6] hover:bg-[#5a4bd4] disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-[#6b5be6]/20"
                                >
                                {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Save size={14} />}
                                {saving ? "Kaydediliyor..." : saved ? "Kaydedildi!" : isCreating ? "Oluştur" : "Kaydet"}
                            </button>
                        </motion.div>
                    )}
                    </AnimatePresence>

                    {/* Delete button — only when editing, now on the right */}
                    {!isCreating && feature && (
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={() => setShowDeleteModal(true)}
                            className="h-9 px-3 rounded-xl text-sm font-medium text-red-400/60 hover:text-red-400 bg-red-500/[0.04] hover:bg-red-500/[0.08] border border-red-500/[0.08] transition-all flex items-center gap-1.5"
                        >
                            <Trash2 size={13} />
                            Sil
                        </motion.button>
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
                    {/* K7: Risk seviyesi — noRisk true iken gizlenir */}
                    <AnimatePresence initial={false}>
                        {!form.noRisk && (
                            <motion.div
                                key="risk-field"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                                className="overflow-hidden"
                            >
                                <label className={labelCls}>Risk Seviyesi</label>
                                <AdminSelect options={riskOptions} value={form.risk} onChange={v => updateField("risk", v)} placeholder="Risk seçin" />
                            </motion.div>
                        )}
                    </AnimatePresence>
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
                        <label className="flex items-center gap-2 cursor-pointer">
                            <button
                                type="button"
                                onClick={() => updateField("newBadge", !form.newBadge)}
                                className={`w-10 h-[22px] rounded-full transition-all duration-300 relative ${form.newBadge ? "bg-amber-500/80" : "bg-white/[0.06]"}`}
                            >
                                <span className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${form.newBadge ? "left-[22px]" : "left-[3px]"}`} />
                            </button>
                            <span className="text-xs text-white/50">Yeni Badge</span>
                        </label>
                    </div>
                    {/* K8: Badge alanı animasyonlu açılıp kapanır */}
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

            {/* Translations */}
            <div className="rounded-2xl border border-white/[0.04] bg-white/[0.015] p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-bold text-white/25 uppercase tracking-wider">Çeviriler</h3>
                    <AdminLangPicker value={translationLang} onChange={setTranslationLang} availableLangs={availableLangs} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

                {/* Script Message — per-language (above command) */}
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
                            onClick={() => {
                                // J3: Generate script message for ALL languages from their own title
                                for (const lang of availableLangs) {
                                    const title = form.translations[lang]?.title || "";
                                    if (title) {
                                        updateCommand(lang, "scriptMessage", generateScriptMessage(title, lang));
                                    }
                                }
                            }}
                            className="shrink-0 h-9 px-3 rounded-xl text-[11px] font-bold bg-[#6b5be6]/10 text-[#6b5be6] hover:bg-[#6b5be6]/20 border border-[#6b5be6]/15 transition-all"
                            title="Tüm diller için başlıktan otomatik oluştur"
                        >
                            Otomatik
                        </button>
                    </div>
                </div>

                {/* Command — language-independent */}
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

            {/* Delete Modal */}
            <AdminConfirmModal
                open={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={() => {
                    setShowDeleteModal(false);
                    if (feature) onDelete(feature.id);
                }}
                title="Özelliği Sil"
                description="Bu işlem geri alınamaz. Tüm çeviriler ve komutlar kalıcı olarak silinecektir. Devam etmek istiyor musunuz?"
                confirmText="Evet, Sil"
                cancelText="İptal"
                variant="danger"
            />
        </motion.div>
    );
}
