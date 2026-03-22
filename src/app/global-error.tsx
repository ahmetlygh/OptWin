"use client";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body style={{ margin: 0, padding: 0, background: "#0a0a0f", color: "#e4e4e7", fontFamily: "Inter, system-ui, sans-serif" }}>
                <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
                    <div style={{ textAlign: "center", maxWidth: "420px" }}>
                        <div style={{ fontSize: "4rem", marginBottom: "1rem", opacity: 0.3 }}>
                            /!\
                        </div>
                        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                            Critical Error
                        </h1>
                        <p style={{ color: "#a1a1aa", marginBottom: "2rem", lineHeight: 1.6 }}>
                            The application encountered a critical error. This usually resolves by refreshing the page.
                        </p>
                        <button
                            onClick={reset}
                            style={{
                                padding: "0.75rem 1.5rem",
                                borderRadius: "0.75rem",
                                border: "none",
                                background: "#6c5ce7",
                                color: "white",
                                fontWeight: 700,
                                fontSize: "0.875rem",
                                cursor: "pointer",
                            }}
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
