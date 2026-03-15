"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileCode2,
    Save,
    RotateCcw,
    Plus,
    Trash2,
    Check,
    Loader2,
    AlertCircle,
    Download,
    MonitorPlay,
    Pencil,
    Code2,
    List,
    Github,
    ChevronUp,
    ChevronDown,
    X,
} from "lucide-react";
import { AdminLangPicker } from "@/components/admin/AdminLangPicker";
import { UnsavedChangesModal } from "@/components/admin/UnsavedChangesModal";
import { useUnsavedChanges } from "@/components/admin/UnsavedChangesContext";

type LabelsMap = Record<string, Record<string, string>>;
type PreviewLine = { text: string; key: string | null; editable: boolean };

const LABEL_DESCRIPTIONS: Record<string, string> = {
    scriptTitle: "Script başlığı (header yorumunda görünür)",
    version: "Versiyon alanı etiketi",
    date: "Tarih alanı etiketi",
    developer: "Geliştirici alanı etiketi",
    website: "Website alanı etiketi",
    githubUrl: "Script başlığında kullanılan GitHub URL'i",
    openSource: "Açık kaynak bildirimi (header yorumu)",
    bannerTitle: "ASCII banner bölümünde gösterilen başlık",
    openSourceShort: "Kısa açık kaynak etiketi (banner)",
    adminRequest: "Yönetici izni istenirken gösterilen mesaj",
    adminPrompt: "UAC izin talimatı mesajı",
    adminError: "Yetki yükseltme başarısız olduğundaki hata mesajı",
    adminHint: "Manuel script çalıştırma ipucu",
    pressAnyKey: "Çıkış için tuşa bas mesajı",
    restorePoint: "Geri yükleme noktası oluşturma mesajı",
    restoreSuccess: "Geri yükleme noktası başarılı mesajı",
    restoreFail: "Geri yükleme noktası başarısız mesajı",
    complete: "Optimizasyon tamamlandı başlığı",
    success: "Yeniden başlatma önerisi mesajı",
    thankYou: "Teşekkür mesajı",
    author: "Yazar atıf metni",
    done: "Her özellik tamamlandığında gösterilen metin",
    developerName: "Script başlığında kullanılan geliştirici adı",
    websiteUrl: "Script başlığında kullanılan website URL'i",
};

const getLineClass = (text: string) => {
    if (!text) return "text-white/20";
    if (text.startsWith("#")) return "text-emerald-400/60";
    if (text.includes("Write-Host")) return "text-purple-300";
    if (text.startsWith("$")) return "text-cyan-300/70";
    return "text-white/40";
};

