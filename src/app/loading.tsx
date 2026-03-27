import { Loader } from "@/components/shared/Loader";

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-[var(--bg-color)]">
            <Loader text="OptWin" />
        </div>
    );
}
