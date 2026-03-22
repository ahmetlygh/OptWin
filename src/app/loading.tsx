export default function Loading() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-2 border-[var(--border-color)]"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--accent-color)] animate-spin"></div>
                </div>
                <p className="text-sm text-[var(--text-secondary)] font-medium animate-pulse">
                    Loading...
                </p>
            </div>
        </div>
    );
}
