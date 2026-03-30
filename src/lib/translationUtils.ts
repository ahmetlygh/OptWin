/**
 * Shared translation utilities for progress calculation and data merging.
 */

export interface CalculationResult {
    percentage: number;
    missingCount: number;
    totalCount: number;
}

export const SEO_KEYS = ["title", "description", "keywords", "ogTitle", "ogDesc"];
export const PAGE_KEYS = ["page.home.title", "page.contact.title", "page.support.title", "page.terms.title", "page.maintenance.title"];

/**
 * Calculates the completion percentage for a language based on translations, SEO metadata, and page titles.
 */
export function calculateProgress(
    translations: Record<string, string> = {}, 
    seoMetadata: any = {}, 
    defaultKeys: string[] = []
): CalculationResult {
    // 1. Standard UI Keys (Excluding special ones)
    const uiKeys = defaultKeys.filter(k => !k.startsWith("seo.") && !k.startsWith("page."));
    const totalUiKeys = uiKeys.length;
    let filledUiKeys = 0;
    uiKeys.forEach(k => { if (translations[k] && translations[k].trim() !== "") filledUiKeys++; });

    // 2. SEO Keys (6 total)
    let filledSeoKeys = 0;
    SEO_KEYS.forEach(k => { 
        const val = seoMetadata[k];
        if (val && val.toString().trim() !== "") filledSeoKeys++; 
    });

    // 3. Page Title Keys (5 total) - In case they are passed in translations or separate
    let filledPageKeys = 0;
    PAGE_KEYS.forEach(k => { if (translations[k] && translations[k].trim() !== "") filledPageKeys++; });

    const totalCount = totalUiKeys + SEO_KEYS.length + PAGE_KEYS.length;
    const filledCount = filledUiKeys + filledSeoKeys + filledPageKeys;
    
    const percentage = totalCount > 0 ? Math.min(Math.round((filledCount / totalCount) * 100), 100) : 0;
    
    return {
        percentage,
        missingCount: totalCount - filledCount,
        totalCount
    };
}
