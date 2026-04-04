"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { useMemo, memo } from "react";

// Escape special regex characters to prevent crashes from user input
function escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const HighlightText = memo(function HighlightText({ text }: { text: string }) {
    const searchQuery = useOptWinStore(state => state.searchQuery);

    const parts = useMemo(() => {
        if (!searchQuery || searchQuery.trim() === "" || !text) {
            return null;
        }
        const escaped = escapeRegExp(searchQuery.trim());
        return text.split(new RegExp(`(${escaped})`, "gi"));
    }, [text, searchQuery]);

    if (!parts) {
        return <>{text}</>;
    }

    const query = searchQuery.trim();

    return (
        <span className="wrap-break-word">
            {parts.map((part, i) =>
                part.toLowerCase() === query.toLowerCase() ? (
                    <span key={i} className="bg-(--accent-color)/30 text-(--text-primary) font-bold rounded-sm px-0.5">
                        {part}
                    </span>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </span>
    );
});
