export interface ContactMessage {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    read: boolean;
    deleted: boolean;
    createdAt: Date;
}

export interface SiteSetting {
    key: string;
    value: string;
    type: "string" | "boolean" | "number" | "json";
    description?: string;
}

export interface AdminDashboardStats {
    totalVisits: number;
    totalScripts: number;
    unreadMessages: number;
    activeFeatures: number;
    totalFeatures: number;
    totalCategories: number;
}

// Known setting keys for type safety
export type SettingKey =
    | "maintenance_mode"
    | "site_version"
    | "github_url"
    | "bmc_url"
    | "contact_email"
    | "author_name"
    | "author_url"
    | "default_lang"
    | "default_theme"
    | "script_format"
    | "bmc_widget_enabled"
    | "footer_year"
    | "footer_text_en"
    | "footer_text_tr";