export default function ScriptDefaultsPage() {
    const [labels, setLabels] = useState<LabelsMap>({});
    const [originalLabels, setOriginalLabels] = useState<LabelsMap>({});
    const [languages, setLanguages] = useState<string[]>([]);
    const [activeLang, setActiveLang] = useState("en");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");
    const [newKey, setNewKey] = useState("");
    const [newValue, setNewValue] = useState("");
    const [showNewRow, setShowNewRow] = useState(false);
    const [editMode, setEditMode] = useState<"off" | "line" | "full">("off");
    const [editingLineKey, setEditingLineKey] = useState<string | null>(null);
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);
    const [pendingNav, setPendingNav] = useState<(() => void) | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [keyOrder, setKeyOrder] = useState<Record<string, number>>({});
    const newKeyRef = useRef<HTMLInputElement>(null);
    const unsavedCtx = useUnsavedChanges();

    // Build initial order from LABEL_DESCRIPTIONS positions
    const buildKeyOrder = useCallback((labelsData: Record<string, string>) => {
        const descKeys = Object.keys(LABEL_DESCRIPTIONS);
        const allKeys = Object.keys(labelsData);
        const order: Record<string, number> = {};
        // Known keys get their LABEL_DESCRIPTIONS index
        allKeys.forEach(k => {
            const descIdx = descKeys.indexOf(k);
            if (descIdx !== -1) {
                order[k] = descIdx + 1;
            }
        });
        // Unknown keys go after all known keys
        let nextOrder = descKeys.length + 1;
        allKeys.filter(k => !(k in order)).sort().forEach(k => {
            order[k] = nextOrder++;
        });
        return order;
    }, []);

    const fetchLabels = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/script-labels");
            const data = await res.json();
            if (data.success) {
                setLabels(JSON.parse(JSON.stringify(data.labels)));
                setOriginalLabels(JSON.parse(JSON.stringify(data.labels)));
                setLanguages(data.languages);
                // Initialize key order from first language
                const firstLang = data.languages[0] || "en";
                setKeyOrder(buildKeyOrder(data.labels[firstLang] || {}));
            }
        } catch {
            setError("Script etiketleri yüklenemedi");
        } finally {
            setLoading(false);
        }
    }, [buildKeyOrder]);

    useEffect(() => { fetchLabels(); }, [fetchLabels]);

    // ESC to exit edit mode (preserve changes)
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (editingLineKey) { setEditingLineKey(null); return; }
                if (editMode !== "off") { setEditMode("off"); }
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [editMode, editingLineKey]);

    // J11: beforeunload guard + context sync
    const hasChanges = JSON.stringify(labels) !== JSON.stringify(originalLabels);
    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (hasChanges) { e.preventDefault(); }
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [hasChanges]);

    // Sync hasChanges with global context for sidebar navigation guard
    useEffect(() => {
        unsavedCtx.setHasUnsavedChanges(hasChanges);
        return () => unsavedCtx.setHasUnsavedChanges(false);
    }, [hasChanges]);

    const currentLabels = labels[activeLang] || {};

    const handleValueChange = (key: string, value: string) => {
        setLabels(prev => ({
            ...prev,
            [activeLang]: { ...prev[activeLang], [key]: value },
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setError("");
        try {
            const changedLabels: { lang: string; key: string; value: string }[] = [];
            for (const lang of languages) {
                const current = labels[lang] || {};
                const original = originalLabels[lang] || {};
                for (const key of Object.keys(current)) {
                    if (current[key] !== original[key]) {
                        changedLabels.push({ lang, key, value: current[key] });
                    }
                }
            }
            if (changedLabels.length === 0) return;

            const res = await fetch("/api/admin/script-labels", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ labels: changedLabels }),
            });
            const data = await res.json();
            if (data.success) {
                setOriginalLabels(JSON.parse(JSON.stringify(labels)));
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            } else {
                setError(data.error || "Kaydetme başarısız");
            }
        } catch {
            setError("Değişiklikler kaydedilemedi");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setLabels(JSON.parse(JSON.stringify(originalLabels)));
        setEditMode("off");
        setEditingLineKey(null);
    };

    // Register callbacks for sidebar navigation guard
    unsavedCtx.onSave.current = handleSave;
    unsavedCtx.onDiscard.current = handleCancel;

    // J11: Navigation guard
    const tryNavigate = (navFn: () => void) => {
        if (hasChanges) {
            setPendingNav(() => navFn);
            setShowUnsavedModal(true);
        } else {
            navFn();
        }
    };

    // J9: Autocomplete — filter matching keys as user types
    const allKnownKeys = useMemo(() => Object.keys(LABEL_DESCRIPTIONS), []);
    const handleNewKeyChange = (val: string) => {
        setNewKey(val);
        if (val.trim().length > 0) {
            const matches = allKnownKeys.filter(k =>
                k.toLowerCase().includes(val.toLowerCase()) && !Object.keys(currentLabels).includes(k)
            );
            setSuggestions(matches.slice(0, 5));
        } else {
            setSuggestions([]);
        }
    };

    const handleSelectSuggestion = (key: string) => {
        setNewKey(key);
        setNewValue(LABEL_DESCRIPTIONS[key] ? "" : "");
        setSuggestions([]);
    };

    const handleAddRow = () => {
        if (!newKey.trim()) return;
        const key = newKey.trim();
        setLabels(prev => {
            const updated = { ...prev };
            for (const lang of languages) {
                updated[lang] = { ...updated[lang], [key]: lang === activeLang ? newValue : "" };
            }
            return updated;
        });
        setNewKey("");
        setNewValue("");
        setShowNewRow(false);
        setSuggestions([]);
    };

    // K9: Rename a key across all languages + keyOrder
    const handleRenameKey = (oldKey: string, newKeyName: string) => {
        if (!newKeyName.trim() || newKeyName === oldKey) return;
        const nk = newKeyName.trim();
        setLabels(prev => {
            const updated = { ...prev };
            for (const lang of languages) {
                const copy = { ...updated[lang] };
                copy[nk] = copy[oldKey] ?? "";
                delete copy[oldKey];
                updated[lang] = copy;
            }
            return updated;
        });
        setKeyOrder(prev => {
            const next = { ...prev };
            next[nk] = next[oldKey] ?? (Math.max(0, ...Object.values(next)) + 1);
            delete next[oldKey];
            return next;
        });
        // Also update originalLabels so the old key doesn't appear as "changed"
        setOriginalLabels(prev => {
            const updated = { ...prev };
            for (const lang of languages) {
                if (updated[lang]?.[oldKey] !== undefined) {
                    const copy = { ...updated[lang] };
                    copy[nk] = copy[oldKey];
                    delete copy[oldKey];
                    updated[lang] = copy;
                }
            }
            return updated;
        });
    };

    const handleDeleteKey = async (key: string) => {
        setLabels(prev => {
            const updated = { ...prev };
            for (const lang of languages) {
                const copy = { ...updated[lang] };
                delete copy[key];
                updated[lang] = copy;
            }
            return updated;
        });
        // J10: Remove from keyOrder
        setKeyOrder(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
        for (const lang of languages) {
            await fetch(`/api/admin/script-labels?lang=${lang}&key=${key}`, { method: "DELETE" });
        }
        setOriginalLabels(prev => {
            const updated = { ...prev };
            for (const lang of languages) {
                const copy = { ...updated[lang] };
                delete copy[key];
                updated[lang] = copy;
            }
            return updated;
        });
    };

    // J10: Sort keys by keyOrder, fallback to LABEL_DESCRIPTIONS index
    const keys = Object.keys(currentLabels).sort((a, b) => {
        const aOrd = keyOrder[a] ?? 9999;
        const bOrd = keyOrder[b] ?? 9999;
        return aOrd - bOrd;
    });

    // J10: Ensure new keys added to labels also get an order
    useEffect(() => {
        const allKeys = Object.keys(currentLabels);
        const missing = allKeys.filter(k => !(k in keyOrder));
        if (missing.length > 0) {
            const maxOrder = Math.max(0, ...Object.values(keyOrder));
            setKeyOrder(prev => {
                const next = { ...prev };
                missing.forEach((k, i) => { next[k] = maxOrder + i + 1; });
                return next;
            });
        }
    }, [currentLabels, keyOrder]);

    // J10: Move key up in order
    const handleMoveUp = (key: string) => {
        const sorted = [...keys];
        const idx = sorted.indexOf(key);
        if (idx <= 0) return;
        const prevKey = sorted[idx - 1];
        setKeyOrder(prev => ({
            ...prev,
            [key]: prev[prevKey],
            [prevKey]: prev[key],
        }));
    };

    // J10: Move key down in order
    const handleMoveDown = (key: string) => {
        const sorted = [...keys];
        const idx = sorted.indexOf(key);
        if (idx < 0 || idx >= sorted.length - 1) return;
        const nextKey = sorted[idx + 1];
        setKeyOrder(prev => ({
            ...prev,
            [key]: prev[nextKey],
            [nextKey]: prev[key],
        }));
    };

    // J10: Set specific order for a key — if occupied, shift existing + below down
    const handleSetOrder = (key: string, newOrder: number) => {
        if (newOrder < 1) return;
        setKeyOrder(prev => {
            const next = { ...prev };
            const currentOrder = next[key];
            // Find keys that occupy the target position or are >= target (excluding current key)
            const occupied = Object.entries(next)
                .filter(([k, o]) => k !== key && o >= newOrder)
                .sort(([, a], [, b]) => a - b);
            // Shift occupied keys down by 1
            occupied.forEach(([k]) => { next[k] = next[k] + 1; });
            next[key] = newOrder;
            return next;
        });
    };

    // J5+J8: Preview lines — githubUrl included, all text lines editable
    const previewLines = useMemo<PreviewLine[]>(() => {
        const L = currentLabels;
        const today = new Date().toISOString().split("T")[0];
        return [
            { text: `# ============================================`, key: null, editable: false },
            { text: `# ${L.scriptTitle || "OptWin - Windows System Optimizer"}`, key: "scriptTitle", editable: true },
            { text: `# ${L.version || "Version"}: 1.3`, key: "version", editable: true },
            { text: `# ${L.date || "Date"}: ${today}`, key: "date", editable: true },
            { text: `# ${L.developer || "Developer"}: ${L.developerName || "OptWin"}`, key: "developer", editable: true },
            { text: `#   → ${L.developerName || "OptWin"}`, key: "developerName", editable: true },
            { text: `# ${L.website || "Website"}: ${L.websiteUrl || "https://optwin.tech"}`, key: "website", editable: true },
            { text: `#   → ${L.websiteUrl || "https://optwin.tech"}`, key: "websiteUrl", editable: true },
            { text: `# GitHub: ${L.githubUrl || "https://github.com/ahmetlygh/OptWin"}`, key: "githubUrl", editable: true },
            { text: `# ${L.openSource || "Open Source"}`, key: "openSource", editable: true },
            { text: `# ============================================`, key: null, editable: false },
            { text: ``, key: null, editable: false },
            { text: `Write-Host ""`, key: null, editable: false },
            { text: `Write-Host "  ╔══════════════════════════════════════╗" -ForegroundColor Cyan`, key: null, editable: false },
            { text: `Write-Host "  ║  ${(L.bannerTitle || "OPTWIN").padEnd(36)}║" -ForegroundColor Cyan`, key: "bannerTitle", editable: true },
            { text: `Write-Host "  ║  ${(L.openSourceShort || "Open Source Optimizer").padEnd(36)}║" -ForegroundColor DarkCyan`, key: "openSourceShort", editable: true },
            { text: `Write-Host "  ╚══════════════════════════════════════╝" -ForegroundColor Cyan`, key: null, editable: false },
            { text: `Write-Host ""`, key: null, editable: false },
            { text: ``, key: null, editable: false },
            { text: `# ${L.adminRequest || "Requesting admin privileges..."}`, key: "adminRequest", editable: true },
            { text: `# ${L.adminPrompt || "Please click Yes on the UAC prompt"}`, key: "adminPrompt", editable: true },
            { text: ``, key: null, editable: false },
            { text: `Write-Host "[*] ${L.restorePoint || "Creating restore point..."}" -ForegroundColor Yellow`, key: "restorePoint", editable: true },
            { text: `Write-Host "[+] ${L.restoreSuccess || "Restore point created"}" -ForegroundColor Green`, key: "restoreSuccess", editable: true },
            { text: ``, key: null, editable: false },
            { text: `# --- Optimizations ---`, key: null, editable: false },
            { text: `Write-Host "[*] Example Feature islemi yapiliyor..." -ForegroundColor White`, key: null, editable: false },
            { text: `Write-Host "  [${L.done || "DONE"}]" -ForegroundColor Green`, key: "done", editable: true },
            { text: ``, key: null, editable: false },
            { text: `Write-Host ""`, key: null, editable: false },
            { text: `Write-Host "  ╔══════════════════════════════════════╗" -ForegroundColor Green`, key: null, editable: false },
            { text: `Write-Host "  ║  ${(L.complete || "Optimization Complete!").padEnd(36)}║" -ForegroundColor Green`, key: "complete", editable: true },
            { text: `Write-Host "  ╚══════════════════════════════════════╝" -ForegroundColor Green`, key: null, editable: false },
            { text: `Write-Host ""`, key: null, editable: false },
            { text: `Write-Host "${L.success || "Please restart your computer."}" -ForegroundColor Yellow`, key: "success", editable: true },
            { text: `Write-Host "${L.thankYou || "Thank you for using OptWin!"}" -ForegroundColor Cyan`, key: "thankYou", editable: true },
            { text: `Write-Host "${L.author || "by OptWin Team"}" -ForegroundColor DarkGray`, key: "author", editable: true },
            { text: `Write-Host ""`, key: null, editable: false },
            { text: `Write-Host "${L.pressAnyKey || "Press any key to exit..."}" -ForegroundColor Gray`, key: "pressAnyKey", editable: true },
            { text: `$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")`, key: null, editable: false },
        ];
    }, [currentLabels]);

    const previewText = previewLines.map(l => l.text).join("\n");

    // J7: Enter in preview adds new line
    const handlePreviewKeyDown = (e: React.KeyboardEvent, idx: number) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            // Generate unique key name
            let counter = 1;
            while (currentLabels[`yeniDeger${counter}`] !== undefined) counter++;
            const newKeyName = `yeniDeger${counter}`;
            setLabels(prev => {
                const updated = { ...prev };
                for (const lang of languages) {
                    updated[lang] = { ...updated[lang], [newKeyName]: "" };
                }
                return updated;
            });
            setTimeout(() => setEditingLineKey(newKeyName), 50);
        }
    };

    const handleDownloadPreview = () => {
        const bom = "\uFEFF";
        const blob = new Blob([bom + previewText], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `OptWin-Preview-${activeLang}.ps1`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={24} className="text-[#6b5be6] animate-spin" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#10b981]/10 flex items-center justify-center">
                        <FileCode2 size={18} className="text-[#10b981]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight">Script Ayarları</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-white/30">
                                Oluşturulan PowerShell scriptlerinde görünen varsayılan metinleri düzenleyin
                            </p>
                            {currentLabels.githubUrl && (
                                <a href={currentLabels.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-white/20 hover:text-[#6b5be6] transition-colors">
                                    <Github size={10} />
                                    {currentLabels.githubUrl}
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <AdminLangPicker value={activeLang} onChange={setActiveLang} availableLangs={languages} />

                    <AnimatePresence>
                        {hasChanges && (
                            <motion.div
                                key="save-cancel"
                                initial={{ opacity: 0, x: 8 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 8, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center gap-2"
                            >
                                <button
                                    onClick={handleCancel}
                                    className="h-9 px-4 rounded-xl text-sm font-medium text-white/40 hover:text-white/70 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] transition-all flex items-center gap-2"
                                >
                                    <RotateCcw size={14} />
                                    İptal
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="h-9 px-5 rounded-xl text-sm font-bold text-white bg-[#6b5be6] hover:bg-[#5a4bd4] disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-[#6b5be6]/20"
                                >
                                    {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Save size={14} />}
                                    {saving ? "Kaydediliyor..." : saved ? "Kaydedildi!" : "Kaydet"}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/[0.06] border border-red-500/10 text-red-400 text-sm">
                    <AlertCircle size={14} />
                    {error}
                </div>
            )}

            {/* Two-column layout — fills to bottom of screen */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5" style={{ height: "calc(100vh - 220px)" }}>
                {/* Labels Table */}
                <div className="rounded-2xl border border-white/[0.04] bg-white/[0.015] overflow-hidden flex flex-col min-h-0">
                    <div className="px-5 py-3 border-b border-white/[0.04] flex items-center justify-between shrink-0">
                        <h3 className="text-[11px] font-bold text-white/25 uppercase tracking-wider">Anahtar — Değer</h3>
                        <span className="text-[9px] text-white/15 font-mono">{keys.length} etiket</span>
                    </div>
                    <div className="flex-1 overflow-y-auto admin-scrollbar min-h-0">
                        <table className="w-full text-sm">
                            <tbody>
                                {keys.map((key, i) => {
                                    const original = originalLabels[activeLang]?.[key];
                                    const current = currentLabels[key];
                                    const changed = original !== undefined && original !== current;
                                    const order = keyOrder[key] ?? 0;

                                    return (
                                        <motion.tr
                                            key={key}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.01, layout: { duration: 0.2 } }}
                                            className={`border-b border-white/[0.03] hover:bg-white/[0.015] transition-colors group/row ${changed ? "bg-[#6b5be6]/[0.03]" : ""}`}
                                        >
                                            {/* J10: Order column — wider */}
                                            <td className="pl-1.5 pr-0 py-1.5 w-[56px] align-top">
                                                <div className="flex flex-col items-center gap-0">
                                                    <button
                                                        onClick={() => handleMoveUp(key)}
                                                        disabled={i === 0}
                                                        className="size-4 flex items-center justify-center rounded text-white/0 group-hover/row:text-white/20 hover:!text-white/50 disabled:!text-white/0 transition-colors"
                                                        title="Yukarı taşı"
                                                    >
                                                        <ChevronUp size={10} />
                                                    </button>
                                                    <input
                                                        type="number"
                                                        value={order}
                                                        onChange={e => {
                                                            const v = parseInt(e.target.value);
                                                            if (!isNaN(v)) handleSetOrder(key, v);
                                                        }}
                                                        className="w-10 h-5 text-center text-[9px] font-mono font-bold text-white/30 bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] focus:border-[#6b5be6]/30 rounded focus:outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        title="Sıra numarası"
                                                    />
                                                    <button
                                                        onClick={() => handleMoveDown(key)}
                                                        disabled={i === keys.length - 1}
                                                        className="size-4 flex items-center justify-center rounded text-white/0 group-hover/row:text-white/20 hover:!text-white/50 disabled:!text-white/0 transition-colors"
                                                        title="Aşağı taşı"
                                                    >
                                                        <ChevronDown size={10} />
                                                    </button>
                                                </div>
                                            </td>
                                            {/* K9: Editable key name */}
                                            <td className="px-1.5 py-2 align-top w-[150px]">
                                                <input
                                                    defaultValue={key}
                                                    onBlur={e => {
                                                        const nk = e.target.value.trim();
                                                        if (nk && nk !== key) handleRenameKey(key, nk);
                                                    }}
                                                    onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                                                    className="w-full text-[11px] font-mono font-bold text-white/50 bg-transparent border border-transparent hover:border-white/[0.06] focus:border-[#6b5be6]/30 rounded px-1.5 py-0.5 focus:outline-none transition-all"
                                                    title="Anahtar adını düzenle"
                                                />
                                                {LABEL_DESCRIPTIONS[key] && (
                                                    <p className="text-[9px] text-white/15 mt-0.5 leading-tight px-1.5">{LABEL_DESCRIPTIONS[key]}</p>
                                                )}
                                            </td>
                                            {/* Value */}
                                            <td className="px-1.5 py-1.5">
                                                <textarea
                                                    value={current || ""}
                                                    onChange={e => handleValueChange(key, e.target.value)}
                                                    rows={1}
                                                    placeholder="Değer girin..."
                                                    className="w-full bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] focus:border-[#6b5be6]/30 rounded-lg px-2.5 py-1.5 text-[13px] text-white/80 placeholder-white/15 focus:outline-none transition-all resize-none"
                                                    style={{ minHeight: "32px" }}
                                                    onInput={(e) => {
                                                        const t = e.target as HTMLTextAreaElement;
                                                        t.style.height = "auto";
                                                        t.style.height = t.scrollHeight + "px";
                                                    }}
                                                />
                                            </td>
                                            <td className="px-1 py-1.5 w-8">
                                                <button
                                                    onClick={() => handleDeleteKey(key)}
                                                    className="size-6 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-white/10 hover:text-red-400 transition-all"
                                                    title="Anahtarı sil"
                                                >
                                                    <Trash2 size={11} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    );
                                })}

                                {/* K10: New row — animated entry */}
                                <AnimatePresence>
                                    {showNewRow && (
                                        <motion.tr
                                            key="new-row"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                                            className="border-b border-white/[0.03] bg-[#6b5be6]/[0.03]"
                                        >
                                            <td className="pl-1.5 pr-0 py-2 w-[56px]">
                                                {/* Order placeholder for new row */}
                                                <span className="block w-10 h-5 text-center text-[9px] font-mono text-white/15">—</span>
                                            </td>
                                            <td className="px-1.5 py-2 w-[150px] relative">
                                                <input
                                                    ref={newKeyRef}
                                                    value={newKey}
                                                    onChange={e => handleNewKeyChange(e.target.value)}
                                                    placeholder="Anahtar adı"
                                                    className="w-full bg-white/[0.02] border border-[#6b5be6]/20 focus:border-[#6b5be6]/40 rounded px-2 py-1.5 text-[11px] font-mono text-white/80 placeholder-white/20 focus:outline-none transition-all"
                                                />
                                                {suggestions.length > 0 && (
                                                    <div className="absolute left-1.5 right-1.5 top-full z-20 mt-0.5 bg-[#14141f] border border-white/[0.08] rounded-lg shadow-xl overflow-hidden">
                                                        {suggestions.map(s => (
                                                            <button
                                                                key={s}
                                                                onClick={() => handleSelectSuggestion(s)}
                                                                className="w-full px-3 py-1.5 text-left text-[11px] font-mono text-white/60 hover:bg-[#6b5be6]/10 hover:text-white/80 transition-colors flex items-center justify-between"
                                                            >
                                                                <span>{s}</span>
                                                                {LABEL_DESCRIPTIONS[s] && (
                                                                    <span className="text-[8px] text-white/20 ml-2 truncate max-w-[80px]">{LABEL_DESCRIPTIONS[s]}</span>
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-1.5 py-2">
                                                <input
                                                    value={newValue}
                                                    onChange={e => setNewValue(e.target.value)}
                                                    placeholder="Değer girin..."
                                                    className="w-full bg-white/[0.02] border border-[#6b5be6]/20 focus:border-[#6b5be6]/40 rounded-lg px-2.5 py-1.5 text-[13px] text-white/80 placeholder-white/20 focus:outline-none transition-all"
                                                    onKeyDown={e => e.key === "Enter" && handleAddRow()}
                                                />
                                            </td>
                                            <td className="px-1 py-2 w-8">
                                                <div className="flex flex-col gap-1">
                                                    <button
                                                        onClick={handleAddRow}
                                                        className="size-6 flex items-center justify-center rounded-lg bg-[#6b5be6]/15 text-[#6b5be6] hover:bg-[#6b5be6]/25 transition-all"
                                                        title="Ekle"
                                                    >
                                                        <Check size={11} />
                                                    </button>
                                                    <button
                                                        onClick={() => { setShowNewRow(false); setNewKey(""); setNewValue(""); setSuggestions([]); }}
                                                        className="size-6 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-white/15 hover:text-red-400 transition-all"
                                                        title="İptal"
                                                    >
                                                        <X size={11} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    <div className="px-4 py-2.5 border-t border-white/[0.03] shrink-0">
                        <button
                            onClick={() => {
                                setShowNewRow(true);
                                setTimeout(() => newKeyRef.current?.focus(), 100);
                            }}
                            className="flex items-center gap-2 text-xs font-medium text-white/20 hover:text-white/50 transition-colors"
                        >
                            <Plus size={13} />
                            Yeni etiket ekle
                        </button>
                    </div>
                </div>

                {/* Terminal Preview */}
                <div className="rounded-2xl border border-white/[0.04] bg-white/[0.015] overflow-hidden flex flex-col min-h-0">
                    <div className="px-5 py-3 border-b border-white/[0.04] flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <MonitorPlay size={13} className="text-emerald-400" />
                            <h3 className="text-[11px] font-bold text-white/25 uppercase tracking-wider">Terminal Önizleme</h3>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => {
                                    if (editMode === "line") { setEditMode("off"); setEditingLineKey(null); }
                                    else { setEditMode("line"); setEditingLineKey(null); }
                                }}
                                className={`h-7 px-2.5 rounded-lg text-[10px] font-bold transition-all border flex items-center gap-1.5 ${
                                    editMode === "line"
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/15"
                                        : "bg-white/[0.03] text-white/30 border-white/[0.04] hover:text-white/50"
                                }`}
                            >
                                <List size={10} />
                                Satır
                            </button>
                            <button
                                onClick={() => {
                                    if (editMode === "full") { setEditMode("off"); setEditingLineKey(null); }
                                    else { setEditMode("full"); setEditingLineKey(null); }
                                }}
                                className={`h-7 px-2.5 rounded-lg text-[10px] font-bold transition-all border flex items-center gap-1.5 ${
                                    editMode === "full"
                                        ? "bg-amber-500/10 text-amber-400 border-amber-500/15"
                                        : "bg-white/[0.03] text-white/30 border-white/[0.04] hover:text-white/50"
                                }`}
                            >
                                <Code2 size={10} />
                                Komple
                            </button>
                            <button
                                onClick={handleDownloadPreview}
                                className="h-7 px-2.5 rounded-lg text-[10px] font-bold bg-[#6b5be6]/10 text-[#6b5be6] hover:bg-[#6b5be6]/20 border border-[#6b5be6]/15 transition-all flex items-center gap-1.5"
                            >
                                <Download size={10} />
                                İndir
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 bg-[#0a0a0f] overflow-auto admin-scrollbar min-h-0">
                        {editMode === "full" ? (
                            /* Full edit: all editable lines become inputs at once */
                            <div className="p-4 space-y-0.5">
                                {previewLines.map((line, idx) => {
                                    if (line.key && line.editable) {
                                        const ord = keyOrder[line.key];
                                        return (
                                            <div key={idx} className="flex items-center gap-1">
                                                <span className="text-[9px] font-mono text-amber-400/30 w-20 text-right shrink-0 pr-1 truncate" title={line.key}>{line.key}</span>
                                                <span className="text-amber-400/20 text-[8px] font-mono w-4 text-center shrink-0" title={`Sıra: ${ord}`}>{ord}</span>
                                                <span className="text-white/15 text-[10px] font-mono w-6 text-right shrink-0">{idx + 1}</span>
                                                <input
                                                    value={currentLabels[line.key] || ""}
                                                    onChange={e => handleValueChange(line.key!, e.target.value)}
                                                    onKeyDown={e => handlePreviewKeyDown(e, idx)}
                                                    className="flex-1 bg-amber-500/[0.05] border border-amber-500/15 hover:border-amber-500/30 focus:border-amber-500/40 rounded px-2 py-0.5 text-[12px] font-mono text-amber-200/80 focus:outline-none transition-all"
                                                />
                                            </div>
                                        );
                                    }
                                    return (
                                        <div key={idx} className="flex items-start gap-1">
                                            <span className="text-transparent text-[9px] font-mono w-20 shrink-0 pr-1">&nbsp;</span>
                                            <span className="text-transparent text-[8px] font-mono w-4 shrink-0">&nbsp;</span>
                                            <span className="text-white/15 text-[10px] font-mono w-6 text-right shrink-0 pt-px">{idx + 1}</span>
                                            <code className={`text-[12px] font-mono whitespace-pre ${getLineClass(line.text)}`}>{line.text || " "}</code>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : editMode === "line" ? (
                            /* Line edit: click individual lines to edit */
                            <div className="p-4 space-y-0.5">
                                {previewLines.map((line, idx) => {
                                    const isEditing = editingLineKey === line.key && line.key;
                                    const ord = line.key ? keyOrder[line.key] : null;

                                    if (isEditing && line.key) {
                                        return (
                                            <div key={idx} className="flex items-center gap-1">
                                                <span className="text-[9px] font-mono text-[#6b5be6]/40 w-20 text-right shrink-0 pr-1 truncate" title={line.key}>{line.key}</span>
                                                <span className="text-[#6b5be6]/25 text-[8px] font-mono w-4 text-center shrink-0">{ord}</span>
                                                <span className="text-white/15 text-[10px] font-mono w-6 text-right shrink-0">{idx + 1}</span>
                                                <input
                                                    autoFocus
                                                    value={currentLabels[line.key] || ""}
                                                    onChange={e => handleValueChange(line.key!, e.target.value)}
                                                    onKeyDown={e => {
                                                        if (e.key === "Escape") setEditingLineKey(null);
                                                        handlePreviewKeyDown(e, idx);
                                                    }}
                                                    className="flex-1 bg-[#6b5be6]/10 border border-[#6b5be6]/30 rounded px-2 py-0.5 text-[12px] font-mono text-purple-300 focus:outline-none"
                                                />
                                            </div>
                                        );
                                    }

                                    return (
                                        <div
                                            key={idx}
                                            className={`flex items-start gap-1 group ${line.key && line.editable ? "cursor-pointer hover:bg-white/[0.03] rounded" : ""}`}
                                            onClick={() => line.key && line.editable && setEditingLineKey(line.key)}
                                        >
                                            <span className={`text-[9px] font-mono w-20 text-right shrink-0 pr-1 pt-px truncate ${
                                                line.key ? "text-[#6b5be6]/25" : "text-transparent"
                                            }`} title={line.key || ""}>
                                                {line.key || ""}
                                            </span>
                                            <span className={`text-[8px] font-mono w-4 text-center shrink-0 pt-px ${
                                                line.key ? "text-[#6b5be6]/15" : "text-transparent"
                                            }`}>{ord ?? ""}</span>
                                            <span className="text-white/15 text-[10px] font-mono w-6 text-right shrink-0 pt-px">{idx + 1}</span>
                                            <code className={`text-[12px] font-mono whitespace-pre ${getLineClass(line.text)}`}>
                                                {line.text || " "}
                                            </code>
                                            {line.key && line.editable && (
                                                <Pencil size={9} className="text-white/0 group-hover:text-white/30 transition-colors mt-1 shrink-0" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            /* View mode: plain preview with key labels + order */
                            <div className="p-4 space-y-0.5">
                                {previewLines.map((line, idx) => {
                                    const ord = line.key ? keyOrder[line.key] : null;
                                    return (
                                        <div key={idx} className="flex items-start gap-1">
                                            <span className={`text-[9px] font-mono w-20 text-right shrink-0 pr-1 pt-px truncate ${
                                                line.key ? "text-white/10" : "text-transparent"
                                            }`} title={line.key || ""}>
                                                {line.key || ""}
                                            </span>
                                            <span className={`text-[8px] font-mono w-4 text-center shrink-0 pt-px ${
                                                line.key ? "text-white/8" : "text-transparent"
                                            }`}>{ord ?? ""}</span>
                                            <span className="text-white/15 text-[10px] font-mono w-6 text-right shrink-0 pt-px">{idx + 1}</span>
                                            <code className={`text-[12px] font-mono whitespace-pre ${getLineClass(line.text)}`}>
                                                {line.text || " "}
                                            </code>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* J11: Unsaved Changes Modal */}
            <UnsavedChangesModal
                open={showUnsavedModal}
                onClose={() => { setShowUnsavedModal(false); setPendingNav(null); }}
                onSaveAndLeave={async () => {
                    setShowUnsavedModal(false);
                    await handleSave();
                    pendingNav?.();
                    setPendingNav(null);
                }}
                onDiscardAndLeave={() => {
                    setShowUnsavedModal(false);
                    setLabels(JSON.parse(JSON.stringify(originalLabels)));
                    pendingNav?.();
                    setPendingNav(null);
                }}
            />
        </motion.div>
    );
}
