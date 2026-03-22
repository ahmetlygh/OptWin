"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Settings as SettingsIcon,
    Save,
    Loader2,
    Check,
    AlertCircle,
    ShieldAlert,
    Globe,
    Github,
    Coffee,
    Mail,
    User,
    Palette,

    Trash2,
    AlertTriangle,
    RotateCcw,
    Type,
    Heart,
    MessageSquare,
    Layers,
    ExternalLink,
    X,
    Languages,
    ChevronDown,
} from "lucide-react";
import { useUnsavedChanges } from "@/components/admin/UnsavedChangesContext";
import { AdminLangPicker } from "@/components/admin/AdminLangPicker";

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

// ─── Translation key definitions ─────────────────────────────────────────────
interface TranslationKeyDef {
    key: string;
    label: string;
    placeholder: string;
    multiline?: boolean;
}

interface ContentSection {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    keys: TranslationKeyDef[];
}

const LANGS = ["en", "tr", "de", "fr", "es", "zh", "hi"];

// ─── Setting groups (bakım sadece toggle) ────────────────────────────────────
const DURATION_PRESETS = [
    { label: "5 dk", minutes: 5 },
    { label: "15 dk", minutes: 15 },
    { label: "30 dk", minutes: 30 },
    { label: "1 saat", minutes: 60 },
];

const REASON_LANGS = ["en", "tr", "de", "fr", "es", "zh", "hi"] as const;
const REASON_LANG_LABELS: Record<string, string> = { tr: "Türkçe", en: "English", de: "Deutsch", fr: "Français", es: "Español", zh: "中文", hi: "हिन्दी" };

