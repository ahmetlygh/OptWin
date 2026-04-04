"use client";

import { useState, useEffect } from "react";

type Category = {
    id: string;
    slug: string;
    icon: string | null;
    order: number;
    enabled: boolean;
    translations: { id: string; lang: string; name: string }[];
    _count: { features: number };
};

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Category | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [cascadeConfirm, setCascadeConfirm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [dragItem, setDragItem] = useState<number | null>(null);

    const fetchCategories = async () => {
        const res = await fetch("/api/admin/categories");
        const data = await res.json();
        if (data.success) setCategories(data.categories);
        setLoading(false);
    };

    useEffect(() => { fetchCategories(); }, []);

    const toggleEnabled = async (cat: Category) => {
        await fetch("/api/admin/categories", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: cat.id, enabled: !cat.enabled }),
        });
        fetchCategories();
    };

    const handleDelete = async (id: string, force = false) => {
        const res = await fetch(`/api/admin/categories?id=${id}${force ? '&force=true' : ''}`, { method: "DELETE" });
        const data = await res.json();
        if (!data.success) alert(data.error);
        setDeleteConfirm(null);
        setCascadeConfirm(false);
        fetchCategories();
    };

    const handleSave = async (formData: any) => {
        setSaving(true);
        try {
            const method = isCreating ? "POST" : "PUT";
            const res = await fetch("/api/admin/categories", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) {
                setEditing(null);
                setIsCreating(false);
                fetchCategories();
            } else {
                alert(data.error || "Failed to save");
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDragStart = (index: number) => setDragItem(index);
    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (dragItem === null || dragItem === index) return;
        const newItems = [...categories];
        const [removed] = newItems.splice(dragItem, 1);
        newItems.splice(index, 0, removed);
        setCategories(newItems);
        setDragItem(index);
    };
    const handleDragEnd = async () => {
        setDragItem(null);
        const items = categories.map((c, i) => ({ id: c.id, order: i }));
        await fetch("/api/admin/reorder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "category", items }),
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-(--accent-color) border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (editing || isCreating) {
        return <CategoryForm category={editing} isCreating={isCreating} saving={saving} onSave={handleSave} onCancel={() => { setEditing(null); setIsCreating(false); }} />;
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Categories</h2>
                    <p className="text-sm text-[#a19eb7] mt-1">{categories.length} categories · Drag to reorder</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="h-10 px-5 bg-(--accent-color) hover:bg-(--accent-hover) text-white font-bold text-sm rounded-xl transition-all duration-200 flex items-center gap-2 hover:-translate-y-0.5 shadow-lg shadow-(--accent-color)/20"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Add Category
                </button>
            </div>

            <div className="space-y-2">
                {categories.map((cat, i) => {
                    const nameEn = cat.translations.find(t => t.lang === "en")?.name || cat.slug;
                    const nameTr = cat.translations.find(t => t.lang === "tr")?.name || "";

                    return (
                        <div
                            key={cat.id}
                            draggable
                            onDragStart={() => handleDragStart(i)}
                            onDragOver={(e) => handleDragOver(e, i)}
                            onDragEnd={handleDragEnd}
                            className={`bg-[#1a1a24]/80 border border-[#2b2938] rounded-xl p-4 flex items-center gap-4 cursor-grab active:cursor-grabbing hover:border-white/10 transition-all group ${dragItem === i ? "opacity-50 scale-[0.98]" : ""}`}
                        >
                            {/* Drag handle */}
                            <div className="text-[#a19eb7]/40 group-hover:text-[#a19eb7] transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="19" r="1" /></svg>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-white text-sm">{nameEn}</p>
                                    {nameTr && <span className="text-[11px] text-[#a19eb7]">({nameTr})</span>}
                                </div>
                                <p className="text-[10px] text-[#a19eb7]/60 font-mono mt-0.5">{cat.slug}</p>
                            </div>

                            <span className="text-xs bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg text-[#a19eb7] hidden sm:block">
                                {cat._count.features} features
                            </span>

                            <button
                                onClick={() => toggleEnabled(cat)}
                                className={`w-10 h-5 rounded-full transition-all duration-300 relative shrink-0 ${cat.enabled ? "bg-emerald-500" : "bg-white/10"}`}
                            >
                                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${cat.enabled ? "left-5.5" : "left-0.5"}`} />
                            </button>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => setEditing(cat)}
                                    className="size-8 flex items-center justify-center rounded-lg hover:bg-(--accent-color)/15 text-[#a19eb7] hover:text-(--accent-color) transition-all"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                                </button>
                                <button
                                    onClick={() => setDeleteConfirm(cat.id)}
                                    className="size-8 flex items-center justify-center rounded-lg hover:bg-red-500/15 text-[#a19eb7] hover:text-red-400 transition-all"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {deleteConfirm && (() => {
                const cat = categories.find(c => c.id === deleteConfirm);
                if (!cat) return null;
                const hasFeatures = cat._count.features > 0;
                return (
                    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4" onClick={() => { setDeleteConfirm(null); setCascadeConfirm(false); }}>
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
                        <div className="relative bg-[#0d0d12]/95 backdrop-blur-2xl border border-white/6 rounded-2xl p-6 max-w-sm w-full shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden animate-fade-in-up" onClick={e => e.stopPropagation()}>
                            {/* ambient glow */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/8 blur-3xl pointer-events-none" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="size-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                    </div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-tight">Kategoriyi Sil</h3>
                                </div>

                                {!cascadeConfirm ? (
                                    <>
                                        {hasFeatures ? (
                                            <p className="text-[12px] text-red-400/80 mb-5 leading-relaxed">Bu kategori içinde <b className="text-red-400">{cat._count.features}</b> adet özellik bulunuyor! &quot;Hepsini Sil&quot; diyerek kategoriyi ve içindeki tüm özellikleri tamamen silebilirsiniz.</p>
                                        ) : (
                                            <p className="text-[12px] text-white/40 mb-5 leading-relaxed">Bu kategoriyi silmek istediğinizden emin misiniz?</p>
                                        )}
                                        <div className="flex gap-3">
                                            <button onClick={() => { setDeleteConfirm(null); setCascadeConfirm(false); }} className="flex-1 h-10 bg-white/3 hover:bg-white/6 text-white/50 font-bold text-[12px] uppercase tracking-wider rounded-xl transition-all border border-white/6">İptal</button>
                                            {hasFeatures ? (
                                                <button onClick={() => setCascadeConfirm(true)} className="flex-1 h-10 bg-red-600 hover:bg-red-500 text-white font-bold text-[12px] uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-red-600/15 active:scale-95">Hepsini Sil</button>
                                            ) : (
                                                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 h-10 bg-red-600 hover:bg-red-500 text-white font-bold text-[12px] uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-red-600/15 active:scale-95">Sil</button>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="bg-red-500/10 border border-red-500/15 rounded-xl p-4 mb-5">
                                            <p className="text-[12px] text-red-400 font-bold mb-1">Bu işlem geri alınamaz!</p>
                                            <p className="text-[11px] text-red-400/70 leading-relaxed">Kategoriyi içindeki <b>{cat._count.features}</b> özellikle beraber kalıcı olarak silmek istediğinize emin misiniz? Tüm özellikler, çeviriler ve PowerShell komutları da silinecektir.</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <button onClick={() => setCascadeConfirm(false)} className="flex-1 h-10 bg-white/3 hover:bg-white/6 text-white/50 font-bold text-[12px] uppercase tracking-wider rounded-xl transition-all border border-white/6">Geri Dön</button>
                                            <button onClick={() => handleDelete(deleteConfirm, true)} className="flex-1 h-10 bg-red-700 hover:bg-red-600 text-white font-bold text-[12px] uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-red-700/15 active:scale-95">Kalıcı Olarak Sil</button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}

function CategoryForm({ category, isCreating, saving, onSave, onCancel }: {
    category: Category | null;
    isCreating: boolean;
    saving: boolean;
    onSave: (data: any) => void;
    onCancel: () => void;
}) {
    const [slug, setSlug] = useState(category?.slug || "");
    const [icon, setIcon] = useState(category?.icon || "");
    const [order, setOrder] = useState(category?.order || 0);
    const [enabled, setEnabled] = useState(category?.enabled !== false);
    const [nameEn, setNameEn] = useState(category?.translations.find(t => t.lang === "en")?.name || "");
    const [nameTr, setNameTr] = useState(category?.translations.find(t => t.lang === "tr")?.name || "");

    const handleSubmit = () => {
        const data: any = {
            slug, icon: icon || null, order, enabled,
            translations: [
                { lang: "en", name: nameEn },
                { lang: "tr", name: nameTr },
            ],
        };
        if (!isCreating) data.id = category!.id;
        onSave(data);
    };

    const inputClass = "w-full h-10 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-[#a19eb7]/50 focus:outline-none focus:border-(--accent-color)/50 transition-colors";
    const labelClass = "block text-xs font-bold text-[#a19eb7] uppercase tracking-wider mb-1.5";

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={onCancel} className="size-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                    <h2 className="text-2xl font-black text-white tracking-tight">{isCreating ? "New Category" : "Edit Category"}</h2>
                </div>
                <button onClick={handleSubmit} disabled={saving || !slug || !nameEn} className="h-10 px-6 bg-(--accent-color) hover:bg-(--accent-hover) disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all flex items-center gap-2">
                    {saving ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : <>{isCreating ? "Create" : "Save"}</>}
                </button>
            </div>

            <div className="bg-[#1a1a24]/80 border border-[#2b2938] rounded-2xl p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Slug</label>
                        <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="e.g. privacy" className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Icon SVG path</label>
                        <input value={icon} onChange={e => setIcon(e.target.value)} placeholder="Optional SVG icon" className={inputClass} />
                    </div>
                    <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer pb-2">
                            <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} className="sr-only peer" />
                            <div className="w-10 h-5 rounded-full bg-white/10 peer-checked:bg-emerald-500 transition-all relative">
                                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${enabled ? "left-5.5" : "left-0.5"}`} />
                            </div>
                            <span className="text-sm text-white font-medium">Enabled</span>
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                        <label className={labelClass}>Name (EN)</label>
                        <input value={nameEn} onChange={e => setNameEn(e.target.value)} placeholder="Category name" className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>İsim (TR)</label>
                        <input value={nameTr} onChange={e => setNameTr(e.target.value)} placeholder="Kategori ismi" className={inputClass} />
                    </div>
                </div>
            </div>
        </div>
    );
}
