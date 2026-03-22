import { Settings } from "lucide-react";

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-[var(--bg-color)]">
            <div className="flex flex-col items-center gap-5">
                <div className="optwin-spinner">
                    <Settings size={48} className="text-[var(--accent-color)] opacity-30" strokeWidth={1.5} />
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-[var(--accent-color)]/40 animate-[pulse_1.5s_ease-in-out_infinite]" />
                    <div className="w-1 h-1 rounded-full bg-[var(--accent-color)]/40 animate-[pulse_1.5s_ease-in-out_0.3s_infinite]" />
                    <div className="w-1 h-1 rounded-full bg-[var(--accent-color)]/40 animate-[pulse_1.5s_ease-in-out_0.6s_infinite]" />
                </div>
            </div>
        </div>
    );
}
