import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkAdmin, unauthorizedResponse } from "@/lib/admin-guard";

function sanitizeSlug(slug: string): string {
    return slug
        .replace(/ğ/gi, 'g').replace(/Ğ/g, 'G')
        .replace(/ü/gi, 'u').replace(/Ü/g, 'U')
        .replace(/ş/gi, 's').replace(/Ş/g, 'S')
        .replace(/ı/g, 'i').replace(/İ/g, 'I')
        .replace(/ö/gi, 'o').replace(/Ö/g, 'O')
        .replace(/ç/gi, 'c').replace(/Ç/g, 'C')
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9\-_]/g, '');
}

// POST /api/admin/fix-slugs — one-time fix for features with Turkish chars or spaces in slugs
export async function POST() {
    if (!(await checkAdmin())) return unauthorizedResponse();

    const features = await prisma.feature.findMany({ select: { id: true, slug: true } });
    const fixed: { id: string; oldSlug: string; newSlug: string }[] = [];

    for (const f of features) {
        const newSlug = sanitizeSlug(f.slug);
        if (newSlug !== f.slug) {
            // Ensure no collision
            let finalSlug = newSlug;
            let suffix = 2;
            while (await prisma.feature.findFirst({ where: { slug: finalSlug, id: { not: f.id } } })) {
                finalSlug = `${newSlug}-${suffix++}`;
            }
            await prisma.feature.update({ where: { id: f.id }, data: { slug: finalSlug } });
            fixed.push({ id: f.id, oldSlug: f.slug, newSlug: finalSlug });
        }
    }

    return NextResponse.json({ success: true, fixed, total: features.length });
}
