import { useState, FormEvent, useEffect } from "react";
import { X, Save, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useOptWinStore } from "@/store/useOptWinStore";
import { Language } from "./LanguageDashboard";

interface Props {
    language: Language | null;
    onClose: () => void;
    onSave: () => void;
}

export function LanguageEditorModal({ language, onClose, onSave }: Props) {
    const { showToast } = useOptWinStore();
    const isEdit = !!language;
    const [formData, setFormData] = useState({
        code: "",
        name: "",
        nativeName: "",
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
        setIsSaving(true);
        try {
            const method = isEdit ? "PUT" : "POST";
            const body = isEdit ? { ...formData, id: language.id } : formData;
            
            const res = await fetch("/api/admin/languages", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            
            if (res.ok) {
                showToast(isEdit ? "Dil güncellendi" : "Dil eklendi", "success");
                onSave();
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

    // ESC to close
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 10 }} 
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                className="relative bg-[#12121a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl custom-scrollbar flex flex-col"
            >
                <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-white/[0.05] bg-[#12121a]/90 backdrop-blur-md">
                    <h2 className="text-xl font-bold text-white">
                        {isEdit ? "Dili Düzenle" : "Yeni Dil Ekle"}
                    </h2>
                    <button onClick={onClose} className="p-2 text-white/50 hover:text-white rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-white/70">Dil Kodu (ISO)</label>
                            <input
                                required disabled={isEdit}
                                type="text"
                                pattern="[a-z]{2,5}"
                                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500/50"
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value })}
                                placeholder="tr, en, zh vb."
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-white/70">Zaman Dilimi (UTC Offset)</label>
                            <input
                                required
                                type="number" step="0.5"
                                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500/50"
                                value={formData.utcOffset}
                                onChange={e => setFormData({ ...formData, utcOffset: parseFloat(e.target.value) })}
                                placeholder="Örn. 3, 0, 8, 5.5"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-white/70">Adı (İngilizce)</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500/50"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Turkish, English vb."
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-white/70">Adı (Yerel)</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500/50"
                                value={formData.nativeName}
                                onChange={e => setFormData({ ...formData, nativeName: e.target.value })}
                                placeholder="Türkçe, English, 中文 vb."
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-white/70 flex items-center justify-between">
                            <span>Bayrak (SVG Kodu)</span>
                            <span className="text-[10px] text-yellow-500/70 border border-yellow-500/20 bg-yellow-500/5 px-2 py-0.5 rounded flex items-center gap-1">
                                <AlertCircle size={10} /> Emoji yasaktır, sadece SVG.
                            </span>
                        </label>
                        <textarea
                            required
                            className="w-full h-32 bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 font-mono text-[11px] custom-scrollbar"
                            value={formData.flagSvg}
                            onChange={e => setFormData({ ...formData, flagSvg: e.target.value })}
                            placeholder='<svg viewBox="0 0 30 20">...</svg>'
                        />
                    </div>

                    <div className="flex gap-10 pt-2">
                        <div className="flex items-center gap-3">
                            <span className="text-[12px] font-bold text-white/70 tracking-wide">Yayımla (Aktif)</span>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                                className={`w-10 h-5 rounded-full transition-all duration-300 relative ${formData.isActive ? "bg-[#6b5be6] shadow-[0_0_15px_rgba(107,91,230,0.3)]" : "bg-white/[0.06] border border-white/[0.05]"}`}
                            >
                                <span className={`absolute top-[2px] w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${formData.isActive ? "left-[22px]" : "left-[2px]"}`} />
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-[12px] font-bold text-white/70 tracking-wide">Varsayılan Dil (Default)</span>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, isDefault: !prev.isDefault }))}
                                className={`w-10 h-5 rounded-full transition-all duration-300 relative ${formData.isDefault ? "bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]" : "bg-white/[0.06] border border-white/[0.05]"}`}
                            >
                                <span className={`absolute top-[2px] w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${formData.isDefault ? "left-[22px]" : "left-[2px]"}`} />
                            </button>
                        </div>
                    </div>

                    <p className="text-[10px] text-white/40 pt-2 flex items-center gap-1.5 border-t border-white/[0.05]">
                        * Varsayılan dil değiştirilirse eski varsayılanın konumu otomatik sıfırlanır.
                    </p>

                    <div className="pt-4 border-t border-white/10 flex justify-end gap-3 sticky bottom-0">
                        <button type="button" onClick={onClose} disabled={isSaving} className="px-5 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:bg-white/5 transition-colors">
                            İptal
                        </button>
                        <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold shadow-xl shadow-purple-900/30 transition-all disabled:opacity-50">
                            {isSaving ? "Kaydediliyor..." : <><Save size={16} /> {isEdit ? "Güncelle" : "Oluştur"}</>}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
