export type RiskLevel = "low" | "medium" | "high";

export interface FeatureTranslation {
    lang: string;
    title: string;
    desc: string;
}

export interface FeatureCommand {
    lang: string;
    command: string;
    scriptMessage: string;
}

export interface Feature {
    id: string;
    slug: string;
    categoryId: string;
    icon: string;
    iconType: "solid" | "brands";
    risk: RiskLevel;
    noRisk: boolean;
    order: number;
    enabled: boolean;
    newBadge?: boolean;
    newBadgeExpiry?: string | null;
    translations: FeatureTranslation[];
    commands?: FeatureCommand[];
}

export interface CategoryTranslation {
    lang: string;
    name: string;
}

export interface Category {
    id: string;
    slug: string;
    icon: string | null;
    order: number;
    enabled: boolean;
    translations: CategoryTranslation[];
    features: Feature[];
}

export interface DnsProvider {
    id: string;
    slug: string;
    name: string;
    primary: string;
    secondary: string;
    order: number;
    enabled: boolean;
}

export interface PresetTranslation {
    lang: string;
    name: string;
}

export interface Preset {
    id: string;
    slug: string;
    featureSlugs: string[];
    enabled: boolean;
    order: number;
    translations: PresetTranslation[];
}
