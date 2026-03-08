"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Manages modal open/close phase transitions without calling setState inside useEffect.
 * 
 * - "entering" → "open" uses requestAnimationFrame (triggered from render-time state derivation)
 * - "open" → "exiting" → "closed" uses a timeout for exit animation
 * - Body scroll is locked while the modal is visible
 * - ESC key closes the modal
 * - Focus is trapped inside the modal while open
 */
type Phase = "closed" | "entering" | "open" | "exiting";

const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useModalPhase(isOpen: boolean, onClose: () => void) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Render-time derivation: detect isOpen going true while phase is "closed"
    const [phase, setPhase] = useState<Phase>("closed");
    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

    // Detect open → trigger "entering" synchronously during render (no useEffect)
    if (isOpen && !prevIsOpen) {
        setPrevIsOpen(true);
        setPhase("entering");
    }
    // Detect close → trigger "exiting" synchronously during render
    if (!isOpen && prevIsOpen) {
        setPrevIsOpen(false);
        if (phase === "open" || phase === "entering") {
            setPhase("exiting");
        }
    }

    // "entering" → "open" via rAF (this is safe — it's an async callback, not synchronous in effect)
    useEffect(() => {
        if (phase === "entering") {
            const id = requestAnimationFrame(() => setPhase("open"));
            return () => cancelAnimationFrame(id);
        }
    }, [phase]);

    // "exiting" → "closed" after animation duration
    useEffect(() => {
        if (phase === "exiting") {
            const timer = setTimeout(() => setPhase("closed"), 300);
            return () => clearTimeout(timer);
        }
    }, [phase]);

    // Lock body scroll while modal is visible
    useEffect(() => {
        if (phase !== "closed") {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [phase]);

    // ESC key handler + focus trapping
    const stableOnClose = useCallback(() => onClose(), [onClose]);
    useEffect(() => {
        if (phase === "closed") return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                stableOnClose();
                return;
            }

            // Focus trap: cycle through focusable elements inside the modal
            if (e.key === "Tab" && containerRef.current) {
                const focusable = containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
                if (focusable.length === 0) return;

                const first = focusable[0];
                const last = focusable[focusable.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === first) {
                        e.preventDefault();
                        last.focus();
                    }
                } else {
                    if (document.activeElement === last) {
                        e.preventDefault();
                        first.focus();
                    }
                }
            }
        };

        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [phase, stableOnClose]);

    // Auto-focus first focusable element when modal opens
    useEffect(() => {
        if (phase === "open" && containerRef.current) {
            const focusable = containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
            if (focusable.length > 0) {
                focusable[0].focus();
            }
        }
    }, [phase]);

    return {
        phase,
        isVisible: phase === "open",
        isMounted: phase !== "closed",
        containerRef,
    };
}
