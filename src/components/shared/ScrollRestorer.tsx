"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function ScrollRestorer() {
    const pathname = usePathname();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "instant" });
    }, [pathname]);

    return null;
}
