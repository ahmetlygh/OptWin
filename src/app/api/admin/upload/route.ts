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

// Magic bytes for raster image validation
const MAGIC_BYTES: Record<string, number[][]> = {
    "image/png": [[0x89, 0x50, 0x4e, 0x47]],
    "image/jpeg": [[0xff, 0xd8, 0xff]],
    "image/gif": [[0x47, 0x49, 0x46, 0x38]],     // GIF8
    "image/webp": [[0x52, 0x49, 0x46, 0x46]],     // RIFF
};

function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
    const signatures = MAGIC_BYTES[mimeType];
    if (!signatures) return true; // SVG validated separately
    return signatures.some(sig =>
        sig.every((byte, i) => buffer[i] === byte)
    );
}

/**
 * Sanitize SVG content by removing dangerous elements and attributes.
 * Strips: <script>, <iframe>, <object>, <embed>, <foreignObject>,
 * event handlers (on*), javascript: URLs, and <use> with external refs.
 */
function sanitizeSvg(svgContent: string): string {
    let sanitized = svgContent;

    // Remove dangerous elements entirely (with their content)
    const dangerousTags = ["script", "iframe", "object", "embed", "foreignObject", "link", "meta"];
    for (const tag of dangerousTags) {
        // Remove opening+closing tags with content
        sanitized = sanitized.replace(
            new RegExp(`<${tag}[^>]*>[\\s\\S]*?<\\/${tag}>`, "gi"),
            ""
        );
        // Remove self-closing tags
        sanitized = sanitized.replace(
            new RegExp(`<${tag}[^>]*\\/?>`, "gi"),
            ""
        );
    }

    // Remove event handler attributes (onclick, onerror, onload, etc.)
    sanitized = sanitized.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, "");
    sanitized = sanitized.replace(/\s+on\w+\s*=\s*[^\s>]+/gi, "");

    // Remove javascript:, data:text/html, and vbscript: URLs from attributes
    sanitized = sanitized.replace(/javascript\s*:/gi, "blocked:");
    sanitized = sanitized.replace(/vbscript\s*:/gi, "blocked:");
    sanitized = sanitized.replace(/data\s*:\s*text\/html/gi, "blocked:text/html");

    // Remove <use> elements with external references (xlink:href="http://...")
    sanitized = sanitized.replace(/<use[^>]*xlink:href\s*=\s*["']https?:\/\/[^"']*["'][^>]*\/?>/gi, "");

    // Remove set/animate elements that could trigger scripts
    sanitized = sanitized.replace(/<set[^>]*attributeName\s*=\s*["']on\w+["'][^>]*\/?>/gi, "");

    return sanitized;
}

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

        // Validate magic bytes for raster images
        if (file.type !== "image/svg+xml") {
            if (!validateMagicBytes(buffer, file.type)) {
                return NextResponse.json(
                    { error: "File content doesn't match declared type" },
                    { status: 400 }
                );
            }
        }

        // SVGs are sanitized then saved; raster images are converted to WebP
        if (file.type === "image/svg+xml") {
            const svgContent = buffer.toString("utf-8");

            // Validate it's actually SVG
            if (!svgContent.includes("<svg")) {
                return NextResponse.json(
                    { error: "Invalid SVG content" },
                    { status: 400 }
                );
            }

            const sanitized = sanitizeSvg(svgContent);
            const filename = `${timestamp}-${hash}.svg`;
            const filepath = path.join(UPLOAD_DIR, filename);
            await writeFile(filepath, sanitized, "utf-8");
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
    } catch (error: unknown) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Upload failed" },
            { status: 500 }
        );
    }
}
