import { SettingKey } from "@/types/admin";
import { settingsService } from "./settingsService";
import { cache } from "react";

/**
 * Fetches a single site setting by its key with an optional default value
 */
export const getSetting = cache(async <T = string>(key: SettingKey | string, defaultValue: T = "" as unknown as T): Promise<T> => {
    return await settingsService.getSetting<T>(key, defaultValue);
});

/**
 * Fetches multiple settings at once and returns them as an object
 */
export const getSettings = cache(async (keys: (SettingKey | string)[]): Promise<Record<string, string>> => {
    try {
        const fetched = await settingsService.getSettings<Record<string, any>>(keys as string[]);
        const result: Record<string, string> = {};
        for (const k of keys) {
            const val = fetched[k as string];
            result[k as string] = val !== undefined && val !== null ? String(val) : "";
        }
        return result;
    } catch (err) {
        console.error("Failed to fetch settings:", err);
        return Object.fromEntries(keys.map(k => [k as string, ""]));
    }
});
