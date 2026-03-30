import { useState, FormEvent, useEffect } from "react";
import { X, Save, AlertCircle, Globe, Type, Flag, Clock, Code2 } from "lucide-react";
import { motion } from "framer-motion";
import { useOptWinStore } from "@/store/useOptWinStore";
import { Language } from "./LanguageDashboard";

interface Props {
    language: Language | null;
    displayOnly?: boolean;
    onClose: () => void;
    onSave: (updated?: Language) => void;
}

const FieldLabel = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
    <label className="flex items-center gap-2 text-[10px] font-black text-white/50 uppercase tracking-[0.15em] mb-1.5">
        <span className="text-[#6b5be6]/70">{icon}</span>
        {children}
    </label>
);

const inputClasses = "w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-[13px] text-white focus:outline-none focus:border-[#6b5be6]/50 focus:bg-white/[0.04] transition-all placeholder-white/15";

export function LanguageEditorModal({ language, onClose, onSave, displayOnly = false }: Props) {
    const { showToast } = useOptWinStore();
    const isEdit = !!language;
    const [formData, setFormData] = useState({
        code: "",
        name: "",
        nativeName: "",
        turkishName: "",
        flagSvg: "",
        utcOffset: 0,
        isActive: true,
        isDefault: false,
        sortOrder: 0,
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (language) {
            setFormData({
                code: language.code,
                name: language.name,
                nativeName: language.nativeName,
                turkishName: language.turkishName || "",
                flagSvg: language.flagSvg,
                utcOffset: language.utcOffset,
                isActive: language.isActive,
                isDefault: language.isDefault,
                sortOrder: language.sortOrder,
            });
        }
    }, [language]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (formData.name.trim().includes(" ")) {
            showToast("Dil ismi (İngilizce) tek kelime olmalıdır.", "error");
            return;
        }

        const updated: Language = {
            ...(language || {} as Language),
            ...formData,
            code: formData.code.trim() // Keep case for pt-BR style, just trim
        };

        if (displayOnly) {
            onSave(updated);
            return;
        }

        setIsSaving(true);
        try {
            const method = isEdit ? "PUT" : "POST";
            const body = isEdit ? { ...formData, id: language?.id, newCode: formData.code } : formData;
            const res = await fetch("/api/admin/languages", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                showToast(isEdit ? "Dil güncellendi" : "Dil eklendi", "success");
                onSave(updated);
            } else {
                const data = await res.json();
                showToast(data.error || "Hata oluştu", "error");
            }
        } catch {
            showToast("Ağ hatası", "error");
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="relative bg-[#0d0d12]/95 backdrop-blur-2xl border border-white/[0.06] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6),0_0_60px_rgba(107,91,230,0.08)] flex flex-col"
            >
                {/* Ambient Glows */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#6b5be6]/8 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/5 blur-3xl pointer-events-none" />

                {/* Header */}
                <div className="relative z-10 flex items-center justify-between p-6 border-b border-white/[0.04]">
                    <div>
                        <h2 className="text-sm font-black text-white uppercase tracking-tight">
                            {isEdit ? "DİL AYARLARI" : "YENİ DİL EKLE"}
                        </h2>
                        <p className="text-[10px] text-white/30 font-medium mt-0.5">
                            {isEdit ? "Mevcut dil bilgilerini güncelleyin" : "Platforma yeni bir dil ekleyin"}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 text-white/30 hover:text-white hover:bg-white/[0.05] rounded-xl transition-all">
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="relative z-10 p-5 space-y-5 flex-1 overflow-y-auto custom-scrollbar">
                    {/* Row 1: Code + UTC */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <FieldLabel icon={<Code2 size={11} />}>Dil Kodu (ISO)</FieldLabel>
                            <input
                                required type="text" 
                                pattern="^[a-zA-Z]{2,3}(?:-[a-zA-Z]{2,4})?$"
                                className={inputClasses}
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value.trim() })}
                                placeholder="tr, en, pt-BR"
                            />
                        </div>
                        <div>
                            <FieldLabel icon={<Clock size={11} />}>UTC Offset</FieldLabel>
                            <div className="flex items-center gap-2">
                                <button 
                                    type="button" 
                                    onClick={() => setFormData(p => ({ ...p, utcOffset: p.utcOffset - 0.5 }))}
                                    className="h-[42px] px-4 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white/40 hover:text-white hover:bg-white/[0.06] transition-all font-black"
                                >
                                    -
                                </button>
                                <div className={`${inputClasses} flex-1 flex items-center justify-center font-mono text-center`}>
                                    {formData.utcOffset > 0 ? `+${formData.utcOffset}` : formData.utcOffset}
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => setFormData(p => ({ ...p, utcOffset: p.utcOffset + 0.5 }))}
                                    className="h-[42px] px-4 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white/40 hover:text-white hover:bg-white/[0.06] transition-all font-black"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ISO Code Change Warning */}
                    {isEdit && language && formData.code !== language.code && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="p-3 bg-amber-500/[0.05] border border-amber-500/20 rounded-xl flex gap-2.5 items-start">
                            <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={14} />
                            <div>
                                <p className="text-[10px] font-black text-amber-400 uppercase tracking-wider">ISO Kodu Değişimi</p>
                                <p className="text-[9px] text-amber-500/60 leading-relaxed mt-0.5">Mevcut SEO linklerini bozabilir.</p>
                            </div>
                        </motion.div>
                    )}

                    {/* Row 2: Name EN + Name Local */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <FieldLabel icon={<Type size={11} />}>Adı (EN - Tek Kelime)</FieldLabel>
                            <input
                                required type="text" pattern="^\S+$"
                                title="Boşluksuz tek bir kelime girin."
                                className={inputClasses}
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value.trim() })}
                                placeholder="Turkish"
                            />
                        </div>
                        <div>
                            <FieldLabel icon={<Globe size={11} />}>Adı (Yerel)</FieldLabel>
                            <input
                                required type="text"
                                className={inputClasses}
                                value={formData.nativeName}
                                onChange={e => setFormData({ ...formData, nativeName: e.target.value })}
                                placeholder="Türkçe"
                            />
                        </div>
                    </div>

                    {/* Turkish Name */}
                    <div>
                        <FieldLabel icon={<Type size={11} />}>Adı (Türkçe)</FieldLabel>
                        <input
                            required type="text"
                            className={inputClasses}
                            value={formData.turkishName}
                            onChange={e => setFormData({ ...formData, turkishName: e.target.value })}
                            placeholder="Türkçe, İngilizce"
                        />
                    </div>

                    {/* SVG Flag */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <FieldLabel icon={<Flag size={11} />}>Bayrak (SVG)</FieldLabel>
                            <span className="text-[8px] text-amber-500/60 border border-amber-500/15 bg-amber-500/[0.03] px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1">
                                <AlertCircle size={8} /> Sadece SVG
                            </span>
                        </div>
                        <textarea
                            required
                            className={`${inputClasses} h-28 font-mono text-[11px] resize-none`}
                            value={formData.flagSvg}
                            onChange={e => setFormData({ ...formData, flagSvg: e.target.value })}
                            placeholder='<svg viewBox="0 0 30 20">...</svg>'
                        />
                    </div>

                    {/* Footer Buttons */}
                    <div className="pt-4 border-t border-white/[0.04] flex justify-end gap-2.5">
                        <button type="button" onClick={onClose} disabled={isSaving} className="px-5 py-2.5 rounded-xl text-[11px] font-bold text-white/40 hover:text-white/70 hover:bg-white/[0.03] transition-all">
                            İptal
                        </button>
                        <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#6b5be6] hover:bg-[#5a4cc2] text-white text-[11px] font-black uppercase tracking-wider shadow-lg shadow-purple-900/20 transition-all active:scale-95 disabled:opacity-50">
                            {isSaving ? "Kaydediliyor..." : <><Save size={14} /> {isEdit ? "Güncelle" : "Oluştur"}</>}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
