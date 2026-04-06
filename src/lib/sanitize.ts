/**
 * Sanitizes SVG markup to prevent XSS attacks.
 * Strips <script> tags, on* event handlers, <foreignObject>, 
 * <iframe>, <embed>, <object> tags, and data:/javascript: URLs.
 */
export function sanitizeSvg(svgString: string): string {
    if (!svgString) return "";

    let sanitized = svgString;

    // Remove <script> tags and their content
    sanitized = sanitized.replace(/<script[\s\S]*?<\/script>/gi, "");
    sanitized = sanitized.replace(/<script[^>]*\/>/gi, "");

    // Remove on* event handlers (onclick, onload, onerror, etc.)
    sanitized = sanitized.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, "");
    sanitized = sanitized.replace(/\s+on\w+\s*=\s*[^\s>]*/gi, "");

    // Remove dangerous tags
    const dangerousTags = ["foreignObject", "iframe", "embed", "object", "base", "form", "input", "textarea"];
    for (const tag of dangerousTags) {
        const openClose = new RegExp(`<${tag}[\\s\\S]*?<\\/${tag}>`, "gi");
        const selfClose = new RegExp(`<${tag}[^>]*\\/?>`, "gi");
        sanitized = sanitized.replace(openClose, "");
        sanitized = sanitized.replace(selfClose, "");
    }

    // Remove javascript: and data: URLs from href/xlink:href/src attributes
    sanitized = sanitized.replace(/(href|xlink:href|src)\s*=\s*["']\s*(javascript|data):[^"']*/gi, '$1=""');

    return sanitized;
}
