import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

async function checkAdmin() {
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session?.user || !(session as any).isAdmin) return false;
    return true;
}

// GET /api/admin/maintenance — get maintenance mode status
export async function GET() {
    try {
        const setting = await prisma.siteSetting.findUnique({
            where: { key: "maintenanceMode" },
        });
        return NextResponse.json({
            success: true,
            maintenance: setting?.value === "true",
        });
    } catch {
        return NextResponse.json({ success: false, maintenance: false });
    }
}

// PUT /api/admin/maintenance — toggle maintenance mode
export async function PUT(req: Request) {
    if (!(await checkAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const enabled = body.enabled === true;

        await prisma.siteSetting.upsert({
            where: { key: "maintenanceMode" },
            create: {
                key: "maintenanceMode",
                value: enabled ? "true" : "false",
                type: "boolean",
                description: "Site bakım modu",
            },
            update: { value: enabled ? "true" : "false" },
        });

        return NextResponse.json({ success: true, maintenance: enabled });
    } catch (error) {
        console.error("Maintenance toggle error:", error);
        return NextResponse.json({ error: "Failed to toggle maintenance" }, { status: 500 });
    }
}
