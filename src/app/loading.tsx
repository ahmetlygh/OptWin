// Loading is handled by:
// 1. The inline HTML splash screen in layout.tsx (initial page load, F5)
// 2. ChangingLocaleLoader in ClientProviders (language transitions)
// This file intentionally returns null to avoid triple-loading stacking.
export default function Loading() {
    return null;
}

