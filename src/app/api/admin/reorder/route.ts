import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { checkAdmin, unauthorizedResponse } from "@/lib/admin-guard";
import { z } from "zod";

const reorderSchema = z.object({
    type: z.enum(["feature", "category", "dns"]),
    items: z.array(z.object({
        id: z.string().min(1),
        order: z.number().int(),
    })).min(1).max(500),
});

// POST /api/admin/reorder — reorder items
// body: { type: "feature" | "category" | "dns", items: [{ id, order }] }
export async function POST(req: NextRequest) {
    if (!(await checkAdmin())) return unauthorizedResponse();

    try {
        const body = await req.json();
        const parsed = reorderSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
        }

        const { type, items } = parsed.data;

        const updates = items.map((item) => {
            switch (type) {
                case "feature":
                    return prisma.feature.update({ where: { id: item.id }, data: { order: item.order } });
                case "category":
                    return prisma.category.update({ where: { id: item.id }, data: { order: item.order } });
                case "dns":
                    return prisma.dnsProvider.update({ where: { id: item.id }, data: { order: item.order } });
            }
        });

        await Promise.all(updates);

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error("Reorder error:", error);
        return NextResponse.json({ error: "Failed to reorder" }, { status: 500 });
    }
}
