"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
    GripVertical,
    FolderPlus,
    ArrowUpDown,
    ChevronRight,
    Pencil,
    ChevronsUpDown,
    ChevronsDownUp,
    Languages,
} from "lucide-react";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";
import { AdminLangPicker } from "@/components/admin/AdminLangPicker";
import { AdminIconPicker } from "@/components/admin/AdminIconPicker";
import { generateScriptMessage } from "@/lib/powershell-safe";
import { useUnsavedChanges } from "@/components/admin/UnsavedChangesContext";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
    order: number;
    enabled: boolean;
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

// ─── Sortable Feature Row ────────────────────────────────────────────
function SortableFeatureRow({ feature, onClick, onToggle, lang }: {
    feature: Feature;
    onClick: () => void;
    onToggle: (e: React.MouseEvent) => void;
    lang: string;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: feature.id });
    const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : undefined, opacity: isDragging ? 0.5 : 1 };
    const title = feature.translations.find(t => t.lang === lang)?.title || feature.translations.find(t => t.lang === "en")?.title || feature.slug;
    const subtitle = lang !== "en" ? (feature.translations.find(t => t.lang === "en")?.title) : (feature.translations.find(t => t.lang === "tr")?.title);

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onClick}
            className={`flex items-center gap-2 px-3 py-2.5 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-grab active:cursor-grabbing group touch-none ${isDragging ? "bg-white/[0.04] shadow-lg rounded-lg" : ""}`}
        >
            <GripVertical size={13} className="shrink-0 text-white/[0.06] group-hover:text-white/15 transition-colors" />
            <span className="w-7 text-center text-[10px] font-mono text-white/15 shrink-0">{feature.order}</span>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-white/80 group-hover:text-white transition-colors truncate">{title}</p>
                {subtitle && <p className="text-[11px] text-white/20 truncate">{subtitle}</p>}
            </div>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg border shrink-0 ${RISK_COLORS[feature.risk] || ""}`}>
                {RISK_LABELS[feature.risk] || feature.risk}
            </span>
            <button
                onClick={onToggle}
                onPointerDown={e => e.stopPropagation()}
                className={`w-9 h-[20px] rounded-full transition-all duration-300 relative shrink-0 ${feature.enabled ? "bg-emerald-500/80" : "bg-white/[0.06]"}`}
            >
                <span className={`absolute top-[3px] w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-all duration-300 ${feature.enabled ? "left-[19px]" : "left-[3px]"}`} />
            </button>
        </div>
    );
}

// ─── Sortable Category Row (for category ordering modal) ─────────────
function SortableCategoryRow({ cat, getTrName }: { cat: Category & { _count?: { features: number } }; getTrName: (c: Category) => string }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id });
    const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : undefined, opacity: isDragging ? 0.5 : 1 };
    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.04] bg-white/[0.01]">
            <button {...attributes} {...listeners} className="shrink-0 p-1 text-white/15 hover:text-white/40 cursor-grab active:cursor-grabbing touch-none">
                <GripVertical size={14} />
            </button>
            <span className="w-6 text-center text-[10px] font-mono text-white/20">{cat.order}</span>
            <span className="flex-1 text-sm font-semibold text-white/70">{getTrName(cat)}</span>
            <span className="text-[10px] text-white/20">{(cat as any)._count?.features || 0} özellik</span>
        </div>
    );
}

export default function AdminFeaturesPage() {
    const router = useRouter();
    const [features, setFeatures] = useState<Feature[]>([]);
    const [categories, setCategories] = useState<(Category & { _count?: { features: number } })[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [filterRisk, setFilterRisk] = useState("");
    const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    // Category management
    const [showCategoryOrder, setShowCategoryOrder] = useState(false);
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [newCatSlug, setNewCatSlug] = useState("");
    const [newCatNames, setNewCatNames] = useState<Record<string, string>>({ en: "", tr: "", de: "", fr: "", es: "", zh: "", hi: "" });
    const [newCatOrder, setNewCatOrder] = useState(0);
    const [savingCategory, setSavingCategory] = useState(false);
    const [translatingCat, setTranslatingCat] = useState(false);
    const [newCatLang, setNewCatLang] = useState("en");
    const [orderedCategories, setOrderedCategories] = useState<(Category & { _count?: { features: number } })[]>([]);

    // M7-M10 states
    const [displayLang, setDisplayLang] = useState("en");
    const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(() => {
        if (typeof window !== "undefined") {
            try {
                const stored = localStorage.getItem("optwin-collapsed-cats");
                if (stored) return new Set(JSON.parse(stored));
            } catch { /* ignore */ }
        }
        return new Set();
    });
    const [originalOrders, setOriginalOrders] = useState<Record<string, { id: string; order: number }[]>>({});
    const [pendingOrders, setPendingOrders] = useState<Record<string, { id: string; order: number }[]>>({});
    const [editingCatName, setEditingCatName] = useState<string | null>(null);
    const [editingCatValue, setEditingCatValue] = useState("");
    const [originalCatValue, setOriginalCatValue] = useState("");
    const catNameRef = useRef<HTMLInputElement>(null);
    const { setHasUnsavedChanges, onSave, onDiscard } = useUnsavedChanges();
    const [catNameDirty, setCatNameDirty] = useState(false);
    const [translateToast, setTranslateToast] = useState("");
    const [deleteCatId, setDeleteCatId] = useState<string | null>(null);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

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

    // Build original orders snapshot when features load
    useEffect(() => {
        if (features.length === 0) return;
        const snapshot: Record<string, { id: string; order: number }[]> = {};
        for (const cat of categories) {
            snapshot[cat.id] = features
                .filter(f => f.categoryId === cat.id)
                .sort((a, b) => a.order - b.order)
                .map(f => ({ id: f.id, order: f.order }));
        }
        setOriginalOrders(snapshot);
        setPendingOrders({});
    }, [features, categories]);

    // DnD: reorder features within a category (local only, no API call)
    const handleFeatureDragEnd = (event: DragEndEvent, catId: string) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const catFeatures = features.filter(f => f.categoryId === catId).sort((a, b) => a.order - b.order);
        const oldIndex = catFeatures.findIndex(f => f.id === active.id);
        const newIndex = catFeatures.findIndex(f => f.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;

        const reordered = arrayMove(catFeatures, oldIndex, newIndex);
        const updates = reordered.map((f, i) => ({ id: f.id, order: i + 1 }));

        // Local update only
        setFeatures(prev => {
            const others = prev.filter(f => f.categoryId !== catId);
            return [...others, ...reordered.map((f, i) => ({ ...f, order: i + 1 }))];
        });
        setPendingOrders(prev => ({ ...prev, [catId]: updates }));
    };

    // Check if any category has pending order changes
    const hasOrderChanges = useMemo(() => {
        for (const catId of Object.keys(pendingOrders)) {
            const orig = originalOrders[catId];
            const pending = pendingOrders[catId];
            if (!orig || !pending) continue;
            if (orig.length !== pending.length) return true;
            for (let i = 0; i < orig.length; i++) {
                if (orig[i].id !== pending[i].id || orig[i].order !== pending[i].order) return true;
            }
        }
        return false;
    }, [originalOrders, pendingOrders]);

    // Wire unsaved changes guard
    useEffect(() => {
        setHasUnsavedChanges(hasOrderChanges);
    }, [hasOrderChanges, setHasUnsavedChanges]);

    // Save all pending order changes
    const saveAllOrders = useCallback(async () => {
        const allUpdates: { id: string; order: number }[] = [];
        for (const items of Object.values(pendingOrders)) {
            allUpdates.push(...items);
        }
        if (allUpdates.length === 0) return;
        await fetch("/api/admin/reorder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "feature", items: allUpdates }),
        });
        // Snapshot current state as new original
        const snapshot: Record<string, { id: string; order: number }[]> = {};
        for (const cat of categories) {
            snapshot[cat.id] = features
                .filter(f => f.categoryId === cat.id)
                .sort((a, b) => a.order - b.order)
                .map(f => ({ id: f.id, order: f.order }));
        }
        setOriginalOrders(snapshot);
        setPendingOrders({});
    }, [pendingOrders, features, categories]);

    // Cancel all pending order changes — restore original orders
    const cancelAllOrders = useCallback(() => {
        setFeatures(prev => {
            const restored = [...prev];
            for (const [catId, items] of Object.entries(originalOrders)) {
                for (const item of items) {
                    const idx = restored.findIndex(f => f.id === item.id);
                    if (idx !== -1) restored[idx] = { ...restored[idx], order: item.order };
                }
            }
            return restored;
        });
        setPendingOrders({});
    }, [originalOrders]);

    // Register save/discard callbacks for unsaved changes modal
    useEffect(() => {
        onSave.current = saveAllOrders;
        onDiscard.current = cancelAllOrders;
    }, [saveAllOrders, cancelAllOrders, onSave, onDiscard]);

    // DnD: reorder categories
    const handleCategoryDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = orderedCategories.findIndex(c => c.id === active.id);
        const newIndex = orderedCategories.findIndex(c => c.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;
        setOrderedCategories(arrayMove(orderedCategories, oldIndex, newIndex));
    };

    const saveCategoryOrder = async () => {
        const updates = orderedCategories.map((c, i) => ({ id: c.id, order: i + 1 }));
        await fetch("/api/admin/reorder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "category", items: updates }),
        });
        setCategories(orderedCategories.map((c, i) => ({ ...c, order: i + 1 })));
        setShowCategoryOrder(false);
    };

    const createCategory = async () => {
        if (!newCatSlug || !newCatNames.en) return;
        setSavingCategory(true);
        try {
            const order = newCatOrder > 0 ? newCatOrder : categories.reduce((max, c) => Math.max(max, c.order), 0) + 1;

            // O8: Shift existing categories if same order exists
            const conflict = categories.some(c => c.order === order);
            if (conflict) {
                const shifted = categories
                    .filter(c => c.order >= order)
                    .map(c => ({ id: c.id, order: c.order + 1 }));
                if (shifted.length > 0) {
                    await fetch("/api/admin/reorder", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ type: "category", items: shifted }),
                    });
                    setCategories(prev => prev.map(c => {
                        const s = shifted.find(x => x.id === c.id);
                        return s ? { ...c, order: s.order } : c;
                    }));
                }
            }

            const translations = Object.entries(newCatNames)
                .filter(([, name]) => name.trim())
                .map(([lang, name]) => ({ lang, name: name.trim() }));
            const res = await fetch("/api/admin/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slug: newCatSlug, order, enabled: true, translations }),
            });
            const data = await res.json();
            if (data.success) {
                setCategories(prev => [...prev, data.category]);
                setShowNewCategory(false);
                setNewCatSlug("");
                setNewCatNames({ en: "", tr: "", de: "", fr: "", es: "", zh: "", hi: "" });
                setNewCatOrder(0);
            }
        } finally {
            setSavingCategory(false);
        }
    };

    // N6: Translate category name from current language to all others
    const translateCatName = async () => {
        const sourceName = newCatNames[newCatLang];
        if (!sourceName?.trim()) return;
        setTranslatingCat(true);
        try {
            const targetLangs = Object.keys(newCatNames).filter(l => l !== newCatLang);
            const res = await fetch("/api/admin/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: sourceName, sourceLang: newCatLang, targetLangs }),
            });
            const data = await res.json();
            if (data.success && data.translations) {
                setNewCatNames(prev => {
                    const updated = { ...prev };
                    Object.entries(data.translations as Record<string, string>).forEach(([lang, translated]) => {
                        updated[lang] = translated;
                    });
                    return updated;
                });
                setTranslateToast("Çeviriler eklendi!");
                setTimeout(() => setTranslateToast(""), 2500);
            }
        } catch { /* ignore */ }
        finally { setTranslatingCat(false); }
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

    const getCatDisplayName = (cat: Category) =>
        cat.translations.find(t => t.lang === displayLang)?.name || cat.translations.find(t => t.lang === "en")?.name || cat.slug;

    // M8: Toggle category collapse — persisted to localStorage
    const toggleCollapse = (catId: string) => {
        setCollapsedCategories(prev => {
            const next = new Set(prev);
            if (next.has(catId)) next.delete(catId); else next.add(catId);
            try { localStorage.setItem("optwin-collapsed-cats", JSON.stringify([...next])); } catch { /* ignore */ }
            return next;
        });
    };

    // N5: Collapse all / Expand all
    const collapseAll = () => {
        const allIds = new Set(categories.map(c => c.id));
        setCollapsedCategories(allIds);
        try { localStorage.setItem("optwin-collapsed-cats", JSON.stringify([...allIds])); } catch { /* ignore */ }
    };
    const expandAll = () => {
        setCollapsedCategories(new Set());
        try { localStorage.setItem("optwin-collapsed-cats", JSON.stringify([])); } catch { /* ignore */ }
    };

    // N3: Save category name inline edit with save/cancel buttons
    const saveCatName = async (catId: string) => {
        if (!editingCatValue.trim()) { setEditingCatName(null); setCatNameDirty(false); return; }
        const cat = categories.find(c => c.id === catId);
        if (!cat) return;
        const existingTr = cat.translations.find(t => t.lang === displayLang);
        const translations = existingTr
            ? cat.translations.map(t => t.lang === displayLang ? { ...t, name: editingCatValue.trim() } : t)
            : [...cat.translations, { lang: displayLang, name: editingCatValue.trim() }];
        await fetch("/api/admin/categories", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: catId, translations: translations.map(t => ({ lang: t.lang, name: t.name })) }),
        });
        setCategories(prev => prev.map(c => c.id === catId ? { ...c, translations } : c));
        setEditingCatName(null);
        setCatNameDirty(false);
    };

    const cancelCatNameEdit = () => {
        setEditingCatName(null);
        setEditingCatValue("");
        setCatNameDirty(false);
    };

    // O6: Delete category
    const deleteCategory = async (catId: string) => {
        await fetch(`/api/admin/categories?id=${catId}`, { method: "DELETE" });
        setCategories(prev => prev.filter(c => c.id !== catId));
        setDeleteCatId(null);
    };

    const startCatNameEdit = (e: React.MouseEvent, catId: string) => {
        e.stopPropagation();
        const cat = categories.find(c => c.id === catId);
        if (!cat) return;
        const name = getCatDisplayName(cat);
        setEditingCatName(catId);
        setEditingCatValue(name);
        setOriginalCatValue(name);
        setCatNameDirty(false);
    };

    // M9: Toggle category enabled/disabled
    const toggleCatEnabled = async (e: React.MouseEvent, cat: Category) => {
        e.stopPropagation();
        const newEnabled = !cat.enabled;
        setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, enabled: newEnabled } : c));
        await fetch("/api/admin/categories", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: cat.id, enabled: newEnabled }),
        });
    };

    // Group features by category
    const groupedFeatures = useMemo(() => {
        const sorted = [...categories].sort((a, b) => a.order - b.order);
        return sorted.map(cat => ({
            category: cat,
            features: filtered.filter(f => f.categoryId === cat.id).sort((a, b) => a.order - b.order),
        })).filter(g => g.features.length > 0 || !search);
    }, [categories, filtered, search]);

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
                            {filtered.length} / {features.length} özellik · {categories.length} kategori
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* O5: Save/Cancel LEFT of collapse/expand */}
                    <AnimatePresence>
                        {(hasOrderChanges || catNameDirty) && (
                            <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="flex items-center gap-1.5">
                                <button onClick={() => { if (catNameDirty) cancelCatNameEdit(); else cancelAllOrders(); }} className="h-8 px-3 bg-white/[0.03] hover:bg-white/[0.06] text-white/40 hover:text-white/70 text-xs font-medium rounded-lg transition-all border border-white/[0.04] flex items-center gap-1.5">
                                    <RotateCcw size={12} /> İptal
                                </button>
                                <button onClick={() => { if (catNameDirty && editingCatName) saveCatName(editingCatName); else saveAllOrders(); }} className="h-8 px-3 bg-[#6b5be6] hover:bg-[#5a4bd4] text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-lg shadow-[#6b5be6]/20">
                                    <Save size={12} /> Kaydet
                                </button>
                                <div className="w-px h-5 bg-white/[0.06] mx-1" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* O4: Collapse/Expand all — with text labels */}
                    <button onClick={expandAll} title="Tümünü Genişlet" className="h-8 px-3 flex items-center gap-1.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] text-white/25 hover:text-white/50 border border-white/[0.04] transition-all text-[10px] font-medium">
                        <ChevronsUpDown size={13} /> Genişlet
                    </button>
                    <button onClick={collapseAll} title="Tümünü Daralt" className="h-8 px-3 flex items-center gap-1.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] text-white/25 hover:text-white/50 border border-white/[0.04] transition-all text-[10px] font-medium">
                        <ChevronsDownUp size={13} /> Daralt
                    </button>

                    <div className="w-px h-5 bg-white/[0.06]" />

                    {/* M9: Language picker */}
                    <AdminLangPicker value={displayLang} onChange={setDisplayLang} />

                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => { setOrderedCategories([...categories].sort((a, b) => a.order - b.order)); setShowCategoryOrder(true); }}
                        className="h-9 px-4 bg-white/[0.03] hover:bg-white/[0.06] text-white/50 hover:text-white/80 font-medium text-sm rounded-xl transition-all flex items-center gap-2 border border-white/[0.04]"
                    >
                        <ArrowUpDown size={14} />
                        Kategorileri Sırala
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setShowNewCategory(true)}
                        className="h-9 px-4 bg-white/[0.03] hover:bg-white/[0.06] text-white/50 hover:text-white/80 font-medium text-sm rounded-xl transition-all flex items-center gap-2 border border-white/[0.04]"
                    >
                        <FolderPlus size={14} />
                        Yeni Kategori
                    </motion.button>
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

            {/* Features grouped by category */}
            <div className="space-y-4">
                {groupedFeatures.map(({ category: cat, features: catFeatures }) => {
                    const isCollapsed = collapsedCategories.has(cat.id);
                    return (
                    <div key={cat.id} className={`rounded-2xl border bg-white/[0.015] overflow-hidden transition-colors ${cat.enabled ? "border-white/[0.04]" : "border-white/[0.02] opacity-60"}`}>
                        {/* Category header — clickable to collapse */}
                        <div
                            className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02] cursor-pointer select-none group"
                            onClick={() => toggleCollapse(cat.id)}
                        >
                            <ChevronRight size={14} className={`text-[#6b5be6]/60 transition-transform duration-200 ${isCollapsed ? "" : "rotate-90"}`} />

                            {/* O3: Editable category name — edit button RIGHT NEXT to name */}
                            {editingCatName === cat.id ? (
                                <input
                                    ref={catNameRef}
                                    autoFocus
                                    value={editingCatValue}
                                    onChange={e => {
                                        setEditingCatValue(e.target.value);
                                        setCatNameDirty(e.target.value.trim() !== originalCatValue);
                                    }}
                                    onKeyDown={e => {
                                        if (e.key === "Enter") saveCatName(cat.id);
                                        if (e.key === "Escape") cancelCatNameEdit();
                                    }}
                                    onClick={e => e.stopPropagation()}
                                    className="text-[11px] font-bold text-white/70 uppercase tracking-wider bg-white/[0.04] border border-[#6b5be6]/30 rounded px-2 py-0.5 focus:outline-none max-w-[200px]"
                                />
                            ) : (
                                <>
                                    <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider group-hover:text-white/70 transition-colors">
                                        {getCatDisplayName(cat)}
                                    </span>
                                    {/* O3: Edit button — immediately after name */}
                                    <button
                                        onClick={(e) => startCatNameEdit(e, cat.id)}
                                        className="size-6 flex items-center justify-center rounded-md text-white/0 group-hover:text-white/25 hover:!text-white/50 hover:!bg-white/[0.04] transition-all shrink-0"
                                        title="Yeniden Adlandır"
                                    >
                                        <Pencil size={11} />
                                    </button>
                                </>
                            )}

                            <span className="flex-1" />
                            <span className="text-[10px] text-white/20 shrink-0">{catFeatures.length} özellik</span>

                            {/* Category enable/disable toggle */}
                            <button
                                onClick={(e) => toggleCatEnabled(e, cat)}
                                className={`w-8 h-[18px] rounded-full transition-all duration-300 relative shrink-0 ${cat.enabled ? "bg-emerald-500/70" : "bg-white/[0.06]"}`}
                            >
                                <span className={`absolute top-[2px] w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-300 ${cat.enabled ? "left-[17px]" : "left-[3px]"}`} />
                            </button>

                            {/* O6: Delete category button */}
                            <button
                                onClick={(e) => { e.stopPropagation(); setDeleteCatId(cat.id); }}
                                className="size-6 flex items-center justify-center rounded-md text-white/0 group-hover:text-white/15 hover:!text-red-400 hover:!bg-red-500/10 transition-all shrink-0"
                                title="Kategoriyi Sil"
                            >
                                <Trash2 size={11} />
                            </button>
                        </div>

                        {/* Collapsible feature rows */}
                        <AnimatePresence initial={false}>
                            {!isCollapsed && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.25, ease: "easeInOut" }}
                                    className="overflow-hidden"
                                >
                                    {catFeatures.length > 0 ? (
                                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleFeatureDragEnd(e, cat.id)}>
                                            <SortableContext items={catFeatures.map(f => f.id)} strategy={verticalListSortingStrategy}>
                                                {catFeatures.map(f => (
                                                    <SortableFeatureRow
                                                        key={f.id}
                                                        feature={f}
                                                        lang={displayLang}
                                                        onClick={() => router.push(`/admin/features/edit/${f.slug}`)}
                                                        onToggle={(e) => toggleEnabled(e, f)}
                                                    />
                                                ))}
                                            </SortableContext>
                                        </DndContext>
                                    ) : (
                                        <div className="text-center py-6 text-white/15 text-xs">Bu kategoride özellik yok</div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    );
                })}

                {groupedFeatures.length === 0 && filtered.length === 0 && (
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

            {/* Category Ordering Modal */}
            <AnimatePresence>
                {showCategoryOrder && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center" onClick={() => setShowCategoryOrder(false)}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 12 }}
                            transition={{ duration: 0.25 }}
                            className="relative bg-[#0f0f18] border border-white/[0.06] rounded-2xl p-5 max-w-md w-full mx-4 shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-white">Kategorileri Sırala</h3>
                                <button onClick={() => setShowCategoryOrder(false)} className="p-1 text-white/30 hover:text-white/60"><X size={16} /></button>
                            </div>
                            <p className="text-xs text-white/30 mb-4">Sürükleyerek kategorilerin sırasını değiştirin. Kaydet&apos;e basana kadar değişiklikler uygulanmaz.</p>

                            <div className="rounded-xl border border-white/[0.04] overflow-hidden mb-4 max-h-[400px] overflow-y-auto admin-scrollbar">
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCategoryDragEnd}>
                                    <SortableContext items={orderedCategories.map(c => c.id)} strategy={verticalListSortingStrategy}>
                                        {orderedCategories.map(cat => (
                                            <SortableCategoryRow key={cat.id} cat={cat} getTrName={getCatDisplayName} />
                                        ))}
                                    </SortableContext>
                                </DndContext>
                            </div>

                            <div className="flex gap-2">
                                <button onClick={() => setShowCategoryOrder(false)} className="flex-1 h-9 rounded-xl text-sm font-medium text-white/40 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] transition-all">
                                    İptal
                                </button>
                                <button onClick={saveCategoryOrder} className="flex-1 h-9 rounded-xl text-sm font-bold text-white bg-[#6b5be6] hover:bg-[#5a4bd4] transition-all shadow-lg shadow-[#6b5be6]/20">
                                    Kaydet
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* N6: New Category Modal — with language list, order, translate */}
            <AnimatePresence>
                {showNewCategory && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center" onClick={() => setShowNewCategory(false)}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 12 }}
                            transition={{ duration: 0.25 }}
                            className="relative bg-[#0f0f18] border border-white/[0.06] rounded-2xl p-5 max-w-xl w-full mx-4 shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-white">Yeni Kategori</h3>
                                <button onClick={() => setShowNewCategory(false)} className="p-1 text-white/30 hover:text-white/60"><X size={16} /></button>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-white/25 uppercase tracking-wider mb-1">Slug (benzersiz ID)</label>
                                    <input
                                        value={newCatSlug}
                                        onChange={e => setNewCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                                        placeholder="computer-optimization"
                                        className="w-full h-9 px-3 bg-white/[0.02] border border-white/[0.04] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#6b5be6]/30 transition-colors"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-white/25 uppercase tracking-wider mb-1">Sıra</label>
                                        <input
                                            type="number"
                                            value={newCatOrder || ""}
                                            onChange={e => setNewCatOrder(parseInt(e.target.value) || 0)}
                                            placeholder={`${categories.length + 1}`}
                                            className="w-full h-9 px-3 bg-white/[0.02] border border-white/[0.04] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#6b5be6]/30 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                        <p className="text-[9px] text-white/15 mt-0.5">Aynı sıra varsa mevcut kategoriler kaydırılır</p>
                                    </div>
                                    <div className="flex items-end pb-6">
                                        <p className="text-[9px] text-white/15">Boş = #{categories.length + 1} (sona)</p>
                                    </div>
                                </div>
                                {/* O7: Language picker + single input + translate */}
                                <div>
                                    <label className="block text-[10px] font-bold text-white/25 uppercase tracking-wider mb-1">Kategori İsmi</label>
                                    <div className="flex items-center gap-2">
                                        <AdminLangPicker value={newCatLang} onChange={setNewCatLang} />
                                        <input
                                            value={newCatNames[newCatLang] || ""}
                                            onChange={e => setNewCatNames(prev => ({ ...prev, [newCatLang]: e.target.value }))}
                                            placeholder={`İsim (${LANG_NAMES[newCatLang] || newCatLang})`}
                                            className="flex-1 h-9 px-3 bg-white/[0.02] border border-white/[0.04] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#6b5be6]/30 transition-colors"
                                        />
                                        <button
                                            onClick={translateCatName}
                                            disabled={translatingCat || !newCatNames[newCatLang]?.trim()}
                                            className="shrink-0 h-9 px-3 rounded-xl text-[10px] font-bold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/15 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
                                        >
                                            {translatingCat ? <Loader2 size={11} className="animate-spin" /> : <Languages size={11} />}
                                            {translatingCat ? "..." : "Çevir"}
                                        </button>
                                    </div>
                                    {/* Show filled languages as small tags */}
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {Object.entries(newCatNames).filter(([, v]) => v.trim()).map(([l, v]) => (
                                            <span key={l} className={`text-[9px] px-1.5 py-0.5 rounded ${l === newCatLang ? "bg-[#6b5be6]/15 text-[#6b5be6]" : "bg-white/[0.03] text-white/25"}`}>
                                                {l.toUpperCase()}: {v.length > 20 ? v.slice(0, 20) + "…" : v}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <button onClick={() => setShowNewCategory(false)} className="flex-1 h-9 rounded-xl text-sm font-medium text-white/40 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] transition-all">
                                    İptal
                                </button>
                                <button
                                    onClick={createCategory}
                                    disabled={!newCatSlug || !newCatNames.en || savingCategory}
                                    className="flex-1 h-9 rounded-xl text-sm font-bold text-white bg-[#6b5be6] hover:bg-[#5a4bd4] disabled:opacity-50 transition-all shadow-lg shadow-[#6b5be6]/20 flex items-center justify-center gap-2"
                                >
                                    {savingCategory ? <Loader2 size={14} className="animate-spin" /> : <FolderPlus size={14} />}
                                    {savingCategory ? "Oluşturuluyor..." : "Oluştur"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* O6: Delete category confirmation modal */}
            <AdminConfirmModal
                open={!!deleteCatId}
                onClose={() => setDeleteCatId(null)}
                onConfirm={() => { if (deleteCatId) deleteCategory(deleteCatId); }}
                title="Kategoriyi Sil"
                description={`"${deleteCatId ? getCatDisplayName(categories.find(c => c.id === deleteCatId)!) : ""}" kategorisini silmek istediğinize emin misiniz?${(features.filter(f => f.categoryId === deleteCatId).length > 0) ? ` Bu kategoriye bağlı ${features.filter(f => f.categoryId === deleteCatId).length} özellik var!` : ""}`}
                confirmText="Evet, Sil"
                cancelText="Hayır"
                variant="danger"
            />

            {/* Translate toast */}
            <AnimatePresence>
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
            </AnimatePresence>
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
