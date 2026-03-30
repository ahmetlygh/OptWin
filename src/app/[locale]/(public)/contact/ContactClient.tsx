"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { useState, useEffect } from "react";
import { SendIcon, LoaderIcon, CheckCircleIcon, ArrowLeftIcon } from "@/components/shared/Icons";
import { ShieldCheck, AlertCircle } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function ContactClient() {
    const { t } = useTranslation();
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");
    
    // Captcha State
    const [captchaToken, setCaptchaToken] = useState("");
    const [captchaQuestion, setCaptchaQuestion] = useState("");
    const [captchaAnswer, setCaptchaAnswer] = useState("");

    const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

    // Fetch Captcha on mount
    const fetchCaptcha = async () => {
        try {
            const res = await fetch("/api/contact/captcha");
            const data = await res.json();
            if (data.success) {
                setCaptchaQuestion(data.question);
                setCaptchaToken(data.token);
                setCaptchaAnswer(""); // Reset answer
            }
        } catch {
            // fallback gracefully
        }
    };

    useEffect(() => {
        fetchCaptcha();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setErrorMessage("");

        if (formData.message.length < 20) {
            setErrorMessage("Mesaj çok kısa (En az 20 karakter).");
            setStatus("error");
            return;
        }
        if (!captchaAnswer) {
            setErrorMessage("Lütfen matematik sorusunu yanıtlayın.");
            setStatus("error");
            return;
        }

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    captchaToken,
                    captchaAnswer: parseInt(captchaAnswer)
                }),
            });

            const data = await res.json();
            if (data.success) {
                setStatus("success");
                setFormData({ name: "", email: "", subject: "", message: "" });
            } else {
                setErrorMessage(data.error || "Beklenmeyen bir hata oluştu.");
                setStatus("error");
                fetchCaptcha();
            }
        } catch {
            setErrorMessage("Sunucuya bağlanılamadı.");
            setStatus("error");
            fetchCaptcha();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[75vh] w-full animate-fade-in-up mt-10 mb-20 px-4">
            <div className="text-center mb-12 w-full max-w-2xl px-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/20 text-[var(--accent-color)] text-[11px] font-bold uppercase tracking-widest mb-4">
                    <ShieldCheck size={14} /> Güvenli İletişim
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-5 text-[var(--text-primary)]">
                    {t["contact.title"]}
                </h1>
                <p className="text-[var(--text-secondary)] text-lg leading-relaxed font-medium">
                    {t["contact.description"]}
                </p>
            </div>

            <div className="w-full max-w-2xl px-4">
                <div className="bg-[var(--card-bg)] border border-[var(--border-color)]/80 backdrop-blur-2xl p-8 sm:p-10 rounded-[2.5rem] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] relative overflow-hidden transition-all duration-300">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent-color)]/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#3b82f6]/5 rounded-full blur-[80px] pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

                    <AnimatePresence mode="wait">
                        {status === "success" ? (
                            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center py-12 relative z-10">
                                <div className="w-24 h-24 rounded-[2rem] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mb-8 shadow-inner shadow-emerald-500/10">
                                    <CheckCircleIcon size={48} />
                                </div>
                                <h3 className="text-3xl font-black text-[var(--text-primary)] tracking-tight mb-3">{t["contact.sent"]}</h3>
                                <p className="text-[var(--text-secondary)] mb-10 text-lg font-medium max-w-sm">{t["contact.sentDesc"]}</p>
                                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                    <button onClick={() => { setStatus("idle"); fetchCaptcha(); }} className="px-8 py-3.5 rounded-2xl bg-[var(--accent-color)] text-white font-bold hover:brightness-110 active:scale-95 shadow-[0_8px_20px_rgba(108,92,231,0.25)] flex-1 sm:flex-none transition-all">Yeni Mesaj Gönder</button>
                                    <Link href="/" className="px-8 py-3.5 rounded-2xl bg-[var(--input-bg)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold hover:bg-[var(--border-color)] flex items-center justify-center gap-2 flex-1 sm:flex-none transition-all active:scale-95"><ArrowLeftIcon size={18} /> Ana Sayfaya Dön</Link>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10">
                                {status === "error" && errorMessage && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/[0.08] border border-red-500/20 text-red-500 text-[14px] font-medium shadow-inner shadow-red-500/5">
                                        <AlertCircle size={18} className="shrink-0" /> {errorMessage}
                                    </motion.div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2.5">
                                        <label className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.1em] ml-1">{t["contact.name"]}</label>
                                        <input required type="text" disabled={status === "loading"} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-5 py-4 bg-[var(--input-bg)]/50 backdrop-blur-sm border border-[var(--border-color)] hover:border-[var(--accent-color)]/30 rounded-[1.25rem] text-[var(--text-primary)] font-medium placeholder-[var(--text-secondary)]/40 focus:outline-none focus:ring-4 focus:ring-[var(--accent-color)]/10 focus:border-[var(--accent-color)]/60 transition-all shadow-sm" placeholder="John Doe" />
                                    </div>
                                    <div className="flex flex-col gap-2.5">
                                        <label className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.1em] ml-1">{t["contact.email"]}</label>
                                        <input required type="email" disabled={status === "loading"} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-5 py-4 bg-[var(--input-bg)]/50 backdrop-blur-sm border border-[var(--border-color)] hover:border-[var(--accent-color)]/30 rounded-[1.25rem] text-[var(--text-primary)] font-medium placeholder-[var(--text-secondary)]/40 focus:outline-none focus:ring-4 focus:ring-[var(--accent-color)]/10 focus:border-[var(--accent-color)]/60 transition-all shadow-sm" placeholder="john@example.com" />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2.5">
                                    <label className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.1em] ml-1">{t["contact.subject"]}</label>
                                    <input required type="text" disabled={status === "loading"} value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="w-full px-5 py-4 bg-[var(--input-bg)]/50 backdrop-blur-sm border border-[var(--border-color)] hover:border-[var(--accent-color)]/30 rounded-[1.25rem] text-[var(--text-primary)] font-medium placeholder-[var(--text-secondary)]/40 focus:outline-none focus:ring-4 focus:ring-[var(--accent-color)]/10 focus:border-[var(--accent-color)]/60 transition-all shadow-sm" placeholder="Konu başlığı" />
                                </div>
                                <div className="flex flex-col gap-2.5">
                                    <label className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.1em] ml-1">{t["contact.message"]}</label>
                                    <textarea required rows={5} disabled={status === "loading"} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full px-5 py-4 bg-[var(--input-bg)]/50 backdrop-blur-sm border border-[var(--border-color)] hover:border-[var(--accent-color)]/30 rounded-[1.25rem] text-[var(--text-primary)] font-medium placeholder-[var(--text-secondary)]/40 focus:outline-none focus:ring-4 focus:ring-[var(--accent-color)]/10 focus:border-[var(--accent-color)]/60 transition-all resize-none shadow-sm" placeholder="Mesajınızı buraya girin..." />
                                </div>
                                <div className="flex flex-col sm:flex-row items-center gap-4 bg-[var(--card-bg)] border border-[var(--border-color)] p-4 rounded-[1.25rem]">
                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="w-10 h-10 rounded-xl bg-[var(--accent-color)]/10 text-[var(--accent-color)] flex items-center justify-center font-black tracking-widest border border-[var(--accent-color)]/20 shadow-inner">?=?</div>
                                        <div><p className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest shrink-0">İnsan Doğrulaması</p><p className="text-[14px] font-bold text-[var(--text-primary)]">{captchaQuestion ? `${captchaQuestion}` : "Soru yükleniyor..."}</p></div>
                                    </div>
                                    <div className="w-full sm:w-px sm:h-10 bg-[var(--border-color)] hidden sm:block mx-1"></div>
                                    <input required type="number" disabled={status === "loading" || !captchaQuestion} value={captchaAnswer} onChange={(e) => setCaptchaAnswer(e.target.value)} className="w-full sm:w-full flex-1 px-4 py-3 bg-[var(--input-bg)]/60 border border-[var(--border-color)] hover:border-[var(--accent-color)]/40 rounded-xl text-[var(--text-primary)] font-black text-center focus:outline-none focus:ring-4 focus:ring-[var(--accent-color)]/10 focus:border-[var(--accent-color)]/70 transition-all placeholder-[var(--text-secondary)]/30" placeholder="Cevap" />
                                </div>
                                <button disabled={status === "loading"} className="mt-2 w-full flex items-center justify-center gap-3 h-16 bg-[var(--accent-color)] hover:brightness-110 active:scale-[0.98] text-white font-black text-[15px] tracking-wide rounded-[1.25rem] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(108,92,231,0.3)] transition-all overflow-hidden relative group">
                                    <div className="relative z-10 flex items-center gap-3">{status === "loading" ? (<><LoaderIcon size={22} className="animate-spin" /><span>Gönderiliyor...</span></>) : (<><span>MESAJI GÖNDER</span><SendIcon size={20} /></>)}</div>
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
