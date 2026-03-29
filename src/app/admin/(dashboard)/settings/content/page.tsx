"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Save,
    Loader2,
    Check,
    AlertCircle,
    RotateCcw,
    Type,
    Heart,
    MessageSquare,
    Layers,
    Layout,
    Search as SearchIcon,
    Shield,
    Zap,
    Download,
    Terminal,
    Settings,
    Clock,
} from "lucide-react";
import { useUnsavedChanges } from "@/components/admin/UnsavedChangesContext";
import { AdminActionBar } from "@/components/admin/AdminActionBar";
import { AdminLangPicker } from "@/components/admin/AdminLangPicker";
import { Loader } from "@/components/shared/Loader";

// ─── Types ──────────────────────────────────────────────────────────────────
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


const CONTENT_SECTIONS: ContentSection[] = [
    {
        id: "hero",
        title: "Hero & Giriş",
        description: "Ana sayfa giriş bölümü metinleri.",
        icon: <Zap size={18} />,
        color: "#f59e0b",
        keys: [
            { key: "hero.titleHighlight", label: "Başlık Vurgusu", placeholder: "Optimize" },
            { key: "hero.titlePrefix", label: "Başlık Ön Ek", placeholder: "Windows Deneyiminizi" },
            { key: "hero.titleTemplate", label: "Cümle Yapısı (Şablon)", placeholder: "{highlight} {prefix}" },
            { key: "hero.subtitle", label: "Alt Başlık", placeholder: "The premium optimization tool...", multiline: true },
        ],
    },
    {
        id: "about",
        title: "Hakkında Bölümü",
        description: "Misyonumuz ve değerlerimiz bölümü.",
        icon: <Layout size={18} />,
        color: "#3b82f6",
        keys: [
            { key: "about.title", label: "Başlık", placeholder: "About OptWin" },
            { key: "about.description", label: "Genel Açıklama", placeholder: "Our mission is to empower...", multiline: true },
            { key: "about.safeSecure", label: "Kart 1: Başlık", placeholder: "Safe & Secure" },
            { key: "about.safeSecureDesc", label: "Kart 1: Açıklama", placeholder: "Every optimization is carefully vetted...", multiline: true },
            { key: "about.openSource", label: "Kart 2: Başlık", placeholder: "Open Source" },
            { key: "about.openSourceDesc", label: "Kart 2: Açıklama", placeholder: "Our code is 100% transparent...", multiline: true },
            { key: "about.transparent", label: "Kart 3: Başlık", placeholder: "Transparent" },
            { key: "about.transparentDesc", label: "Kart 3: Açıklama", placeholder: "No hidden background services...", multiline: true },
        ],
    },
    {
        id: "scripts",
        title: "Script & Modal",
        description: "Script oluşturma ve indirme ekranları.",
        icon: <Terminal size={18} />,
        color: "#8b5cf6",
        keys: [
            { key: "script.ready", label: "Hazır Başlığı", placeholder: "Script Ready" },
            { key: "script.howToUse", label: "Nasıl Kullanılır Başlık", placeholder: "How to use" },
            { key: "script.step1", label: "Adım 1", placeholder: "Download the .bat file..." },
            { key: "script.step2", label: "Adım 2", placeholder: "Double-click to run..." },
            { key: "script.runAsAdmin", label: "Adım 2 (Vurgu)", placeholder: "Run as Administrator" },
            { key: "script.step3", label: "Adım 3", placeholder: "Wait for the optimization..." },
            { key: "script.download", label: "İndir Butonu", placeholder: "Download" },
            { key: "script.copy", label: "Kopyala Butonu", placeholder: "Copy" },
            { key: "script.downloadToast", label: "İndirme Mesajı", placeholder: "Download started!" },
            { key: "script.copiedToast", label: "Kopyalanma Mesajı", placeholder: "Script copied to clipboard!" },
            { key: "restore.title", label: "Geri Yükleme Başlık", placeholder: "Create Restore Point?" },
            { key: "restore.description", label: "Geri Yükleme Açıklama", placeholder: "Do you want to create...", multiline: true },
            { key: "restore.yesCreate", label: "Geri Yükleme Evet", placeholder: "Yes, Create" },
            { key: "warning.title", label: "Özellik Seçilmedi Başlık", placeholder: "No Features Selected" },
            { key: "warning.description", label: "Özellik Seçilmedi Açıklama", placeholder: "Please select at least one...", multiline: true },
        ],
    },
    {
        id: "support",
        title: "Destek & Kahve",
        description: "Destek modalı ve bağış çağrıları.",
        icon: <Heart size={18} />,
        color: "#ec4899",
        keys: [
            { key: "support.title", label: "Bölüm Başlığı", placeholder: "Support OptWin Development" },
            { key: "support.description", label: "Bölüm Açıklaması", placeholder: "OptWin is entirely free...", multiline: true },
            { key: "support.modalTitle", label: "Modal Başlığı", placeholder: "Support OptWin" },
            { key: "support.modalDesc", label: "Modal Açıklaması", placeholder: "OptWin is developed by...", multiline: true },
            { key: "support.howToSupport", label: "Nasıl Destek Olunur", placeholder: "How to Support" },
            { key: "support.way1", label: "Yöntem 1", placeholder: "Buy us a coffee..." },
            { key: "support.way2", label: "Yöntem 2", placeholder: "Star our GitHub repo..." },
            { key: "support.way3", label: "Yöntem 3", placeholder: "Share OptWin with friends..." },
            { key: "support.buyMeCoffee", label: "BMC Buton Metni", placeholder: "Buy Me a Coffee" },
            { key: "support.widgetMessage", label: "Widget Mesajı", placeholder: "Özgür yazılıma destek olmak ister misiniz?" },
        ],
    },
    {
        id: "footer",
        title: "Footer (Alt Bilgi)",
        description: "En alttaki bilgilendirme metinleri.",
        icon: <Layers size={18} />,
        color: "#6366f1",
        keys: [
            { key: "footer.description", label: "Slogan/Açıklama", placeholder: "OptWin follows open-source...", multiline: true },
            { key: "footer.legal", label: "Yasal Başlık", placeholder: "Legal" },
            { key: "footer.privacy", label: "Gizlilik Politikası", placeholder: "Privacy Policy" },
            { key: "footer.terms", label: "Kullanım Şartları", placeholder: "Terms of Service" },
            { key: "footer.support", label: "Destek Başlığı", placeholder: "Support" },
            { key: "footer.contactUs", label: "İletişim Linki", placeholder: "Contact Us" },
            { key: "footer.contact", label: "İletişim Başlığı", placeholder: "Contact" },
            { key: "footer.allRights", label: "Telif Hakkı Dipnotu", placeholder: "All rights reserved." },
        ],
    },
    {
        id: "contact",
        title: "İletişim Sayfası",
        description: "Form ve başarı mesajları.",
        icon: <MessageSquare size={18} />,
        color: "#14b8a6",
        keys: [
            { key: "contact.title", label: "Ana Başlık", placeholder: "Get in Touch" },
            { key: "contact.description", label: "Form Açıklaması", placeholder: "Have a question...", multiline: true },
            { key: "contact.name", label: "İsim Etiketi", placeholder: "Your Name" },
            { key: "contact.email", label: "E-posta Etiketi", placeholder: "Email Address" },
            { key: "contact.subject", label: "Konu Etiketi", placeholder: "Subject" },
            { key: "contact.message", label: "Mesaj Etiketi", placeholder: "Message" },
            { key: "contact.send", label: "Gönder Butonu", placeholder: "Send Message" },
            { key: "contact.sent", label: "Başarı Başlığı", placeholder: "Message Sent!" },
            { key: "contact.sentDesc", label: "Başarı Açıklaması", placeholder: "Thank you for reaching out..." },
        ],
    },
    {
        id: "dns",
        title: "DNS & Diğerleri",
        description: "DNS seçenekleri ve UI etiketleri.",
        icon: <Settings size={18} />,
        color: "#10b981",
        keys: [
            { key: "dns.title", label: "DNS Başlığı", placeholder: "DNS Provider" },
            { key: "dns.description", label: "DNS Açıklaması", placeholder: "Choose a DNS provider...", multiline: true },
            { key: "dns.confirm", label: "Seçimi Onayla", placeholder: "Confirm" },
            { key: "dns.select", label: "DNS Seç", placeholder: "Select DNS" },
            { key: "preset.recommended", label: "Önerilen Ayarlar", placeholder: "Recommended Settings" },
            { key: "preset.gamer", label: "Oyuncu Ayarları", placeholder: "Gaming Settings" },
            { key: "preset.clearAll", label: "Tümünü Temizle", placeholder: "Clear All" },
            { key: "preset.selectAll", label: "Hepsini Seç", placeholder: "Select All" },
        ],
    },
    {
        id: "ui",
        title: "Sistem & Hata",
        description: "Yükleme, arama ve hata mesajları.",
        icon: <SearchIcon size={18} />,
        color: "#06b6d4",
        keys: [
            { key: "search.placeholder", label: "Arama Kutusu", placeholder: "Search features..." },
            { key: "search.noResults", label: "Sonuç Yok", placeholder: "No results found." },
            { key: "ui.loading", label: "Yükleniyor Yazısı", placeholder: "Loading..." },
            { key: "scrollTop.label", label: "Yukarı Çık Etiketi", placeholder: "Back to top" },
            { key: "maintenance.msg", label: "Bakım Mesajı", placeholder: "Our site is currently...", multiline: true },
            { key: "maintenance.estLabel", label: "Bitiş Etiketi", placeholder: "Estimated Completion" },
        ],
    },
    {
        id: "legal-pages",
        title: "Sözleşme Metinleri",
        description: "Gizlilik ve Kullanım Şartları detayları.",
        icon: <Shield size={18} />,
        color: "#ef4444",
        keys: [
            { key: "privacy.title", label: "Gizlilik Başlık", placeholder: "Privacy Policy" },
            { key: "privacy.intro", label: "Gizlilik Giriş", placeholder: "Your privacy is important...", multiline: true },
            { key: "terms.title", label: "Şartlar Başlık", placeholder: "Terms of Service" },
            { key: "terms.intro", label: "Şartlar Giriş", placeholder: "By using OptWin...", multiline: true },
        ],
    },
];

