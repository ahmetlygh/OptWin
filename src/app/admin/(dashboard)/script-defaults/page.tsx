"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { AdminLangPicker } from "@/components/admin/AdminLangPicker";

type LabelsMap = Record<string, Record<string, string>>;

const LABEL_DESCRIPTIONS: Record<string, string> = {
    scriptTitle: "Script başlığı (header yorumunda görünür)",
    version: "Versiyon alanı etiketi",
    date: "Tarih alanı etiketi",
    developer: "Geliştirici alanı etiketi",
    website: "Website alanı etiketi",
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
    githubUrl: "Script başlığında kullanılan GitHub URL'i",
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
    const [showPreview, setShowPreview] = useState(false);
    const [editingPreviewKey, setEditingPreviewKey] = useState<string | null>(null);
    const newKeyRef = useRef<HTMLInputElement>(null);

    const fetchLabels = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/script-labels");
            const data = await res.json();
            if (data.success) {
                setLabels(JSON.parse(JSON.stringify(data.labels)));
                setOriginalLabels(JSON.parse(JSON.stringify(data.labels)));
                setLanguages(data.languages);
            }
        } catch {
            setError("Script etiketleri yüklenemedi");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchLabels(); }, [fetchLabels]);

    const hasChanges = JSON.stringify(labels) !== JSON.stringify(originalLabels);

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

    const currentLabels = labels[activeLang] || {};
    const keys = Object.keys(currentLabels).sort((a, b) => {
        const aIdx = Object.keys(LABEL_DESCRIPTIONS).indexOf(a);
        const bIdx = Object.keys(LABEL_DESCRIPTIONS).indexOf(b);
        if (aIdx === -1 && bIdx === -1) return a.localeCompare(b);
        if (aIdx === -1) return 1;
        if (bIdx === -1) return -1;
        return aIdx - bIdx;
    });

    // Generate terminal preview script
    const previewScript = useMemo(() => {
        const L = currentLabels;
        const today = new Date().toISOString().split("T")[0];
        const lines: string[] = [
            `# ============================================`,
            `# ${L.scriptTitle || "OptWin - Windows System Optimizer"}`,
            `# ${L.version || "Version"}: 1.3`,
            `# ${L.date || "Date"}: ${today}`,
            `# ${L.developer || "Developer"}: ${L.developerName || "OptWin"}`,
            `# ${L.website || "Website"}: ${L.websiteUrl || "https://optwin.tech"}`,
            `# ${L.openSource || "Open Source"}`,
            `# ============================================`,
            ``,
            `Write-Host ""`,
            `Write-Host "  ╔══════════════════════════════════════╗" -ForegroundColor Cyan`,
            `Write-Host "  ║  ${(L.bannerTitle || "OPTWIN").padEnd(36)}║" -ForegroundColor Cyan`,
            `Write-Host "  ║  ${(L.openSourceShort || "Open Source Optimizer").padEnd(36)}║" -ForegroundColor DarkCyan`,
            `Write-Host "  ╚══════════════════════════════════════╝" -ForegroundColor Cyan`,
            `Write-Host ""`,
            ``,
            `# ${L.adminRequest || "Requesting admin privileges..."}`,
            `# ${L.adminPrompt || "Please click Yes on the UAC prompt"}`,
            ``,
            `Write-Host "[*] ${L.restorePoint || "Creating restore point..."}" -ForegroundColor Yellow`,
            `Write-Host "[+] ${L.restoreSuccess || "Restore point created"}" -ForegroundColor Green`,
            ``,
            `# --- Optimizations ---`,
            `Write-Host "[*] Example Feature islemi yapiliyor..." -ForegroundColor White`,
            `Write-Host "  [${L.done || "DONE"}]" -ForegroundColor Green`,
            ``,
            `Write-Host ""`,
            `Write-Host "  ╔══════════════════════════════════════╗" -ForegroundColor Green`,
            `Write-Host "  ║  ${(L.complete || "Optimization Complete!").padEnd(36)}║" -ForegroundColor Green`,
            `Write-Host "  ╚══════════════════════════════════════╝" -ForegroundColor Green`,
            `Write-Host ""`,
            `Write-Host "${L.success || "Please restart your computer."}" -ForegroundColor Yellow`,
            `Write-Host "${L.thankYou || "Thank you for using OptWin!"}" -ForegroundColor Cyan`,
            `Write-Host "${L.author || "by OptWin Team"}" -ForegroundColor DarkGray`,
            `Write-Host ""`,
            `Write-Host "${L.pressAnyKey || "Press any key to exit..."}" -ForegroundColor Gray`,
            `$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")`,
        ];
        return lines.join("\n");
    }, [currentLabels]);

    const handleDownloadPreview = () => {
        const blob = new Blob([previewScript], { type: "text/plain;charset=utf-8" });
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
                        <p className="text-xs text-white/30 mt-0.5">
                            Oluşturulan PowerShell scriptlerinde görünen varsayılan metinleri düzenleyin
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <AdminLangPicker value={activeLang} onChange={setActiveLang} availableLangs={languages} />

                    {hasChanges && (
                        <motion.div
                            initial={{ opacity: 0, x: 8 }}
                            animate={{ opacity: 1, x: 0 }}
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
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/[0.06] border border-red-500/10 text-red-400 text-sm">
                    <AlertCircle size={14} />
                    {error}
                </div>
            )}

            {/* Two-column layout: Table + Preview */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {/* Labels Table */}
                <div className="rounded-2xl border border-white/[0.04] bg-white/[0.015] overflow-hidden">
                    <div className="px-5 py-3 border-b border-white/[0.04] flex items-center justify-between">
                        <h3 className="text-[11px] font-bold text-white/25 uppercase tracking-wider">Anahtar — Değer</h3>
                    </div>
                    <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-sm">
                            <tbody>
                                {keys.map((key, i) => {
                                    const original = originalLabels[activeLang]?.[key];
                                    const current = currentLabels[key];
                                    const changed = original !== undefined && original !== current;

                                    return (
                                        <motion.tr
                                            key={key}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.01 }}
                                            className={`border-b border-white/[0.03] hover:bg-white/[0.015] transition-colors ${changed ? "bg-[#6b5be6]/[0.03]" : ""}`}
                                        >
                                            <td className="px-4 py-2.5 align-top w-[160px]">
                                                <p className="text-[11px] font-mono font-bold text-white/50">{key}</p>
                                                {LABEL_DESCRIPTIONS[key] && (
                                                    <p className="text-[9px] text-white/15 mt-0.5 leading-tight">{LABEL_DESCRIPTIONS[key]}</p>
                                                )}
                                            </td>
                                            <td className="px-3 py-1.5">
                                                <textarea
                                                    value={current || ""}
                                                    onChange={e => handleValueChange(key, e.target.value)}
                                                    rows={1}
                                                    className="w-full bg-transparent border border-transparent hover:border-white/[0.06] focus:border-[#6b5be6]/30 rounded-lg px-2.5 py-1.5 text-[13px] text-white/80 placeholder-white/15 focus:outline-none transition-all resize-none"
                                                    style={{ minHeight: "32px" }}
                                                    onInput={(e) => {
                                                        const t = e.target as HTMLTextAreaElement;
                                                        t.style.height = "auto";
                                                        t.style.height = t.scrollHeight + "px";
                                                    }}
                                                />
                                            </td>
                                            <td className="px-1 py-1.5 w-8">
                                                {!Object.keys(LABEL_DESCRIPTIONS).includes(key) && (
                                                    <button
                                                        onClick={() => handleDeleteKey(key)}
                                                        className="size-6 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-white/10 hover:text-red-400 transition-all"
                                                        title="Anahtarı sil"
                                                    >
                                                        <Trash2 size={11} />
                                                    </button>
                                                )}
                                            </td>
                                        </motion.tr>
                                    );
                                })}

                                {showNewRow && (
                                    <tr className="border-b border-white/[0.03] bg-[#6b5be6]/[0.02]">
                                        <td className="px-4 py-2">
                                            <input
                                                ref={newKeyRef}
                                                value={newKey}
                                                onChange={e => setNewKey(e.target.value)}
                                                placeholder="yeniAnahtar"
                                                className="w-full bg-transparent border border-white/[0.06] focus:border-[#6b5be6]/30 rounded-lg px-2.5 py-1.5 text-[13px] font-mono text-white/80 placeholder-white/15 focus:outline-none"
                                            />
                                        </td>
                                        <td className="px-3 py-2">
                                            <input
                                                value={newValue}
                                                onChange={e => setNewValue(e.target.value)}
                                                placeholder="Değer..."
                                                className="w-full bg-transparent border border-white/[0.06] focus:border-[#6b5be6]/30 rounded-lg px-2.5 py-1.5 text-[13px] text-white/80 placeholder-white/15 focus:outline-none"
                                                onKeyDown={e => e.key === "Enter" && handleAddRow()}
                                            />
                                        </td>
                                        <td className="px-1 py-2">
                                            <button
                                                onClick={handleAddRow}
                                                className="size-6 flex items-center justify-center rounded-lg bg-[#6b5be6]/15 text-[#6b5be6] hover:bg-[#6b5be6]/25 transition-all"
                                            >
                                                <Check size={11} />
                                            </button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-4 py-2.5 border-t border-white/[0.03]">
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
                <div className="rounded-2xl border border-white/[0.04] bg-white/[0.015] overflow-hidden flex flex-col">
                    <div className="px-5 py-3 border-b border-white/[0.04] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MonitorPlay size={13} className="text-emerald-400" />
                            <h3 className="text-[11px] font-bold text-white/25 uppercase tracking-wider">Terminal Önizleme</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowPreview(!showPreview)}
                                className={`h-7 px-3 rounded-lg text-[10px] font-bold transition-all border flex items-center gap-1.5 ${
                                    showPreview
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/15"
                                        : "bg-white/[0.03] text-white/30 border-white/[0.04] hover:text-white/50"
                                }`}
                            >
                                <Pencil size={10} />
                                {showPreview ? "Düzenleniyor" : "Düzenle"}
                            </button>
                            <button
                                onClick={handleDownloadPreview}
                                className="h-7 px-3 rounded-lg text-[10px] font-bold bg-[#6b5be6]/10 text-[#6b5be6] hover:bg-[#6b5be6]/20 border border-[#6b5be6]/15 transition-all flex items-center gap-1.5"
                            >
                                <Download size={10} />
                                İndir
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 bg-[#0a0a0f] overflow-auto max-h-[600px] custom-scrollbar">
                        {showPreview ? (
                            <div className="p-4 space-y-0.5">
                                {previewScript.split("\n").map((line, idx) => {
                                    // Find which label key this line corresponds to
                                    const matchedKey = Object.entries(currentLabels).find(([, val]) =>
                                        val && line.includes(val) && val.length > 3
                                    );
                                    const labelKey = matchedKey?.[0] || null;

                                    if (editingPreviewKey === labelKey && labelKey) {
                                        return (
                                            <div key={idx} className="flex items-center gap-1">
                                                <span className="text-white/15 text-[10px] font-mono w-6 text-right shrink-0">{idx + 1}</span>
                                                <input
                                                    autoFocus
                                                    value={currentLabels[labelKey] || ""}
                                                    onChange={e => handleValueChange(labelKey, e.target.value)}
                                                    onBlur={() => setEditingPreviewKey(null)}
                                                    onKeyDown={e => e.key === "Enter" && setEditingPreviewKey(null)}
                                                    className="flex-1 bg-[#6b5be6]/10 border border-[#6b5be6]/30 rounded px-2 py-0.5 text-[12px] font-mono text-purple-300 focus:outline-none"
                                                />
                                            </div>
                                        );
                                    }

                                    return (
                                        <div
                                            key={idx}
                                            className={`flex items-start gap-1 group ${labelKey ? "cursor-pointer hover:bg-white/[0.03] rounded" : ""}`}
                                            onClick={() => labelKey && setEditingPreviewKey(labelKey)}
                                        >
                                            <span className="text-white/15 text-[10px] font-mono w-6 text-right shrink-0 pt-px">{idx + 1}</span>
                                            <code className={`text-[12px] font-mono whitespace-pre ${
                                                line.startsWith("#") ? "text-emerald-400/60" :
                                                line.includes("Write-Host") ? "text-purple-300" :
                                                line.includes("-ForegroundColor") ? "text-cyan-300/70" :
                                                "text-white/40"
                                            }`}>
                                                {line}
                                            </code>
                                            {labelKey && (
                                                <Pencil size={9} className="text-white/0 group-hover:text-white/30 transition-colors mt-1 shrink-0" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <pre className="p-4 m-0">
                                <code className="text-purple-300 font-mono text-[12px] whitespace-pre leading-relaxed">{previewScript}</code>
                            </pre>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
