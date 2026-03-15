"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Maintenance is now handled inline by PublicShell.
// This page only exists to redirect any direct /maintenance visits to homepage.
export default function MaintenanceRedirect() {
    const router = useRouter();
    useEffect(() => { router.replace("/"); }, [router]);
    return <div className="fixed inset-0 bg-[#08080d]" />;
}
