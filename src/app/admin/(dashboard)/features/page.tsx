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
import { AdminActionBar } from "@/components/admin/AdminActionBar";
import { Loader } from "@/components/shared/Loader";
import { generateScriptMessage, toPowerShellSafe } from "@/lib/powershell-safe";
import { useUnsavedChanges } from "@/components/admin/UnsavedChangesContext";
import { UnsavedChangesModal } from "@/components/admin/UnsavedChangesModal";
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
            {!feature.noRisk && (
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg border shrink-0 ${RISK_COLORS[feature.risk] || ""}`}>
                    {RISK_LABELS[feature.risk] || feature.risk}
                </span>
            )}
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
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [search, setSearch] = useState("");

    const [filterCategory, setFilterCategory] = useState("");
    const [filterRisk, setFilterRisk] = useState("");
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
    const [cascadeConfirmCat, setCascadeConfirmCat] = useState(false);
    const [moveCatTarget, setMoveCatTarget] = useState("");

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

    const isLocalDrag = useRef(false);
    useEffect(() => {
        if (features.length === 0) return;
        if (isLocalDrag.current) { isLocalDrag.current = false; return; }
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

    const handleFeatureDragEnd = (event: DragEndEvent, catId: string) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const catFeatures = features.filter(f => f.categoryId === catId).sort((a, b) => a.order - b.order);
        const oldIndex = catFeatures.findIndex(f => f.id === active.id);
        const newIndex = catFeatures.findIndex(f => f.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;

        const reordered = arrayMove(catFeatures, oldIndex, newIndex);
        const updates = reordered.map((f, i) => ({ id: f.id, order: i + 1 }));

        isLocalDrag.current = true;
        setFeatures(prev => {
            const others = prev.filter(f => f.categoryId !== catId);
            return [...others, ...reordered.map((f, i) => ({ ...f, order: i + 1 }))];
        });
        setPendingOrders(prev => ({ ...prev, [catId]: updates }));
    };

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

    useEffect(() => {
        setHasUnsavedChanges(hasOrderChanges || catNameDirty);
    }, [hasOrderChanges, catNameDirty, setHasUnsavedChanges]);

    const saveAllOrders = useCallback(async () => {
        setSaving(true);
        try {
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
            const snapshot: Record<string, { id: string; order: number }[]> = {};
            for (const cat of categories) {
                snapshot[cat.id] = features
                    .filter(f => f.categoryId === cat.id)
                    .sort((a, b) => a.order - b.order)
                    .map(f => ({ id: f.id, order: f.order }));
            }
            setOriginalOrders(snapshot);
            setPendingOrders({});
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } finally {
            setSaving(false);
        }
    }, [pendingOrders, features, categories]);

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

    const saveCatNameInternal = async (catId: string) => {
        setSaving(true);
        try {
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
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } finally {
            setSaving(false);
        }
    };

    const cancelCatNameEdit = useCallback(() => {
        setEditingCatName(null);
        setEditingCatValue("");
        setCatNameDirty(false);
    }, []);

    useEffect(() => {
        onSave.current = async () => {
            if (hasOrderChanges) await saveAllOrders();
            if (catNameDirty && editingCatName) { await saveCatNameInternal(editingCatName); }
        };
        onDiscard.current = () => {
            if (hasOrderChanges) cancelAllOrders();
            if (catNameDirty) cancelCatNameEdit();
        };
    }, [saveAllOrders, cancelAllOrders, onSave, onDiscard, hasOrderChanges, catNameDirty, editingCatName, cancelCatNameEdit]);

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

    const getCatDisplayName = (cat: Category) =>
        cat.translations.find(t => t.lang === displayLang)?.name || cat.translations.find(t => t.lang === "en")?.name || cat.slug;

    const toggleCollapse = (catId: string) => {
        setCollapsedCategories(prev => {
            const next = new Set(prev);
            if (next.has(catId)) next.delete(catId); else next.add(catId);
            try { localStorage.setItem("optwin-collapsed-cats", JSON.stringify([...next])); } catch { /* ignore */ }
            return next;
        });
    };

    const collapseAll = () => {
        const allIds = new Set(categories.map(c => c.id));
        setCollapsedCategories(allIds);
        try { localStorage.setItem("optwin-collapsed-cats", JSON.stringify([...allIds])); } catch { /* ignore */ }
    };
    const expandAll = () => {
        setCollapsedCategories(new Set());
        try { localStorage.setItem("optwin-collapsed-cats", JSON.stringify([])); } catch { /* ignore */ }
    };

    const deleteCategory = async (catId: string, force = false) => {
        const res = await fetch(`/api/admin/categories?id=${catId}${force ? '&force=true' : ''}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) {
            setCategories(prev => prev.filter(c => c.id !== catId));
            setFeatures(prev => prev.filter(f => f.categoryId !== catId));
            setDeleteCatId(null);
            setCascadeConfirmCat(false);
        } else {
            alert(data.error || "Kategori silinemedi.");
        }
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

    const groupedFeatures = useMemo(() => {
        const sorted = [...categories].sort((a, b) => a.order - b.order);
        return sorted.map(cat => ({
            category: cat,
            features: filtered.filter(f => f.categoryId === cat.id).sort((a, b) => a.order - b.order),
        })).filter(g => g.features.length > 0 || !search);
    }, [categories, filtered, search]);

    if (loading) return <div className="flex items-center justify-center p-20"><Loader /></div>;

    const categoryOptions = [{ value: "", label: "Tüm Kategoriler" }, ...categories.map(c => ({ value: c.id, label: c.translations.find(t => t.lang === "en")?.name || c.slug }))];
    const riskOptions = [{ value: "", label: "Tüm Risk Seviyeleri" }, { value: "low", label: "Düşük" }, { value: "medium", label: "Orta" }, { value: "high", label: "Yüksek" }];

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#6b5be6]/10 flex items-center justify-center">
                        <Puzzle size={18} className="text-[#6b5be6]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight">Özellikler</h1>
                        <p className="text-xs text-white/30 mt-0.5">
                            {features.filter(f => f.enabled && categories.find(c => c.id === f.categoryId)?.enabled).length} / {features.length} aktif özellik
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <AdminActionBar
                        show={hasOrderChanges || catNameDirty}
                        saving={saving}
                        saved={saved}
                        onSave={() => { if (catNameDirty && editingCatName) saveCatNameInternal(editingCatName); else saveAllOrders(); }}
                        onCancel={() => { if (catNameDirty) cancelCatNameEdit(); else cancelAllOrders(); }}
                        saveText={catNameDirty ? "İsim Kaydet" : "Sıralamayı Kaydet"}
                    />
                    <AdminLangPicker value={displayLang} onChange={setDisplayLang} />
                    <motion.button onClick={() => { setOrderedCategories([...categories].sort((a, b) => a.order - b.order)); setShowCategoryOrder(true); }} className="h-9 px-4 bg-white/[0.03] hover:bg-white/[0.06] text-white/50 hover:text-white/80 font-medium text-sm rounded-xl transition-all flex items-center gap-2 border border-white/[0.04]"><ArrowUpDown size={14} /> Kategorileri Sırala</motion.button>
                    <motion.button onClick={() => setShowNewCategory(true)} className="h-9 px-4 bg-white/[0.03] hover:bg-white/[0.06] text-white/50 hover:text-white/80 font-medium text-sm rounded-xl transition-all flex items-center gap-2 border border-white/[0.04]"><FolderPlus size={14} /> Yeni Kategori</motion.button>
                    <motion.button onClick={() => router.push("/admin/features/new")} className="h-9 px-5 bg-[#6b5be6] hover:bg-[#5a4bd4] text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-[#6b5be6]/20"><Plus size={15} /> Yeni Özellik</motion.button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/15" />
                    <input type="text" placeholder="Özellik ara..." value={search} onChange={e => setSearch(e.target.value)} className="w-full h-9 pl-9 pr-4 bg-white/[0.02] border border-white/[0.04] rounded-xl text-white text-sm focus:outline-none focus:border-[#6b5be6]/30 transition-colors" />
                </div>
                <AdminSelect options={categoryOptions} value={filterCategory} onChange={setFilterCategory} placeholder="Tüm Kategoriler" className="w-[200px]" />
                <AdminSelect options={riskOptions} value={filterRisk} onChange={setFilterRisk} placeholder="Tüm Risk" className="w-[150px]" />
            </div>

            {/* Content */}
            <div className="space-y-4">
                {groupedFeatures.map(({ category: cat, features: catFeatures }) => {
                    const isCollapsed = collapsedCategories.has(cat.id);
                    return (
                        <div key={cat.id} className={`rounded-2xl border bg-white/[0.015] overflow-hidden transition-colors ${cat.enabled ? "border-white/[0.04]" : "border-white/[0.02] opacity-60"}`}>
                            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02] cursor-pointer group" onClick={() => toggleCollapse(cat.id)}>
                                <ChevronRight size={14} className={`text-[#6b5be6]/60 transition-transform ${isCollapsed ? "" : "rotate-90"}`} />
                                {editingCatName === cat.id ? (
                                    <input autoFocus value={editingCatValue} onChange={e => { setEditingCatValue(e.target.value); setCatNameDirty(e.target.value.trim() !== originalCatValue); }} onKeyDown={e => { if (e.key === "Enter") saveCatNameInternal(cat.id); if (e.key === "Escape") cancelCatNameEdit(); }} onClick={e => e.stopPropagation()} className="text-[11px] font-bold text-white/70 bg-white/[0.04] border border-[#6b5be6]/30 rounded px-2" />
                                ) : (
                                    <><span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">{getCatDisplayName(cat)}</span><button onClick={(e) => startCatNameEdit(e, cat.id)} className="size-6 flex items-center justify-center rounded-md text-white/0 group-hover:text-white/25 hover:!text-white/50 transition-all"><Pencil size={11} /></button></>
                                )}
                                <span className="flex-1" /><span className="text-[10px] text-white/20">{catFeatures.length} özellik</span>
                                <button onClick={(e) => toggleCatEnabled(e, cat)} className={`w-8 h-[18px] rounded-full relative transition-colors ${cat.enabled ? "bg-emerald-500/70" : "bg-white/[0.06]"}`}><span className={`absolute top-[2px] w-3 h-3 rounded-full bg-white transition-all ${cat.enabled ? "left-[17px]" : "left-[3px]"}`} /></button>
                                <button onClick={(e) => { e.stopPropagation(); setDeleteCatId(cat.id); }} className="size-6 flex items-center justify-center text-white/15 hover:text-red-400 transition-colors"><Trash2 size={11} /></button>
                            </div>
                            <AnimatePresence>{!isCollapsed && (
                                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleFeatureDragEnd(e, cat.id)}>
                                        <SortableContext items={catFeatures.map(f => f.id)} strategy={verticalListSortingStrategy}>
                                            {catFeatures.map(f => (
                                                <SortableFeatureRow key={f.id} feature={f} lang={displayLang} onClick={() => router.push(`/admin/features/edit/${f.slug}`)} onToggle={(e) => toggleEnabled(e, f)} />
                                            ))}
                                        </SortableContext>
                                    </DndContext>
                                </motion.div>
                            )}</AnimatePresence>
                        </div>
                    );
                })}
            </div>

            {/* Modals */}
            <AdminConfirmModal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)} title="Sil" description="Emin misiniz?" />
            <AnimatePresence>
                {showCategoryOrder && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center"><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowCategoryOrder(false)} />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-[#0f0f18] border border-white/[0.06] rounded-2xl p-6 w-full max-w-md">
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCategoryDragEnd}><SortableContext items={orderedCategories.map(c => c.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-1 mb-6">{orderedCategories.map(cat => <SortableCategoryRow key={cat.id} cat={cat} getTrName={getCatDisplayName} />)}</div>
                        </SortableContext></DndContext>
                        <div className="flex gap-2"><button onClick={() => setShowCategoryOrder(false)} className="flex-1 h-9 bg-white/[0.03] rounded-xl text-white/40 text-sm">İptal</button><button onClick={saveCategoryOrder} className="flex-1 h-9 bg-[#6b5be6] rounded-xl text-white font-bold text-sm">Kaydet</button></div>
                    </motion.div></div>
                )}
                {showNewCategory && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center"><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowNewCategory(false)} />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-[#0f0f18] border border-white/[0.06] rounded-2xl p-6 w-full max-w-md space-y-4">
                        <input value={newCatSlug} onChange={e => setNewCatSlug(e.target.value)} placeholder="Slug" className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-white" />
                        <div className="flex gap-2"><input value={newCatNames.en} onChange={e => setNewCatNames(prev => ({ ...prev, en: e.target.value }))} placeholder="English Name" className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-white" /><button onClick={translateCatName} className="bg-emerald-500/10 text-emerald-400 px-4 rounded-xl text-xs font-bold">Çevir</button></div>
                        <div className="flex gap-2"><button onClick={() => setShowNewCategory(false)} className="flex-1 h-10 bg-white/[0.03] rounded-xl text-white/40">İptal</button><button onClick={createCategory} className="flex-1 h-10 bg-[#6b5be6] rounded-xl text-white font-bold">Oluştur</button></div>
                    </motion.div></div>
                )}
            </AnimatePresence>
            {deleteCatId && (
                <AdminConfirmModal open={true} onClose={() => setDeleteCatId(null)} onConfirm={() => deleteCategory(deleteCatId)} title="Kategoriyi Sil" description="Bu kategoriyi ve içindeki tüm özellikleri silmek istediğinize emin misiniz?" confirmText="Sil" variant="danger" />
            )}
        </motion.div>
    );
}
