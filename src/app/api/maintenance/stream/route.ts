import { NextResponse } from "next/server";
import { redisClient } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    let subscriber: typeof redisClient | null = null;

    const stream = new ReadableStream({
        start(controller) {
            // Send initial connection message
            controller.enqueue(`data: {"connected":true}\n\n`);

            // Duplicate redis client for pub/sub (ioredis requirement)
            subscriber = redisClient.duplicate();

            subscriber.on("message", (channel, message) => {
                if (channel === "optwin:channels:maintenance") {
                    try {
                        controller.enqueue(`data: {"maintenance": ${message === "true"}}\n\n`);
                    } catch (e) {
                        console.error("Failed to push SSE message", e);
                    }
                }
            });

            subscriber.subscribe("optwin:channels:maintenance", (err) => {
                if (err) {
                    console.error("Failed to subscribe to channels", err);
                    controller.error(err);
                }
            });

            // Keep connection alive with heartbeat
            const interval = setInterval(() => {
                try {
                    controller.enqueue(`:\n\n`);
                } catch {
                    clearInterval(interval);
                }
            }, 15000);

            request.signal.addEventListener("abort", () => {
                clearInterval(interval);
                if (subscriber) {
                    subscriber.unsubscribe();
                    subscriber.quit();
                }
                controller.close();
            });
        },
        cancel() {
            if (subscriber) {
                subscriber.unsubscribe();
                subscriber.quit();
            }
        }
    });

    return new NextResponse(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
        },
    });
}
