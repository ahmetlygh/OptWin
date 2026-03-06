"use client";

import { TranslatableText } from "@/components/shared/TranslatableText";
import { useState } from "react";
import { SendIcon, LoaderIcon, CheckCircleIcon, ArrowLeftIcon } from "@/components/shared/Icons";
import Link from "next/link";

export default function Contact() {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (data.success) {
                setStatus("success");
                setFormData({ name: "", email: "", subject: "", message: "" });
            } else {
                setStatus("error");
            }
        } catch {
            setStatus("error");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] w-full animate-fade-in-up mt-8">

            <div className="text-center mb-10 w-full max-w-2xl px-4">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[var(--text-primary)]">
                    <TranslatableText en="Get in Touch" tr="İletişime Geçin" />
                </h1>
                <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
                    <TranslatableText
                        en="Have a question, feedback, or need help with a generated script? Drop us a message and we'll get back to you soon."
                        tr="Bir sorunuz mu var, geri bildirimde bulunmak mı istiyorsunuz veya bir betikle ilgili yardıma mı ihtiyacınız var? Bize mesaj atın, en kısa sürede dönüş yapalım."
                    />
                </p>
            </div>

            <div className="w-full max-w-2xl px-4">
                <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-8 rounded-2xl shadow-xl relative overflow-hidden">
                    {/* Decorative glow */}
                    <div className="absolute -top-32 -right-32 w-64 h-64 bg-[var(--accent-color)]/10 rounded-full blur-[80px] pointer-events-none"></div>

                    {status === "success" ? (
                        <div className="flex flex-col items-center text-center py-10 animate-fade-in-up">
                            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
                                <CheckCircleIcon size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                                <TranslatableText en="Message Sent!" tr="Mesaj Gönderildi!" />
                            </h3>
                            <p className="text-[var(--text-secondary)] mb-8">
                                <TranslatableText en="Thank you for reaching out. We will respond to your email as soon as possible." tr="Ulaştığınız için teşekkürler. E-postanıza en kısa sürede yanıt vereceğiz." />
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStatus("idle")}
                                    className="px-6 py-3 rounded-xl bg-[var(--accent-color)]/10 text-[var(--accent-color)] font-semibold hover:bg-[var(--accent-color)]/20 border border-[var(--accent-color)]/20"
                                    style={{ transition: "all 0.2s" }}
                                >
                                    <TranslatableText en="Send Another Message" tr="Yeni Bir Mesaj Gönder" />
                                </button>
                                <Link
                                    href="/"
                                    className="px-6 py-3 rounded-xl bg-[var(--border-color)]/50 text-[var(--text-primary)] font-semibold hover:bg-[var(--border-color)] flex items-center gap-2"
                                    style={{ transition: "all 0.2s" }}
                                >
                                    <ArrowLeftIcon size={16} />
                                    <TranslatableText en="Back Home" tr="Ana Sayfa" noSpan />
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider ml-1">
                                        <TranslatableText en="Your Name" tr="Adınız" />
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        disabled={status === "loading"}
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/50 focus:border-[var(--accent-color)]"
                                        style={{ transition: "border-color 0.2s, box-shadow 0.2s" }}
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider ml-1">
                                        <TranslatableText en="Email Address" tr="E-posta Adresi" />
                                    </label>
                                    <input
                                        required
                                        type="email"
                                        disabled={status === "loading"}
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/50 focus:border-[var(--accent-color)]"
                                        style={{ transition: "border-color 0.2s, box-shadow 0.2s" }}
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider ml-1">
                                    <TranslatableText en="Subject" tr="Konu" />
                                </label>
                                <input
                                    required
                                    type="text"
                                    disabled={status === "loading"}
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/50 focus:border-[var(--accent-color)]"
                                    style={{ transition: "border-color 0.2s, box-shadow 0.2s" }}
                                    placeholder="Feature request, bug report..."
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider ml-1">
                                    <TranslatableText en="Message" tr="Mesajınız" />
                                </label>
                                <textarea
                                    required
                                    rows={5}
                                    disabled={status === "loading"}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/50 focus:border-[var(--accent-color)] resize-none"
                                    style={{ transition: "border-color 0.2s, box-shadow 0.2s" }}
                                    placeholder="Hello, I would like to report that..."
                                />
                            </div>

                            <button
                                disabled={status === "loading"}
                                className="mt-2 w-full flex items-center justify-center gap-2 h-14 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_20px_rgba(108,92,231,0.25)] hover:shadow-[0_12px_25px_rgba(108,92,231,0.4)]"
                                style={{ transition: "all 0.2s" }}
                            >
                                {status === "loading" ? (
                                    <LoaderIcon size={20} className="animate-spin" />
                                ) : (
                                    <SendIcon size={20} />
                                )}
                                <TranslatableText en="Send Message" tr="Mesajı Gönder" noSpan />
                            </button>
                        </form>
                    )}

                </div>
            </div>
        </div>
    );
}
