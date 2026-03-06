"use client";

import { useEffect, useState, useRef } from "react";

interface CountUpProps {
    end: number;
    duration?: number;
    formatter?: (num: number) => string;
}

export function CountUp({ end, duration = 2000, formatter }: CountUpProps) {
    const [count, setCount] = useState(0);
    const countRef = useRef(0);
    const startTimeRef = useRef<number | null>(null);

    useEffect(() => {
        // Reset animation when 'end' changes
        countRef.current = 0;
        startTimeRef.current = null;

        let animationFrameId: number;

        const animate = (timestamp: number) => {
            if (!startTimeRef.current) startTimeRef.current = timestamp;
            const progress = timestamp - startTimeRef.current;
            const percentage = Math.min(progress / duration, 1);

            // Ease out cubic function
            const easeOutCubic = 1 - Math.pow(1 - percentage, 3);

            const currentCount = Math.floor(easeOutCubic * end);
            setCount(currentCount);

            if (percentage < 1) {
                animationFrameId = requestAnimationFrame(animate);
            }
        };

        animationFrameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrameId);
    }, [end, duration]);

    return <span>{formatter ? formatter(count) : count}</span>;
}
