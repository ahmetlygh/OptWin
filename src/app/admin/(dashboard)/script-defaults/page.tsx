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
    Github,
    X,
} from "lucide-react";
import { AdminLangPicker } from "@/components/admin/AdminLangPicker";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";
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
    const [editingLineKey, setEditingLineKey] = useState<string | null>(null);
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);
    const [pendingNav, setPendingNav] = useState<(() => void) | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [keyOrder, setKeyOrder] = useState<Record<string, number>>({});
    const [originalKeyOrder, setOriginalKeyOrder] = useState<Record<string, number>>({});
    const newKeyRef = useRef<HTMLInputElement>(null);
    const [deleteConfirmKey, setDeleteConfirmKey] = useState<string | null>(null);
    const [siteVersion, setSiteVersion] = useState("1.3.0");
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
            const [res, verRes] = await Promise.all([
                fetch("/api/admin/script-labels"),
                fetch("/api/admin/dashboard"),
            ]);
            const data = await res.json();
            const verData = await verRes.json().catch(() => ({}));
            if (verData.settings?.site_version) setSiteVersion(verData.settings.site_version);
            if (data.success) {
                setLabels(JSON.parse(JSON.stringify(data.labels)));
                setOriginalLabels(JSON.parse(JSON.stringify(data.labels)));
                setLanguages(data.languages);
                const firstLang = data.languages[0] || "en";
                const initOrder = buildKeyOrder(data.labels[firstLang] || {});
                setKeyOrder(initOrder);
                setOriginalKeyOrder(JSON.parse(JSON.stringify(initOrder)));
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
                if (editingLineKey) { setEditingLineKey(null); }
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [editingLineKey]);

    // J11: beforeunload guard + context sync (includes order changes)
    const hasChanges = JSON.stringify(labels) !== JSON.stringify(originalLabels) || JSON.stringify(keyOrder) !== JSON.stringify(originalKeyOrder);
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
                setOriginalKeyOrder(JSON.parse(JSON.stringify(keyOrder)));
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
        setKeyOrder(JSON.parse(JSON.stringify(originalKeyOrder)));
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
        // R9: Assign the highest order + 1 so it appears at the bottom
        setKeyOrder(prev => {
            const maxOrder = Math.max(0, ...Object.values(prev));
            return { ...prev, [key]: maxOrder + 1 };
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

    // M11: Dynamic preview lines — 100% synced with list via keyOrder
    // Each key maps to a PowerShell format template
    const KEY_FORMAT: Record<string, (v: string, L: Record<string, string>) => string> = useMemo(() => ({
        scriptTitle: (v) => `# ${v}`,
        version: (v) => `# ${v}: ${siteVersion}`,
        date: (v) => `# ${v}: ${new Date().toISOString().split("T")[0]}`,
        developer: (v, L) => `# ${v}: ${L.developerName || "OptWin"}`,
        developerName: (v) => `#   → ${v}`,
        website: (v, L) => `# ${v}: ${L.websiteUrl || "https://optwin.tech"}`,
        websiteUrl: (v) => `#   → ${v}`,
        githubUrl: (v) => `# GitHub: ${v}`,
        openSource: (v) => `# ${v}`,
        bannerTitle: (v) => `Write-Host "  ║  ${v.padEnd(36)}║" -ForegroundColor Cyan`,
        openSourceShort: (v) => `Write-Host "  ║  ${v.padEnd(36)}║" -ForegroundColor DarkCyan`,
        adminRequest: (v) => `# ${v}`,
        adminPrompt: (v) => `# ${v}`,
        adminError: (v) => `# ${v}`,
        adminHint: (v) => `# ${v}`,
        restorePoint: (v) => `Write-Host "[*] ${v}" -ForegroundColor Yellow`,
        restoreSuccess: (v) => `Write-Host "[+] ${v}" -ForegroundColor Green`,
        restoreFail: (v) => `Write-Host "[-] ${v}" -ForegroundColor Red`,
        done: (v) => `Write-Host "  [${v}]" -ForegroundColor Green`,
        complete: (v) => `Write-Host "  ║  ${v.padEnd(36)}║" -ForegroundColor Green`,
        success: (v) => `Write-Host "${v}" -ForegroundColor Yellow`,
        thankYou: (v) => `Write-Host "${v}" -ForegroundColor Cyan`,
        author: (v) => `Write-Host "${v}" -ForegroundColor DarkGray`,
        pressAnyKey: (v) => `Write-Host "${v}" -ForegroundColor Gray`,
    }), [siteVersion]);

    // N12: Simplified section separators — no decorative box-drawing lines
    const SECTION_BEFORE: Record<string, PreviewLine[]> = useMemo(() => ({
        scriptTitle: [{ text: "# ============================================", key: null, editable: false }],
        bannerTitle: [
            { text: "# ============================================", key: null, editable: false },
            { text: "", key: null, editable: false },
        ],
        adminRequest: [
            { text: "", key: null, editable: false },
        ],
        restorePoint: [{ text: "", key: null, editable: false }],
        complete: [
            { text: "", key: null, editable: false },
        ],
        pressAnyKey: [{ text: "", key: null, editable: false }],
    }), []);

    // N12: All label-backed lines are editable, preview is clean/simple
    const previewLines = useMemo<PreviewLine[]>(() => {
        const L = currentLabels;
        const sortedKeys = Object.keys(L)
            .filter(k => L[k] !== undefined)
            .sort((a, b) => (keyOrder[a] || 999) - (keyOrder[b] || 999));

        const lines: PreviewLine[] = [];

        const postOptSet = new Set(["done", "complete", "success", "thankYou", "author", "pressAnyKey"]);
        const preOptKeys = sortedKeys.filter(k => !postOptSet.has(k));
        const postOptKeys = sortedKeys.filter(k => postOptSet.has(k));

        for (const key of preOptKeys) {
            const before = SECTION_BEFORE[key];
            if (before) lines.push(...before);
            const fmt = KEY_FORMAT[key];
            const val = L[key] || "";
            lines.push({ text: fmt ? fmt(val, L) : `# ${key}: ${val}`, key, editable: true });
        }

        // Optimization placeholder
        lines.push({ text: "", key: null, editable: false });
        lines.push({ text: "# --- Optimizations ---", key: null, editable: false });
        lines.push({ text: 'Write-Host "[*] Example Feature islemi yapiliyor..." -ForegroundColor White', key: null, editable: false });

        for (const key of postOptKeys) {
            const before = SECTION_BEFORE[key];
            if (before) lines.push(...before);
            const fmt = KEY_FORMAT[key];
            const val = L[key] || "";
            lines.push({ text: fmt ? fmt(val, L) : `Write-Host "${val}"`, key, editable: true });
        }

        // N13: Footer — pause keeps terminal open
        lines.push({ text: "", key: null, editable: false });
        lines.push({ text: '$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")', key: null, editable: false });

        return lines;
    }, [currentLabels, keyOrder, KEY_FORMAT, SECTION_BEFORE]);

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

    // O12: Downloaded preview — proper PowerShell pause (not CMD 'pause')
    const handleDownloadPreview = () => {
        const bom = "\uFEFF";
        const pauseBlock = '\nWrite-Host ""\nWrite-Host "Press Enter to exit..." -ForegroundColor Gray\nRead-Host';
        const downloadText = previewText + pauseBlock;
        const blob = new Blob([bom + downloadText], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `OptWin-Preview-${activeLang}.bat`;
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
                    {/* N11: Save/Cancel buttons LEFT of lang picker */}
                    <AnimatePresence>
                        {hasChanges && (
                            <motion.div
                                key="save-cancel"
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -8, scale: 0.95 }}
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

                    <AdminLangPicker value={activeLang} onChange={setActiveLang} availableLangs={languages} />
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

                                    return (
                                        <motion.tr
                                            key={key}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.01, layout: { duration: 0.2 } }}
                                            className={`border-b border-white/[0.03] hover:bg-white/[0.015] transition-colors group/row ${changed ? "bg-[#6b5be6]/[0.03]" : ""}`}
                                        >
                                            {/* N10: Simple index column — no reorder buttons */}
                                            <td className="pl-2.5 pr-0 py-2 w-[36px] align-top">
                                                <span className="block text-center text-[9px] font-mono font-bold text-white/15 pt-1">{i + 1}</span>
                                            </td>
                                            {/* K9: Editable key name */}
                                            <td className="px-1.5 py-2 align-top w-[150px]">
                                                <input
                                                    defaultValue={key}
                                                    onBlur={e => {
                                                        const nk = e.target.value.trim();
                                                        if (nk && nk !== key) handleRenameKey(key, nk);
                                                    }}
                                                    onKeyDown={e => {
                                                        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                                                        if (e.key === "Escape") { (e.target as HTMLInputElement).value = key; (e.target as HTMLInputElement).blur(); }
                                                    }}
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
                                                    onKeyDown={e => { if (e.key === "Escape") (e.target as HTMLTextAreaElement).blur(); }}
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
                                                    onClick={() => setDeleteConfirmKey(key)}
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
                                            <td className="pl-2.5 pr-0 py-2 w-[36px]">
                                                <span className="block text-center text-[9px] font-mono text-white/15">—</span>
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

                {/* M11: Modern Interactive Terminal Preview */}
                <div className="rounded-2xl border border-white/[0.04] bg-white/[0.015] overflow-hidden flex flex-col min-h-0">
                    {/* Terminal header — macOS style dots + title + download */}
                    <div className="px-4 py-2.5 border-b border-white/[0.04] flex items-center justify-between shrink-0 bg-[#0d0d14]">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                            </div>
                            <div className="flex items-center gap-1.5">
                                <MonitorPlay size={11} className="text-emerald-400/50" />
                                <span className="text-[10px] font-mono text-white/20">OptWin-Preview-{activeLang}.bat</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[9px] text-white/15 font-mono">{previewLines.filter(l => l.key).length} editable</span>
                            <button
                                onClick={handleDownloadPreview}
                                className="h-6 px-2 rounded-md text-[9px] font-bold bg-emerald-500/10 text-emerald-400/70 hover:text-emerald-400 hover:bg-emerald-500/15 border border-emerald-500/10 transition-all flex items-center gap-1"
                            >
                                <Download size={9} />
                                .bat
                            </button>
                        </div>
                    </div>

                    {/* Terminal body — notepad-style interactive */}
                    <div className="flex-1 bg-[#08080e] overflow-auto admin-scrollbar min-h-0">
                        <div className="py-3">
                            {previewLines.map((line, idx) => {
                                const isEditing = editingLineKey === line.key && !!line.key;

                                // Editing mode for this line
                                if (isEditing && line.key) {
                                    return (
                                        <div key={`${idx}-${line.key}`} className="flex items-center gap-0 px-2 py-px bg-[#6b5be6]/[0.04]">
                                            <span className="w-8 text-right text-[9px] font-mono text-[#6b5be6]/30 shrink-0 select-none">{idx + 1}</span>
                                            <span className="w-px h-4 bg-[#6b5be6]/15 mx-1.5 shrink-0" />
                                            <span className="text-[8px] font-mono text-[#6b5be6]/40 w-[72px] text-right pr-1.5 shrink-0 truncate" title={line.key}>{line.key}</span>
                                            <input
                                                autoFocus
                                                value={currentLabels[line.key] || ""}
                                                onChange={e => handleValueChange(line.key!, e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === "Escape") setEditingLineKey(null);
                                                    handlePreviewKeyDown(e, idx);
                                                }}
                                                onBlur={() => setEditingLineKey(null)}
                                                className="flex-1 bg-[#6b5be6]/[0.06] border border-[#6b5be6]/20 rounded px-2 py-0.5 text-[11px] font-mono text-[#c4b5fd] focus:outline-none focus:border-[#6b5be6]/40 transition-all mr-2"
                                                placeholder="Değer girin..."
                                            />
                                        </div>
                                    );
                                }

                                // Regular line (clickable if editable)
                                return (
                                    <div
                                        key={`${idx}-${line.key || 'static'}`}
                                        className={`flex items-start gap-0 px-2 py-px group ${
                                            line.editable && line.key
                                                ? "cursor-pointer hover:bg-white/[0.015]"
                                                : ""
                                        }`}
                                        onClick={() => line.editable && line.key && setEditingLineKey(line.key)}
                                    >
                                        <span className="w-8 text-right text-[9px] font-mono text-white/[0.08] shrink-0 select-none pt-px">{idx + 1}</span>
                                        <span className="w-px h-4 bg-white/[0.04] mx-1.5 shrink-0 mt-px" />
                                        {line.key ? (
                                            <span className="text-[8px] font-mono text-white/[0.08] group-hover:text-white/15 w-[72px] text-right pr-1.5 shrink-0 truncate pt-0.5 transition-colors" title={line.key}>{line.key}</span>
                                        ) : (
                                            <span className="w-[72px] shrink-0" />
                                        )}
                                        <code className={`text-[11px] font-mono whitespace-pre leading-[1.6] ${getLineClass(line.text)} ${
                                            line.editable && line.key ? "group-hover:brightness-125 transition-all" : ""
                                        }`}>
                                            {line.text || "\u00A0"}
                                        </code>
                                        {line.editable && line.key && (
                                            <Pencil size={8} className="text-white/0 group-hover:text-white/20 transition-colors mt-1 ml-1.5 shrink-0" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Terminal footer — status bar */}
                    <div className="px-4 py-1.5 border-t border-white/[0.03] bg-[#0d0d14] flex items-center justify-between">
                        <span className="text-[8px] font-mono text-white/10">{previewLines.length} satır</span>
                        <span className="text-[8px] font-mono text-white/10">UTF-8 · PowerShell</span>
                    </div>
                </div>
            </div>

            {/* N14: Delete Confirm Modal */}
            <AdminConfirmModal
                open={!!deleteConfirmKey}
                onClose={() => setDeleteConfirmKey(null)}
                onConfirm={async () => {
                    const key = deleteConfirmKey;
                    setDeleteConfirmKey(null);
                    if (key) await handleDeleteKey(key);
                }}
                title="Etiketi Sil"
                description={`"${deleteConfirmKey}" anahtarını silmek istediğinize emin misiniz? Bu işlem tüm dillerden kalıcı olarak silinecektir.`}
                confirmText="Evet, Sil"
                cancelText="Hayır"
                variant="danger"
            />

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
