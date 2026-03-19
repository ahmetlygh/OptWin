import { NextResponse } from "next/server";
import { checkAdmin, unauthorizedResponse } from "@/lib/admin-guard";
import sharp from "sharp";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "icons");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
    "image/png",
    "image/webp",
    "image/svg+xml",
    "image/jpeg",
    "image/gif",
];

export async function POST(req: Request) {
    if (!(await checkAdmin())) return unauthorizedResponse();

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: "Invalid file type. Allowed: PNG, WebP, SVG, JPEG, GIF" },
                { status: 400 }
            );
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: "File too large. Max 5MB" },
                { status: 400 }
            );
        }

        // Ensure upload directory exists
        if (!existsSync(UPLOAD_DIR)) {
            await mkdir(UPLOAD_DIR, { recursive: true });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const hash = crypto.createHash("md5").update(buffer).digest("hex").slice(0, 12);
        const timestamp = Date.now();

        // SVGs are kept as-is, raster images are converted to WebP
        if (file.type === "image/svg+xml") {
            const filename = `${timestamp}-${hash}.svg`;
            const filepath = path.join(UPLOAD_DIR, filename);
            await writeFile(filepath, buffer);
            return NextResponse.json({
                success: true,
                url: `/uploads/icons/${filename}`,
                type: "svg",
            });
        }

        // Convert raster images to WebP (optimized, small size)
        const webpBuffer = await sharp(buffer)
            .resize(128, 128, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .webp({ quality: 85 })
            .toBuffer();

        const filename = `${timestamp}-${hash}.webp`;
        const filepath = path.join(UPLOAD_DIR, filename);
        await writeFile(filepath, webpBuffer);

        return NextResponse.json({
            success: true,
            url: `/uploads/icons/${filename}`,
            type: "webp",
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Upload failed" },
            { status: 500 }
        );
    }
}
