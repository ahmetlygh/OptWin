import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { checkAdmin, unauthorizedResponse } from "@/lib/admin-guard";
import { z } from "zod";
import { cacheService } from "@/lib/cache-service";

const createDnsSchema = z.object({
    slug: z.string().min(1).max(100),
    name: z.string().min(1).max(200),
    primary: z.string().min(1).max(50),
    secondary: z.string().min(1).max(50),
    order: z.number().int().default(0),
    enabled: z.boolean().default(true),
});

const updateDnsSchema = z.object({
    id: z.string().min(1),
    slug: z.string().min(1).max(100).optional(),
    name: z.string().min(1).max(200).optional(),
    primary: z.string().min(1).max(50).optional(),
    secondary: z.string().min(1).max(50).optional(),
    order: z.number().int().optional(),
    enabled: z.boolean().optional(),
});

// GET
export async function GET() {
    if (!(await checkAdmin())) return unauthorizedResponse();
    const providers = await prisma.dnsProvider.findMany({ orderBy: { order: "asc" } });
    return NextResponse.json({ success: true, providers });
}

// POST
export async function POST(req: NextRequest) {
    if (!(await checkAdmin())) return unauthorizedResponse();
    try {
        const body = await req.json();
        const parsed = createDnsSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
        }

        const { slug, name, primary, secondary, order, enabled } = parsed.data;
        const provider = await prisma.dnsProvider.create({
            data: { slug, name, primary, secondary, order, enabled },
        });
        await cacheService.invalidate("dns");
        return NextResponse.json({ success: true, provider });
    } catch (error: unknown) {
        const prismaError = error as { code?: string };
        if (prismaError.code === "P2002") return NextResponse.json({ error: "DNS provider slug already exists" }, { status: 409 });
        return NextResponse.json({ error: "Failed to create DNS provider" }, { status: 500 });
    }
}

// PUT
export async function PUT(req: NextRequest) {
    if (!(await checkAdmin())) return unauthorizedResponse();
    try {
        const body = await req.json();
        const parsed = updateDnsSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
        }

        const { id, slug, name, primary, secondary, order, enabled } = parsed.data;
        const data: Record<string, unknown> = {};
        if (slug !== undefined) data.slug = slug;
        if (name !== undefined) data.name = name;
        if (primary !== undefined) data.primary = primary;
        if (secondary !== undefined) data.secondary = secondary;
        if (order !== undefined) data.order = order;
        if (enabled !== undefined) data.enabled = enabled;
        const provider = await prisma.dnsProvider.update({ where: { id }, data });
        await cacheService.invalidate("dns");
        return NextResponse.json({ success: true, provider });
    } catch (error: unknown) {
        console.error("Update DNS error:", error);
        return NextResponse.json({ error: "Failed to update DNS provider" }, { status: 500 });
    }
}

// DELETE
export async function DELETE(req: NextRequest) {
    if (!(await checkAdmin())) return unauthorizedResponse();
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    try {
        await prisma.dnsProvider.delete({ where: { id } });
        await cacheService.invalidate("dns");
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error("Delete DNS error:", error);
        return NextResponse.json({ error: "Failed to delete DNS provider" }, { status: 500 });
    }
}
