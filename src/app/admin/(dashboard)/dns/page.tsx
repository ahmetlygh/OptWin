"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader } from "@/components/shared/Loader";
import { AdminActionBar } from "@/components/admin/AdminActionBar";
import { useUnsavedChanges } from "@/components/admin/UnsavedChangesContext";
import { Globe, Plus, Trash2, Pencil, Check, RotateCcw } from "lucide-react";

type DnsProvider = {
    id: string;
    slug: string;
    name: string;
    primary: string;
    secondary: string;
    order: number;
    enabled: boolean;
};

export default function AdminDnsPage() {
    const [providers, setProviders] = useState<DnsProvider[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<DnsProvider | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const fetchProviders = async () => {
        const res = await fetch("/api/admin/dns");
        const data = await res.json();
        if (data.success) setProviders(data.providers);
        setLoading(false);
    };

    useEffect(() => { fetchProviders(); }, []);

    const toggleEnabled = async (p: DnsProvider) => {
        await fetch("/api/admin/dns", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: p.id, enabled: !p.enabled }),
        });
        fetchProviders();
    };

    const handleDelete = async (id: string) => {
        await fetch(`/api/admin/dns?id=${id}`, { method: "DELETE" });
        setDeleteConfirm(null);
        fetchProviders();
    };

    const handleSave = async (formData: any) => {
        setSaving(true);
        try {
            const method = isCreating ? "POST" : "PUT";
            const res = await fetch("/api/admin/dns", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) {
                setSaved(true);
                setTimeout(() => {
                    setEditing(null);
                    setIsCreating(false);
                    setSaved(false);
                    fetchProviders();
                }, 1200);
            } else {
                alert(data.error || "Failed to save");
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader />
            </div>
        );
    }

    if (editing || isCreating) {
        return (
            <DnsForm
                provider={editing}
                isCreating={isCreating}
                saving={saving}
                saved={saved}
                onSave={handleSave}
                onCancel={() => { setEditing(null); setIsCreating(false); }}
            />
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">DNS Providers</h2>
                    <p className="text-sm text-[#a19eb7] mt-1">{providers.length} providers</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="h-10 px-5 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white font-bold text-sm rounded-xl transition-all duration-200 flex items-center gap-2 hover:-translate-y-0.5 shadow-lg shadow-[var(--accent-color)]/20"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Add Provider
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {providers.map(p => (
                    <div key={p.id} className="bg-[#1a1a24]/80 border border-[#2b2938] rounded-2xl p-5 hover:border-white/10 transition-all group relative">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="font-bold text-white">{p.name}</h3>
                                <p className="text-[10px] text-[#a19eb7]/60 font-mono mt-0.5">{p.slug}</p>
                            </div>
                            <button
                                onClick={() => toggleEnabled(p)}
                                className={`w-10 h-5 rounded-full transition-all duration-300 relative shrink-0 ${p.enabled ? "bg-emerald-500" : "bg-white/10"}`}
                            >
                                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${p.enabled ? "left-5.5" : "left-0.5"}`} />
                            </button>
                        </div>

                        <div className="flex gap-2 mb-4">
                            <div className="flex-1 bg-black/30 border border-white/5 rounded-lg p-3">
                                <p className="text-[10px] text-[#a19eb7] uppercase tracking-wider mb-1">Primary</p>
                                <p className="text-sm text-white font-mono">{p.primary}</p>
                            </div>
                            <div className="flex-1 bg-black/30 border border-white/5 rounded-lg p-3">
                                <p className="text-[10px] text-[#a19eb7] uppercase tracking-wider mb-1">Secondary</p>
                                <p className="text-sm text-white font-mono">{p.secondary}</p>
                            </div>
                        </div>

                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => setEditing(p)}
                                className="flex-1 h-8 flex items-center justify-center gap-1.5 rounded-lg bg-[var(--accent-color)]/10 text-[var(--accent-color)] text-xs font-bold hover:bg-[var(--accent-color)]/20 transition-all"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                                Edit
                            </button>
                            <button
                                onClick={() => setDeleteConfirm(p.id)}
                                className="h-8 px-3 flex items-center justify-center gap-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /></svg>
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {deleteConfirm && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-xl" onClick={() => setDeleteConfirm(null)}>
                    <div className="bg-[#1a1a24] border border-[#2b2938] rounded-2xl p-6 max-w-sm w-full mx-4 animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-white mb-2 italic tracking-tight">Kanalı Temizle?</h3>
                        <p className="text-xs text-[#a19eb7]/60 mb-6 font-medium leading-relaxed">Bu DNS sağlayıcısını seçim listesinden kalıcı olarak kaldıracaktır.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 h-10 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all text-xs">İptal</button>
                            <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 h-10 bg-red-500/80 hover:bg-red-600 text-white font-bold rounded-xl transition-all text-xs">Sil</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function DnsForm({ provider, isCreating, saving, saved, onSave, onCancel }: {
    provider: DnsProvider | null;
    isCreating: boolean;
    saving: boolean;
    saved: boolean;
    onSave: (data: any) => void;
    onCancel: () => void;
}) {
    const [slug, setSlug] = useState(provider?.slug || "");
    const [name, setName] = useState(provider?.name || "");
    const [primary, setPrimary] = useState(provider?.primary || "");
    const [secondary, setSecondary] = useState(provider?.secondary || "");
    const [order, setOrder] = useState(provider?.order || 0);
    const [enabled, setEnabled] = useState(provider?.enabled !== false);

    const handleSubmit = () => {
        const data: any = { slug, name, primary, secondary, order, enabled };
        if (!isCreating) data.id = provider!.id;
        onSave(data);
    };

    const { setHasUnsavedChanges } = useUnsavedChanges();
    const hasChanges = useMemo(() => {
        return slug !== (provider?.slug || "") ||
               name !== (provider?.name || "") ||
               primary !== (provider?.primary || "") ||
               secondary !== (provider?.secondary || "") ||
               order !== (provider?.order || 0) ||
               enabled !== (provider?.enabled !== false);
    }, [slug, name, primary, secondary, order, enabled, provider]);

    useEffect(() => {
        setHasUnsavedChanges(hasChanges);
        return () => setHasUnsavedChanges(false);
    }, [hasChanges, setHasUnsavedChanges]);

    const inputClass = "w-full h-10 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-[#a19eb7]/50 focus:outline-none focus:border-[#6b5be6]/50 transition-colors";
    const labelClass = "block text-[10px] font-bold text-[#a19eb7] uppercase tracking-widest mb-2 opacity-40";

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onCancel} className="size-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all border border-white/5">
                        <RotateCcw size={16} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight">{isCreating ? "Yeni DNS Sağlayıcı" : "DNS Sağlayıcıyı Düzenle"}</h2>
                        <p className="text-xs text-white/20 mt-0.5 font-medium italic">Sistem genelinde kullanılacak DNS yapılandırması</p>
                    </div>
                </div>
                <AdminActionBar
                    show={hasChanges || isCreating}
                    saving={saving}
                    saved={saved}
                    onSave={handleSubmit}
                    onCancel={onCancel}
                    saveText={isCreating ? "Ekle" : "Kaydet"}
                />
            </div>

            <div className="bg-[#1a1a24]/80 border border-[#2b2938] rounded-2xl p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Slug</label>
                        <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="e.g. cloudflare" className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Display Name</label>
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Cloudflare" className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Primary DNS</label>
                        <input value={primary} onChange={e => setPrimary(e.target.value)} placeholder="1.1.1.1" className={`${inputClass} font-mono`} />
                    </div>
                    <div>
                        <label className={labelClass}>Secondary DNS</label>
                        <input value={secondary} onChange={e => setSecondary(e.target.value)} placeholder="1.0.0.1" className={`${inputClass} font-mono`} />
                    </div>
                    <div>
                        <label className={labelClass}>Order</label>
                        <input type="number" value={order} onChange={e => setOrder(parseInt(e.target.value) || 0)} className={inputClass} />
                    </div>
                    <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer pb-2">
                            <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} className="sr-only peer" />
                            <div className="w-10 h-5 rounded-full bg-white/10 peer-checked:bg-emerald-500 transition-all relative">
                                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${enabled ? "left-5.5" : "left-0.5"}`} />
                            </div>
                            <span className="text-sm text-white font-medium">Enabled</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
