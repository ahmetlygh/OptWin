"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useOptWinStore } from "@/store/useOptWinStore";
import { Loader } from "@/components/shared/Loader";

export function ChangingLocaleLoader() {
    const isChangingLocale = useOptWinStore((state) => state.isChangingLocale);

    return (
        <AnimatePresence>
            {isChangingLocale && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-[9999] bg-[var(--bg-color)]/80 backdrop-blur-md flex flex-col items-center justify-center pointer-events-auto"
                >
                    <Loader text="OptWin" />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
