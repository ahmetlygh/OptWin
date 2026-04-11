"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Shield, Zap } from "lucide-react";

export function HeroIllustration() {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(true);
    const [progress, setProgress] = useState(0);
    const [typedCmd, setTypedCmd] = useState("");
    const [showOverlay, setShowOverlay] = useState(false);
    // Whether the overlay has already shown for this animation cycle (one-shot)
    const overlayFiredRef = useRef(false);
    const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
    const overlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isBodyHoveredRef = useRef(false);
    const progressRef = useRef(0);
    // showOverlay ref for use in callbacks without stale closure
    const showOverlayRef = useRef(false);
    // Terminal container ref
    const terminalRef = useRef<HTMLDivElement>(null);

    const txt = {
        safe: t["hero.term.safe"] || "Safe",
        openSource: t["hero.term.openSource"] || "Open Source",
        fast: t["hero.term.fast"] || "Fast",
        optimized: t["hero.term.optimized"] || "Optimized",
        cmd1: t["hero.term.cmd1"] || "Disabling Telemetry",
        cmd2: t["hero.term.cmd2"] || "Clearing Temp/Prefetch",
        cmd3: t["hero.term.cmd3"] || "Disabling Background Apps",
        cmd4: t["hero.term.cmd4"] || "Optimizing Services",
        cmd5: t["hero.term.cmd5"] || "Configuring Privacy",
        done: t["hero.term.allDone"] || "All tasks completed",
        thanks: t["hero.term.thanks"] || "Thank you for using OptWin!",
        preview: t["hero.term.preview"] || "Script preview",
        replay: t["hero.term.replay"] || "Click to replay",
        expand: t["hero.term.expand"] || "Expand",
        collapse: t["hero.term.collapse"] || "Collapse",
    };

    const cmdText = ".\\OptWin.bat";
    const isAnimationDone = progress >= 70;

    // Keep refs in sync
    useEffect(() => { progressRef.current = progress; }, [progress]);
    useEffect(() => { showOverlayRef.current = showOverlay; }, [showOverlay]);

    const runAnimation = useCallback(() => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
        if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);

        setProgress(0);
        setTypedCmd("");
        setShowOverlay(false);
        showOverlayRef.current = false;
        progressRef.current = 0;
        overlayFiredRef.current = false;

        for (let i = 0; i <= cmdText.length; i++) {
            timersRef.current.push(setTimeout(() => setTypedCmd(cmdText.slice(0, i)), 300 + i * 65));
        }
        const typeEnd = 300 + cmdText.length * 65 + 200;

        const setP = (v: number) => {
            setProgress(v);
            progressRef.current = v;
        };

        timersRef.current.push(setTimeout(() => setP(10), typeEnd + 400));
        timersRef.current.push(setTimeout(() => setP(11), typeEnd + 1200));
        timersRef.current.push(setTimeout(() => setP(20), typeEnd + 1400));
        timersRef.current.push(setTimeout(() => setP(21), typeEnd + 2000));
        timersRef.current.push(setTimeout(() => setP(30), typeEnd + 2200));
        timersRef.current.push(setTimeout(() => setP(31), typeEnd + 2800));
        timersRef.current.push(setTimeout(() => setP(40), typeEnd + 3000));
        timersRef.current.push(setTimeout(() => setP(41), typeEnd + 3700));
        timersRef.current.push(setTimeout(() => setP(50), typeEnd + 3900));
        timersRef.current.push(setTimeout(() => setP(51), typeEnd + 4700));
        timersRef.current.push(setTimeout(() => setP(60), typeEnd + 5100));
        timersRef.current.push(setTimeout(() => setP(70), typeEnd + 5800));
    }, []);

    useEffect(() => {
        runAnimation();
        return () => timersRef.current.forEach(clearTimeout);
    }, [runAnimation]);

    // ── Overlay logic ────────────────────────────────────────────────────────
    // Rule:
    // Trigger A: animation finishes WHILE body is hovered → wait 1.5s → show
    // Trigger B: body is entered AFTER animation finishes → show immediately
    useEffect(() => {
        if (isAnimationDone && isOpen && isBodyHoveredRef.current) {
            if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
            overlayTimerRef.current = setTimeout(() => {
                if (isBodyHoveredRef.current) {
                    setShowOverlay(true);
                }
            }, 1500);
        }
    }, [isAnimationDone, isOpen]);

    const toggle = useCallback(() => {
        setIsOpen(prev => {
            const next = !prev;
            if (!next) {
                setShowOverlay(false);
                if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
            }
            if (next && progressRef.current < 70) {
                setTimeout(() => runAnimation(), 100);
            }
            return next;
        });
    }, [runAnimation]);

    const handleReplay = useCallback(() => {
        setShowOverlay(false);
        setTimeout(() => runAnimation(), 50);
    }, [runAnimation]);

    // Body mouse handlers (header excluded)
    const handleBodyMouseEnter = useCallback(() => {
        isBodyHoveredRef.current = true;
        if (progressRef.current >= 70 && isOpen) {
            setShowOverlay(true);
        }
    }, [isOpen]);

    const handleBodyMouseLeave = useCallback(() => {
        isBodyHoveredRef.current = false;
        setShowOverlay(false);
        if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!terminalRef.current) return;
        const rect = terminalRef.current.getBoundingClientRect();
        terminalRef.current.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        terminalRef.current.style.setProperty('--my', `${e.clientY - rect.top}px`);
    }, []);

    const isTyping = typedCmd.length < cmdText.length && progress === 0;

    return (
        <div className="relative w-full max-w-md min-h-[360px] flex flex-col justify-center">
            {/* Background glow */}
            <div
                className={`absolute inset-0 bg-(--accent-color)/12 blur-3xl rounded-full scale-75 animate-pulse transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                style={{ animationDuration: '4s' }}
            />

            <div className="relative w-full z-10 transition-all duration-500">
                {/* Terminal Window */}
            <div
                ref={terminalRef}
                onMouseMove={handleMouseMove}
                className="group/t relative bg-[#0c0e16]/85 backdrop-blur-sm rounded-xl border border-white/6 shadow-2xl flex flex-col overflow-hidden"
                style={{
                    transform: 'rotateY(-5deg) rotateX(2deg)',
                    boxShadow: '-20px 20px 60px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.03)'
                }}
            >
                {/* Mouse-follow glow */}
                <div
                    className="absolute inset-0 rounded-xl opacity-0 group-hover/t:opacity-100 transition-opacity duration-700 pointer-events-none z-0"
                    style={{ background: 'radial-gradient(300px circle at var(--mx, 50%) var(--my, 50%), rgba(124,58,237,0.08), transparent 50%)' }}
                />

                {/* ── Header ───────────────────────────────────────────────── */}
                <button
                    onClick={toggle}
                    className="cursor-pointer relative z-30 h-9 bg-white/3 border-b border-white/5 flex items-center px-3.5 w-full hover:bg-white/6 transition-colors duration-200 shrink-0 outline-none"
                >
                    {/* Traffic lights — fixed left block */}
                    <div className="flex gap-1.5 shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]/80" />
                    </div>

                    {/* Title — absolutely centered so left & right controls don't shift it */}
                    <span className="absolute left-1/2 -translate-x-1/2 text-[10.5px] text-white/40 font-medium font-mono select-none whitespace-nowrap pointer-events-none antialiased">
                        OptWin.bat — Administrator
                    </span>

                    {/* Expand/Collapse label + chevron — fixed right block */}
                    <div className="ml-auto flex items-center gap-1 shrink-0">
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={isOpen ? "c" : "e"}
                                initial={{ opacity: 0, y: 2 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -2 }}
                                transition={{ duration: 0.15 }}
                                className="text-[9px] text-white/40 font-mono select-none antialiased"
                                style={{ transformStyle: "preserve-3d", WebkitFontSmoothing: "antialiased" }}
                            >
                                {isOpen ? txt.collapse : txt.expand}
                            </motion.span>
                        </AnimatePresence>
                        <motion.div
                            animate={{ rotate: isOpen ? 0 : -90 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronDown size={14} className="text-white/60" />
                        </motion.div>
                    </div>
                </button>

                {/* ── Collapsible Body ─────────────────────────────────────── */}
                <div className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <div 
                        className="min-h-0 overflow-hidden relative"
                        onMouseEnter={handleBodyMouseEnter}
                        onMouseLeave={handleBodyMouseLeave}
                    >
                        {/* Invisible capture layer for hover events */}
                        <div className="absolute inset-0 z-0 pointer-events-auto" />

                        <div
                            className="p-4 pb-3 font-mono text-[11.5px] leading-[1.9] select-none relative z-10 flex flex-col pointer-events-none"
                            style={{ minHeight: '260px' }}
                        >
                            {/* Prompt + typewriter */}
                            <div>
                                <div className="text-white/50">
                                    <span className="text-green-400/80">PS C:\&gt;</span>{" "}
                                    <span className="text-amber-300/70">{typedCmd}</span>
                                    {isTyping && <span className="inline-block w-1.5 h-3.5 bg-white/90 animate-cursor-blink ml-1.5 align-middle mb-[1px]" />}
                                </div>

                                {progress >= 1 && <div className="h-2" />}

                                {/* Steps */}
                                <AnimatePresence>
                                    {progress >= 10 && (
                                        <motion.div key="c1" initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="text-white/45">
                                            <span className="text-cyan-400/80 mr-1 font-bold">[*]</span> {txt.cmd1}
                                            {progress >= 11 ? <span className="text-green-400/80 ml-2 font-bold">✓</span> : <span className="text-yellow-400/60 ml-2 text-[12px] tracking-[0.2em] font-bold loading-dots" />}
                                        </motion.div>
                                    )}
                                    {progress >= 20 && (
                                        <motion.div key="c2" initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="text-white/45">
                                            <span className="text-cyan-400/80 mr-1 font-bold">[*]</span> {txt.cmd2}
                                            {progress >= 21 ? <span className="text-green-400/80 ml-2 font-bold">✓</span> : <span className="text-yellow-400/60 ml-2 text-[12px] tracking-[0.2em] font-bold loading-dots" />}
                                        </motion.div>
                                    )}
                                    {progress >= 30 && (
                                        <motion.div key="c3" initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="text-white/45">
                                            <span className="text-cyan-400/80 mr-1 font-bold">[*]</span> {txt.cmd3}
                                            {progress >= 31 ? <span className="text-green-400/80 ml-2 font-bold">✓</span> : <span className="text-yellow-400/60 ml-2 text-[12px] tracking-[0.2em] font-bold loading-dots" />}
                                        </motion.div>
                                    )}
                                    {progress >= 40 && (
                                        <motion.div key="c4" initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="text-white/45">
                                            <span className="text-cyan-400/80 mr-1 font-bold">[*]</span> {txt.cmd4}
                                            {progress >= 41 ? <span className="text-green-400/80 ml-2 font-bold">✓</span> : <span className="text-yellow-400/60 ml-2 text-[12px] tracking-[0.2em] font-bold loading-dots" />}
                                        </motion.div>
                                    )}
                                    {progress >= 50 && (
                                        <motion.div key="c5" initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="text-white/45">
                                            <span className="text-cyan-400/80 mr-1 font-bold">[*]</span> {txt.cmd5}
                                            {progress >= 51 ? <span className="text-green-400/80 ml-2 font-bold">✓</span> : <span className="text-yellow-400/60 ml-2 text-[12px] tracking-[0.2em] font-bold loading-dots" />}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Completion */}
                            <AnimatePresence>
                                {progress >= 60 && (
                                    <motion.div key="done" initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mt-1.5">
                                        <div className="text-green-400/70 font-semibold flex items-center gap-1.5">
                                            <span className="text-green-400">✓</span> {txt.done}
                                        </div>
                                    </motion.div>
                                )}
                                {progress >= 70 && (
                                    <motion.div key="thanks" initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mt-0.5">
                                        <div className="text-white/45">{txt.thanks}</div>
                                        <div className="text-white/50 mt-1">
                                            <span className="text-green-400/80">PS C:\&gt;</span>
                                            <span className="inline-block w-1.5 h-3.5 bg-white/90 animate-cursor-blink ml-1.5 align-middle mb-[1px]" />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Overlay (body only — z-20 above body hover zone) */}
                        <AnimatePresence>
                            {showOverlay && isOpen && isAnimationDone && (
                                <motion.div
                                    key="overlay"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="absolute inset-0 z-20 flex flex-col items-center justify-center backdrop-blur-[3px] bg-black/35 cursor-pointer rounded-b-xl pointer-events-auto"
                                    onClick={handleReplay}
                                >
                                    <div className="text-white/70 text-[12px] font-semibold mb-1">{txt.preview}</div>
                                    <div className="text-(--accent-color) text-[11px] font-medium flex items-center gap-1.5">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polygon points="5 3 19 12 5 21 5 3" />
                                        </svg>
                                        {txt.replay}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* ── Floating Badges ──────────────────────────────────────────────
                Open:    Vertical stack on right side, offset below header
                Closed:  Horizontal row below header, one left + one right
                Grid auto-columns ensures equal width regardless of text length
            ─────────────────────────────────────────────────────────────────── */}
            <motion.div
                layout
                animate={isOpen
                    ? { y: 46 }
                    : { y: 44 }
                }
                transition={{ type: "spring", stiffness: 200, damping: 28, mass: 0.7 }}
                className={`absolute z-20 pointer-events-none ${
                    isOpen
                        ? "right-[-8px] top-0"
                        : "left-0 right-0 top-0"
                }`}
            >
                <div className={`grid gap-2 ${
                    isOpen
                        ? "grid-cols-1 w-max"
                        : "grid-cols-2"
                }`}>
                    {/* Badge 1 — Safe */}
                    <div className="pointer-events-auto bg-[#12141e]/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-emerald-500/15 shadow-emerald-500/5 flex items-center justify-center gap-2 animate-splash-float" style={{ animationDuration: '6s' }}>
                        <Shield size={14} className="text-emerald-400 shrink-0" />
                        <div className="min-w-0 text-center">
                            <div className="text-[10px] font-bold text-white/85 leading-none">{txt.safe}</div>
                            <div className="text-[7px] text-white/70 uppercase tracking-[0.15em] leading-none mt-1">{txt.openSource}</div>
                        </div>
                    </div>
                    {/* Badge 2 — Fast */}
                    <div className="pointer-events-auto bg-[#12141e]/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-blue-500/15 shadow-blue-500/5 flex items-center justify-center gap-2 animate-splash-float" style={{ animationDuration: '5s', animationDelay: '1s' }}>
                        <Zap size={14} className="text-blue-400 shrink-0" />
                        <div className="min-w-0 text-center">
                            <div className="text-[10px] font-bold text-white/85 leading-none">{txt.fast}</div>
                            <div className="text-[7px] text-white/70 uppercase tracking-[0.15em] leading-none mt-1">{txt.optimized}</div>
                        </div>
                    </div>
                </div>
            </motion.div>
            </div>
        </div>
    );
}
