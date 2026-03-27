import { NextResponse } from "next/server";
import { createHmac } from "crypto";

const SECRET = process.env.NEXTAUTH_SECRET || "default_captcha_secret_optwin";

export async function GET() {
    // Generate random math question (addition or subtraction to keep it positive)
    const num1 = Math.floor(Math.random() * 10) + 1; // 1 to 10
    const num2 = Math.floor(Math.random() * num1) + 1; // 1 to num1 (to ensure positive subtraction)
    
    const isAddition = Math.random() > 0.5;
    const operator = isAddition ? "+" : "-";
    const answer = isAddition ? num1 + num2 : num1 - num2;
    
    const question = `${num1} ${operator} ${num2} = ?`;
    
    // Create time-bound cryptographic signature
    const timestamp = Date.now();
    const data = `${answer}:${timestamp}`;
    const hash = createHmac("sha256", SECRET).update(data).digest("hex");
    const token = Buffer.from(`${data}|${hash}`).toString("base64");

    return NextResponse.json({
        success: true,
        question,
        token
    }, {
        headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
        }
    });
}
