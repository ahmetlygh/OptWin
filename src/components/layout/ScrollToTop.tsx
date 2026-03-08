"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronDown } from "lucide-react";

export function ScrollToTop() {
    const [visible, setVisible] = useState(false);
    const [bottomOffset, setBottomOffset] = useState(24); // default: 24px from bottom
    const footerRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            setVisible(window.scrollY > 400);

            // Keep button above footer when footer is visible
            if (!footerRef.current) {
                footerRef.current = document.querySelector("footer");
            }
            if (footerRef.current) {
                const footerRect = footerRef.current.getBoundingClientRect();
                const windowH = window.innerHeight;
                if (footerRect.top < windowH) {
                    // footer is visible — push button up above it
                    setBottomOffset(windowH - footerRect.top + 16);
                } else {
                    setBottomOffset(24); // normal: 24px from bottom edge
                }
            }
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleClick = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <button
            onClick={handleClick}
            aria-label="Scroll to top"
            style={{ bottom: `${bottomOffset}px`, right: '24px' }}
            className={`fixed z-[100] size-12 flex items-center justify-center rounded-full bg-[var(--card-bg)]/90 border border-[var(--border-color)] text-[var(--accent-color)] shadow-[0_8px_30px_rgba(0,0,0,0.15)] backdrop-blur-xl hover:bg-[var(--accent-color)] hover:text-white hover:shadow-[0_0_25px_rgba(107,91,230,0.5)] hover:-translate-y-1 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${visible ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-75 pointer-events-none"}`}
        >
            <ChevronDown size={22} strokeWidth={2.5} className="rotate-180" />
        </button>
    );
}
