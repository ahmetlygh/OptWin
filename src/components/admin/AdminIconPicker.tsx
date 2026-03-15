"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, ChevronDown, Upload, X,
    Trash2, Archive, Container, Power, UserX, Gamepad2, BellOff, Gauge, Rocket, FastForward,
    MemoryStick, ShieldCheck, Stethoscope, BriefcaseMedical, Eraser, RotateCw, Palette, Images,
    BadgeInfo, MapPin, UserCog, Phone, Bug, Keyboard, Printer, Headset, TruckIcon,
    Network, Zap, Globe, Wifi, Cog, Brush, Sliders, Layers, Share2,
    MicOff, CloudDownload, MapPinOff, Clipboard, History, Newspaper, Clock,
    EyeOff, Wand2, Lightbulb, Lock, SearchX, FileCode, Eye, MousePointer, AppWindow, Cpu, AlignJustify, Github, MonitorCog,
    Shield, ShieldOff, Timer, TimerOff, Download, Settings, Monitor, HardDrive, Battery, BatteryCharging,
    Fingerprint, ScanLine, Unplug, PlugZap, RefreshCw, RefreshCcw, ToggleLeft, ToggleRight,
    Volume2, VolumeX, Camera, CameraOff, Bluetooth, BluetoothOff, Usb, Terminal,
    Database, Server, Cloud, CloudOff, Folder, FolderOpen, File, FilePlus,
    AlertTriangle, Info, HelpCircle, CheckCircle, XCircle, Ban, Minus, Plus,
    ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Activity, BarChart3, PieChart,
    User, Users, UserPlus, UserMinus, Mail, Send, MessageSquare,
    Star, Heart, Bookmark, Flag, Tag, Hash, AtSign,
    Scissors, Wrench, Hammer, Key, Unlock, Link, ExternalLink,
    Play, Pause, Square, SkipForward, SkipBack, Repeat, Shuffle,
    Sun, Moon, Thermometer, Droplets, Wind, Flame,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, { icon: LucideIcon; label: string }> = {
    "fa-trash-can": { icon: Trash2, label: "Çöp Kutusu" },
    "fa-box-archive": { icon: Archive, label: "Arşiv" },
    "fa-dumpster": { icon: Container, label: "Konteyner" },
    "fa-power-off": { icon: Power, label: "Güç" },
    "fa-user-secret": { icon: UserX, label: "Gizli Kullanıcı" },
    "fa-gamepad": { icon: Gamepad2, label: "Oyun Kumandası" },
    "fa-bell-slash": { icon: BellOff, label: "Bildirim Kapalı" },
    "fa-gauge-high": { icon: Gauge, label: "Hız Göstergesi" },
    "fa-rocket": { icon: Rocket, label: "Roket" },
    "fa-forward-fast": { icon: FastForward, label: "Hızlı İleri" },
    "fa-memory": { icon: MemoryStick, label: "Bellek" },
    "fa-file-shield": { icon: ShieldCheck, label: "Dosya Koruma" },
    "fa-stethoscope": { icon: Stethoscope, label: "Stetoskop" },
    "fa-kit-medical": { icon: BriefcaseMedical, label: "Tıbbi Çanta" },
    "fa-eraser": { icon: Eraser, label: "Silgi" },
    "fa-rotate": { icon: RotateCw, label: "Döndür" },
    "fa-icons": { icon: Palette, label: "Palet" },
    "fa-image": { icon: Images, label: "Resim" },
    "fa-wallet": { icon: BadgeInfo, label: "Cüzdan" },
    "fa-map-location-dot": { icon: MapPin, label: "Konum" },
    "fa-user-gear": { icon: UserCog, label: "Kullanıcı Ayar" },
    "fa-fax": { icon: Phone, label: "Telefon" },
    "fa-bug": { icon: Bug, label: "Hata" },
    "fa-keyboard": { icon: Keyboard, label: "Klavye" },
    "fa-print": { icon: Printer, label: "Yazıcı" },
    "fa-magnifying-glass": { icon: Search, label: "Arama" },
    "fa-headset": { icon: Headset, label: "Kulaklık" },
    "fa-truck-fast": { icon: TruckIcon, label: "Hızlı Teslimat" },
    "fa-network-wired": { icon: Network, label: "Ağ" },
    "fa-bolt": { icon: Zap, label: "Şimşek" },
    "fa-globe": { icon: Globe, label: "Dünya" },
    "fa-wifi": { icon: Wifi, label: "WiFi" },
    "fa-gears": { icon: Cog, label: "Dişli" },
    "fa-broom": { icon: Brush, label: "Fırça" },
    "fa-sliders": { icon: Sliders, label: "Kaydırıcı" },
    "fa-layer-group": { icon: Layers, label: "Katmanlar" },
    "fa-share-nodes": { icon: Share2, label: "Paylaşım" },
    "fa-microphone-slash": { icon: MicOff, label: "Mikrofon Kapalı" },
    "fa-cloud-arrow-down": { icon: CloudDownload, label: "Bulut İndirme" },
    "fa-location-crosshairs": { icon: MapPinOff, label: "Konum Kapalı" },
    "fa-clipboard": { icon: Clipboard, label: "Pano" },
    "fa-clock-rotate-left": { icon: History, label: "Geçmiş" },
    "fa-newspaper": { icon: Newspaper, label: "Gazete" },
    "fa-timeline": { icon: Clock, label: "Zaman Çizelgesi" },
    "fa-rectangle-ad": { icon: BadgeInfo, label: "Reklam" },
    "fa-eye-slash": { icon: EyeOff, label: "Görünmez" },
    "fa-wand-magic-sparkles": { icon: Wand2, label: "Sihir Değneği" },
    "fa-lightbulb": { icon: Lightbulb, label: "Ampul" },
    "fa-images": { icon: Images, label: "Resimler" },
    "fa-lock": { icon: Lock, label: "Kilit" },
    "fa-magnifying-glass-minus": { icon: SearchX, label: "Arama İptal" },
    "fa-file-code": { icon: FileCode, label: "Kod Dosyası" },
    "fa-eye": { icon: Eye, label: "Göz" },
    "fa-arrow-pointer": { icon: MousePointer, label: "İmleç" },
    "fa-window-restore": { icon: AppWindow, label: "Pencere" },
    "fa-microchip": { icon: Cpu, label: "İşlemci" },
    "fa-bars": { icon: AlignJustify, label: "Menü" },
    "fa-github": { icon: Github, label: "GitHub" },
    "fa-microsoft": { icon: MonitorCog, label: "Microsoft" },
    "shield": { icon: Shield, label: "Kalkan" },
    "shield-off": { icon: ShieldOff, label: "Kalkan Kapalı" },
    "timer": { icon: Timer, label: "Zamanlayıcı" },
    "timer-off": { icon: TimerOff, label: "Zamanlayıcı Kapalı" },
    "download": { icon: Download, label: "İndirme" },
    "settings": { icon: Settings, label: "Ayarlar" },
    "monitor": { icon: Monitor, label: "Monitör" },
    "hard-drive": { icon: HardDrive, label: "Sabit Disk" },
    "battery": { icon: Battery, label: "Pil" },
    "battery-charging": { icon: BatteryCharging, label: "Pil Şarj" },
    "fingerprint": { icon: Fingerprint, label: "Parmak İzi" },
    "scan-line": { icon: ScanLine, label: "Tarama" },
    "unplug": { icon: Unplug, label: "Fişi Çek" },
    "plug-zap": { icon: PlugZap, label: "Elektrik" },
    "refresh-cw": { icon: RefreshCw, label: "Yenile" },
    "refresh-ccw": { icon: RefreshCcw, label: "Geri Yenile" },
    "toggle-left": { icon: ToggleLeft, label: "Kapalı Toggle" },
    "toggle-right": { icon: ToggleRight, label: "Açık Toggle" },
    "volume": { icon: Volume2, label: "Ses" },
    "volume-x": { icon: VolumeX, label: "Ses Kapalı" },
    "camera": { icon: Camera, label: "Kamera" },
    "camera-off": { icon: CameraOff, label: "Kamera Kapalı" },
    "bluetooth": { icon: Bluetooth, label: "Bluetooth" },
    "bluetooth-off": { icon: BluetoothOff, label: "Bluetooth Kapalı" },
    "usb": { icon: Usb, label: "USB" },
    "terminal": { icon: Terminal, label: "Terminal" },
    "database": { icon: Database, label: "Veritabanı" },
    "server": { icon: Server, label: "Sunucu" },
    "cloud": { icon: Cloud, label: "Bulut" },
    "cloud-off": { icon: CloudOff, label: "Bulut Kapalı" },
    "folder": { icon: Folder, label: "Klasör" },
    "folder-open": { icon: FolderOpen, label: "Açık Klasör" },
    "file": { icon: File, label: "Dosya" },
    "file-plus": { icon: FilePlus, label: "Dosya Ekle" },
    "alert-triangle": { icon: AlertTriangle, label: "Uyarı" },
    "info": { icon: Info, label: "Bilgi" },
    "help-circle": { icon: HelpCircle, label: "Yardım" },
    "check-circle": { icon: CheckCircle, label: "Onay" },
    "x-circle": { icon: XCircle, label: "İptal" },
    "ban": { icon: Ban, label: "Yasak" },
    "minus": { icon: Minus, label: "Eksi" },
    "plus": { icon: Plus, label: "Artı" },
    "arrow-up": { icon: ArrowUp, label: "Yukarı Ok" },
    "arrow-down": { icon: ArrowDown, label: "Aşağı Ok" },
    "arrow-left": { icon: ArrowLeft, label: "Sol Ok" },
    "arrow-right": { icon: ArrowRight, label: "Sağ Ok" },
    "activity": { icon: Activity, label: "Aktivite" },
    "bar-chart": { icon: BarChart3, label: "Grafik" },
    "pie-chart": { icon: PieChart, label: "Pasta Grafik" },
    "user": { icon: User, label: "Kullanıcı" },
    "users": { icon: Users, label: "Kullanıcılar" },
    "user-plus": { icon: UserPlus, label: "Kullanıcı Ekle" },
    "user-minus": { icon: UserMinus, label: "Kullanıcı Çıkar" },
    "mail": { icon: Mail, label: "E-posta" },
    "send": { icon: Send, label: "Gönder" },
    "message-square": { icon: MessageSquare, label: "Mesaj" },
    "star": { icon: Star, label: "Yıldız" },
    "heart": { icon: Heart, label: "Kalp" },
    "bookmark": { icon: Bookmark, label: "Yer İmi" },
    "flag": { icon: Flag, label: "Bayrak" },
    "tag": { icon: Tag, label: "Etiket" },
    "hash": { icon: Hash, label: "Hash" },
    "at-sign": { icon: AtSign, label: "@ İşareti" },
    "scissors": { icon: Scissors, label: "Makas" },
    "wrench": { icon: Wrench, label: "Anahtar" },
    "hammer": { icon: Hammer, label: "Çekiç" },
    "key": { icon: Key, label: "Anahtar" },
    "unlock": { icon: Unlock, label: "Kilit Açık" },
    "link": { icon: Link, label: "Bağlantı" },
    "external-link": { icon: ExternalLink, label: "Dış Bağlantı" },
    "play": { icon: Play, label: "Oynat" },
    "pause": { icon: Pause, label: "Duraklat" },
    "stop": { icon: Square, label: "Durdur" },
    "skip-forward": { icon: SkipForward, label: "İleri Atla" },
    "skip-back": { icon: SkipBack, label: "Geri Atla" },
    "repeat": { icon: Repeat, label: "Tekrar" },
    "shuffle": { icon: Shuffle, label: "Karıştır" },
    "sun": { icon: Sun, label: "Güneş" },
    "moon": { icon: Moon, label: "Ay" },
    "thermometer": { icon: Thermometer, label: "Termometre" },
    "droplets": { icon: Droplets, label: "Damlalar" },
    "wind": { icon: Wind, label: "Rüzgar" },
    "flame": { icon: Flame, label: "Alev" },
};

