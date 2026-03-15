"use client";

import {
    Search, X, Check, ChevronDown, Sun, Moon, Menu, ArrowLeft,
    Globe, Star, Gamepad2, RotateCcw, CheckCheck, Terminal, RefreshCw,
    Copy, Download, Info, Send, Loader2, CheckCircle, AlertCircle,
    Heart, Shield, Code, EyeOff, Users, Coffee, Trash2, Archive,
    Container, Power, UserX, BellOff, Gauge, Rocket, FastForward,
    MemoryStick, ShieldCheck, Stethoscope, BriefcaseMedical, Eraser,
    RotateCw, MonitorCog, Palette, MapPin, UserCog, Printer, Headset,
    TruckIcon, Network, Zap, Wifi, Cog, Brush, Sliders,
    Layers, Share2, MicOff, CloudDownload, MapPinOff, Clipboard,
    History, Newspaper, Clock, BadgeInfo, Wand2,
    Lightbulb, Images, Lock, Keyboard, SearchX, FileCode, Eye,
    MousePointer, AppWindow, Cpu, AlignJustify, Phone, Bug, Github,
    BookOpen, Repeat, ExternalLink, ClockArrowUp,
    // Additional icons from AdminIconPicker
    ShieldOff, Timer, TimerOff, Settings, Monitor, HardDrive,
    Battery, BatteryCharging, Fingerprint, ScanLine, Unplug, PlugZap,
    RefreshCcw, ToggleLeft, ToggleRight, Volume2, VolumeX,
    Camera, CameraOff, Bluetooth, BluetoothOff, Usb, Database,
    Server, Cloud, CloudOff, Folder, FolderOpen, File, FilePlus,
    AlertTriangle, HelpCircle, XCircle, Ban, Minus, Plus,
    ArrowUp, ArrowDown, ArrowRight, Activity, BarChart3, PieChart,
    User, UserPlus, UserMinus, Mail, MessageSquare, Bookmark, Flag,
    Tag, Hash, AtSign, Scissors, Wrench, Hammer, Key, Unlock,
    Link, Play, Pause, Square, SkipForward, SkipBack, Shuffle,
    Thermometer, Droplets, Wind, Flame,
} from "lucide-react";

import { type LucideIcon } from "lucide-react";

// Map FontAwesome icon names (from DB) → lucide-react components
const FA_ICON_MAP: Record<string, LucideIcon> = {
    // System
    "fa-trash-can": Trash2,
    "fa-box-archive": Archive,
    "fa-dumpster": Container,
    "fa-power-off": Power,
    "fa-user-secret": UserX,
    "fa-gamepad": Gamepad2,
    "fa-bell-slash": BellOff,
    "fa-gauge-high": Gauge,
    "fa-rocket": Rocket,
    "fa-forward-fast": FastForward,
    "fa-memory": MemoryStick,
    // Maintenance
    "fa-file-shield": ShieldCheck,
    "fa-stethoscope": Stethoscope,
    "fa-kit-medical": BriefcaseMedical,
    "fa-eraser": Eraser,
    "fa-rotate": RotateCw,
    "fa-icons": Palette,
    "fa-image": Images,
    // Services
    "fa-wallet": BadgeInfo,
    "fa-map-location-dot": MapPin,
    "fa-user-gear": UserCog,
    "fa-fax": Phone,
    "fa-bug": Bug,
    "fa-keyboard": Keyboard,
    "fa-print": Printer,
    "fa-magnifying-glass": Search,
    "fa-headset": Headset,
    "fa-truck-fast": TruckIcon,
    // Network
    "fa-network-wired": Network,
    "fa-bolt": Zap,
    "fa-globe": Globe,
    "fa-wifi": Wifi,
    "fa-gears": Cog,
    "fa-broom": Brush,
    "fa-sliders": Sliders,
    "fa-layer-group": Layers,
    "fa-share-nodes": Share2,
    // Privacy
    "fa-microphone-slash": MicOff,
    "fa-cloud-arrow-down": CloudDownload,
    "fa-location-crosshairs": MapPinOff,
    "fa-clipboard": Clipboard,
    "fa-clock-rotate-left": History,
    "fa-newspaper": Newspaper,
    "fa-timeline": Clock,
    "fa-rectangle-ad": BadgeInfo,
    // Visual
    "fa-eye-slash": EyeOff,
    "fa-wand-magic-sparkles": Wand2,
    "fa-lightbulb": Lightbulb,
    "fa-images": Images,
    "fa-lock": Lock,
    // Extra
    "fa-magnifying-glass-minus": SearchX,
    "fa-file-code": FileCode,
    "fa-eye": Eye,
    "fa-arrow-pointer": MousePointer,
    "fa-window-restore": AppWindow,
    "fa-microchip": Cpu,
    "fa-bars": AlignJustify,
    // Brands
    "fa-github": Github,
    "fa-microsoft": MonitorCog,
    // Lucide-native keys (from AdminIconPicker)
    "shield": Shield,
    "shield-off": ShieldOff,
    "timer": Timer,
    "timer-off": TimerOff,
    "download": Download,
    "settings": Settings,
    "monitor": Monitor,
    "hard-drive": HardDrive,
    "battery": Battery,
    "battery-charging": BatteryCharging,
    "fingerprint": Fingerprint,
    "scan-line": ScanLine,
    "unplug": Unplug,
    "plug-zap": PlugZap,
    "refresh-cw": RefreshCw,
    "refresh-ccw": RefreshCcw,
    "toggle-left": ToggleLeft,
    "toggle-right": ToggleRight,
    "volume": Volume2,
    "volume-x": VolumeX,
    "camera": Camera,
    "camera-off": CameraOff,
    "bluetooth": Bluetooth,
    "bluetooth-off": BluetoothOff,
    "usb": Usb,
    "terminal": Terminal,
    "database": Database,
    "server": Server,
    "cloud": Cloud,
    "cloud-off": CloudOff,
    "folder": Folder,
    "folder-open": FolderOpen,
    "file": File,
    "file-plus": FilePlus,
    "alert-triangle": AlertTriangle,
    "info": Info,
    "help-circle": HelpCircle,
    "check-circle": CheckCircle,
    "x-circle": XCircle,
    "ban": Ban,
    "minus": Minus,
    "plus": Plus,
    "arrow-up": ArrowUp,
    "arrow-down": ArrowDown,
    "arrow-left": ArrowLeft,
    "arrow-right": ArrowRight,
    "activity": Activity,
    "bar-chart": BarChart3,
    "pie-chart": PieChart,
    "user": User,
    "users": Users,
    "user-plus": UserPlus,
    "user-minus": UserMinus,
    "mail": Mail,
    "send": Send,
    "message-square": MessageSquare,
    "star": Star,
    "heart": Heart,
    "bookmark": Bookmark,
    "flag": Flag,
    "tag": Tag,
    "hash": Hash,
    "at-sign": AtSign,
    "scissors": Scissors,
    "wrench": Wrench,
    "hammer": Hammer,
    "key": Key,
    "unlock": Unlock,
    "link": Link,
    "external-link": ExternalLink,
    "play": Play,
    "pause": Pause,
    "stop": Square,
    "skip-forward": SkipForward,
    "skip-back": SkipBack,
    "repeat": Repeat,
    "shuffle": Shuffle,
    "sun": Sun,
    "moon": Moon,
    "thermometer": Thermometer,
    "droplets": Droplets,
    "wind": Wind,
    "flame": Flame,
};

