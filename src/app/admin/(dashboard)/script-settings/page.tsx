"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Languages, Download, FileCode2, FileUp, FileDown, Navigation2 } from "lucide-react";
import { AdminLangPicker } from "@/components/admin/AdminLangPicker";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";
import { useUnsavedChanges } from "@/components/admin/UnsavedChangesContext";
import { AdminActionBar } from "@/components/admin/AdminActionBar";
import { Loader } from "@/components/shared/Loader";
import { FlagIcon } from "@/components/shared/FlagIcon";
import { toPowerShellSafe } from "@/lib/powershell-safe";

import { LabelsMap, PreviewLine, ExtraLine, LABEL_DESCRIPTIONS } from "@/components/admin/script-settings/ScriptSettingsTypes";
import { LabelsTable, LabelsTableRef } from "@/components/admin/script-settings/LabelsTable";
import { TerminalPreview } from "@/components/admin/script-settings/TerminalPreview";
import { MissingTranslationsModal } from "@/components/admin/script-settings/MissingTranslationsModal";

export default function ScriptDefaultsPage() {
    const [labels, setLabels] = useState<LabelsMap>({});
    const [originalLabels, setOriginalLabels] = useState<LabelsMap>({});
    const [languages, setLanguages] = useState<any[]>([]);
    const [activeLang, setActiveLang] = useState("en");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");
    const [newKey, setNewKey] = useState("");
    const [newValue, setNewValue] = useState("");
    const [showNewRow, setShowNewRow] = useState(false);
    const [editingLineKey, setEditingLineKey] = useState<string | null>(null);
    const [editingLineIdx, setEditingLineIdx] = useState<number | null>(null);
    const [lineOverrides, setLineOverrides] = useState<Record<number, string>>({});
    const [originalLineOverrides, setOriginalLineOverrides] = useState<Record<number, string>>({});
    const [extraLines, setExtraLines] = useState<ExtraLine[]>([]);
    const [originalExtraLines, setOriginalExtraLines] = useState<ExtraLine[]>([]);
    const [deletedPreviewLines, setDeletedPreviewLines] = useState<number[]>([]);
    const [originalDeletedPreviewLines, setOriginalDeletedPreviewLines] = useState<number[]>([]);
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);
    const [pendingNav, setPendingNav] = useState<(() => void) | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [keyOrder, setKeyOrder] = useState<Record<string, number>>({});
    const [originalKeyOrder, setOriginalKeyOrder] = useState<Record<string, number>>({});
    const [deleteConfirmKey, setDeleteConfirmKey] = useState<string | null>(null);
    const [showMissingModal, setShowMissingModal] = useState(false);
    const [translatingMissing, setTranslatingMissing] = useState(false);
    const [translateProgress, setTranslateProgress] = useState("");
    
    const labelsTableRef = useRef<LabelsTableRef>(null);

    const unsavedCtx = useUnsavedChanges();

    const missingTranslations = useMemo(() => {
        const enKeys = Object.keys(labels["en"] || {});
        const result: Record<string, string[]> = {};
        for (const l of languages) {
            const langCode = l.code || l;
            if (langCode === "en") continue;
            const langLabels = labels[langCode] || {};
            const missing = enKeys.filter(k => !langLabels[k] || langLabels[k].trim() === "");
            if (missing.length > 0) result[langCode] = missing;
        }
        return result;
    }, [labels, languages]);

    const totalMissingForActive = useMemo(() => {
        return (missingTranslations[activeLang] || []).length;
    }, [missingTranslations, activeLang]);

    // CSS-based animation state for the missing badge
    const [badgeMounted, setBadgeMounted] = useState(false);
    const [badgeClass, setBadgeClass] = useState("missing-badge-enter");
    const prevMissingRef = useRef(0);

    useEffect(() => {
        const wasVisible = prevMissingRef.current > 0;
        const isVisible = totalMissingForActive > 0;
        prevMissingRef.current = totalMissingForActive;

        if (isVisible && !wasVisible) {
            // Mount and run enter animation
            setBadgeClass("missing-badge-enter");
            setBadgeMounted(true);
        } else if (!isVisible && wasVisible) {
            // Run exit animation then unmount
            setBadgeClass("missing-badge-exit");
            const timer = setTimeout(() => setBadgeMounted(false), 310);
            return () => clearTimeout(timer);
        }
    }, [totalMissingForActive]);

    const handleTranslateMissingLang = async (lang: string) => {
        const missing = missingTranslations[lang];
        if (!missing || missing.length === 0) return;
        setTranslatingMissing(true);
        setTranslateProgress(`${lang.toUpperCase()} çevriliyor...`);
        try {
            let translated = 0;
            for (let i = 0; i < missing.length; i += 10) {
                const batch = missing.slice(i, i + 10);
                await Promise.all(batch.map(async (key) => {
                    const enValue = labels["en"]?.[key];
                    if (!enValue) return;
                    try {
                        const res = await fetch("/api/admin/translate", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ text: enValue, sourceLang: "en", targetLangs: [lang] }),
                        });
                        const data = await res.json();
                        if (data.success && data.translations?.[lang]) {
                            setLabels(prev => ({
                                ...prev,
                                [lang]: { ...prev[lang], [key]: data.translations[lang] },
                            }));
                            translated++;
                        }
                    } catch { }
                }));
                setTranslateProgress(`${lang.toUpperCase()}: ${Math.min(i + 10, missing.length)}/${missing.length}`);
            }
            setTranslateProgress(`${lang.toUpperCase()}: ${translated} etiket çevrildi ✓`);
        } catch {
            setTranslateProgress(`${lang.toUpperCase()} çevirisi başarısız`);
        } finally {
            setTimeout(() => {
                setTranslatingMissing(false);
                setTranslateProgress("");
            }, 1500);
        }
    };

    const handleTranslateAllMissing = async () => {
        const langsWithMissing = Object.keys(missingTranslations);
        if (langsWithMissing.length === 0) return;
        for (const lang of langsWithMissing) {
            await handleTranslateMissingLang(lang);
        }
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                setLabels(prev => ({
                    ...prev,
                    [activeLang]: { ...prev[activeLang], ...json }
                }));
            } catch {
                setError("Geçersiz JSON formatı");
            }
        };
        reader.readAsText(file);
        e.target.value = "";
    };

    const handleFillEnglish = () => {
        if (activeLang === "en") return;
        setLabels(prev => ({
            ...prev,
            [activeLang]: { ...prev["en"] }
        }));
    };

    const buildKeyOrder = useCallback((labelsData: Record<string, string>) => {
        const descKeys = Object.keys(LABEL_DESCRIPTIONS);
        const allKeys = Object.keys(labelsData);
        const order: Record<string, number> = {};
        allKeys.forEach(k => {
            const descIdx = descKeys.indexOf(k);
            if (descIdx !== -1) order[k] = descIdx + 1;
        });
        let nextOrder = descKeys.length + 1;
        allKeys.filter(k => !(k in order)).sort().forEach(k => { order[k] = nextOrder++; });
        return order;
    }, []);

    const fetchLabels = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/script-labels");
            const data = await res.json();
            
            const langRes = await fetch("/api/admin/languages");
            const langData = await langRes.json();

            if (data.success) {
                setLabels(JSON.parse(JSON.stringify(data.labels)));
                setOriginalLabels(JSON.parse(JSON.stringify(data.labels)));
                setLanguages(langData);
                
                // Get active lang from localStorage if exists
                const savedLang = localStorage.getItem("optwin_active_script_lang");
                const firstLang = langData.find((l:any)=>l.code === savedLang)?.code || langData[0]?.code || "en";
                setActiveLang(firstLang);
                let initialOrder = data.keyOrder;
                if (!initialOrder || Object.keys(initialOrder).length === 0) {
                    initialOrder = buildKeyOrder(data.labels[firstLang] || {});
                }
                setKeyOrder(initialOrder);
                setOriginalKeyOrder(JSON.parse(JSON.stringify(initialOrder)));

                if (Array.isArray(data.extraLines)) {
                    setExtraLines(data.extraLines);
                    setOriginalExtraLines(JSON.parse(JSON.stringify(data.extraLines)));
                }
                if (data.lineOverrides && typeof data.lineOverrides === 'object') {
                    setLineOverrides(data.lineOverrides);
                    setOriginalLineOverrides(JSON.parse(JSON.stringify(data.lineOverrides)));
                }
                if (Array.isArray(data.deletedPreviewLines)) {
                    setDeletedPreviewLines(data.deletedPreviewLines);
                    setOriginalDeletedPreviewLines(JSON.parse(JSON.stringify(data.deletedPreviewLines)));
                }
            }
        } catch {
            setError("Veriler yüklenemedi");
        } finally {
            setLoading(false);
        }
    }, [buildKeyOrder]);

    useEffect(() => { fetchLabels(); }, [fetchLabels]);

    useEffect(() => {
        if (!loading) localStorage.setItem("optwin_active_script_lang", activeLang);
    }, [activeLang, loading]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (editingLineKey) setEditingLineKey(null);
                if (editingLineIdx !== null) setEditingLineIdx(null);
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [editingLineKey]);

    const strLabels = useMemo(() => JSON.stringify(labels), [labels]);
    const strOrigLabels = useMemo(() => JSON.stringify(originalLabels), [originalLabels]);
    
    // Compute changes boolean
    const hasChanges = useMemo(() => {
        return strLabels !== strOrigLabels || 
               JSON.stringify(keyOrder) !== JSON.stringify(originalKeyOrder) || 
               JSON.stringify(extraLines) !== JSON.stringify(originalExtraLines) || 
               JSON.stringify(lineOverrides) !== JSON.stringify(originalLineOverrides) || 
               JSON.stringify(deletedPreviewLines) !== JSON.stringify(originalDeletedPreviewLines);
    }, [strLabels, strOrigLabels, keyOrder, originalKeyOrder, extraLines, originalExtraLines, lineOverrides, originalLineOverrides, deletedPreviewLines, originalDeletedPreviewLines]);

    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => { if (hasChanges) e.preventDefault(); };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [hasChanges]);

    useEffect(() => {
        unsavedCtx.setHasUnsavedChanges(hasChanges);
        return () => unsavedCtx.setHasUnsavedChanges(false);
    }, [hasChanges, unsavedCtx]);

    const handleSave = useCallback(async () => {
        setSaving(true);
        setError("");
        try {
            const deletedKeysSet = new Set<string>();
            const changedLabels: { lang: string; key: string; value: string }[] = [];
            for (const langObj of languages) {
                const lang = langObj.code || langObj;
                const current = labels[lang] || {};
                const original = originalLabels[lang] || {};
                
                // Track additions and changes
                for (const key of Object.keys(current)) {
                    if (current[key] !== original[key]) {
                        changedLabels.push({ lang, key, value: current[key] });
                    }
                }
                
                // Track complete deletions
                for (const key of Object.keys(original)) {
                    if (current[key] === undefined) {
                        deletedKeysSet.add(key);
                    }
                }
            }
            
            const payload: Record<string, unknown> = {};
            if (changedLabels.length > 0) payload.labels = changedLabels;
            if (deletedKeysSet.size > 0) payload.deletedKeys = Array.from(deletedKeysSet);
            if (JSON.stringify(extraLines) !== JSON.stringify(originalExtraLines)) payload.extraLines = extraLines;
            if (JSON.stringify(lineOverrides) !== JSON.stringify(originalLineOverrides)) payload.lineOverrides = lineOverrides;
            if (JSON.stringify(deletedPreviewLines) !== JSON.stringify(originalDeletedPreviewLines)) payload.deletedPreviewLines = deletedPreviewLines;
            if (JSON.stringify(keyOrder) !== JSON.stringify(originalKeyOrder)) payload.keyOrder = keyOrder;

            if (Object.keys(payload).length > 0) {
                const res = await fetch("/api/admin/script-labels", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                const data = await res.json();
                if (!data.success) {
                    setError(data.error || "Kaydetme başarısız");
                    return;
                }
            }
            setOriginalLabels(JSON.parse(JSON.stringify(labels)));
            setOriginalKeyOrder(JSON.parse(JSON.stringify(keyOrder)));
            setOriginalExtraLines(JSON.parse(JSON.stringify(extraLines)));
            setOriginalLineOverrides(JSON.parse(JSON.stringify(lineOverrides)));
            setOriginalDeletedPreviewLines(JSON.parse(JSON.stringify(deletedPreviewLines)));
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch {
            setError("Değişiklikler kaydedilemedi");
        } finally {
            setSaving(false);
        }
    }, [labels, originalLabels, languages, extraLines, originalExtraLines, lineOverrides, originalLineOverrides, deletedPreviewLines, originalDeletedPreviewLines, keyOrder, originalKeyOrder]);

    const handleCancel = useCallback(() => {
        setLabels(JSON.parse(JSON.stringify(originalLabels)));
        setKeyOrder(JSON.parse(JSON.stringify(originalKeyOrder)));
        setExtraLines(JSON.parse(JSON.stringify(originalExtraLines)));
        setLineOverrides(JSON.parse(JSON.stringify(originalLineOverrides)));
        setDeletedPreviewLines(JSON.parse(JSON.stringify(originalDeletedPreviewLines)));
        setEditingLineKey(null);
    }, [originalLabels, originalKeyOrder, originalExtraLines, originalLineOverrides, originalDeletedPreviewLines]);

    unsavedCtx.onSave.current = handleSave;
    unsavedCtx.onDiscard.current = handleCancel;

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (hasChanges) handleSave();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [hasChanges, handleSave]);

    const currentLabels = labels[activeLang] || {};

    const handleValueChange = (key: string, value: string) => {
        setLabels(prev => ({
            ...prev,
            [activeLang]: { ...prev[activeLang], [key]: value },
        }));
    };

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
        if (!newKey || !newKey.trim()) return;
        const key = newKey.trim();
        
        // Validation: Prevent duplicate keys
        if (Object.keys(currentLabels).includes(key)) {
            setError(`"${key}" anahtarı zaten mevcut.`);
            setTimeout(() => setError(""), 3000);
            return;
        }

        setLabels(prev => {
            const updated = { ...prev };
            for (const langObj of languages) {
                const lang = langObj.code || langObj;
                updated[lang] = { ...updated[lang], [key]: lang === activeLang ? newValue : "" };
            }
            return updated;
        });
        setKeyOrder(prev => {
            const maxOrder = Math.max(0, ...Object.values(prev));
            return { ...prev, [key]: maxOrder + 1 };
        });
        setNewKey("");
        setNewValue("");
        setShowNewRow(false);
        setSuggestions([]);
    };

    const handleRenameKey = (oldKey: string, newKeyName: string) => {
        if (!newKeyName || !newKeyName.trim() || newKeyName === oldKey) return;
        const nk = newKeyName.trim();
        
        // Validation: Prevent renaming to an existing key
        if (Object.keys(currentLabels).includes(nk)) {
            setError(`"${nk}" anahtarı zaten mevcut.`);
            setTimeout(() => setError(""), 3000);
            return;
        }

        setLabels(prev => {
            const updated = { ...prev };
            for (const langObj of languages) {
                const lang = langObj.code || langObj;
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
    };

    const handleMoveUp = (key: string) => {
        const idx = keys.indexOf(key);
        if (idx <= 0) return;
        const prevKey = keys[idx - 1];
        setKeyOrder(prev => {
            const next = { ...prev };
            const tmp = next[key];
            next[key] = next[prevKey];
            next[prevKey] = tmp;
            return next;
        });
    };

    const handleMoveDown = (key: string) => {
        const idx = keys.indexOf(key);
        if (idx === -1 || idx >= keys.length - 1) return;
        const nextKey = keys[idx + 1];
        setKeyOrder(prev => {
            const next = { ...prev };
            const tmp = next[key];
            next[key] = next[nextKey];
            next[nextKey] = tmp;
            return next;
        });
    };

    const handleDeleteKey = async (key: string) => {
        setLabels(prev => {
            const updated = { ...prev };
            for (const langObj of languages) {
                const lang = langObj.code || langObj;
                const copy = { ...updated[lang] };
                delete copy[key];
                updated[lang] = copy;
            }
            return updated;
        });
        setKeyOrder(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    };

    const keys = Object.keys(currentLabels).sort((a, b) => {
        const aOrd = keyOrder[a] ?? 9999;
        const bOrd = keyOrder[b] ?? 9999;
        return aOrd - bOrd;
    });

    const resolvePlaceholders = useCallback((text: string, labelsMap: Record<string, string>): string => {
        return text.replace(/<([a-zA-Z_][a-zA-Z0-9_]*)>/g, (match, key) => {
            return labelsMap[key] !== undefined ? labelsMap[key] : match;
        });
    }, []);

    const previewLines = useMemo<PreviewLine[]>(() => {
        const L = currentLabels;
        const ps = (key: string) => toPowerShellSafe(resolvePlaceholders(L[key] || "", L));
        const S = (text: string): PreviewLine => ({ text, key: null, editable: true });
        const K = (text: string, key: string, valueKey?: string): PreviewLine => ({ text, key, valueKey, editable: true });

        const activeLanguageObj = languages.find(l => l.code === activeLang);
        const offset = activeLanguageObj?.utcOffset ?? 0;
        const offsetStr = offset >= 0 ? `+${offset}` : `${offset}`;
        
        const now = new Date();
        const targetDate = new Date(now.getTime() + offset * 3600000);
        const formattedDate = targetDate.toLocaleString("tr-TR", { timeZone: "UTC" }).replace(',', '');
        const dateStr = `${formattedDate} (UTC${offsetStr})`;

        const ghShort = (ps("githubUrl") || "github.com/ahmetlygh/optwin").replace("https://", "");

        return [
            S("#"),
            K(`#    ${ps("scriptTitle")}`, "scriptTitle"),
            K(`#    ${ps("version")}   : ${ps("versionNumber")}`, "version", "versionNumber"),
            K(`#    ${ps("date")}      : ${dateStr}`, "date"),
            K(`#    ${ps("developer")} : ${ps("developerName")}`, "developer", "developerName"),
            K(`#    ${ps("website")}   : ${ps("websiteUrl")}`, "website", "websiteUrl"),
            K(`#    GitHub    : ${ps("githubUrl")}`, "githubUrl"),
            K(`#    ${ps("openSource")}`, "openSource"),
            S("#"),
            S(""),
            S('$host.UI.RawUI.WindowTitle = "OptWin Optimizer Script"'),
            S(""),
            S("Clear-Host"),
            S('Write-Host ""'),
            S('Write-Host "  ================================================================" -ForegroundColor Magenta'),
            S('Write-Host "" -ForegroundColor Magenta'),
            S('Write-Host "       OOOO  PPPP  TTTTT W   W  III  N   N" -ForegroundColor Cyan'),
            S('Write-Host "      O    O P   P   T   W   W   I   NN  N" -ForegroundColor Cyan'),
            S('Write-Host "      O    O PPPP    T   W W W   I   N N N" -ForegroundColor Cyan'),
            S('Write-Host "      O    O P       T   WW WW   I   N  NN" -ForegroundColor Cyan'),
            S('Write-Host "       OOOO  P       T    W W   III  N   N" -ForegroundColor Cyan'),
            S('Write-Host "" -ForegroundColor Magenta'),
            S('Write-Host "  ================================================================" -ForegroundColor Magenta'),
            K(`Write-Host "    ${ps("bannerTitle")}" -ForegroundColor White`, "bannerTitle"),
            S('Write-Host "  ----------------------------------------------------------------" -ForegroundColor DarkGray'),
            K(`Write-Host "    ${ps("version")}   : ${ps("versionNumber")}" -ForegroundColor Gray`, "version", "versionNumber"),
            S(`Write-Host "    ${ps("date")}      : ${dateStr}" -ForegroundColor Gray`),
            S('Write-Host "  ----------------------------------------------------------------" -ForegroundColor DarkGray'),
            K(`Write-Host "    ${ps("openSourceShort")}" -ForegroundColor DarkGray`, "openSourceShort"),
            S(`Write-Host "    GitHub: ${ghShort}" -ForegroundColor DarkGray`),
            S('Write-Host "  ================================================================" -ForegroundColor Magenta'),
            S('Write-Host ""'),
            S(""),
            K(`Write-Host "  [*] ${ps("restorePoint")}" -ForegroundColor Cyan`, "restorePoint"),
            S("try {"),
            S('    Enable-ComputerRestore -Drive "C:\\" -ErrorAction Stop'),
            S('    Checkpoint-Computer -Description "OptWin Optimization" -RestorePointType "MODIFY_SETTINGS" -ErrorAction Stop -WarningAction Stop'),
            K(`    Write-Host "      ${ps("restoreSuccess")}" -ForegroundColor Green`, "restoreSuccess"),
            S("} catch {"),
            K(`    Write-Host "      ${ps("restoreFail")}: $($_.Exception.Message)" -ForegroundColor Red`, "restoreFail"),
            S("}"),
            S('Write-Host ""'),
            S(""),
            S("# --- Optimizations ---"),
            S('Write-Host "  Example Feature is being applied..." -ForegroundColor Cyan'),
            S("# ... PowerShell commands ..."),
            K(`Write-Host "      ${ps("done")}" -ForegroundColor Green`, "done"),
            S('Write-Host ""'),
            S(""),
            S('Write-Host ""'),
            S('Write-Host "  ========================================" -ForegroundColor Green'),
            K(`Write-Host "       ${ps("complete")}" -ForegroundColor Green`, "complete"),
            K(`Write-Host "       ${ps("success")}" -ForegroundColor Green`, "success"),
            S('Write-Host "  ========================================" -ForegroundColor Green'),
            S('Write-Host ""'),
            K(`Write-Host "  ${ps("thankYou")}" -ForegroundColor Cyan`, "thankYou"),
            K(`Write-Host "  ${ps("author")}" -ForegroundColor Gray`, "author"),
            S('Write-Host ""'),
            K(`Write-Host "  ${ps("pressAnyKey")}" -ForegroundColor Gray`, "pressAnyKey"),
        ];
    }, [currentLabels, resolvePlaceholders, languages, activeLang]);

    const getDisplayText = (line: PreviewLine, idx: number) =>
        !line.key && lineOverrides[idx] !== undefined ? lineOverrides[idx] : line.text;

    const resolveDisplay = (text: string) =>
        text.replace(/<([a-zA-Z_][a-zA-Z0-9_]*)>/g, (match, key) =>
            currentLabels[key] !== undefined ? toPowerShellSafe(currentLabels[key]) : match
        );

    const mergedItems = useMemo<any[]>(() => {
        const items: any[] = previewLines
            .map((line, i) => ({ type: 'preview' as const, line, previewIdx: i }))
            .filter(item => !deletedPreviewLines.includes(item.previewIdx));
        
        const sorted = extraLines
            .map((e, i) => ({ ...e, extraIdx: i }))
            .sort((a, b) => b.pos - a.pos);
        for (const extra of sorted) {
            const insertAt = Math.max(0, Math.min(extra.pos - 1, items.length));
            items.splice(insertAt, 0, { type: 'extra', extraIdx: extra.extraIdx, text: extra.text, pos: extra.pos });
        }
        return items;
    }, [previewLines, extraLines, deletedPreviewLines]);

    const handleDownloadPreview = () => {
        const allDisplayLines = mergedItems.map(item =>
            item.type === 'preview' ? getDisplayText(item.line, item.previewIdx) : resolveDisplay(item.text)
        );
        const previewText = allDisplayLines.join("\n");
        const bat = `@echo off\r\nchcp 65001 >nul 2>&1\r\ntitle OptWin Optimizer Preview\r\ncd /d "%~dp0"\r\nnet session >nul 2>&1\r\nif %errorlevel% equ 0 goto :OPTWIN_ADMIN\r\npowershell.exe -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"\r\nexit /b\r\n:OPTWIN_ADMIN\r\nset "T=%TEMP%\\optwin_%RANDOM%.ps1"\r\npowershell -NoP -Ep Bypass -C "$f='%~f0';$c=[IO.File]::ReadAllText($f);$m='REM === OPTWIN'+' PS ===';$i=$c.IndexOf($m);if($i-ge0){$u=New-Object Text.UTF8Encoding($false);[IO.File]::WriteAllText($env:T,$c.Substring($i+$m.Length),$u)}"\r\npowershell.exe -NoProfile -ExecutionPolicy Bypass -File "%T%"\r\ndel /f /q "%T%" >nul 2>&1\r\nexit /b\r\nREM === OPTWIN PS ===\r\n${previewText.split('\n').join('\r\n')}\r\n\r\n$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")\r\nexit`;
        
        const blob = new Blob([bat], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const now = new Date();
        const ts = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`;
        a.download = `OptWin-Pv-${activeLang.toUpperCase()}_${ts}.bat`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader />
            </div>
        );
    }

    const activeLanguageObj = languages.find(l => l.code === activeLang);

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="h-[calc(100vh-100px)] flex flex-col pt-2"
        >
            <AdminActionBar show={hasChanges} saving={saving} saved={saved} onSave={handleSave} onCancel={handleCancel} />

            {/* Header matches Languages UI */}
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }} className="w-full bg-white/2 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6 shadow-[0_4px_30px_rgba(0,0,0,0.1)] shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <FileCode2 size={18} className="text-emerald-400" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-lg font-black text-white uppercase tracking-tight leading-tight">Script Ayarları</h1>
                        <div className="flex items-center gap-3 mt-0.5">
                            <div className="flex items-center gap-1.5">
                                {activeLanguageObj?.flagSvg && <FlagIcon flagSvg={activeLanguageObj.flagSvg} size="sm" />}
                                <span className="text-[9px] font-mono text-[#6b5be6] bg-[#6b5be6]/10 px-1.5 py-0.5 rounded uppercase tracking-wider">{activeLang}</span>
                                {activeLanguageObj?.turkishName && (
                                    <span className="text-[9px] text-white/20 font-bold uppercase tracking-[0.15em]">{activeLanguageObj.turkishName}</span>
                                )}
                            </div>
                            <div className="h-3 w-px bg-white/10" />
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Durum:</span>
                                <span className={`text-[10px] font-black tracking-wider ${totalMissingForActive === 0 ? "text-emerald-400" : "text-amber-400"}`}>
                                    %{Math.round(((keys.length - totalMissingForActive) / keys.length) * 100) || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 w-full lg:w-auto flex-wrap">
                    {badgeMounted && (
                        <div className={`relative z-100 flex items-center shrink-0 ${badgeClass}`} style={{ willChange: 'transform, opacity' }}>
                            <button
                                onClick={() => setShowMissingModal(true)}
                                className="flex items-center gap-2 px-4 py-2.5 mr-2 bg-linear-to-r from-red-500/10 to-amber-500/10 backdrop-blur-xl border border-amber-500/30 text-amber-400 hover:from-red-500/20 hover:to-amber-500/15 hover:border-amber-400/50 transition-all duration-300 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] active:scale-95 shadow-[0_4px_20px_rgba(245,158,11,0.12)] whitespace-nowrap relative overflow-hidden cursor-pointer"
                            >
                                <span className="absolute inset-0 bg-linear-to-r from-transparent via-amber-300/10 to-transparent missing-badge-shine pointer-events-none" />
                                <div className="w-6 h-6 rounded-lg bg-amber-500/15 flex items-center justify-center border border-amber-500/25 shrink-0">
                                    <Languages size={13} className="text-amber-400" />
                                </div>
                                <span>AI-ÇEVİRİ</span>
                                <span className="flex items-center justify-center min-w-[20px] h-[20px] px-1 rounded-md bg-amber-500/25 text-[10px] font-black text-amber-300 border border-amber-500/30">
                                    {totalMissingForActive}
                                </span>
                            </button>
                            <button
                                onClick={() => labelsTableRef.current?.jumpToNextMissing?.()}
                                className="flex items-center justify-center p-2.5 mr-2 bg-white/4 backdrop-blur-md hover:bg-amber-500/10 text-white/40 hover:text-amber-400 border border-white/10 hover:border-amber-500/40 hover:shadow-[0_0_15px_rgba(245,158,11,0.15)] rounded-xl transition-all duration-300 active:scale-95 cursor-pointer"
                                title="Sonraki Eksikliğe Git"
                            >
                                <Navigation2 size={16} />
                            </button>
                        </div>
                    )}
                    
                    {activeLang !== "en" && (
                        <button
                            onClick={handleFillEnglish}
                            className="flex items-center gap-2 px-6 py-3 bg-white/4 backdrop-blur-md hover:bg-indigo-500/20 border border-white/10 hover:border-indigo-500/50 text-white/50 hover:text-indigo-400 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 active:scale-95 shrink-0 cursor-pointer"
                            title="CMD karakter desteği olmayan diller için İngilizceyi uygular"
                        >
                            VARSAYILAN DİLİ KULLAN
                        </button>
                    )}
                    <label className="flex items-center gap-2.5 h-[42px] px-6 bg-white/4 backdrop-blur-md hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/40 text-white/50 hover:text-emerald-400 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer active:scale-95 shrink-0">
                        <FileUp size={15} className="text-white/40 group-hover:text-amber-400 transition-colors" /><span className="font-black hidden xl:inline">İÇE AKTAR</span>
                        <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                    </label>
                    <button
                        onClick={() => {
                            const exportJson = JSON.stringify(labels[activeLang] || {}, null, 2);
                            const blob = new Blob([exportJson], { type: "application/json" });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url; a.download = `optwin_scripts_${activeLang}.json`; a.click();
                            URL.revokeObjectURL(url);
                        }}
                        className="flex items-center gap-2.5 h-[42px] px-6 bg-white/4 backdrop-blur-md hover:bg-orange-500/15 border border-white/10 hover:border-orange-500/40 text-white/50 hover:text-orange-400 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer active:scale-95 shrink-0"
                    >
                        <FileDown size={15} className="text-white/40 group-hover:text-emerald-400 transition-colors" /><span className="font-black hidden xl:inline">DIŞA AKTAR</span>
                    </button>
                    <button
                        onClick={handleDownloadPreview}
                        className="flex items-center gap-2.5 h-[42px] px-6 bg-white/4 hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/40 text-white/50 hover:text-emerald-400 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer shrink-0"
                    >
                        <Download size={15} className="text-white/40" /><span className="font-black hidden xl:inline">ÖNİZLEME</span>
                    </button>
                    <AdminLangPicker value={activeLang} onChange={setActiveLang} availableLangs={languages.map(l => l.code)} />
                </div>
            </motion.div>

            {/* Layout */}
            <div className="flex-1 min-h-0 pb-4">
                
                {/* Main Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-[calc(100vh-230px)] min-h-0">
                    {/* Left: Table */}
                    <div className="flex flex-col h-full min-h-0">
                        <LabelsTable 
                            ref={labelsTableRef}
                            keys={keys}
                            currentLabels={currentLabels}
                            originalLabels={originalLabels}
                            activeLang={activeLang}
                            showNewRow={showNewRow}
                            setShowNewRow={setShowNewRow}
                            newKey={newKey}
                            setNewKey={setNewKey}
                            newValue={newValue}
                            setNewValue={setNewValue}
                            suggestions={suggestions}
                            handleSelectSuggestion={handleSelectSuggestion}
                            handleNewKeyChange={handleNewKeyChange}
                            handleAddRow={handleAddRow}
                            handleRenameKey={handleRenameKey}
                            handleValueChange={handleValueChange}
                            setDeleteConfirmKey={setDeleteConfirmKey}
                            handleMoveUp={handleMoveUp}
                            handleMoveDown={handleMoveDown}
                        />
                    </div>
                    {/* Right: Terminal */}
                    <div className="flex flex-col h-full min-h-0">
                        <TerminalPreview 
                            mergedItems={mergedItems}
                            activeLang={activeLang}
                            lineOverrides={lineOverrides}
                            setLineOverrides={setLineOverrides}
                            deletedPreviewLines={deletedPreviewLines}
                            setDeletedPreviewLines={setDeletedPreviewLines}
                            currentLabels={currentLabels}
                            handleValueChange={handleValueChange}
                            editingLineIdx={editingLineIdx}
                            setEditingLineIdx={setEditingLineIdx}
                            editingLineKey={editingLineKey}
                            setEditingLineKey={setEditingLineKey}
                            extraLines={extraLines}
                            setExtraLines={setExtraLines}
                            resolveDisplay={resolveDisplay}
                            getDisplayText={getDisplayText}
                        />
                    </div>
                </div>
            </div>

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

            <MissingTranslationsModal 
                open={showMissingModal}
                onClose={() => setShowMissingModal(false)}
                missingTranslations={missingTranslations}
                translateProgress={translateProgress}
                translatingMissing={translatingMissing}
                onTranslateLang={handleTranslateMissingLang}
                onTranslateAll={handleTranslateAllMissing}
            />
        </motion.div>
    );
}