interface AdminIconPickerProps {
    value: string;
    onChange: (value: string) => void;
}

export function AdminIconPicker({ value, onChange }: AdminIconPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [openDirection, setOpenDirection] = useState<"up" | "down">("up");
    const ref = useRef<HTMLDivElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
        };
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEsc);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEsc);
        };
    }, []);

    const filtered = useMemo(() => {
        if (!search) return Object.entries(ICON_MAP);
        const q = search.toLowerCase();
        return Object.entries(ICON_MAP).filter(([key, data]) =>
            key.toLowerCase().includes(q) || data.label.toLowerCase().includes(q)
        );
    }, [search]);

    const currentIcon = ICON_MAP[value];
    const CurrentIconComp = currentIcon?.icon || Cog;
    const isCustom = value && !ICON_MAP[value] && (value.startsWith("/") || value.startsWith("data:"));

    const [uploading, setUploading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const allowed = ["image/png", "image/webp", "image/svg+xml", "image/jpeg", "image/gif"];
        if (!allowed.includes(file.type)) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
            const data = await res.json();
            if (data.success && data.url) {
                onChange(data.url);
                setIsOpen(false);
            }
        } catch {
            /* ignore */
        } finally {
            setUploading(false);
            if (e.target) e.target.value = "";
        }
    };

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => {
                    if (!isOpen && ref.current) {
                        const rect = ref.current.getBoundingClientRect();
                        const spaceAbove = rect.top;
                        const spaceBelow = window.innerHeight - rect.bottom;
                        setOpenDirection(spaceBelow > 340 ? "down" : spaceAbove > 340 ? "up" : spaceBelow >= spaceAbove ? "down" : "up");
                    }
                    setIsOpen(!isOpen);
                }}
                className={`w-full h-9 px-3 flex items-center gap-2 rounded-xl text-sm transition-all border ${
                    isOpen
                        ? "bg-white/[0.04] border-[#6b5be6]/30 text-white/80"
                        : "bg-white/[0.02] border-white/[0.04] text-white/60 hover:border-white/[0.08]"
                }`}
            >
                <span className="w-5 h-5 flex items-center justify-center shrink-0">
                    {isCustom ? (
                        <img src={value} alt="icon" className="w-4 h-4 object-contain" />
                    ) : (
                        <CurrentIconComp size={15} className="text-[#6b5be6]" />
                    )}
                </span>
                <span className="flex-1 text-left truncate text-xs">
                    {isCustom ? "Özel ikon" : (currentIcon?.label || value)}
                </span>
                <ChevronDown size={13} className="text-white/25 shrink-0" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                        className={`absolute z-[100] left-0 right-0 rounded-xl border border-white/[0.06] bg-[#0f0f18]/95 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden ${openDirection === "up" ? "bottom-full mb-1" : "top-full mt-1"}`}
                    >
                        {/* Search */}
                        <div className="p-2 border-b border-white/[0.04]">
                            <div className="relative">
                                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/20" />
                                <input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="İkon ara..."
                                    className="w-full h-7 pl-7 pr-2 bg-white/[0.03] border border-white/[0.04] rounded-lg text-xs text-white/70 placeholder-white/20 focus:outline-none focus:border-[#6b5be6]/30"
                                    autoFocus
                                />
                                {search && (
                                    <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2">
                                        <X size={11} className="text-white/20" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Icons grid */}
                        <div className="max-h-[280px] overflow-y-auto p-2 custom-scrollbar">
                            <div className="grid grid-cols-7 gap-1">
                                {filtered.map(([key, data]) => {
                                    const IconComp = data.icon;
                                    const isSelected = key === value;
                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => { onChange(key); setIsOpen(false); }}
                                            className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition-all ${
                                                isSelected
                                                    ? "bg-[#6b5be6]/15 text-[#6b5be6]"
                                                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                                            }`}
                                            title={`${data.label} (${key})`}
                                        >
                                            <IconComp size={16} />
                                        </button>
                                    );
                                })}
                            </div>
                            {filtered.length === 0 && (
                                <p className="text-center text-[10px] text-white/20 py-4">İkon bulunamadı</p>
                            )}
                        </div>

                        {/* Upload */}
                        <div className="p-2 border-t border-white/[0.04]">
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                disabled={uploading}
                                className="w-full flex items-center justify-center gap-1.5 h-7 rounded-lg text-[11px] font-medium text-white/30 hover:text-white/60 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] transition-all disabled:opacity-50"
                            >
                                {uploading ? (
                                    <><span className="w-3 h-3 border-2 border-white/20 border-t-[#6b5be6] rounded-full animate-spin" /> Yükleniyor...</>
                                ) : (
                                    <><Upload size={12} /> Dosyadan Yükle (PNG, WebP, SVG)</>
                                )}
                            </button>
                            <input
                                ref={fileRef}
                                type="file"
                                accept=".png,.webp,.svg,.jpg,.jpeg,.gif,image/png,image/webp,image/svg+xml,image/jpeg,image/gif"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
