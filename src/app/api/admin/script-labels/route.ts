import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

async function checkAdmin() {
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session?.user || !(session as any).isAdmin) return false;
    return true;
}

// GET /api/admin/script-labels — get all script labels grouped by lang
export async function GET() {
    if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const labels = await prisma.scriptLabel.findMany({
        orderBy: [{ lang: "asc" }, { key: "asc" }],
    });

    // Group by language
    const grouped: Record<string, Record<string, string>> = {};
    for (const label of labels) {
        if (!grouped[label.lang]) grouped[label.lang] = {};
        grouped[label.lang][label.key] = label.value;
    }

    // Get unique languages
    const languages = [...new Set(labels.map(l => l.lang))].sort();

    return NextResponse.json({ success: true, labels: grouped, languages });
}

// PUT /api/admin/script-labels — update script labels
export async function PUT(req: NextRequest) {
    if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { labels } = body as { labels: { lang: string; key: string; value: string }[] };

        if (!labels || !Array.isArray(labels)) {
            return NextResponse.json({ error: "labels array is required" }, { status: 400 });
        }

        for (const label of labels) {
            await prisma.scriptLabel.upsert({
                where: { lang_key: { lang: label.lang, key: label.key } },
                update: { value: label.value },
                create: { lang: label.lang, key: label.key, value: label.value },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Update script labels error:", error);
        return NextResponse.json({ error: "Failed to update script labels" }, { status: 500 });
    }
}

// DELETE /api/admin/script-labels — delete a specific label
export async function DELETE(req: NextRequest) {
    if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const lang = searchParams.get("lang");
    const key = searchParams.get("key");

    if (!lang || !key) {
        return NextResponse.json({ error: "lang and key are required" }, { status: 400 });
    }

    try {
        await prisma.scriptLabel.delete({
            where: { lang_key: { lang, key } },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete script label error:", error);
        return NextResponse.json({ error: "Failed to delete script label" }, { status: 500 });
    }
}
