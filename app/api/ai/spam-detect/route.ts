import { NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = "llama-3.3-70b-versatile";

if (!GROQ_API_KEY) {
  console.error("❌ GROQ_API_KEY is not configured in environment variables");
}

export async function POST(req: Request) {
    if (!GROQ_API_KEY) {
        return NextResponse.json({
            result: { isSpam: false, confidence: 50, reason: "API key not configured" },
        }, { status: 500 });
    }

    try {
        const { subject, snippet, from } = await req.json();

        // ✅ Validate input
        if (!subject && !snippet) {
            return NextResponse.json({
                result: { isSpam: false, confidence: 50, reason: "No content to analyze" },
            });
        }

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: MODEL,
                max_tokens: 200, // Reduced for faster response
                temperature: 0.2, // More consistent spam detection
                messages: [
                    {
                        role: "system",
                        content: `You are a spam detection AI. Analyze if email is spam/promotional or legitimate.

Consider:
- Suspicious sender patterns
- Promotional language (sale, discount, limited time)
- Phishing indicators
- Urgency manipulation
- Too-good-to-be-true offers

Respond ONLY with valid JSON.`,
                    },
                    {
                        role: "user",
                        content: `From: ${from || "Unknown"}
Subject: ${subject || "No subject"}
Content: ${snippet || "No content"}

Respond ONLY as JSON:
{"isSpam": <true/false>, "confidence": <number 0-100>, "reason": "<brief explanation>"}`,
                    },
                ],
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Spam Detection API Error:", response.status, errorText);
            
            // ✅ Better fallback based on keywords
            const text = `${subject} ${snippet}`.toLowerCase();
            const spamKeywords = ["unsubscribe", "click here", "limited time", "act now", "winner", "congratulations", "free money", "viagra", "casino"];
            const isSpam = spamKeywords.some(keyword => text.includes(keyword));
            
            return NextResponse.json({
                result: { isSpam, confidence: 60, reason: "Keyword-based detection" },
            });
        }

        const data = await response.json();
        const raw = data.choices[0]?.message?.content || "";
        const match = raw.match(/\{[\s\S]*?\}/);

        if (!match) {
            console.error("Spam Detection API: No JSON found in response:", raw);
            return NextResponse.json({
                result: { isSpam: false, confidence: 50, reason: "Could not parse response" },
            });
        }

        const parsed = JSON.parse(match[0]);
        return NextResponse.json({ result: parsed });

    } catch (err: any) {
        console.error("Spam Detection API Error:", err.message);
        return NextResponse.json(
            { result: { isSpam: false, confidence: 0, reason: "Processing error" } },
            { status: 500 }
        );
    }
}
