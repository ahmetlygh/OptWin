import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";

export const getTranslationsFromDb = unstable_cache(
    async (lang: string) => {
        const [langRows, enRows] = await Promise.all([
            prisma.uiTranslation.findMany({ where: { lang }, select: { key: true, value: true } }),
            lang !== "en"
                ? prisma.uiTranslation.findMany({ where: { lang: "en" }, select: { key: true, value: true } })
                : Promise.resolve([]),
        ]);

        const result: Record<string, string> = {};
        for (const row of enRows) result[row.key] = row.value;
        for (const row of langRows) result[row.key] = row.value;
        return result;
    },
    ["ui-translations"],
    { revalidate: 60, tags: ["ui-translations"] }
);