// Category icon map
const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
    "fa-computer": MonitorCog,
    "fa-wrench": Cog,
    "fa-gears": Cog,
    "fa-network-wired": Network,
    "fa-shield-halved": Shield,
    "fa-eye": Eye,
    "fa-puzzle-piece": Sliders,
};

/**
 * Renders a lucide-react icon from a FontAwesome name stored in the database.
 * Falls back to a default icon if no mapping exists.
 */
export function FeatureIcon({
    icon,
    className = "",
    size = 18,
}: {
    icon: string;
    iconType?: string;
    className?: string;
    size?: number;
}) {
    // Custom uploaded icon (file path)
    if (icon && (icon.startsWith("/uploads/") || icon.startsWith("/assets/"))) {
        return <img src={icon} alt="" width={size} height={size} className={`object-contain ${className}`} />;
    }
    const IconComponent = FA_ICON_MAP[icon] || Cog;
    return <IconComponent className={className} size={size} strokeWidth={2} />;
}

/**
 * Renders a lucide-react icon from a category FA name.
 */
export function CategoryIcon({
    icon,
    className = "",
    size = 22,
}: {
    icon: string | null;
    className?: string;
    size?: number;
}) {
    if (!icon) return null;
    const IconComponent = CATEGORY_ICON_MAP[icon] || FA_ICON_MAP[icon] || Cog;
    return <IconComponent className={className} size={size} strokeWidth={2} />;
}

// Re-export commonly used icons for direct import
export {
    Search as SearchIcon,
    X as XIcon,
    Check as CheckIcon,
    ChevronDown as ChevronDownIcon,
    Sun as SunIcon,
    Moon as MoonIcon,
    Menu as MenuIcon,
    Globe as GlobeIcon,
    Star as StarIcon,
    Gamepad2 as GamepadIcon,
    RotateCcw as ResetIcon,
    CheckCheck as CheckAllIcon,
    Terminal as TerminalIcon,
    RefreshCw as SpinnerIcon,
    Copy as CopyIcon,
    Download as DownloadIcon,
    Info as InfoIcon,
    Send as SendIcon,
    Loader2 as LoaderIcon,
    CheckCircle as CheckCircleIcon,
    AlertCircle as AlertCircleIcon,
    Heart as HeartIcon,
    Shield as ShieldIcon,
    Code as CodeIcon,
    EyeOff as EyeOffIcon,
    Users as UsersIcon,
    Coffee as CoffeeIcon,
    Github as GithubIcon,
    BookOpen as BookOpenIcon,
    Repeat as RepeatIcon,
    ExternalLink as ExternalLinkIcon,
    ClockArrowUp as RestoreIcon,
    ArrowLeft as ArrowLeftIcon,
};
