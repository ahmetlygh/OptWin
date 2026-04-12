"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { DnsProvider } from "@/types/feature";
import { useTranslation } from "@/i18n/useTranslation";
import { useModalPhase } from "@/hooks/useModalPhase";
import { XIcon, CheckIcon, GlobeIcon } from "../shared/Icons";

export function DnsModal({ providers }: { providers: DnsProvider[] }) {
    const { isDnsModalOpen, setDnsModalOpen, dnsProvider, setDnsProvider } = useOptWinStore();
    const { t } = useTranslation();
    const handleClose = () => setDnsModalOpen(false);
    const { isVisible, isMounted, phase, containerRef } = useModalPhase(isDnsModalOpen, handleClose);

    const handleSelect = (slug: string) => {
        setDnsProvider(slug);
    };

    if (!isMounted) return null;

    return (
        <div
            ref={containerRef}
            className={`fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-xl ${isVisible ? 'modal-backdrop-enter' : phase === 'exiting' ? 'modal-backdrop-exit' : ''}`}
            onClick={handleClose}
        >
            <div
                className={`w-full max-w-4xl bg-(--card-bg) border border-(--border-color) rounded-3xl overflow-hidden shadow-2xl shadow-(--accent-color)/10 relative flex flex-col md:flex-row max-h-[85vh] md:max-h-[75vh] ${isVisible ? 'modal-content-enter' : phase === 'exiting' ? 'modal-content-exit' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={handleClose}
                    className="cursor-pointer absolute top-4 right-4 z-20 size-8 flex items-center justify-center rounded-full bg-(--text-secondary)/10 text-(--text-secondary) hover:bg-(--text-secondary)/20 hover:text-(--text-primary) hover:rotate-90 transition-all duration-200"
                >
                    <XIcon size={14} />
                </button>

                {/* Left Side: Info */}
                <div className="w-full md:w-[32%] bg-(--bg-color)/50 p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-(--border-color)">
                    <div className="space-y-6">
                        <div className="animate-fade-in-up">
                            <div className="size-12 rounded-2xl bg-(--accent-color)/20 text-(--accent-color) flex items-center justify-center mb-4 border border-(--accent-color)/30 shadow-[0_0_15px_rgba(107,91,230,0.3)]">
                                <GlobeIcon size={22} />
                            </div>
                            <h2 className="text-2xl font-black text-(--text-primary) mb-2 tracking-tight">
                                {t["dns.title"]}
                            </h2>
                            <p className="text-sm text-(--text-secondary) leading-relaxed">
                                {t["dns.description"]}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs font-semibold animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                            <span className="bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-md border border-emerald-500/20 flex items-center gap-1">
                                <CheckIcon size={12} /> {t["dns.reversible"]}
                            </span>
                            <span className="bg-blue-500/10 text-blue-500 px-2.5 py-1 rounded-md border border-blue-500/20 flex items-center gap-1">
                                <GlobeIcon size={12} /> {t["dns.systemWide"]}
                            </span>
                        </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-(--border-color) hidden md:flex flex-col gap-3 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                        <button
                            onClick={() => {
                                let psCode = `$servers = @(\n`;
                                providers.forEach(p => {
                                    if(p.primary) psCode += `    @{Name="${p.name}"; IP="${p.primary}"},\n`;
                                });
                                psCode = psCode.replace(/,\n$/, "\n") + `)

Write-Host "Tum DNS adresleri test ediliyor. Bu islem 5-10 saniye surebilir..." -ForegroundColor Cyan
$results = @()
foreach ($s in $servers) {
    Write-Host "Pinging $($s.Name) ($($s.IP))..."
    $ping = Test-Connection -ComputerName $s.IP -Count 3 -ErrorAction SilentlyContinue
    if ($ping) {
        $avg = ($ping | Measure-Object -Property ResponseTime -Average).Average
        $results += [PSCustomObject]@{ "Saglayici"=$s.Name; "IP"=$s.IP; "MS"=[math]::Round($avg) }
    } else {
        $results += [PSCustomObject]@{ "Saglayici"=$s.Name; "IP"=$s.IP; "MS"=9999 }
    }
}
Write-Host ""
Write-Host "--- PING SONUCLARI ---" -ForegroundColor Yellow
$sorted = $results | Sort-Object MS -Descending
$sorted | Format-Table -AutoSize
Write-Host "====== EN DUSUK GECIKME ======" -ForegroundColor Green
$best = $results | Sort-Object MS | Select-Object -First 1
Write-Host ">>> $($best.Saglayici) ($($best.MS) ms) <<<" -ForegroundColor Cyan -BackgroundColor Black
Write-Host ""
`;
                                const wrapper = `@echo off\ncolor 0b\ntitle OptWin Ping Test\nPowerShell -NoProfile -ExecutionPolicy Bypass -Command "& { [ScriptBlock]::Create((Get-Content '%~f0' | Select-Object -Skip 6 | Out-String)).Invoke() }"\npause\nexit\n`;
                                const blob = new Blob([wrapper + psCode], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = "OptWin_DNS_Ping.bat";
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                            }}
                            className="cursor-pointer w-full flex items-center justify-center gap-2 h-12 bg-(--accent-color)/10 hover:bg-(--accent-color)/20 border border-(--accent-color)/30 text-(--accent-color) font-bold rounded-xl shadow-inner transition-all duration-200"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            {t["dns.pingTest"] || "Download Ping Test"}
                        </button>

                        <button
                            onClick={handleClose}
                            className="cursor-pointer w-full flex items-center justify-center gap-2 h-12 bg-(--accent-color) hover:bg-(--accent-hover) text-white font-bold rounded-xl shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(107,91,230,0.4)]"
                        >
                            <CheckIcon size={18} strokeWidth={2.5} />
                            {t["dns.confirmSelection"]}
                        </button>
                    </div>
                </div>

                {/* Right Side: DNS Options */}
                <div className="w-full md:w-[68%] p-4 md:p-6 flex flex-col bg-(--card-bg)">
                    <div className="flex items-center justify-between mb-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                        <h3 className="text-sm font-bold text-(--text-primary) uppercase tracking-wider">
                            {t["dns.availableProviders"]}
                        </h3>
                        <span className="text-xs text-(--text-secondary) bg-(--border-color) px-2.5 py-1 rounded-lg">
                            {providers.length + 1} {t["dns.options"]}
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-2 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
                        {/* Default option */}
                        <label
                            className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer border-2 relative overflow-hidden group transition-all duration-300 ${dnsProvider === "default" ? "border-(--accent-color) bg-(--accent-color)/10 shadow-[0_0_20px_rgba(107,91,230,0.15)]" : "border-(--border-color)/50 bg-(--border-color)/20 hover:bg-(--border-color)/40 hover:border-(--border-color)"}`}
                        >
                            <div
                                className={`relative flex items-center justify-center w-5 h-5 rounded-full border-2 shrink-0 transition-all duration-300 ${dnsProvider === "default" ? 'border-(--accent-color) bg-(--accent-color)' : 'border-(--text-secondary) bg-transparent'}`}
                            >
                                {dnsProvider === "default" && (
                                    <CheckIcon size={12} strokeWidth={3} className="text-white animate-check-bounce" />
                                )}
                            </div>
                            <div className="flex-1">
                                <span className={`font-bold text-sm ${dnsProvider === "default" ? "text-(--text-primary)" : "text-(--text-secondary)"}`}>
                                    {t["dns.defaultLabel"]}
                                </span>
                                <p className="text-[11px] text-(--text-secondary)/70 mt-0.5">
                                    {t["dns.defaultDesc"]}
                                </p>
                            </div>
                            <input type="radio" name="dns" value="default" className="sr-only" checked={dnsProvider === "default"} onChange={() => handleSelect("default")} />
                        </label>

                        {providers.map(p => (
                            <label
                                key={p.slug}
                                className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer border-2 relative overflow-hidden group transition-all duration-300 ${dnsProvider === p.slug ? "border-(--accent-color) bg-(--accent-color)/10 shadow-[0_0_20px_rgba(107,91,230,0.15)]" : "border-(--border-color)/50 bg-(--border-color)/20 hover:bg-(--border-color)/40 hover:border-(--border-color)"}`}
                            >
                                {p.slug === "cloudflare" && (
                                    <div className="absolute top-0 right-0 bg-(--accent-color) text-white text-[9px] font-black px-2.5 py-0.5 rounded-bl-xl tracking-widest shadow-lg z-10">
                                        {t["dns.recommended"]}
                                    </div>
                                )}
                                <div
                                    className={`relative flex items-center justify-center w-5 h-5 rounded-full border-2 shrink-0 transition-all duration-300 ${dnsProvider === p.slug ? 'border-(--accent-color) bg-(--accent-color)' : 'border-(--text-secondary) bg-transparent group-hover:border-(--accent-color)/50'}`}
                                >
                                    {dnsProvider === p.slug && (
                                        <CheckIcon size={12} strokeWidth={3} className="text-white animate-check-bounce" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className={`font-bold text-sm block ${dnsProvider === p.slug ? "text-(--text-primary)" : "text-(--text-secondary)"}`}>{p.name}</span>
                                    <div className="mt-1.5 text-[11px] text-(--text-secondary) font-mono flex flex-wrap gap-1.5">
                                        <span className="px-2 py-0.5 bg-(--border-color) rounded-md border border-(--text-secondary)/10 dark:border-white/5">{p.primary}</span>
                                        <span className="px-2 py-0.5 bg-(--border-color) rounded-md border border-(--text-secondary)/10 dark:border-white/5">{p.secondary}</span>
                                    </div>
                                </div>
                                <input type="radio" name="dns" value={p.slug} className="sr-only" checked={dnsProvider === p.slug} onChange={() => handleSelect(p.slug)} />
                            </label>
                        ))}
                    </div>

                    {/* Mobile Confirm */}
                    <div className="pt-4 flex flex-col gap-2 md:hidden">
                        <button
                            onClick={() => {
                                let psCode = `$servers = @(\n`;
                                providers.forEach(p => {
                                    if(p.primary) psCode += `    @{Name="${p.name}"; IP="${p.primary}"},\n`;
                                });
                                psCode = psCode.replace(/,\n$/, "\n") + `)

Write-Host "Tum DNS adresleri test ediliyor. Bu islem 5-10 saniye surebilir..." -ForegroundColor Cyan
$results = @()
foreach ($s in $servers) {
    Write-Host "Pinging $($s.Name) ($($s.IP))..."
    $ping = Test-Connection -ComputerName $s.IP -Count 3 -ErrorAction SilentlyContinue
    if ($ping) {
        $avg = ($ping | Measure-Object -Property ResponseTime -Average).Average
        $results += [PSCustomObject]@{ "Saglayici"=$s.Name; "IP"=$s.IP; "MS"=[math]::Round($avg) }
    } else {
        $results += [PSCustomObject]@{ "Saglayici"=$s.Name; "IP"=$s.IP; "MS"=9999 }
    }
}
Write-Host ""
Write-Host "--- PING SONUCLARI ---" -ForegroundColor Yellow
$sorted = $results | Sort-Object MS -Descending
$sorted | Format-Table -AutoSize
Write-Host "====== EN DUSUK GECIKME ======" -ForegroundColor Green
$best = $results | Sort-Object MS | Select-Object -First 1
Write-Host ">>> $($best.Saglayici) ($($best.MS) ms) <<<" -ForegroundColor Cyan -BackgroundColor Black
Write-Host ""
`;
                                const wrapper = `@echo off\ncolor 0b\ntitle OptWin Ping Test\nPowerShell -NoProfile -ExecutionPolicy Bypass -Command "& { [ScriptBlock]::Create((Get-Content '%~f0' | Select-Object -Skip 6 | Out-String)).Invoke() }"\npause\nexit\n`;
                                const blob = new Blob([wrapper + psCode], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = "OptWin_DNS_Ping.bat";
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                            }}
                            className="cursor-pointer w-full flex items-center justify-center gap-2 h-12 bg-(--accent-color)/10 hover:bg-(--accent-color)/20 border border-(--accent-color)/30 text-(--accent-color) font-bold rounded-xl shadow-inner transition-all duration-200"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            {t["dns.pingTest"] || "Download Ping Test"}
                        </button>
                        <button
                            onClick={handleClose}
                            className="cursor-pointer w-full flex items-center justify-center gap-2 h-12 bg-(--accent-color) hover:bg-(--accent-hover) text-white font-bold rounded-xl shadow-lg transition-all duration-200"
                        >
                            <CheckIcon size={18} strokeWidth={2.5} />
                            {t["dns.confirm"]}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