export default function ContentSettings() {
    const router = useRouter();
    const unsavedCtx = useUnsavedChanges();

    // ─── CONTENT state ──────────────────────────────────────────────────────
    const [activeLang, setActiveLang] = useState("en");
    const [activeSection, setActiveSection] = useState("hero");
    const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({});
    const [originalTranslations, setOriginalTranslations] = useState<Record<string, Record<string, string>>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");

    // Sync with layout lang picker
    useEffect(() => {
        const handler = (e: any) => setActiveLang(e.detail);
        window.addEventListener('optwin:admin-lang-change', handler);
        return () => window.removeEventListener('optwin:admin-lang-change', handler);
    }, []);

    // ─── Fetch content translations ─────────────────────────────────────────
    const fetchTranslations = useCallback(async () => {
        try {
            const allKeys = CONTENT_SECTIONS.flatMap(s => s.keys.map(k => k.key));
            const res = await fetch("/api/admin/ui-translations");
            const data = await res.json();
            if (data.success) {
                const filtered: Record<string, Record<string, string>> = {};
                const activeLangs = Object.keys(data.translations);
                for (const lang of activeLangs) {
                    filtered[lang] = {};
                    const langData = data.translations[lang] || {};
                    for (const key of allKeys) {
                        filtered[lang][key] = langData[key] || "";
                    }
                }
                setTranslations(JSON.parse(JSON.stringify(filtered)));
                setOriginalTranslations(JSON.parse(JSON.stringify(filtered)));
            }
        } catch {
            setError("Çeviriler yüklenemedi.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTranslations();
        window.addEventListener("optwin:languages-updated", fetchTranslations);
        return () => window.removeEventListener("optwin:languages-updated", fetchTranslations);
    }, [fetchTranslations]);

    // ─── Change detection ───────────────────────────────────────────────────
    const hasChanges = useMemo(() => {
        if (!translations[activeLang] || !originalTranslations[activeLang]) return false;
        // Check all languages, not just active one
        return JSON.stringify(translations) !== JSON.stringify(originalTranslations);
    }, [translations, originalTranslations, activeLang]);

    useEffect(() => {
        unsavedCtx.setHasUnsavedChanges(hasChanges);
        return () => unsavedCtx.setHasUnsavedChanges(false);
    }, [hasChanges, unsavedCtx]);

    const handleSave = async () => {
        if (!hasChanges) return;
        setSaving(true);
        setError("");
        try {
            const changes: { key: string; lang: string; value: string }[] = [];
            const activeLangs = Object.keys(translations);
            for (const lang of activeLangs) {
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
                if (!data.success) { setError(data.error || "Kaydetme başarısız"); return; }
            }
            const updatedState = JSON.parse(JSON.stringify(translations));
            setOriginalTranslations(updatedState);
            setSaved(true);
            router.refresh();
            setTimeout(() => setSaved(false), 2000);
        } catch {
            setError("Çeviriler kaydedilemedi.");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setTranslations(JSON.parse(JSON.stringify(originalTranslations)));
    };

    unsavedCtx.onSave.current = handleSave;
    unsavedCtx.onDiscard.current = handleCancel;

    if (loading) return <div className="flex items-center justify-center p-20"><Loader size={32} /></div>;

    return (
        <div className="space-y-4">
            <AdminActionBar
                show={hasChanges}
                saving={saving}
                saved={saved}
                onSave={handleSave}
                onCancel={handleCancel}
                error={error}
            />

            {error && (
                <div className="flex items-center gap-2 p-4 rounded-2xl bg-red-500/[0.08] border border-red-500/15 text-red-400 text-sm animate-shake">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                className="flex flex-col lg:flex-row gap-5 h-[calc(100vh-270px)]"
            >
                {/* Section Sidebar */}
                <div className="lg:w-[260px] shrink-0 rounded-3xl border border-white/[0.04] bg-white/[0.02] flex flex-col shadow-inner">
                    <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                        <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.15em]">Bölümler</h3>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#6b5be6] opacity-30 shadow-[0_0_8px_#6b5be6]"></div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2.5 space-y-1 admin-scrollbar">
                        {CONTENT_SECTIONS.map(section => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-semibold transition-all duration-300 group ${
                                    activeSection === section.id
                                        ? "text-white"
                                        : "text-white/35 hover:text-white/60 hover:bg-white/[0.03]"
                                }`}
                            >
                                {activeSection === section.id && (
                                    <motion.div
                                        layoutId="contentActiveTab"
                                        className="absolute inset-0 rounded-2xl bg-[#6b5be6]/10 border border-[#6b5be6]/20 shadow-[0_4px_12px_rgba(107,91,230,0.05)]"
                                        transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
                                    />
                                )}
                                <span 
                                    style={{ color: activeSection === section.id ? section.color : undefined }} 
                                    className={`shrink-0 transition-colors duration-300 ${activeSection !== section.id ? "group-hover:text-white/40" : ""}`}
                                >
                                    {section.icon}
                                </span>
                                <span className="relative z-10">{section.title}</span>
                                {activeSection === section.id && (
                                    <motion.div 
                                        initial={{ scale: 0 }} 
                                        animate={{ scale: 1 }} 
                                        className="ml-auto w-1 h-4 rounded-full" 
                                        style={{ backgroundColor: section.color }} 
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right — content fields */}
                <div className="flex-1 rounded-3xl border border-white/[0.04] bg-white/[0.02] overflow-hidden flex flex-col shadow-inner">
                    {(() => {
                        const section = CONTENT_SECTIONS.find(s => s.id === activeSection);
                        if (!section) return null;
                        return (
                            <>
                                <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.01]">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: `${section.color}15`, color: section.color, border: `1px solid ${section.color}25` }}>
                                            {section.icon}
                                        </div>
                                        <div>
                                            <h2 className="text-base font-bold text-white tracking-tight">{section.title}</h2>
                                            <p className="text-[12px] text-white/30 font-medium">{section.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[11px] font-bold text-white/20 uppercase tracking-widest">{activeLang} DİLİ</span>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto admin-scrollbar p-6 space-y-4">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={`${activeSection}-${activeLang}`}
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-4"
                                        >
                                            {section.keys.map(kd => {
                                                const value = translations[activeLang]?.[kd.key] || "";
                                                const originalValue = originalTranslations[activeLang]?.[kd.key] || "";
                                                const changed = value !== originalValue;
                                                return (
                                                    <div key={kd.key} className={`group rounded-2xl border transition-all duration-300 ${changed ? "border-[#6b5be6]/30 bg-[#6b5be6]/[0.05] shadow-[0_4px_15px_rgba(107,91,230,0.05)]" : "border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.02] hover:border-white/[0.08]"} p-4`}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2.5">
                                                                <span className="text-[13px] font-bold text-white/70 group-hover:text-white/90 transition-colors uppercase tracking-tight">{kd.label}</span>
                                                                <span className="text-[10px] font-mono text-white/10 group-hover:text-white/20 transition-colors bg-white/5 px-2 py-0.5 rounded-md">{kd.key}</span>
                                                            </div>
                                                            {changed && (
                                                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#6b5be6]/20 border border-[#6b5be6]/20">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#6b5be6] animate-pulse"></div>
                                                                    <span className="text-[9px] font-black text-[#6b5be6] uppercase tracking-widest">Değişti</span>
                                                                </motion.div>
                                                            )}
                                                        </div>
                                                        {kd.multiline ? (
                                                            <textarea
                                                                value={value}
                                                                onChange={e => setTranslations(prev => ({ ...prev, [activeLang]: { ...prev[activeLang], [kd.key]: e.target.value } }))}
                                                                placeholder={kd.placeholder}
                                                                rows={3}
                                                                className="w-full bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] focus:border-[#6b5be6]/40 focus:bg-white/[0.04] rounded-xl px-4 py-3 text-[14px] text-white/80 placeholder-white/10 focus:outline-none transition-all resize-none shadow-sm font-medium leading-relaxed"
                                                            />
                                                        ) : (
                                                            <input
                                                                type="text"
                                                                value={value}
                                                                onChange={e => setTranslations(prev => ({ ...prev, [activeLang]: { ...prev[activeLang], [kd.key]: e.target.value } }))}
                                                                placeholder={kd.placeholder}
                                                                className="w-full bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] focus:border-[#6b5be6]/40 focus:bg-white/[0.04] rounded-xl px-4 py-3 text-[14px] text-white/80 placeholder-white/10 focus:outline-none transition-all shadow-sm font-medium"
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </>
                        );
                    })()}
                </div>
            </motion.div>
        </div>
    );
}
