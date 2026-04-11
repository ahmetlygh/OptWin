"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";

export function ScrollToTop() {
    const { t } = useTranslation();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setVisible(window.scrollY > 400);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleClick = () => {
        const startY = window.pageYOffset;
        // Scale duration with distance: min 500ms, max 900ms
        const duration = Math.min(900, Math.max(500, startY * 0.15));
        let start: number | null = null;
        const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        
        const step = (timestamp: number) => {
            if (!start) start = timestamp;
            const elapsed = timestamp - start;
            const percent = Math.min(elapsed / duration, 1);
            window.scrollTo(0, startY * (1 - easeInOutCubic(percent)));
            if (elapsed < duration) {
                requestAnimationFrame(step);
            }
        };
        requestAnimationFrame(step);
    };

    return (
        <button
            onClick={handleClick}
            aria-label={t["nav.scrollToTop"] || "Scroll to top"}
            className={`cursor-pointer fixed z-100 bottom-8 sm:bottom-10 right-6 sm:right-10 size-12 sm:size-14 flex items-center justify-center rounded-2xl bg-(--card-bg)/80 border border-(--border-color) text-(--accent-color) shadow-2xl backdrop-blur-2xl hover:bg-(--accent-color) hover:text-white hover:shadow-[0_0_30px_rgba(107,91,230,0.4)] hover:-translate-y-2 active:scale-95 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${visible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-10 pointer-events-none"}`}
        >
            <ChevronDown size={24} strokeWidth={3} className="rotate-180" />
        </button>
    );
}
