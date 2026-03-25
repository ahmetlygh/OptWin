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
} from "lucide-react";
import { useUnsavedChanges } from "@/components/admin/UnsavedChangesContext";
import { AdminActionBar } from "@/components/admin/AdminActionBar";
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

const LANGS = ["en", "tr", "de", "fr", "es", "zh", "hi"];

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
            { key: "support.widgetMessage", label: "Widget Mesajı", placeholder: "Özgür yazılıma destek olmak ister misiniz?" },
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

export default function ContentSettings() {
    const router = useRouter();
    const unsavedCtx = useUnsavedChanges();

    // ─── CONTENT state ──────────────────────────────────────────────────────
    const [activeLang, setActiveLang] = useState("en");
    const [activeSection, setActiveSection] = useState("about");
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
            setError("Çeviriler yüklenemedi.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTranslations();
    }, [fetchTranslations]);

    // ─── Change detection ───────────────────────────────────────────────────
    const hasChanges = useMemo(() =>
        JSON.stringify(translations) !== JSON.stringify(originalTranslations),
        [translations, originalTranslations]
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
                if (!data.success) { setError(data.error || "Kaydetme başarısız"); return; }
            }
            setOriginalTranslations(JSON.parse(JSON.stringify(translations)));
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

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader size={32} />
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

            {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/[0.06] border border-red-500/10 text-red-400 text-sm">
                    <AlertCircle size={14} /> {error}
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-280px)]">
                {/* Section Sidebar */}
                <div className="lg:w-[220px] shrink-0 rounded-2xl border border-white/[0.04] bg-white/[0.015] overflow-hidden flex flex-col">
                    <div className="px-4 py-3 border-b border-white/[0.04]">
                        <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-wider">Bölümler</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
                        {CONTENT_SECTIONS.map(section => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`relative z-0 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium transition-all ${
                                    activeSection === section.id
                                        ? "text-white"
                                        : "text-white/35 hover:text-white/60 hover:bg-white/[0.03]"
                                }`}
                            >
                                {activeSection === section.id && (
                                    <motion.div
                                        layoutId="contentSidebarTab"
                                        className="absolute inset-0 -z-10 rounded-lg bg-[#6b5be6]/10 border border-[#6b5be6]/15"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <span style={{ color: activeSection === section.id ? section.color : undefined }} className={`relative z-10 ${activeSection !== section.id ? "text-white/20" : ""}`}>
                                    {section.icon}
                                </span>
                                <span className="relative z-10">{section.title}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right — content fields */}
                <div className="flex-1 rounded-2xl border border-white/[0.04] bg-white/[0.015] overflow-hidden flex flex-col min-h-0">
                    {(() => {
                        const section = CONTENT_SECTIONS.find(s => s.id === activeSection);
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
                                                        onChange={e => setTranslations(prev => ({ ...prev, [activeLang]: { ...prev[activeLang], [kd.key]: e.target.value } }))}
                                                        placeholder={kd.placeholder}
                                                        rows={3}
                                                        className="w-full bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.10] focus:border-[#6b5be6]/30 rounded-lg px-3 py-2 text-[13px] text-white/80 placeholder-white/15 focus:outline-none transition-all resize-none shadow-sm"
                                                    />
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={value}
                                                        onChange={e => setTranslations(prev => ({ ...prev, [activeLang]: { ...prev[activeLang], [kd.key]: e.target.value } }))}
                                                        placeholder={kd.placeholder}
                                                        className="w-full bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.10] focus:border-[#6b5be6]/30 rounded-lg px-3 py-2 text-[13px] text-white/80 placeholder-white/15 focus:outline-none transition-all shadow-sm"
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
        </div>
    );
}
