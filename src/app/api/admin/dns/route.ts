import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

async function checkAdmin() {
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session?.user || !(session as any).isAdmin) return false;
    return true;
}

// GET
export async function GET() {
    if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const providers = await prisma.dnsProvider.findMany({ orderBy: { order: "asc" } });
    return NextResponse.json({ success: true, providers });
}

// POST
export async function POST(req: NextRequest) {
    if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const { slug, name, primary, secondary, order, enabled } = await req.json();
        if (!slug || !name || !primary || !secondary) {
            return NextResponse.json({ error: "slug, name, primary, secondary are required" }, { status: 400 });
        }
        const provider = await prisma.dnsProvider.create({
            data: { slug, name, primary, secondary, order: order || 0, enabled: enabled !== false },
        });
        return NextResponse.json({ success: true, provider });
    } catch (error: any) {
        if (error.code === "P2002") return NextResponse.json({ error: "DNS provider slug already exists" }, { status: 409 });
        return NextResponse.json({ error: "Failed to create DNS provider" }, { status: 500 });
    }
}

// PUT
export async function PUT(req: NextRequest) {
    if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const { id, slug, name, primary, secondary, order, enabled } = await req.json();
        if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
        const data: any = {};
        if (slug !== undefined) data.slug = slug;
        if (name !== undefined) data.name = name;
        if (primary !== undefined) data.primary = primary;
        if (secondary !== undefined) data.secondary = secondary;
        if (order !== undefined) data.order = order;
        if (enabled !== undefined) data.enabled = enabled;
        const provider = await prisma.dnsProvider.update({ where: { id }, data });
        return NextResponse.json({ success: true, provider });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update DNS provider" }, { status: 500 });
    }
}

// DELETE
export async function DELETE(req: NextRequest) {
    if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    try {
        await prisma.dnsProvider.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete DNS provider" }, { status: 500 });
    }
}
