"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Settings as SettingsIcon,
    Globe,
    Github,
    Coffee,
    Mail,
    User,
    Palette,
    Trash2,
    AlertTriangle,
    ChevronDown,
    ShieldAlert,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { useUnsavedChanges } from "@/components/admin/UnsavedChangesContext";
import { AdminLangPicker } from "@/components/admin/AdminLangPicker";
import { AdminThemePicker } from "@/components/admin/AdminThemePicker";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { AdminActionBar } from "@/components/admin/AdminActionBar";
import { Loader } from "@/components/shared/Loader";

// ─── Types ──────────────────────────────────────────────────────────────────
type SettingsMap = Record<string, string>;

interface SettingField {
    key: string;
    label: string;
    description: string;
    type: "text" | "url" | "email" | "toggle" | "select" | "textarea" | "datetime";
    placeholder?: string;
    options?: { value: string; label: string }[];
    icon?: React.ReactNode;
}

interface SettingGroup {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    fields: SettingField[];
}

const SETTING_GROUPS: SettingGroup[] = [
    {
        id: "general",
        title: "Genel Ayarlar",
        description: "Site sürümü, varsayılan dil/tema ve telif hakkı.",
        icon: <SettingsIcon size={18} />,
        color: "#6b5be6",
        fields: [
            { key: "site_name", label: "Site Adı", description: "Header, Footer ve tüm sayfalarda görünen site ismi.", type: "text", placeholder: "OptWin" },
            { key: "site_url", label: "Site URL", description: "SEO meta etiketlerinde ve paylaşımlarda kullanılan tam site adresi.", type: "url", placeholder: "https://optwin.tech", icon: <Globe size={14} /> },
            { key: "site_description", label: "Site Açıklaması", description: "Arama motorları için SEO site açıklaması.", type: "text", placeholder: "Free, open-source browser-based Windows optimizer..." },
            { key: "site_keywords", label: "Anahtar Kelimeler", description: "SEO için virgülle ayrılmış anahtar kelimeler.", type: "text", placeholder: "windows optimizer, powershell, pc tweaks" },
            { key: "site_version", label: "Site Sürümü", description: "Footer ve admin panelinde görünen sürüm numarası.", type: "text", placeholder: "1.3.0" },
            { key: "default_lang", label: "Varsayılan Dil", description: "Yeni ziyaretçilerin göreceği varsayılan dil.", type: "select" },
            { key: "default_theme", label: "Varsayılan Tema", description: "Yeni ziyaretçilerin göreceği varsayılan tema.", type: "select", icon: <Palette size={14} />, options: [{ value: "dark", label: "Koyu" }, { value: "light", label: "Açık" }] },
            { key: "copyright_text", label: "Copyright Metni", description: "Footer'da görünen telif hakkı metni. Örn: OptWin", type: "text", placeholder: "OptWin" },
            { key: "copyright_year", label: "Copyright Yılı", description: "Footer'da görünen telif hakkı yılı. Girdiğiniz değer aynen gösterilir.", type: "text", placeholder: "2026" },
        ],
    },
    {
        id: "links",
        title: "Bağlantılar",
        description: "Site genelinde kullanılan URL'ler ve iletişim bilgileri.",
        icon: <Globe size={18} />,
        color: "#3b82f6",
        fields: [
            { key: "github_url", label: "GitHub URL", description: "Footer ve About bölümündeki GitHub bağlantısı.", type: "url", placeholder: "https://github.com/ahmetlygh/optwin", icon: <Github size={14} /> },
            { key: "bmc_url", label: "Buy Me a Coffee URL", description: "Destek sayfasındaki bağış bağlantısı.", type: "url", placeholder: "https://buymeacoffee.com/optwin", icon: <Coffee size={14} /> },
            { key: "contact_email", label: "İletişim E-postası", description: "Footer'da ve iletişim sayfasında görünen e-posta adresi.", type: "email", placeholder: "contact@optwin.tech", icon: <Mail size={14} /> },
        ],
    },
    {
        id: "author",
        title: "Yazar Bilgileri",
        description: "Script başlığı ve telif hakları bölümünde görünen bilgiler.",
        icon: <User size={18} />,
        color: "#10b981",
        fields: [
            { key: "author_name", label: "Yazar Adı", description: "Script başlığı ve hakkında bölümünde görünür.", type: "text", placeholder: "Ahmet" },
            { key: "author_url", label: "Yazar Web Sitesi", description: "Yazar adının bağlantısı.", type: "url", placeholder: "https://optwin.tech" },
        ],
    },
    {
        id: "widgets",
        title: "Widget'lar",
        description: "Site üzerindeki ek bileşenler ve entegrasyonlar.",
        icon: <Coffee size={18} />,
        color: "#f59e0b",
        fields: [
            { key: "bmc_widget_enabled", label: "BMC Widget", description: "Sayfanın sağ alt köşesindeki Buy Me a Coffee widget'ı.", type: "toggle", icon: <Coffee size={14} /> },
        ],
    },
];

