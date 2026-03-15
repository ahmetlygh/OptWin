"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
} from "lucide-react";

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

const LANG_NAMES: Record<string, string> = {
    en: "English",
    tr: "Türkçe",
    zh: "中文",
    es: "Español",
    hi: "हिन्दी",
    de: "Deutsch",
    fr: "Français",
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
        // Also delete from DB for all languages
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
            className="space-y-6 max-w-5xl"
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

                {/* Save / Cancel */}
                <div className="flex items-center gap-2">
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
                                {saving ? "Kaydediliyor..." : saved ? "Kaydedildi!" : "Değişiklikleri Kaydet"}
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

            {/* Language Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.02] border border-white/[0.04] overflow-x-auto">
                {languages.map(lang => (
                    <button
                        key={lang}
                        onClick={() => setActiveLang(lang)}
                        className={`relative px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 shrink-0 ${
                            activeLang === lang
                                ? "text-white"
                                : "text-white/25 hover:text-white/50"
                        }`}
                    >
                        {activeLang === lang && (
                            <motion.div
                                layoutId="langTab"
                                className="absolute inset-0 rounded-lg bg-[#6b5be6]/15 border border-[#6b5be6]/20"
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10">
                            {lang.toUpperCase()} {LANG_NAMES[lang] ? `\u2014 ${LANG_NAMES[lang]}` : ""}
                        </span>
                    </button>
                ))}
            </div>

            {/* Labels Table */}
            <div className="rounded-2xl border border-white/[0.04] bg-white/[0.015] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/[0.04]">
                                <th className="text-left px-5 py-3 text-[10px] font-bold text-white/20 uppercase tracking-wider w-[200px]">Anahtar</th>
                                <th className="text-left px-5 py-3 text-[10px] font-bold text-white/20 uppercase tracking-wider">Değer</th>
                                <th className="w-12" />
                            </tr>
                        </thead>
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
                                        transition={{ delay: i * 0.015 }}
                                        className={`border-b border-white/[0.03] hover:bg-white/[0.015] transition-colors ${changed ? "bg-[#6b5be6]/[0.03]" : ""}`}
                                    >
                                        <td className="px-5 py-3 align-top">
                                            <p className="text-xs font-mono font-bold text-white/50">{key}</p>
                                            {LABEL_DESCRIPTIONS[key] && (
                                                <p className="text-[10px] text-white/15 mt-0.5">{LABEL_DESCRIPTIONS[key]}</p>
                                            )}
                                        </td>
                                        <td className="px-5 py-2">
                                            <textarea
                                                value={current || ""}
                                                onChange={e => handleValueChange(key, e.target.value)}
                                                rows={1}
                                                className="w-full bg-transparent border border-transparent hover:border-white/[0.06] focus:border-[#6b5be6]/30 rounded-lg px-3 py-2 text-sm text-white/80 placeholder-white/15 focus:outline-none transition-all resize-none"
                                                style={{ minHeight: "36px" }}
                                                onInput={(e) => {
                                                    const t = e.target as HTMLTextAreaElement;
                                                    t.style.height = "auto";
                                                    t.style.height = t.scrollHeight + "px";
                                                }}
                                            />
                                        </td>
                                        <td className="px-2 py-2">
                                            {!Object.keys(LABEL_DESCRIPTIONS).includes(key) && (
                                                <button
                                                    onClick={() => handleDeleteKey(key)}
                                                    className="size-7 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-white/10 hover:text-red-400 transition-all"
                                                    title="Anahtarı sil"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            )}
                                        </td>
                                    </motion.tr>
                                );
                            })}

                            {/* Add new row */}
                            {showNewRow && (
                                <tr className="border-b border-white/[0.03] bg-[#6b5be6]/[0.02]">
                                    <td className="px-5 py-2">
                                        <input
                                            ref={newKeyRef}
                                            value={newKey}
                                            onChange={e => setNewKey(e.target.value)}
                                            placeholder="yeniAnahtar"
                                            className="w-full bg-transparent border border-white/[0.06] focus:border-[#6b5be6]/30 rounded-lg px-3 py-2 text-sm font-mono text-white/80 placeholder-white/15 focus:outline-none"
                                        />
                                    </td>
                                    <td className="px-5 py-2">
                                        <input
                                            value={newValue}
                                            onChange={e => setNewValue(e.target.value)}
                                            placeholder="Bu anahtar için değer..."
                                            className="w-full bg-transparent border border-white/[0.06] focus:border-[#6b5be6]/30 rounded-lg px-3 py-2 text-sm text-white/80 placeholder-white/15 focus:outline-none"
                                            onKeyDown={e => e.key === "Enter" && handleAddRow()}
                                        />
                                    </td>
                                    <td className="px-2 py-2">
                                        <button
                                            onClick={handleAddRow}
                                            className="size-7 flex items-center justify-center rounded-lg bg-[#6b5be6]/15 text-[#6b5be6] hover:bg-[#6b5be6]/25 transition-all"
                                        >
                                            <Check size={13} />
                                        </button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Add Row Button */}
                <div className="px-5 py-3 border-t border-white/[0.03]">
                    <button
                        onClick={() => {
                            setShowNewRow(true);
                            setTimeout(() => newKeyRef.current?.focus(), 100);
                        }}
                        className="flex items-center gap-2 text-xs font-medium text-white/20 hover:text-white/50 transition-colors"
                    >
                        <Plus size={14} />
                        Yeni etiket ekle
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
