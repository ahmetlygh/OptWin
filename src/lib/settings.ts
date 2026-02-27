import { prisma } from "./db";
import { SettingKey } from "@/types/admin";

/**
 * Fetches a single site setting by its key with an optional default value
 */
export async function getSetting(key: SettingKey, defaultValue: string = ""): Promise<string> {
    try {
        const setting = await prisma.siteSetting.findUnique({
            where: { key }
        });
        return setting?.value ?? defaultValue;
    } catch (err) {
        console.error(`Failed to fetch setting ${key}:`, err);
        return defaultValue;
    }
}

/**
 * Fetches multiple settings at once and returns them as an object
 */
export async function getSettings(keys: SettingKey[]): Promise<Record<string, string>> {
    try {
        const settings = await prisma.siteSetting.findMany({
            where: { key: { in: keys } }
        });

        const result: Record<string, string> = {};
        settings.forEach(s => {
            result[s.key] = s.value;
        });

        // Fill in blanks for missing requested keys
        keys.forEach(k => {
            if (!(k in result)) result[k] = "";
        });

        return result;
    } catch (err) {
        console.error("Failed to fetch settings:", err);
        return Object.fromEntries(keys.map(k => [k, ""]));
    }
}
