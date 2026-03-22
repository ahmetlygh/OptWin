import { Settings } from "lucide-react";

export default function AdminLoading() {
    return (
        <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
                <div className="optwin-spinner">
                    <Settings size={28} className="text-[#6b5be6] opacity-40" strokeWidth={1.5} />
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-[#6b5be6]/30 animate-[pulse_1.5s_ease-in-out_infinite]" />
                    <div className="w-1 h-1 rounded-full bg-[#6b5be6]/30 animate-[pulse_1.5s_ease-in-out_0.3s_infinite]" />
                    <div className="w-1 h-1 rounded-full bg-[#6b5be6]/30 animate-[pulse_1.5s_ease-in-out_0.6s_infinite]" />
                </div>
            </div>
        </div>
    );
}
