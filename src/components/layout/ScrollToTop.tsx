"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

export function ScrollToTop() {
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
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <button
            onClick={handleClick}
            aria-label="Scroll to top"
            className={`fixed z-100 bottom-8 sm:bottom-10 right-6 sm:right-10 size-12 sm:size-14 flex items-center justify-center rounded-2xl bg-(--card-bg)/80 border border-(--border-color) text-(--accent-color) shadow-2xl backdrop-blur-2xl hover:bg-(--accent-color) hover:text-white hover:shadow-[0_0_30px_rgba(107,91,230,0.4)] hover:-translate-y-2 active:scale-95 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${visible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-10 pointer-events-none"}`}
        >
            <ChevronDown size={24} strokeWidth={3} className="rotate-180" />
        </button>
    );
}
