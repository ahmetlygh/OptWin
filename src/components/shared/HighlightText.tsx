"use client";

import { useOptWinStore } from "@/store/useOptWinStore";

export function HighlightText({ text }: { text: string }) {
    const { searchQuery } = useOptWinStore();

    if (!searchQuery || searchQuery.trim() === "" || !text) {
        return <>{text}</>;
    }

    const query = searchQuery.trim();
    const parts = text.split(new RegExp(`(${query})`, "gi"));

    return (
        <span className="break-words">
            {parts.map((part, i) =>
                part.toLowerCase() === query.toLowerCase() ? (
                    <span key={i} className="bg-[var(--accent-color)]/30 text-[var(--text-primary)] font-bold rounded-sm px-0.5">
                        {part}
                    </span>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </span>
    );
}
