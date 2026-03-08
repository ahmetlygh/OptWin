"use client";

import { useEffect } from "react";

/**
 * On mount, if the URL has a #hash, smooth-scroll to that element.
 * This handles cross-page navigation like /contact → /#about.
 */
export function HashScroller() {
    useEffect(() => {
        const hash = window.location.hash;
        if (hash) {
            // Small delay to ensure DOM is ready after hydration
            setTimeout(() => {
                const el = document.getElementById(hash.slice(1));
                if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                }
            }, 300);
        }
    }, []);

    return null;
}
