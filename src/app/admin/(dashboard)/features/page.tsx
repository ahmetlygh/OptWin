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
    List,
    Sparkles,
} from "lucide-react";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";
import { AdminLangPicker } from "@/components/admin/AdminLangPicker";
import { AdminIconPicker } from "@/components/admin/AdminIconPicker";
import { AdminActionBar } from "@/components/admin/AdminActionBar";
import { Loader } from "@/components/shared/Loader";
import { generateScriptMessage, toPowerShellSafe } from "@/lib/powershell-safe";
import { useUnsavedChanges } from "@/components/admin/UnsavedChangesContext";
// Redundant import removed to use centralized context modal
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
    const [activeLangs, setActiveLangs] = useState<string[]>(["en"]);
    const [newCatNames, setNewCatNames] = useState<Record<string, string>>({ en: "" });
    const [newCatOrder, setNewCatOrder] = useState(0);
    const [savingCategory, setSavingCategory] = useState(false);
    const [translatingCat, setTranslatingCat] = useState(false);
    const [newCatLang, setNewCatLang] = useState("en");
    const [orderedCategories, setOrderedCategories] = useState<(Category & { _count?: { features: number } })[]>([]);

    // M7-M10 states
    const [displayLang, setDisplayLangRaw] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("optwin-admin-lang") || "en";
        }
        return "en";
    });
    const setDisplayLang = useCallback((lang: string) => {
        setDisplayLangRaw(lang);
        localStorage.setItem("optwin-admin-lang", lang);
    }, []);
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
    const { hasUnsavedChanges, setHasUnsavedChanges, onSave, onDiscard, openModal } = useUnsavedChanges();
    const [catNameDirty, setCatNameDirty] = useState(false);
    const [translateToast, setTranslateToast] = useState("");
    const [deleteCatId, setDeleteCatId] = useState<string | null>(null);
    const [cascadeConfirmCat, setCascadeConfirmCat] = useState(false);
    const [moveCatTarget, setMoveCatTarget] = useState("");
    const [showUnsavedModal, setShowUnsavedModal] = useState(false); // We keep this if needed for internal page logic, but preferably we use openModal
    const [pendingNav, setPendingNav] = useState<(() => void) | null>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const [showMissingModal, setShowMissingModal] = useState(false);
    const [translatingMissing, setTranslatingMissing] = useState(false);
    const [translateMissingProgress, setTranslateMissingProgress] = useState("");

    // ─── Missing translations for SELECTED lang only ─────────────────
    type MissingItem = { type: "feature"; featureId: string; label: string; missingTitle: boolean; missingDesc: boolean; missingScript: boolean }
        | { type: "category"; categoryId: string; label: string };

    const missingForSelectedLang = useMemo((): MissingItem[] => {
        if (displayLang === "en") return [];
        const lang = displayLang;
        const results: MissingItem[] = [];

        // 1) Category names
        for (const cat of categories) {
            const enName = cat.translations.find(t => t.lang === "en")?.name;
            if (!enName) continue;
            const tr = cat.translations.find(t => t.lang === lang);
            if (!tr || !tr.name || tr.name.trim() === "") {
                results.push({ type: "category", categoryId: cat.id, label: enName });
            }
        }

        // 2) Feature translations + scriptMessage
        for (const f of features) {
            const enTr = f.translations.find(t => t.lang === "en");
            if (!enTr || !enTr.title) continue;
            const tr = f.translations.find(t => t.lang === lang);
            const enCmd = f.commands.find(c => c.lang === "en");
            const cmd = f.commands.find(c => c.lang === lang);

            const missingTitle = !tr || !tr.title || tr.title.trim() === "";
            const missingDesc = !!(enTr.desc && enTr.desc.trim() !== "" && (!tr || !tr.desc || tr.desc.trim() === ""));
            const missingScript = !!(enCmd?.scriptMessage && enCmd.scriptMessage.trim() !== "" && (!cmd || !cmd.scriptMessage || cmd.scriptMessage.trim() === ""));

            if (missingTitle || missingDesc || missingScript) {
                results.push({ type: "feature", featureId: f.id, label: enTr.title, missingTitle, missingDesc, missingScript });
            }
        }
        return results;
    }, [features, categories, displayLang]);

    const missingCount = missingForSelectedLang.length;

    const handleTranslateMissing = async () => {
        if (missingCount === 0) return;
        const lang = displayLang;
        setTranslatingMissing(true);
        setTranslateMissingProgress(`${lang.toUpperCase()} çevriliyor...`);
        let done = 0;
        try {
            // Translate categories
            const catItems = missingForSelectedLang.filter((m): m is MissingItem & { type: "category" } => m.type === "category");
            for (const item of catItems) {
                try {
                    const res = await fetch("/api/admin/translate", {
                        method: "POST", headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ text: item.label, sourceLang: "en", targetLangs: [lang] }),
                    });
                    const data = await res.json();
                    if (data.success && data.translations?.[lang]) {
                        await fetch("/api/admin/categories", {
                            method: "PUT", headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id: item.categoryId, translations: [{ lang, name: data.translations[lang] }] }),
                        });
                        done++;
                    }
                } catch { /* skip */ }
                setTranslateMissingProgress(`Kategoriler: ${done}/${catItems.length}`);
            }

            // Translate features
            const featItems = missingForSelectedLang.filter((m): m is MissingItem & { type: "feature" } => m.type === "feature");
            for (let i = 0; i < featItems.length; i++) {
                const item = featItems[i];
                const feature = features.find(f => f.id === item.featureId);
                if (!feature) continue;
                const enTr = feature.translations.find(t => t.lang === "en");
                const enCmd = feature.commands.find(c => c.lang === "en");
                if (!enTr) continue;
                try {
                    // Translate title & desc
                    const pairs: { text: string; field: string }[] = [];
                    if (item.missingTitle && enTr.title) pairs.push({ text: enTr.title, field: "title" });
                    if (item.missingDesc && enTr.desc) pairs.push({ text: enTr.desc, field: "desc" });
                    for (const p of pairs) {
                        const res = await fetch("/api/admin/translate", {
                            method: "POST", headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ text: p.text, sourceLang: "en", targetLangs: [lang] }),
                        });
                        const data = await res.json();
                        if (data.success && data.translations?.[lang]) {
                            await fetch("/api/admin/features", {
                                method: "PUT", headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ id: item.featureId, translations: [{ lang, [p.field]: data.translations[lang] }] }),
                            });
                        }
                    }
                    // Translate scriptMessage
                    if (item.missingScript && enCmd?.scriptMessage) {
                        const res = await fetch("/api/admin/translate", {
                            method: "POST", headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ text: enCmd.scriptMessage, sourceLang: "en", targetLangs: [lang] }),
                        });
                        const data = await res.json();
                        if (data.success && data.translations?.[lang]) {
                            await fetch("/api/admin/features", {
                                method: "PUT", headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ id: item.featureId, commands: [{ lang, scriptMessage: data.translations[lang] }] }),
                            });
                        }
                    }
                    done++;
                } catch { /* skip */ }
                setTranslateMissingProgress(`Özellikler: ${i + 1}/${featItems.length}`);
            }
            setTranslateMissingProgress(`${done} öğe çevrildi ✓`);
            await fetchFeatures();
            await fetchCategories();
        } catch {
            setTranslateMissingProgress("Çeviri başarısız");
        } finally {
            setTimeout(() => { setTranslatingMissing(false); setTranslateMissingProgress(""); }, 1500);
        }
    };

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

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
        Promise.all([
            fetchFeatures(),
            fetchCategories(),
            fetch("/api/admin/languages").then(r => r.json()).then(data => {
                if (Array.isArray(data)) {
                    const active = data.filter((l: any) => l.isActive).map((l: any) => l.code);
                    if (active.length > 0) {
                        setActiveLangs(active);
                        setNewCatNames(Object.fromEntries(active.map((c: string) => [c, ""])));
                    }
                }
            }),
        ]).then(() => setLoading(false));
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

    // Keyboard shortcuts: Ctrl+F focuses search, Ctrl+S saves
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                searchRef.current?.focus();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (hasOrderChanges || catNameDirty) {
                    if (catNameDirty && editingCatName) saveCatNameInternal(editingCatName);
                    else saveAllOrders();
                }
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [hasOrderChanges, catNameDirty, editingCatName, saveAllOrders]);

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
                setNewCatNames(Object.fromEntries(activeLangs.map(c => [c, ""])));
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
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }} className="w-full bg-white/[0.02] backdrop-blur-md border border-white/[0.05] rounded-2xl p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#6b5be6]/10 border border-[#6b5be6]/20 flex items-center justify-center">
                        <Puzzle size={18} className="text-[#6b5be6]" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-white uppercase tracking-tight leading-tight">Özellikler</h1>
                        <p className="text-[10px] text-white/25 font-bold uppercase tracking-[0.15em] mt-0.5">
                            {features.filter(f => f.enabled && categories.find(c => c.id === f.categoryId)?.enabled).length} / {features.length} aktif özellik
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <AdminActionBar
                        show={hasOrderChanges || catNameDirty}
                        saving={saving}
                        saved={saved}
                        onSave={() => { if (catNameDirty && editingCatName) saveCatNameInternal(editingCatName); else saveAllOrders(); }}
                        onCancel={() => { if (catNameDirty) cancelCatNameEdit(); else cancelAllOrders(); }}
                        saveText={catNameDirty ? "İsim Kaydet" : "Sıralamayı Kaydet"}
                    />
                    <AdminLangPicker value={displayLang} onChange={setDisplayLang} />
                    <motion.button onClick={() => { setOrderedCategories([...categories].sort((a, b) => a.order - b.order)); setShowCategoryOrder(true); }} className="h-9 px-4 bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white/80 font-bold text-[11px] uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 border border-white/[0.06]"><ArrowUpDown size={14} /> Kategorileri Sırala</motion.button>
                    <motion.button onClick={() => setShowNewCategory(true)} className="h-9 px-4 bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white/80 font-bold text-[11px] uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 border border-white/[0.06]"><FolderPlus size={14} /> Yeni Kategori</motion.button>
                    <AnimatePresence>
                        {displayLang !== "en" && missingCount > 0 && (
                            <motion.button
                                key="missing-btn"
                                initial={{ opacity: 0, scale: 0.9, width: 0 }}
                                animate={{ opacity: 1, scale: 1, width: "auto" }}
                                exit={{ opacity: 0, scale: 0.9, width: 0 }}
                                transition={{ duration: 0.25 }}
                                onClick={() => setShowMissingModal(true)}
                                className="h-9 px-3 flex items-center gap-2 rounded-xl text-[11px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/15 transition-colors overflow-hidden"
                            >
                                <Languages size={14} />
                                <span className="whitespace-nowrap">{displayLang.toUpperCase()} Eksikler</span>
                                <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500/20 text-[9px] font-black text-amber-300">{missingCount}</span>
                            </motion.button>
                        )}
                    </AnimatePresence>
                    <motion.button onClick={() => router.push("/admin/features/new")} className="h-9 px-5 bg-[#6b5be6] hover:bg-[#5a4bd4] text-white font-bold text-[11px] uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-lg shadow-[#6b5be6]/20"><Plus size={15} /> Yeni Özellik</motion.button>
                </div>
            </motion.div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2 p-4 rounded-2xl bg-white/[0.02] backdrop-blur-md border border-white/[0.05] shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/15" />
                    <input ref={searchRef} type="text" placeholder="Özellik ara..." value={search} onChange={e => setSearch(e.target.value)} className="w-full h-9 pl-9 pr-4 bg-white/[0.02] border border-white/[0.04] rounded-xl text-white text-sm focus:outline-none focus:border-[#6b5be6]/30 transition-colors" />
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
                {/* Category Reorder Modal - Premium Revamp */}
                {showCategoryOrder && (
                    <div key="reorder-modal" className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setShowCategoryOrder(false)}>
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            className="absolute inset-0 bg-black/70 backdrop-blur-md" 
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.92, y: 20 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.92, y: 20 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="relative bg-[#0d0d12]/95 backdrop-blur-2xl border border-white/[0.06] rounded-2xl p-6 w-full max-w-md shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* ambient glow */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-[#6b5be6]/8 blur-3xl pointer-events-none" />

                            <div className="relative z-10 flex items-start justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-[#6b5be6]/10 border border-[#6b5be6]/20 flex items-center justify-center">
                                        <List size={18} className="text-[#6b5be6]" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-white uppercase tracking-tight">Kategorileri Sırala</h3>
                                        <p className="text-[10px] text-white/25 font-bold uppercase tracking-[0.15em] mt-0.5">Sürükle ve bırak</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowCategoryOrder(false)} className="size-8 flex items-center justify-center rounded-lg hover:bg-white/[0.05] text-white/20 hover:text-white/60 transition-colors">
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="relative z-10 max-h-[40vh] overflow-y-auto pr-2 admin-scrollbar mb-5">
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCategoryDragEnd}>
                                    <SortableContext items={orderedCategories.map(c => c.id)} strategy={verticalListSortingStrategy}>
                                        <div className="space-y-1">
                                            {orderedCategories.map(cat => <SortableCategoryRow key={cat.id} cat={cat} getTrName={getCatDisplayName} />)}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            </div>
                            
                            <div className="relative z-10 flex gap-3">
                                <button onClick={() => setShowCategoryOrder(false)} className="flex-1 h-10 bg-white/[0.03] hover:bg-white/[0.06] text-white/50 font-bold text-[12px] uppercase tracking-wider rounded-xl transition-all border border-white/[0.06]">İptal</button>
                                <button onClick={saveCategoryOrder} className="flex-1 h-10 bg-[#6b5be6] hover:bg-[#5a4bd4] text-white font-bold text-[12px] uppercase tracking-wider rounded-xl shadow-lg shadow-[#6b5be6]/15 transition-all active:scale-95">Kaydet ve Uygula</button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* New Category Modal - Premium Revamp */}
                {showNewCategory && (
                    <div key="new-category-modal" className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setShowNewCategory(false)}>
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            className="absolute inset-0 bg-black/70 backdrop-blur-md" 
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.92, y: 20 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.92, y: 20 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="relative bg-[#0d0d12]/95 backdrop-blur-2xl border border-white/[0.06] rounded-2xl p-6 w-full max-w-md shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* ambient glow */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-[#6b5be6]/8 blur-3xl pointer-events-none" />

                            {/* Header */}
                            <div className="relative z-10 flex items-start justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-[#6b5be6]/10 border border-[#6b5be6]/20 flex items-center justify-center">
                                        <Plus size={18} className="text-[#6b5be6]" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-white uppercase tracking-tight">Yeni Kategori</h3>
                                        <p className="text-[10px] text-white/25 font-bold uppercase tracking-[0.15em] mt-0.5">Optimizasyon gruplama</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowNewCategory(false)} className="size-8 flex items-center justify-center rounded-lg hover:bg-white/[0.05] text-white/20 hover:text-white/60 transition-colors">
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="relative z-10 space-y-4">
                                {/* Slug Input */}
                                <div>
                                    <label className="block text-[10px] font-bold text-white/25 uppercase tracking-wider mb-1.5 ml-1">Kategori ID (Slug)</label>
                                    <input 
                                        value={newCatSlug} 
                                        onChange={e => setNewCatSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))} 
                                        placeholder="örn: system-cleanup" 
                                        className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-[13px] text-white placeholder-white/15 focus:outline-none focus:border-[#6b5be6]/50 focus:bg-white/[0.04] transition-all" 
                                    />
                                </div>

                                {/* Multi-lang Name Input */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-[10px] font-bold text-white/25 uppercase tracking-wider ml-1">Kategori Adı</label>
                                        <AdminLangPicker 
                                            value={newCatLang} 
                                            onChange={setNewCatLang} 
                                        />
                                    </div>
                                    <div className="relative group">
                                        <input 
                                            value={newCatNames[newCatLang as keyof typeof newCatNames] || ""} 
                                            onChange={e => setNewCatNames(prev => ({ ...prev, [newCatLang]: e.target.value }))} 
                                            placeholder={`${newCatLang.toUpperCase()} dilli ismi...`} 
                                            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 pr-24 text-[13px] text-white focus:outline-none focus:border-[#6b5be6]/50 focus:bg-white/[0.04] transition-all" 
                                        />
                                        {newCatNames.en && (
                                            <button 
                                                onClick={translateCatName} 
                                                className="absolute right-2 top-1.5 h-7 px-3 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5"
                                            >
                                                <Languages size={11} />
                                                Tümüne Çevir
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="relative z-10 flex gap-3 mt-6">
                                <button 
                                    onClick={() => setShowNewCategory(false)} 
                                    className="flex-1 h-10 bg-white/[0.03] hover:bg-white/[0.06] text-white/50 font-bold text-[12px] uppercase tracking-wider rounded-xl transition-all border border-white/[0.06]"
                                >
                                    İptal
                                </button>
                                <button 
                                    onClick={createCategory} 
                                    disabled={!newCatSlug || !newCatNames.en}
                                    className="flex-1 h-10 bg-[#6b5be6] hover:bg-[#5a4bd4] text-white font-bold text-[12px] uppercase tracking-wider rounded-xl shadow-lg shadow-[#6b5be6]/15 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Kategori Oluştur
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Confirm Deletion */}
                {deleteCatId && (
                    <AdminConfirmModal 
                        open={true} 
                        onClose={() => setDeleteCatId(null)} 
                        onConfirm={() => deleteCategory(deleteCatId)} 
                        title="Kategoriyi Sil" 
                        description="Bu kategoriyi ve içindeki tüm özellikleri silmek istediğinize emin misiniz? Bu işlem geri alınamaz." 
                        confirmText="Kategoriyi Sil" 
                        variant="danger" 
                    />
                )}
            </AnimatePresence>

            {/* Missing Translations Modal for selected language */}
            <AnimatePresence>
                {showMissingModal && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => !translatingMissing && setShowMissingModal(false)}>
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="relative bg-[#0d0d12]/95 backdrop-blur-2xl border border-white/[0.06] rounded-2xl p-6 max-w-xl w-full shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/8 blur-3xl pointer-events-none" />
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                            <Languages size={18} className="text-amber-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black text-white uppercase tracking-tight">{displayLang.toUpperCase()} — Eksik Çeviriler</h3>
                                            <p className="text-[10px] text-white/30 mt-0.5">
                                                {missingForSelectedLang.filter(m => m.type === "category").length} kategori, {missingForSelectedLang.filter(m => m.type === "feature").length} özellik eksik
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => !translatingMissing && setShowMissingModal(false)} className="size-8 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] flex items-center justify-center transition-colors">
                                        <X size={14} className="text-white/40" />
                                    </button>
                                </div>

                                {translateMissingProgress && (
                                    <div className="mb-4 px-3 py-2 rounded-xl bg-[#6b5be6]/10 border border-[#6b5be6]/20 text-[11px] text-[#6b5be6] font-bold flex items-center gap-2">
                                        <Loader2 size={12} className="animate-spin" />
                                        {translateMissingProgress}
                                    </div>
                                )}

                                <div className="space-y-1.5 max-h-[50vh] overflow-y-auto admin-scrollbar pr-1">
                                    {missingForSelectedLang.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                            <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${item.type === "category" ? "bg-purple-500/10 text-purple-400 border border-purple-500/15" : "bg-blue-500/10 text-blue-400 border border-blue-500/15"}`}>
                                                {item.type === "category" ? "KAT" : "ÖZL"}
                                            </span>
                                            <span className="text-[11px] text-white/50 truncate flex-1">{item.label}</span>
                                            {item.type === "feature" && (
                                                <span className="text-[9px] text-amber-400/60 whitespace-nowrap">
                                                    {item.missingTitle ? "[başlık]" : ""}{item.missingDesc ? "[açıklama]" : ""}{item.missingScript ? "[script]" : ""}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                    {missingCount === 0 && (
                                        <div className="text-center py-8">
                                            <Check size={24} className="mx-auto text-emerald-400 mb-2" />
                                            <p className="text-[12px] text-emerald-400 font-bold">Tüm çeviriler tamamlanmış!</p>
                                        </div>
                                    )}
                                </div>

                                {missingCount > 0 && (
                                    <div className="mt-4 pt-4 border-t border-white/[0.04]">
                                        <button
                                            onClick={handleTranslateMissing}
                                            disabled={translatingMissing}
                                            className="w-full h-10 flex items-center justify-center gap-2 rounded-xl text-[11px] font-bold bg-[#6b5be6] hover:bg-[#5a4bd4] text-white transition-all shadow-lg shadow-[#6b5be6]/15 active:scale-[0.98] disabled:opacity-30"
                                        >
                                            <Sparkles size={13} />
                                            Tümünü Otomatik Çevir ({missingCount} öğe)
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
