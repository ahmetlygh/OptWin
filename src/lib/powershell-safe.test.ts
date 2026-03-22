import { describe, it, expect } from "vitest";
import { toPowerShellSafe, escapeForPsString, generateScriptMessage } from "@/lib/powershell-safe";

describe("escapeForPsString", () => {
    it("escapes backticks", () => {
        expect(escapeForPsString("hello `world`")).toBe("hello ``world``");
    });

    it("escapes double quotes", () => {
        expect(escapeForPsString('say "hello"')).toBe('say `"hello`"');
    });

    it("escapes dollar signs", () => {
        expect(escapeForPsString("$var")).toBe("`$var");
    });

    it("handles combined special chars", () => {
        expect(escapeForPsString('`"$')).toBe('```"`$');
    });

    it("leaves normal text unchanged", () => {
        expect(escapeForPsString("Hello World 123")).toBe("Hello World 123");
    });
});

describe("toPowerShellSafe", () => {
    it("converts Turkish characters", () => {
        const result = toPowerShellSafe("Şifreleme İşlemi Başarılı");
        expect(result).toBe("Sifreleme Islemi Basarili");
    });

    it("converts German characters", () => {
        const result = toPowerShellSafe("Größe über Straße");
        expect(result).toBe("Grosse uber Strasse");
    });

    it("converts French accented chars", () => {
        const result = toPowerShellSafe("Résumé créé");
        expect(result).toBe("Resume cree");
    });

    it("strips unknown non-ASCII characters", () => {
        const result = toPowerShellSafe("Hello 🌍 World");
        expect(result).toBe("Hello World");
    });

    it("collapses multiple spaces", () => {
        const result = toPowerShellSafe("Hello    World");
        expect(result).toBe("Hello World");
    });

    it("also escapes PS special chars", () => {
        const result = toPowerShellSafe('Cost: $5 "discount"');
        expect(result).toBe('Cost: `$5 `"discount`"');
    });
});

describe("generateScriptMessage", () => {
    it("generates English message", () => {
        const result = generateScriptMessage("Clean Temp", "en");
        expect(result).toBe("Clean Temp is being applied");
    });

    it("generates Turkish message with character conversion", () => {
        const result = generateScriptMessage("Geçici Dosyalar", "tr");
        expect(result).toBe("Gecici Dosyalar islemi yapiliyor");
    });

    it("returns empty for empty title", () => {
        expect(generateScriptMessage("  ", "en")).toBe("");
    });

    it("falls back to English for unknown lang", () => {
        const result = generateScriptMessage("Test", "xx");
        expect(result).toBe("Test is being applied");
    });
});
