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

// Known setting keys for type safety or loose strings
export type SettingKey = string;
