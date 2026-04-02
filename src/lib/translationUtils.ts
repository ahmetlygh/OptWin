/**
 * Shared translation utilities for progress calculation and data merging.
 */

export interface CalculationResult {
    percentage: number;
    missingCount: number;
    totalCount: number;
    breakdown?: ProgressBreakdown;
}

export interface ProgressBreakdown {
    uiKeys: { filled: number; total: number };
    seoKeys: { filled: number; total: number };
    pageKeys: { filled: number; total: number };
    features: { filled: number; total: number };
    scriptLabels: { filled: number; total: number };
    categories: { filled: number; total: number };
}

export const SEO_KEYS = ["title", "description", "keywords", "ogTitle", "ogDesc"];
export const PAGE_KEYS = ["page.home.title", "page.contact.title", "page.support.title", "page.terms.title", "page.maintenance.title"];

/**
 * Extra data for comprehensive progress calculation.
 */
export interface ExtraProgressData {
    /** Total features requiring translation */
    totalFeatures?: number;
    /** Features with filled title, desc, AND scriptMessage for this lang */
    filledFeatures?: number;
    /** Total script label keys (from EN reference) */
    totalScriptLabels?: number;
    /** Script labels filled for this lang */
    filledScriptLabels?: number;
    /** Total category names */
    totalCategories?: number;
    /** Categories with filled name for this lang */
    filledCategories?: number;
}

/**
 * Calculates the completion percentage for a language based on all translation sources.
 */
export function calculateProgress(
    translations: Record<string, string> = {}, 
    seoMetadata: any = {}, 
    defaultKeys: string[] = [],
    extra?: ExtraProgressData
): CalculationResult {
    // 1. Standard UI Keys (Excluding special ones)
    const uiKeys = defaultKeys.filter(k => !k.startsWith("seo.") && !k.startsWith("page."));
    const totalUiKeys = uiKeys.length;
    let filledUiKeys = 0;
    uiKeys.forEach(k => { if (translations[k] && translations[k].trim() !== "") filledUiKeys++; });

    // 2. SEO Keys
    let filledSeoKeys = 0;
    SEO_KEYS.forEach(k => { 
        const val = seoMetadata[k];
        if (val && val.toString().trim() !== "") filledSeoKeys++; 
    });

    // 3. Page Title Keys
    let filledPageKeys = 0;
    PAGE_KEYS.forEach(k => { if (translations[k] && translations[k].trim() !== "") filledPageKeys++; });

    // 4. Features (title + desc + scriptMessage per feature = 3 fields)
    const totalFeatures = extra?.totalFeatures ?? 0;
    const filledFeatures = extra?.filledFeatures ?? 0;

    // 5. Script Labels
    const totalScriptLabels = extra?.totalScriptLabels ?? 0;
    const filledScriptLabels = extra?.filledScriptLabels ?? 0;

    // 6. Category Names
    const totalCategories = extra?.totalCategories ?? 0;
    const filledCategories = extra?.filledCategories ?? 0;

    const totalCount = totalUiKeys + SEO_KEYS.length + PAGE_KEYS.length + totalFeatures + totalScriptLabels + totalCategories;
    const filledCount = filledUiKeys + filledSeoKeys + filledPageKeys + filledFeatures + filledScriptLabels + filledCategories;
    
    const percentage = totalCount > 0 ? Math.min(Math.round((filledCount / totalCount) * 100), 100) : 0;
    
    return {
        percentage,
        missingCount: totalCount - filledCount,
        totalCount,
        breakdown: {
            uiKeys: { filled: filledUiKeys, total: totalUiKeys },
            seoKeys: { filled: filledSeoKeys, total: SEO_KEYS.length },
            pageKeys: { filled: filledPageKeys, total: PAGE_KEYS.length },
            features: { filled: filledFeatures, total: totalFeatures },
            scriptLabels: { filled: filledScriptLabels, total: totalScriptLabels },
            categories: { filled: filledCategories, total: totalCategories },
        },
    };
}
