import { Loader } from "@/components/shared/Loader";

export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader text="OptWin" />
        </div>
    );
}
