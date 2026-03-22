"use client";

import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Page error:", error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
                    Something went wrong
                </h2>
                <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">
                    An unexpected error occurred. You can try again or return to the homepage.
                </p>
                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={reset}
                        className="px-5 py-2.5 rounded-xl bg-[var(--accent-color)] text-white font-bold text-sm hover:opacity-90 transition-opacity"
                    >
                        Try Again
                    </button>
                    <a
                        href="/"
                        className="px-5 py-2.5 rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] font-bold text-sm hover:text-[var(--text-primary)] hover:border-[var(--accent-color)]/50 transition-all"
                    >
                        Go Home
                    </a>
                </div>
            </div>
        </div>
    );
}
