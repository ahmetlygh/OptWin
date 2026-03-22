import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="text-[6rem] font-black text-[var(--accent-color)] opacity-20 leading-none mb-4 select-none">
                    404
                </div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
                    Page Not Found
                </h1>
                <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>
                <Link
                    href="/"
                    className="inline-flex px-6 py-3 rounded-xl bg-[var(--accent-color)] text-white font-bold text-sm hover:opacity-90 transition-opacity"
                >
                    Go Home
                </Link>
            </div>
        </div>
    );
}