const SETTING_GROUPS: SettingGroup[] = [
    {
        id: "general",
        title: "Genel Ayarlar",
        description: "Site sürümü, varsayılan dil/tema ve telif hakkı.",
        icon: <SettingsIcon size={18} />,
        color: "#6b5be6",
        fields: [
            { key: "site_version", label: "Site Sürümü", description: "Footer ve admin panelinde görünen sürüm numarası.", type: "text", placeholder: "1.3.0" },
            { key: "default_lang", label: "Varsayılan Dil", description: "Yeni ziyaretçilerin göreceği varsayılan dil.", type: "select", options: [{ value: "en", label: "English" }, { value: "tr", label: "Türkçe" }, { value: "de", label: "Deutsch" }, { value: "fr", label: "Français" }, { value: "es", label: "Español" }, { value: "zh", label: "中文" }, { value: "hi", label: "हिन्दी" }] },
            { key: "default_theme", label: "Varsayılan Tema", description: "Yeni ziyaretçilerin göreceği varsayılan tema.", type: "select", icon: <Palette size={14} />, options: [{ value: "dark", label: "Koyu" }, { value: "light", label: "Açık" }] },
            { key: "copyright_text", label: "Copyright Metni", description: "Footer'da görünen telif hakkı metni. Örn: OptWin", type: "text", placeholder: "OptWin" },
            { key: "copyright_year", label: "Copyright Yılı", description: "Telif hakkı başlangıç yılı. Boş bırakılırsa mevcut yıl kullanılır.", type: "text", placeholder: "2024" },
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

// ─── Content sections ────────────────────────────────────────────────────────
const CONTENT_SECTIONS: ContentSection[] = [
    {
        id: "about",
        title: "Hakkında Bölümü",
        description: "Ana sayfadaki hakkında bölümünün başlık, açıklama ve kartları.",
        icon: <Type size={18} />,
        color: "#3b82f6",
        keys: [
            { key: "about.title", label: "Başlık", placeholder: "About OptWin" },
            { key: "about.description", label: "Alt Açıklama", placeholder: "Our mission is to empower...", multiline: true },
            { key: "about.safeSecure", label: "Kart 1: Başlık", placeholder: "Safe & Secure" },
            { key: "about.safeSecureDesc", label: "Kart 1: Açıklama", placeholder: "Every optimization is carefully vetted...", multiline: true },
            { key: "about.openSource", label: "Kart 2: Başlık", placeholder: "Open Source" },
            { key: "about.openSourceDesc", label: "Kart 2: Açıklama", placeholder: "Our code is 100% transparent...", multiline: true },
            { key: "about.transparent", label: "Kart 3: Başlık", placeholder: "Transparent" },
            { key: "about.transparentDesc", label: "Kart 3: Açıklama", placeholder: "No hidden background services...", multiline: true },
        ],
    },
    {
        id: "support",
        title: "Destek Bölümü",
        description: "Destek çağrısı ve modal içerikleri.",
        icon: <Heart size={18} />,
        color: "#ec4899",
        keys: [
            { key: "support.title", label: "Başlık", placeholder: "Support OptWin Development" },
            { key: "support.description", label: "Açıklama", placeholder: "OptWin is entirely free...", multiline: true },
            { key: "support.modalTitle", label: "Modal Başlık", placeholder: "Support OptWin" },
            { key: "support.modalDesc", label: "Modal Açıklama", placeholder: "OptWin is developed by...", multiline: true },
            { key: "support.howToSupport", label: "Nasıl Destek Olunur", placeholder: "How to Support" },
            { key: "support.way1", label: "Yol 1", placeholder: "Buy us a coffee..." },
            { key: "support.way2", label: "Yol 2", placeholder: "Star our GitHub repo..." },
            { key: "support.way3", label: "Yol 3", placeholder: "Share OptWin with friends..." },
            { key: "support.buyMeCoffee", label: "BMC Buton", placeholder: "Buy Me a Coffee" },
            { key: "support.close", label: "Kapat Butonu", placeholder: "Close" },
            { key: "support.linkCopied", label: "Link Kopyalandı", placeholder: "Link copied!" },
        ],
    },
    {
        id: "footer",
        title: "Footer Metni",
        description: "Alt bilgi çubuğundaki tüm metinler.",
        icon: <Layers size={18} />,
        color: "#8b5cf6",
        keys: [
            { key: "footer.description", label: "Açıklama", placeholder: "Ultimate open-source Windows optimization suite...", multiline: true },
            { key: "footer.legal", label: "Hukuki Başlık", placeholder: "Legal" },
            { key: "footer.privacy", label: "Gizlilik Linki", placeholder: "Privacy Policy" },
            { key: "footer.terms", label: "Koşullar Linki", placeholder: "Terms of Service" },
            { key: "footer.support", label: "Destek Başlık", placeholder: "Support" },
            { key: "footer.contactUs", label: "Bize Ulaşın", placeholder: "Contact Us" },
            { key: "footer.allRights", label: "Tüm Hakları", placeholder: "All rights reserved." },
        ],
    },
    {
        id: "contact",
        title: "İletişim Sayfası",
        description: "İletişim formu başlık, açıklama ve form alanları.",
        icon: <MessageSquare size={18} />,
        color: "#14b8a6",
        keys: [
            { key: "contact.title", label: "Başlık", placeholder: "Get in Touch" },
            { key: "contact.description", label: "Açıklama", placeholder: "Have a question, feedback...", multiline: true },
            { key: "contact.name", label: "İsim Alanı", placeholder: "Your Name" },
            { key: "contact.email", label: "E-posta Alanı", placeholder: "Email Address" },
            { key: "contact.subject", label: "Konu Alanı", placeholder: "Subject" },
            { key: "contact.message", label: "Mesaj Alanı", placeholder: "Message" },
            { key: "contact.send", label: "Gönder Butonu", placeholder: "Send Message" },
            { key: "contact.sent", label: "Gönderildi", placeholder: "Message Sent!" },
            { key: "contact.sentDesc", label: "Gönderildi Açıklama", placeholder: "Thank you for reaching out..." },
            { key: "contact.sendAnother", label: "Başka Gönder", placeholder: "Send Another Message" },
            { key: "contact.backHome", label: "Ana Sayfa", placeholder: "Back Home" },
        ],
    },
    {
        id: "preset",
        title: "Preset Butonları",
        description: "Ön tanımlı seçim butonlarının etiketleri.",
        icon: <Layers size={18} />,
        color: "#f59e0b",
        keys: [
            { key: "preset.recommended", label: "Önerilen", placeholder: "Recommended Settings" },
            { key: "preset.gamer", label: "Oyuncu", placeholder: "Gaming Settings" },
            { key: "preset.clearAll", label: "Tümünü Temizle", placeholder: "Clear All" },
            { key: "preset.selectAll", label: "Tümünü Seç", placeholder: "Select All" },
            { key: "preset.default", label: "Varsayılan (DNS)", placeholder: "Default" },
            { key: "preset.showPresets", label: "Presetleri Göster", placeholder: "Show Presets" },
            { key: "preset.hidePresets", label: "Presetleri Gizle", placeholder: "Hide Presets" },
            { key: "preset.selectAllWarning", label: "Tümünü Seç Uyarısı", placeholder: "All settings may cause unwanted changes...", multiline: true },
        ],
    },
];

// ─── Tabs ─────────────────────────────────────────────────────────────────────
type TabId = "settings" | "content";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "settings", label: "Genel Ayarlar", icon: <SettingsIcon size={15} /> },
    { id: "content", label: "İçerik Yönetimi", icon: <Type size={15} /> },
];



// ═══════════════════════════════════════════════════════════════════════════════
export default function SettingsPage() {
    // ─── TAB state ──────────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState<TabId>("settings");

    // ─── SETTINGS state ─────────────────────────────────────────────────────
    const [settings, setSettings] = useState<SettingsMap>({});
    const [originalSettings, setOriginalSettings] = useState<SettingsMap>({});
    const [settingsLoading, setSettingsLoading] = useState(true);
    const [settingsSaving, setSaving] = useState(false);
    const [settingsSaved, setSaved] = useState(false);
    const [settingsError, setSettingsError] = useState("");
    const [showDangerZone, setShowDangerZone] = useState(false);
    const unsavedCtx = useUnsavedChanges();

    // ─── CONTENT state ──────────────────────────────────────────────────────
    const [activeLang, setActiveLang] = useState("en");
    const [activeContentSection, setActiveContentSection] = useState("about");
    const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({});
    const [originalTranslations, setOriginalTranslations] = useState<Record<string, Record<string, string>>>({});
    const [contentLoading, setContentLoading] = useState(true);
    const [contentSaving, setContentSaving] = useState(false);
    const [contentSaved, setContentSaved] = useState(false);
    const [contentError, setContentError] = useState("");

    // ─── CATEGORIES state ───────────────────────────────────────────────────
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [originalCategories, setOriginalCategories] = useState<CategoryData[]>([]);
    const [catLoading, setCatLoading] = useState(true);
    const [catSaving, setCatSaving] = useState(false);
    const [catSaved, setCatSaved] = useState(false);
    const [catError, setCatError] = useState("");
    const [catLang, setCatLang] = useState("en");

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
            setSettingsError("Ayarlar yüklenemedi.");
        } finally {
            setSettingsLoading(false);
        }
    }, []);

    // ─── Fetch content translations ─────────────────────────────────────────
    const fetchTranslations = useCallback(async () => {
        try {
            const allKeys = CONTENT_SECTIONS.flatMap(s => s.keys.map(k => k.key));
            // Fetch ALL languages at once
            const res = await fetch("/api/admin/ui-translations");
            const data = await res.json();
            if (data.success) {
                // Filter to only content keys
                const filtered: Record<string, Record<string, string>> = {};
                for (const lang of LANGS) {
                    filtered[lang] = {};
                    const langData = data.translations[lang] || {};
                    for (const key of allKeys) {
                        if (langData[key] !== undefined) {
                            filtered[lang][key] = langData[key];
                        }
                    }
                }
                setTranslations(JSON.parse(JSON.stringify(filtered)));
                setOriginalTranslations(JSON.parse(JSON.stringify(filtered)));
            }
        } catch {
            setContentError("Çeviriler yüklenemedi.");
        } finally {
            setContentLoading(false);
        }
    }, []);

    // ─── Fetch maintenance ───────────────────────────────────────────────────
    useEffect(() => {
        fetch("/api/admin/maintenance").then(r => r.json()).then(d => {
            setMaintenance(d.maintenance === true);
            setMaintenanceLoading(false);
        }).catch(() => setMaintenanceLoading(false));
    }, []);

    useEffect(() => {
        fetchSettings();
        fetchTranslations();
    }, [fetchSettings, fetchTranslations]);

    // ─── Change detection ───────────────────────────────────────────────────
    const settingsChanged = useMemo(() =>
        JSON.stringify(Object.fromEntries(ALL_SETTING_KEYS.map(k => [k, settings[k] || ""]))) !==
        JSON.stringify(Object.fromEntries(ALL_SETTING_KEYS.map(k => [k, originalSettings[k] || ""]))),
        [settings, originalSettings]
    );

    const contentChanged = useMemo(() =>
        JSON.stringify(translations) !== JSON.stringify(originalTranslations),
        [translations, originalTranslations]
    );

    const hasChanges = settingsChanged || contentChanged;

    useEffect(() => {
        unsavedCtx.setHasUnsavedChanges(hasChanges);
        return () => unsavedCtx.setHasUnsavedChanges(false);
    }, [hasChanges]);

    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => { if (hasChanges) e.preventDefault(); };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [hasChanges]);

    // ─── Settings save/cancel ───────────────────────────────────────────────
    const handleSettingsSave = async () => {
        setSaving(true);
        setSettingsError("");
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
                if (!data.success) { setSettingsError(data.error || "Kaydetme başarısız"); return; }
            }
            setOriginalSettings({ ...settings });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch {
            setSettingsError("Değişiklikler kaydedilemedi.");
        } finally {
            setSaving(false);
        }
    };

    // ─── Content save/cancel ────────────────────────────────────────────────
    const handleContentSave = async () => {
        setContentSaving(true);
        setContentError("");
        try {
            const changes: { key: string; lang: string; value: string }[] = [];
            for (const lang of LANGS) {
                const current = translations[lang] || {};
                const original = originalTranslations[lang] || {};
                for (const key of Object.keys(current)) {
                    if (current[key] !== original[key]) {
                        changes.push({ key, lang, value: current[key] });
                    }
                }
            }
            if (changes.length > 0) {
                const res = await fetch("/api/admin/ui-translations", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ translations: changes }),
                });
                const data = await res.json();
                if (!data.success) { setContentError(data.error || "Kaydetme başarısız"); return; }
            }
            setOriginalTranslations(JSON.parse(JSON.stringify(translations)));
            setContentSaved(true);
            setTimeout(() => setContentSaved(false), 2000);
        } catch {
            setContentError("Çeviriler kaydedilemedi.");
        } finally {
            setContentSaving(false);
        }
    };

    // ─── Maintenance toggle ──────────────────────────────────────────────────
    const toggleMaintenance = async (enabled: boolean) => {
        setMaintenanceLoading(true);
        try {
            let estimatedEnd = "";
            if (enabled) {
                if (mTimeMode === "duration") {
                    const mins = mCustom ? parseInt(mCustomMinutes) || 0 : (mMinutes || 0);
                    if (mins > 0) {
                        const end = new Date(Date.now() + mins * 60000);
                        estimatedEnd = end.toISOString();
                    }
                } else if (mTimeMode === "datetime" && mDate && mTime) {
                    const localStr = `${mDate}T${mTime}:00+03:00`;
                    estimatedEnd = new Date(localStr).toISOString();
                }
            }
            const res = await fetch("/api/admin/maintenance", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ enabled, reason: enabled ? JSON.stringify(mReasons) : "", estimatedEnd: enabled ? estimatedEnd : "" }),
            });
            const data = await res.json();
            if (data.success) setMaintenance(data.maintenance);
        } catch { /* ignore */ }
        setMaintenanceLoading(false);
        setShowMaintenanceOn(false);
        setShowMaintenanceOff(false);
        if (!enabled) { setMReasons(Object.fromEntries(REASON_LANGS.map(l => [l, ""]))); setMMinutes(null); setMCustom(false); setMCustomMinutes(""); setMDate(""); setMTime(""); }
    };

    const openMaintenanceModal = () => {
        setMReasons(Object.fromEntries(REASON_LANGS.map(l => [l, ""]))); setMReasonLang("en"); setMMinutes(null); setMCustom(false); setMCustomMinutes(""); setMDate(""); setMTime(""); setMTimeMode("duration");
        setShowMaintenanceOn(true);
    };

    const switchToDatetime = () => {
        setMTimeMode("datetime");
        const utc3Now = new Date(Date.now() + 3 * 3600000);
        const plusOne = new Date(utc3Now.getTime() + 3600000);
        const dateStr = plusOne.toISOString().split("T")[0];
        const hh = plusOne.getUTCHours().toString().padStart(2, "0");
        const mm = plusOne.getUTCMinutes().toString().padStart(2, "0");
        setMDate(dateStr);
        setMTime(`${hh}:${mm}`);
    };

    // ESC to close maintenance modal
    useEffect(() => {
        if (!showMaintenanceOn) return;
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setShowMaintenanceOn(false); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [showMaintenanceOn]);

    // ─── Danger zone actions ─────────────────────────────────────────────────
    const handleDangerAction = async (action: string) => {
        setDangerLoading(action);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ settings: { dangerAction: action } }),
            });
            await res.json();
        } catch { /* ignore */ }
        setDangerLoading(null);
    };

    // ─── Master save / cancel ───────────────────────────────────────────────
    const handleSaveAll = async () => {
        if (settingsChanged) await handleSettingsSave();
        if (contentChanged) await handleContentSave();
    };

    const handleCancelAll = () => {
        setSettings({ ...originalSettings });
        setTranslations(JSON.parse(JSON.stringify(originalTranslations)));
    };

    unsavedCtx.onSave.current = handleSaveAll;
    unsavedCtx.onDiscard.current = handleCancelAll;

    const updateSetting = (key: string, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const updateTranslation = (lang: string, key: string, value: string) => {
        setTranslations(prev => ({
            ...prev,
            [lang]: { ...prev[lang], [key]: value },
        }));
    };

    const updateCatTranslation = (catId: string, lang: string, name: string) => {
        setCategories(prev => prev.map(c => {
            if (c.id !== catId) return c;
            const existing = c.translations.find(t => t.lang === lang);
            if (existing) {
                return { ...c, translations: c.translations.map(t => t.lang === lang ? { ...t, name } : t) };
            }
            return { ...c, translations: [...c.translations, { lang, name }] };
        }));
    };

    // Loading
    const isLoading = settingsLoading || contentLoading || catLoading;
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={24} className="text-[#6b5be6] animate-spin" />
            </div>
        );
    }

    // Current tab change detection
    const currentTabChanged = activeTab === "settings" ? settingsChanged : activeTab === "content" ? contentChanged : catChanged;
    const currentError = activeTab === "settings" ? settingsError : activeTab === "content" ? contentError : catError;
    const currentSaving = activeTab === "settings" ? settingsSaving : activeTab === "content" ? contentSaving : catSaving;
    const currentSaved = activeTab === "settings" ? settingsSaved : activeTab === "content" ? contentSaved : catSaved;

    const handleCurrentSave = activeTab === "settings" ? handleSettingsSave : activeTab === "content" ? handleContentSave : handleCatSave;
    const handleCurrentCancel = activeTab === "settings" ? () => setSettings({ ...originalSettings }) : activeTab === "content" ? () => setTranslations(JSON.parse(JSON.stringify(originalTranslations))) : () => setCategories(JSON.parse(JSON.stringify(originalCategories)));

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
                        <Settings size={18} className="text-[#6b5be6]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight">Ayarlar</h1>
                        <p className="text-xs text-white/30">Site genelinde geçerli olan tüm yapılandırmaları yönetin</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <AnimatePresence mode="popLayout">
                        {currentTabChanged && (
                            <motion.div
                                key="actions"
                                initial={{ opacity: 0, x: -12, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -12, scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className="flex items-center gap-2"
                            >
                                <button onClick={handleCurrentCancel} className="h-9 px-4 rounded-xl text-sm font-medium text-white/40 hover:text-white/70 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] transition-all flex items-center gap-2">
                                    <RotateCcw size={14} /> İptal
                                </button>
                                <button onClick={handleCurrentSave} disabled={currentSaving} className="h-9 px-5 rounded-xl text-sm font-bold text-white bg-[#6b5be6] hover:bg-[#5a4bd4] disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-[#6b5be6]/20">
                                    {currentSaving ? <Loader2 size={14} className="animate-spin" /> : currentSaved ? <Check size={14} /> : <Save size={14} />}
                                    {currentSaving ? "Kaydediliyor..." : currentSaved ? "Kaydedildi!" : "Kaydet"}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Preview button for 6.10 */}
                    <button
                        onClick={() => window.open("/", "_blank")}
                        className="h-9 px-3 rounded-xl text-xs font-medium text-white/30 hover:text-white/70 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] transition-all flex items-center gap-1.5"
                        title="Siteyi yeni sekmede aç"
                    >
                        <ExternalLink size={13} /> Önizleme
                    </button>

                    {/* Lang picker for content & categories */}
                    {(activeTab === "content" || activeTab === "categories") && (
                        <AdminLangPicker
                            value={activeTab === "content" ? activeLang : catLang}
                            onChange={activeTab === "content" ? setActiveLang : setCatLang}
                            availableLangs={LANGS}
                        />
                    )}
                </div>
            </div>

            {/* Tab bar */}
            <div className="flex gap-1 p-1 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                            activeTab === tab.id
                                ? "text-white"
                                : "text-white/30 hover:text-white/60 hover:bg-white/[0.02]"
                        }`}
                    >
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="settingsTab"
                                className="absolute inset-0 rounded-lg bg-[#6b5be6]/10 border border-[#6b5be6]/15"
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                        )}
                        <span className={`relative z-10 ${activeTab === tab.id ? "text-[#6b5be6]" : ""}`}>{tab.icon}</span>
                        <span className="relative z-10">{tab.label}</span>
                        {/* Change indicator */}
                        {((tab.id === "settings" && settingsChanged) ||
                          (tab.id === "content" && contentChanged) ||
                          (tab.id === "categories" && catChanged)) && (
                            <span className="relative z-10 w-1.5 h-1.5 rounded-full bg-[#6b5be6]" />
                        )}
                    </button>
                ))}
            </div>

            {/* Errors */}
            {currentError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/[0.06] border border-red-500/10 text-red-400 text-sm">
                    <AlertCircle size={14} /> {currentError}
                </div>
            )}

            {/* ═══ TAB: SETTINGS ═══════════════════════════════════════════════ */}
            {activeTab === "settings" && (
                <div className="space-y-4">
                    {SETTING_GROUPS.map((group, gi) => (
                        <motion.div
                            key={group.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: gi * 0.04, duration: 0.3 }}
                            className="rounded-2xl border border-white/[0.04] bg-white/[0.015] overflow-hidden"
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
                                            <div className="w-[200px] xl:w-[260px] shrink-0">
                                                <div className="flex items-center gap-2">
                                                    {field.icon && <span className="text-white/20">{field.icon}</span>}
                                                    <span className="text-[13px] font-semibold text-white/70">{field.label}</span>
                                                    {changed && <span className="w-1.5 h-1.5 rounded-full bg-[#6b5be6]" />}
                                                </div>
                                                <p className="text-[10px] text-white/20 mt-0.5 leading-relaxed">{field.description}</p>
                                            </div>
                                            <div className="flex-1">
                                                {field.type === "toggle" ? (
                                                    <button onClick={() => updateSetting(field.key, value === "true" ? "false" : "true")} className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${value === "true" ? "bg-[#6b5be6]" : "bg-white/[0.06]"}`}>
                                                        <motion.div animate={{ x: value === "true" ? 24 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
                                                    </button>
                                                ) : field.type === "select" ? (
                                                    <select value={value} onChange={e => updateSetting(field.key, e.target.value)} className="w-full bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.10] focus:border-[#6b5be6]/30 rounded-lg px-3 py-2 text-[13px] text-white/80 focus:outline-none transition-all appearance-none cursor-pointer">
                                                        <option value="" className="bg-[#0d0d14]">Seçin...</option>
                                                        {field.options?.map(opt => <option key={opt.value} value={opt.value} className="bg-[#0d0d14]">{opt.label}</option>)}
                                                    </select>
                                                ) : field.type === "textarea" ? (
                                                    <textarea value={value} onChange={e => updateSetting(field.key, e.target.value)} placeholder={field.placeholder} rows={2} className="w-full bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.10] focus:border-[#6b5be6]/30 rounded-lg px-3 py-2 text-[13px] text-white/80 placeholder-white/15 focus:outline-none transition-all resize-none font-mono" />
                                                ) : (
                                                    <input type={field.type === "email" ? "email" : field.type === "url" ? "url" : "text"} value={value} onChange={e => updateSetting(field.key, e.target.value)} placeholder={field.placeholder} className="w-full bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.10] focus:border-[#6b5be6]/30 rounded-lg px-3 py-2 text-[13px] text-white/80 placeholder-white/15 focus:outline-none transition-all" />
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
                                                <button onClick={() => alert(`"${item.label}" — Bu özellik henüz bağlanmamıştır.`)} className="h-8 px-3 rounded-lg text-[11px] font-bold text-red-400/50 hover:text-red-400 bg-red-500/[0.06] hover:bg-red-500/[0.12] border border-red-500/[0.10] transition-all flex items-center gap-1.5">
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
            )}

            {/* ═══ TAB: CONTENT ════════════════════════════════════════════════ */}
            {activeTab === "content" && (
                <div className="flex gap-4" style={{ height: "calc(100vh - 260px)" }}>
                    {/* Left sidebar — section picker */}
                    <div className="w-[200px] shrink-0 rounded-2xl border border-white/[0.04] bg-white/[0.015] overflow-hidden flex flex-col">
                        <div className="px-4 py-3 border-b border-white/[0.04]">
                            <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-wider">Bölümler</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
                            {CONTENT_SECTIONS.map(section => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveContentSection(section.id)}
                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium transition-all ${
                                        activeContentSection === section.id
                                            ? "bg-[#6b5be6]/10 text-white border border-[#6b5be6]/15"
                                            : "text-white/35 hover:text-white/60 hover:bg-white/[0.03]"
                                    }`}
                                >
                                    <span style={{ color: activeContentSection === section.id ? section.color : undefined }} className={activeContentSection !== section.id ? "text-white/20" : ""}>
                                        {section.icon}
                                    </span>
                                    {section.title}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right — content fields */}
                    <div className="flex-1 rounded-2xl border border-white/[0.04] bg-white/[0.015] overflow-hidden flex flex-col min-h-0">
                        {(() => {
                            const section = CONTENT_SECTIONS.find(s => s.id === activeContentSection);
                            if (!section) return null;
                            return (
                                <>
                                    <div className="px-5 py-3 border-b border-white/[0.04] flex items-center gap-3 shrink-0">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${section.color}15`, color: section.color }}>{section.icon}</div>
                                        <div>
                                            <h2 className="text-sm font-bold text-white">{section.title}</h2>
                                            <p className="text-[11px] text-white/25">{section.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto admin-scrollbar p-4 space-y-3">
                                        {section.keys.map(kd => {
                                            const value = translations[activeLang]?.[kd.key] || "";
                                            const originalValue = originalTranslations[activeLang]?.[kd.key] || "";
                                            const changed = value !== originalValue;
                                            return (
                                                <div key={kd.key} className={`rounded-xl border transition-colors ${changed ? "border-[#6b5be6]/15 bg-[#6b5be6]/[0.03]" : "border-white/[0.04] bg-white/[0.01]"} p-3`}>
                                                    <div className="flex items-center gap-2 mb-1.5">
                                                        <span className="text-[12px] font-semibold text-white/60">{kd.label}</span>
                                                        <span className="text-[9px] font-mono text-white/15">{kd.key}</span>
                                                        {changed && <span className="w-1.5 h-1.5 rounded-full bg-[#6b5be6]" />}
                                                    </div>
                                                    {kd.multiline ? (
                                                        <textarea
                                                            value={value}
                                                            onChange={e => updateTranslation(activeLang, kd.key, e.target.value)}
                                                            placeholder={kd.placeholder}
                                                            rows={3}
                                                            className="w-full bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.10] focus:border-[#6b5be6]/30 rounded-lg px-3 py-2 text-[13px] text-white/80 placeholder-white/15 focus:outline-none transition-all resize-none"
                                                        />
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            value={value}
                                                            onChange={e => updateTranslation(activeLang, kd.key, e.target.value)}
                                                            placeholder={kd.placeholder}
                                                            className="w-full bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.10] focus:border-[#6b5be6]/30 rounded-lg px-3 py-2 text-[13px] text-white/80 placeholder-white/15 focus:outline-none transition-all"
                                                        />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* ═══ TAB: CATEGORIES ═════════════════════════════════════════════ */}
            {activeTab === "categories" && (
                <div className="rounded-2xl border border-white/[0.04] bg-white/[0.015] overflow-hidden">
                    <div className="px-5 py-3 border-b border-white/[0.04] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500"><FolderOpen size={16} /></div>
                            <div>
                                <h2 className="text-sm font-bold text-white">Kategori İsimleri</h2>
                                <p className="text-[11px] text-white/25">Her dil için kategori isimlerini düzenleyin</p>
                            </div>
                        </div>
                        <span className="text-[9px] text-white/15 font-mono">{categories.length} kategori</span>
                    </div>
                    <div className="divide-y divide-white/[0.03]">
                        {categories.sort((a, b) => a.order - b.order).map((cat) => {
                            const currentName = cat.translations.find(t => t.lang === catLang)?.name || "";
                            const origCat = originalCategories.find(c => c.id === cat.id);
                            const origName = origCat?.translations.find(t => t.lang === catLang)?.name || "";
                            const changed = currentName !== origName;
                            return (
                                <div key={cat.id} className={`px-5 py-3 flex items-center gap-4 transition-colors ${changed ? "bg-[#6b5be6]/[0.03]" : "hover:bg-white/[0.01]"}`}>
                                    <div className="w-[180px] shrink-0">
                                        <span className="text-[11px] font-mono font-bold text-white/30">{cat.slug}</span>
                                        {changed && <span className="ml-2 w-1.5 h-1.5 rounded-full bg-[#6b5be6] inline-block" />}
                                    </div>
                                    <input
                                        type="text"
                                        value={currentName}
                                        onChange={e => updateCatTranslation(cat.id, catLang, e.target.value)}
                                        placeholder={`${cat.slug} adı (${catLang})`}
                                        className="flex-1 bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.10] focus:border-[#6b5be6]/30 rounded-lg px-3 py-2 text-[13px] text-white/80 placeholder-white/15 focus:outline-none transition-all"
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
