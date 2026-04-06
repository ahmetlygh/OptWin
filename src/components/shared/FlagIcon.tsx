"use client";

import React from "react";
import { sanitizeSvg } from "@/lib/sanitize";

interface FlagIconProps {
    flagSvg: string | null;
    className?: string;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const sizes = {
    xs: "w-4 h-4",
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xl: "w-16 h-16",
};

/**
 * FlagIcon - A bulletproof, razor-sharp flag component.
 * Honors the original SVG aspect ratio with standard rectangular sizing.
 */
export function FlagIcon({ flagSvg, size = "md", className = "" }: FlagIconProps) {
    const sizes = {
        xs: "w-4 h-2.5",
        sm: "w-6 h-4",
        md: "w-8 h-5",
        lg: "w-10 h-7",
        xl: "w-14 h-10"
    };

    return (
        <div 
            className={`relative flex items-center justify-center ${sizes[size]} overflow-hidden rounded-sm shrink-0 border border-white/10 bg-white/5 [&>svg]:w-full [&>svg]:h-full [&>svg]:block [&>svg]:object-cover ${className}`}
            dangerouslySetInnerHTML={{ __html: sanitizeSvg(flagSvg || "") }}
        />
    );
}
