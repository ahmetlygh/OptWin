import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { checkAdmin, unauthorizedResponse } from "@/lib/admin-guard";

// POST /api/admin/reorder — reorder items
// body: { type: "feature" | "category" | "dns", items: [{ id, order }] }
export async function POST(req: NextRequest) {
    if (!(await checkAdmin())) return unauthorizedResponse();

    try {
        const { type, items } = await req.json();

        if (!type || !items || !Array.isArray(items)) {
            return NextResponse.json({ error: "type and items array are required" }, { status: 400 });
        }

        const updates = items.map((item: { id: string; order: number }) => {
            switch (type) {
                case "feature":
                    return prisma.feature.update({ where: { id: item.id }, data: { order: item.order } });
                case "category":
                    return prisma.category.update({ where: { id: item.id }, data: { order: item.order } });
                case "dns":
                    return prisma.dnsProvider.update({ where: { id: item.id }, data: { order: item.order } });
                default:
                    throw new Error("Invalid type");
            }
        });

        await Promise.all(updates);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Reorder error:", error);
        return NextResponse.json({ error: "Failed to reorder" }, { status: 500 });
    }
}
