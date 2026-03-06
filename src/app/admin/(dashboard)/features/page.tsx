"use client";

import { useState, useEffect, useCallback } from "react";
import { TranslatableText } from "@/components/shared/TranslatableText";

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

export default function AdminFeaturesPage() {
    const [features, setFeatures] = useState<Feature[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [filterRisk, setFilterRisk] = useState("");
    const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const fetchFeatures = useCallback(async () => {
        const params = new URLSearchParams();
        if (filterCategory) params.set("category", filterCategory);
        if (filterRisk) params.set("risk", filterRisk);
        if (search) params.set("search", search);

        const res = await fetch(`/api/admin/features?${params}`);
        const data = await res.json();
        if (data.success) setFeatures(data.features);
    }, [filterCategory, filterRisk, search]);

    const fetchCategories = async () => {
        const res = await fetch("/api/admin/categories");
        const data = await res.json();
        if (data.success) setCategories(data.categories);
    };

    useEffect(() => {
        Promise.all([fetchFeatures(), fetchCategories()]).then(() => setLoading(false));
    }, [fetchFeatures]);

    const toggleEnabled = async (feature: Feature) => {
        await fetch("/api/admin/features", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: feature.id, enabled: !feature.enabled }),
        });
        fetchFeatures();
    };

    const handleDelete = async (id: string) => {
        await fetch(`/api/admin/features?id=${id}`, { method: "DELETE" });
        setDeleteConfirm(null);
        fetchFeatures();
    };

    const handleSave = async (formData: any) => {
        setSaving(true);
        try {
            const method = isCreating ? "POST" : "PUT";
            const res = await fetch("/api/admin/features", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) {
                setEditingFeature(null);
                setIsCreating(false);
                fetchFeatures();
            } else {
                alert(data.error || "Failed to save");
            }
        } finally {
            setSaving(false);
        }
    };

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case "low": return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
            case "medium": return "bg-amber-500/15 text-amber-400 border-amber-500/20";
            case "high": return "bg-red-500/15 text-red-400 border-red-500/20";
            default: return "bg-white/5 text-white/50";
        }
    };

    const getCategoryName = (cat: Feature["category"]) => {
        return cat?.translations?.find(t => t.lang === "en")?.name || cat?.slug || "—";
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-[var(--accent-color)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Feature edit/create form
    if (editingFeature || isCreating) {
        return (
            <FeatureForm
                feature={editingFeature}
                categories={categories}
                isCreating={isCreating}
                saving={saving}
                onSave={handleSave}
                onCancel={() => { setEditingFeature(null); setIsCreating(false); }}
            />
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Features</h2>
                    <p className="text-sm text-[#a19eb7] mt-1">{features.length} total features</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="h-10 px-5 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white font-bold text-sm rounded-xl transition-all duration-200 flex items-center gap-2 hover:-translate-y-0.5 shadow-lg shadow-[var(--accent-color)]/20"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Add Feature
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    placeholder="Search features..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="flex-1 h-10 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-[#a19eb7] focus:outline-none focus:border-[var(--accent-color)]/50 transition-colors"
                />
                <select
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                    className="h-10 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[var(--accent-color)]/50 transition-colors appearance-none cursor-pointer"
                >
                    <option value="">All Categories</option>
                    {categories.map(c => (
                        <option key={c.id} value={c.id}>
                            {c.translations.find(t => t.lang === "en")?.name || c.slug}
                        </option>
                    ))}
                </select>
                <select
                    value={filterRisk}
                    onChange={e => setFilterRisk(e.target.value)}
                    className="h-10 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[var(--accent-color)]/50 transition-colors appearance-none cursor-pointer"
                >
                    <option value="">All Risks</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-[#1a1a24]/80 border border-[#2b2938] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-[#2b2938]">
                                <th className="text-left px-5 py-3 text-xs font-bold text-[#a19eb7] uppercase tracking-wider">Feature</th>
                                <th className="text-left px-5 py-3 text-xs font-bold text-[#a19eb7] uppercase tracking-wider hidden lg:table-cell">Category</th>
                                <th className="text-left px-5 py-3 text-xs font-bold text-[#a19eb7] uppercase tracking-wider hidden md:table-cell">Risk</th>
                                <th className="text-center px-5 py-3 text-xs font-bold text-[#a19eb7] uppercase tracking-wider">Status</th>
                                <th className="text-center px-5 py-3 text-xs font-bold text-[#a19eb7] uppercase tracking-wider">Order</th>
                                <th className="text-right px-5 py-3 text-xs font-bold text-[#a19eb7] uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {features.map(f => {
                                const titleEn = f.translations.find(t => t.lang === "en")?.title || f.slug;
                                const titleTr = f.translations.find(t => t.lang === "tr")?.title || "";
                                return (
                                    <tr key={f.id} className="border-b border-[#2b2938]/50 hover:bg-white/3 transition-colors group">
                                        <td className="px-5 py-3">
                                            <div>
                                                <p className="font-bold text-white">{titleEn}</p>
                                                {titleTr && <p className="text-[11px] text-[#a19eb7] mt-0.5">{titleTr}</p>}
                                                <p className="text-[10px] text-[#a19eb7]/60 font-mono mt-0.5">{f.slug}</p>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 hidden lg:table-cell">
                                            <span className="text-xs bg-white/5 border border-white/5 px-2 py-1 rounded-lg text-[#a19eb7]">
                                                {getCategoryName(f.category)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 hidden md:table-cell">
                                            <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg border ${getRiskColor(f.risk)}`}>
                                                {f.risk}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            <button
                                                onClick={() => toggleEnabled(f)}
                                                className={`w-10 h-5 rounded-full transition-all duration-300 relative ${f.enabled ? "bg-emerald-500" : "bg-white/10"}`}
                                            >
                                                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${f.enabled ? "left-5.5" : "left-0.5"}`} />
                                            </button>
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            <span className="text-xs text-[#a19eb7] font-mono">{f.order}</span>
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setEditingFeature(f)}
                                                    className="size-8 flex items-center justify-center rounded-lg hover:bg-[var(--accent-color)]/15 text-[#a19eb7] hover:text-[var(--accent-color)] transition-all"
                                                    title="Edit"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(f.id)}
                                                    className="size-8 flex items-center justify-center rounded-lg hover:bg-red-500/15 text-[#a19eb7] hover:text-red-400 transition-all"
                                                    title="Delete"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {features.length === 0 && (
                    <div className="text-center py-12 text-[#a19eb7]">No features found</div>
                )}
            </div>

            {/* Delete Confirm Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-xl" onClick={() => setDeleteConfirm(null)}>
                    <div className="bg-[#1a1a24] border border-[#2b2938] rounded-2xl p-6 max-w-sm w-full mx-4 animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-white mb-2">Delete Feature?</h3>
                        <p className="text-sm text-[#a19eb7] mb-6">This action cannot be undone. The feature and all its translations and commands will be permanently deleted.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 h-10 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all text-sm">Cancel</button>
                            <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 h-10 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all text-sm">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Feature Edit/Create Form ────────────────────────────────────────
function FeatureForm({
    feature,
    categories,
    isCreating,
    saving,
    onSave,
    onCancel,
}: {
    feature: Feature | null;
    categories: Category[];
    isCreating: boolean;
    saving: boolean;
    onSave: (data: any) => void;
    onCancel: () => void;
}) {
    const [slug, setSlug] = useState(feature?.slug || "");
    const [categoryId, setCategoryId] = useState(feature?.categoryId || categories[0]?.id || "");
    const [icon, setIcon] = useState(feature?.icon || "settings");
    const [iconType, setIconType] = useState(feature?.iconType || "solid");
    const [risk, setRisk] = useState(feature?.risk || "low");
    const [noRisk, setNoRisk] = useState(feature?.noRisk || false);
    const [order, setOrder] = useState(feature?.order || 0);
    const [enabled, setEnabled] = useState(feature?.enabled !== false);

    // Translations
    const [titleEn, setTitleEn] = useState(feature?.translations?.find(t => t.lang === "en")?.title || "");
    const [descEn, setDescEn] = useState(feature?.translations?.find(t => t.lang === "en")?.desc || "");
    const [titleTr, setTitleTr] = useState(feature?.translations?.find(t => t.lang === "tr")?.title || "");
    const [descTr, setDescTr] = useState(feature?.translations?.find(t => t.lang === "tr")?.desc || "");

    // Commands
    const [cmdEn, setCmdEn] = useState(feature?.commands?.find(c => c.lang === "en")?.command || "");
    const [msgEn, setMsgEn] = useState(feature?.commands?.find(c => c.lang === "en")?.scriptMessage || "");
    const [cmdTr, setCmdTr] = useState(feature?.commands?.find(c => c.lang === "tr")?.command || "");
    const [msgTr, setMsgTr] = useState(feature?.commands?.find(c => c.lang === "tr")?.scriptMessage || "");

    const handleSubmit = () => {
        const data: any = {
            slug, categoryId, icon, iconType, risk, noRisk, order, enabled,
            translations: [
                { lang: "en", title: titleEn, desc: descEn },
                { lang: "tr", title: titleTr, desc: descTr },
            ],
            commands: [
                { lang: "en", command: cmdEn, scriptMessage: msgEn },
                { lang: "tr", command: cmdTr, scriptMessage: msgTr },
            ],
        };
        if (!isCreating) data.id = feature!.id;
        onSave(data);
    };

    const inputClass = "w-full h-10 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-[#a19eb7]/50 focus:outline-none focus:border-[var(--accent-color)]/50 transition-colors";
    const textareaClass = "w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-[#a19eb7]/50 focus:outline-none focus:border-[var(--accent-color)]/50 transition-colors resize-none";
    const labelClass = "block text-xs font-bold text-[#a19eb7] uppercase tracking-wider mb-1.5";

    return (
        <div className="space-y-6 animate-fade-in-up max-w-5xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={onCancel} className="size-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                    <h2 className="text-2xl font-black text-white tracking-tight">{isCreating ? "New Feature" : "Edit Feature"}</h2>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={saving || !slug || !titleEn}
                    className="h-10 px-6 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all duration-200 flex items-center gap-2"
                >
                    {saving ? (
                        <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                    ) : (
                        <>{isCreating ? "Create" : "Save Changes"}</>
                    )}
                </button>
            </div>

            {/* Basic Info */}
            <div className="bg-[#1a1a24]/80 border border-[#2b2938] rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Slug (unique ID)</label>
                        <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="e.g. disableTelemetry" className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Category</label>
                        <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className={`${inputClass} appearance-none cursor-pointer`}>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.translations.find(t => t.lang === "en")?.name || c.slug}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Icon</label>
                        <input value={icon} onChange={e => setIcon(e.target.value)} placeholder="settings" className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Icon Type</label>
                        <select value={iconType} onChange={e => setIconType(e.target.value)} className={`${inputClass} appearance-none cursor-pointer`}>
                            <option value="solid">Solid</option>
                            <option value="outline">Outline</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Risk Level</label>
                        <select value={risk} onChange={e => setRisk(e.target.value)} className={`${inputClass} appearance-none cursor-pointer`}>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Order</label>
                        <input type="number" value={order} onChange={e => setOrder(parseInt(e.target.value) || 0)} className={inputClass} />
                    </div>
                </div>
                <div className="flex items-center gap-4 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} className="sr-only peer" />
                        <div className="w-10 h-5 rounded-full bg-white/10 peer-checked:bg-emerald-500 transition-all relative">
                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${enabled ? "left-5.5" : "left-0.5"}`} />
                        </div>
                        <span className="text-sm text-white font-medium">Enabled</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={noRisk} onChange={e => setNoRisk(e.target.checked)} className="sr-only peer" />
                        <div className="w-10 h-5 rounded-full bg-white/10 peer-checked:bg-blue-500 transition-all relative">
                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${noRisk ? "left-5.5" : "left-0.5"}`} />
                        </div>
                        <span className="text-sm text-white font-medium">No Risk Warning</span>
                    </label>
                </div>
            </div>

            {/* Translations */}
            <div className="bg-[#1a1a24]/80 border border-[#2b2938] rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Translations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-black text-white bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-md">EN</span>
                            <span className="text-xs text-[#a19eb7]">English</span>
                        </div>
                        <div>
                            <label className={labelClass}>Title</label>
                            <input value={titleEn} onChange={e => setTitleEn(e.target.value)} placeholder="Feature title" className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Description</label>
                            <textarea value={descEn} onChange={e => setDescEn(e.target.value)} rows={3} placeholder="Feature description" className={textareaClass} />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-black bg-red-500/20 text-red-400 px-2 py-0.5 rounded-md">TR</span>
                            <span className="text-xs text-[#a19eb7]">Türkçe</span>
                        </div>
                        <div>
                            <label className={labelClass}>Başlık</label>
                            <input value={titleTr} onChange={e => setTitleTr(e.target.value)} placeholder="Özellik başlığı" className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Açıklama</label>
                            <textarea value={descTr} onChange={e => setDescTr(e.target.value)} rows={3} placeholder="Özellik açıklaması" className={textareaClass} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Commands */}
            <div className="bg-[#1a1a24]/80 border border-[#2b2938] rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">PowerShell Commands</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-black bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-md">EN</span>
                        </div>
                        <div>
                            <label className={labelClass}>Command</label>
                            <textarea value={cmdEn} onChange={e => setCmdEn(e.target.value)} rows={4} placeholder="PowerShell command" className={`${textareaClass} font-mono text-xs`} />
                        </div>
                        <div>
                            <label className={labelClass}>Script Message</label>
                            <input value={msgEn} onChange={e => setMsgEn(e.target.value)} placeholder="Applying optimization..." className={inputClass} />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-black bg-red-500/20 text-red-400 px-2 py-0.5 rounded-md">TR</span>
                        </div>
                        <div>
                            <label className={labelClass}>Komut</label>
                            <textarea value={cmdTr} onChange={e => setCmdTr(e.target.value)} rows={4} placeholder="PowerShell komutu" className={`${textareaClass} font-mono text-xs`} />
                        </div>
                        <div>
                            <label className={labelClass}>Script Mesajı</label>
                            <input value={msgTr} onChange={e => setMsgTr(e.target.value)} placeholder="Optimizasyon uygulanıyor..." className={inputClass} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