const ALL_SETTING_KEYS = SETTING_GROUPS.flatMap(g => g.fields.map(f => f.key));

export default function GeneralSettings() {
    const router = useRouter();
    const unsavedCtx = useUnsavedChanges();

    // ─── SETTINGS state ─────────────────────────────────────────────────────
    const [settings, setSettings] = useState<SettingsMap>({});
    const [originalSettings, setOriginalSettings] = useState<SettingsMap>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");
    const [showDangerZone, setShowDangerZone] = useState(false);

    // ─── MAINTENANCE state ─────────────────────────────────────────────────────
    const [maintenance, setMaintenance] = useState(false);
    const [maintenanceLoading, setMaintenanceLoading] = useState(true);

    useEffect(() => {
        // Fetch absolute truth from Redis/DB via existing API instead of waiting for missed events
        fetch("/api/admin/maintenance").then(r => r.json()).then(d => {
            setMaintenance(d.maintenance === true);
            setMaintenanceLoading(false);
        }).catch(() => setMaintenanceLoading(false));

        const handler = (e: any) => {
            setMaintenance(e.detail);
            setMaintenanceLoading(false);
        };
        window.addEventListener('optwin:set-maintenance', handler);
        return () => window.removeEventListener('optwin:set-maintenance', handler);
    }, []);

    // ─── Fetch settings ─────────────────────────────────────────────────────
    const fetchSettings = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/settings");
            const data = await res.json();
            if (data.success) {
                setSettings({ ...data.settings });
                setOriginalSettings({ ...data.settings });
            }
        } catch {
            setError("Ayarlar yüklenemedi.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    // ─── Change detection ───────────────────────────────────────────────────
    const hasChanges = useMemo(() =>
        JSON.stringify(Object.fromEntries(ALL_SETTING_KEYS.map(k => [k, settings[k] || ""]))) !==
        JSON.stringify(Object.fromEntries(ALL_SETTING_KEYS.map(k => [k, originalSettings[k] || ""]))),
        [settings, originalSettings]
    );

    useEffect(() => {
        unsavedCtx.setHasUnsavedChanges(hasChanges);
        return () => unsavedCtx.setHasUnsavedChanges(false);
    }, [hasChanges, unsavedCtx]);

    const handleSave = async () => {
        if (!hasChanges) return;
        setSaving(true);
        setError("");
        try {
            const changed: SettingsMap = {};
            for (const key of ALL_SETTING_KEYS) {
                if ((settings[key] || "") !== (originalSettings[key] || "")) {
                    changed[key] = settings[key] || "";
                }
            }
            if (Object.keys(changed).length > 0) {
                const res = await fetch("/api/admin/settings", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ settings: changed }),
                });
                const data = await res.json();
                if (!data.success) { setError(data.error || "Kaydetme başarısız"); return; }
            }
            setOriginalSettings({ ...settings });
            setSaved(true);
            router.refresh();
            setTimeout(() => setSaved(false), 2000);
        } catch {
            setError("Değişiklikler kaydedilemedi.");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setSettings({ ...originalSettings });
    };

    unsavedCtx.onSave.current = handleSave;
    unsavedCtx.onDiscard.current = handleCancel;

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Action Bar */}
            <AdminActionBar
                show={hasChanges}
                saving={saving}
                saved={saved}
                onSave={handleSave}
                onCancel={handleCancel}
                error={error}
            />

            {/* Errors */}
            {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/[0.06] border border-red-500/10 text-red-400 text-sm">
                    <AlertCircle size={14} /> {error}
                </div>
            )}

            {/* Maintenance Mode */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="rounded-2xl border border-white/[0.04] bg-white/[0.015]">
                <div className="px-5 py-3 border-b border-white/[0.04] flex items-center justify-between gap-3">
                    <div className="flex flex-1 items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 text-red-500"><ShieldAlert size={16} /></div>
                        <div>
                            <h2 className="text-sm font-bold text-white">Bakım Modu</h2>
                            <p className="text-[11px] text-white/25">Siteyi bakım moduna alın veya normal moda döndürün.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${maintenanceLoading ? "text-white/20" : maintenance ? "text-amber-400" : "text-emerald-400"}`}>{maintenanceLoading ? "YÜKLENİYOR" : maintenance ? "BAKIMDA" : "AKTİF"}</span>
                        <button
                            onClick={() => maintenance ? window.dispatchEvent(new CustomEvent('optwin:open-maintenance-off')) : window.dispatchEvent(new CustomEvent('optwin:open-maintenance-modal'))}
                            disabled={maintenanceLoading}
                            className={`relative w-12 h-6 rounded-full transition-all duration-300 ${maintenanceLoading ? "bg-white/10" : maintenance ? "bg-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.3)]" : "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]"}`}
                        >
                            {maintenanceLoading ? (
                                <Loader2 size={12} className="absolute top-1.5 left-1/2 -translate-x-1/2 text-white/50 animate-spin" />
                            ) : (
                                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${maintenance ? "left-1" : "left-7"}`} />
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>

            {SETTING_GROUPS.map((group, gi) => (
                <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: gi * 0.04, duration: 0.3 }}
                    className="rounded-2xl border border-white/[0.04] bg-white/[0.015]"
                >
                    <div className="px-5 py-3 border-b border-white/[0.04] flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${group.color}15`, color: group.color }}>{group.icon}</div>
                        <div>
                            <h2 className="text-sm font-bold text-white">{group.title}</h2>
                            <p className="text-[11px] text-white/25">{group.description}</p>
                        </div>
                    </div>
                    <div className="divide-y divide-white/[0.03]">
                        {group.fields.map(field => {
                            const value = settings[field.key] || "";
                            const original = originalSettings[field.key] || "";
                            const changed = value !== original;
                            return (
                                <div key={field.key} className={`px-5 py-3.5 flex items-center gap-4 transition-colors ${changed ? "bg-[#6b5be6]/[0.03]" : "hover:bg-white/[0.01]"}`}>
                                    <div className="w-[180px] sm:w-[220px] 2xl:w-[280px] shrink-0">
                                        <div className="flex items-center gap-2">
                                            {field.icon && <span className="text-white/20">{field.icon}</span>}
                                            <span className="text-[13px] font-semibold text-white/70">{field.label}</span>
                                            {changed && <span className="w-1.5 h-1.5 rounded-full bg-[#6b5be6]" />}
                                        </div>
                                        <p className="text-[10px] text-white/20 mt-0.5 leading-relaxed">{field.description}</p>
                                    </div>
                                    <div className="flex-1">
                                        {field.type === "toggle" ? (
                                            <div className="flex items-center gap-3">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${value === "true" ? "text-emerald-400" : "text-white/20"}`}>Aktif</span>
                                                <button
                                                    onClick={() => setSettings(prev => ({ ...prev, [field.key]: value === "true" ? "false" : "true" }))}
                                                    className={`w-12 h-6 rounded-full transition-all duration-300 relative ${value === "true" ? "bg-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-white/[0.06]"}`}
                                                >
                                                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${value === "true" ? "left-7" : "left-1"}`} />
                                                </button>
                                            </div>
                                        ) : field.type === "select" ? (
                                            field.key === "default_lang" ? (
                                                <AdminLangPicker
                                                    value={value || "en"}
                                                    onChange={v => setSettings(prev => ({ ...prev, [field.key]: v }))}
                                                    variant="settings"
                                                />
                                            ) : field.key === "default_theme" ? (
                                                <AdminThemePicker
                                                    value={value || "dark"}
                                                    onChange={v => setSettings(prev => ({ ...prev, [field.key]: v }))}
                                                />
                                            ) : (
                                                <AdminSelect
                                                    options={field.options || []}
                                                    value={value}
                                                    onChange={v => setSettings(prev => ({ ...prev, [field.key]: v }))}
                                                    placeholder="Seçin..."
                                                />
                                            )
                                        ) : (
                                            <input
                                                type={field.type === "email" ? "email" : field.type === "url" ? "url" : "text"}
                                                value={value}
                                                onChange={e => setSettings(prev => ({ ...prev, [field.key]: e.target.value }))}
                                                placeholder={field.placeholder}
                                                className="w-full bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.10] focus:border-[#6b5be6]/30 rounded-lg px-3 py-2 text-[13px] text-white/80 placeholder-white/15 focus:outline-none transition-all"
                                            />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            ))}

            {/* Danger Zone */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="rounded-2xl border border-red-500/[0.08] bg-red-500/[0.02] overflow-hidden">
                <button onClick={() => setShowDangerZone(!showDangerZone)} className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-red-500/[0.02] transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center"><AlertTriangle size={16} className="text-red-500/60" /></div>
                        <div className="text-left">
                            <h2 className="text-sm font-bold text-red-400/70">Tehlikeli Bölge</h2>
                            <p className="text-[11px] text-red-400/30">Geri alınamaz toplu silme işlemleri</p>
                        </div>
                    </div>
                    <motion.span animate={{ rotate: showDangerZone ? 180 : 0 }} className="text-red-400/30"><ChevronDown size={16} /></motion.span>
                </button>
                <AnimatePresence>
                    {showDangerZone && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                            <div className="px-5 pb-4 space-y-2.5 border-t border-red-500/[0.06]">
                                <p className="text-[11px] text-red-400/30 pt-3">Bu işlemler geri alınamaz. Veritabanınızdaki verileri kalıcı olarak siler.</p>
                                {[
                                    { label: "Tüm İstatistikleri Sıfırla", desc: "Ziyaret, script ve indirme sayaçlarını sıfırla", action: "resetStats" },
                                    { label: "Tüm Mesajları Sil", desc: "İletişim formundan gelen tüm mesajları kalıcı olarak sil", action: "deleteMessages" },
                                    { label: "Günlük İstatistikleri Sil", desc: "DailyStat tablosundaki tüm verileri sil", action: "deleteDailyStats" },
                                ].map(item => (
                                    <div key={item.action} className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-red-500/[0.03] border border-red-500/[0.06]">
                                        <div>
                                            <p className="text-[13px] font-medium text-red-400/60">{item.label}</p>
                                            <p className="text-[10px] text-red-400/25">{item.desc}</p>
                                        </div>
                                        <button 
                                            onClick={async () => {
                                                if (!confirm(`"${item.label}" — Bu işlem geri alınamaz. Devam etmek istiyor musunuz?`)) return;
                                                try {
                                                    const res = await fetch("/api/admin/danger", {
                                                        method: "POST",
                                                        headers: { "Content-Type": "application/json" },
                                                        body: JSON.stringify({ action: item.action }),
                                                    });
                                                    const data = await res.json();
                                                    if (data.success) {
                                                        alert(data.message || "İşlem başarıyla tamamlandı.");
                                                        router.refresh();
                                                    } else {
                                                        alert(data.error || "Bir hata oluştu.");
                                                    }
                                                } catch {
                                                    alert("İşlem sırasında sunucu hatası oluştu.");
                                                }
                                            }} 
                                            className="h-8 px-3 rounded-lg text-[11px] font-bold text-red-400/50 hover:text-red-400 bg-red-500/[0.06] hover:bg-red-500/[0.12] border border-red-500/[0.10] transition-all flex items-center gap-1.5"
                                        >
                                            <Trash2 size={11} /> Sil
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
