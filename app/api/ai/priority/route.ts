import { NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = "llama-3.3-70b-versatile"; // Fast and accurate

if (!GROQ_API_KEY) {
  console.error("❌ GROQ_API_KEY is not configured in environment variables");
}

export async function POST(req: Request) {
    console.log("🔍 Priority API called");
    console.log("📋 GROQ_API_KEY exists:", !!GROQ_API_KEY);
    console.log("📋 GROQ_API_KEY length:", GROQ_API_KEY?.length);
    
    if (!GROQ_API_KEY) {
        console.error("❌ API key missing!");
        return NextResponse.json({
            result: { score: 50, reason: "API key not configured" },
        }, { status: 500 });
    }

    try {
        const { subject, snippet } = await req.json();
        console.log("📧 Processing email:", subject?.substring(0, 50));

        if (!subject && !snippet) {
            return NextResponse.json({
                result: { score: 50, reason: "No content to analyze" },
            });
        }

        console.log("🚀 Calling Groq API...");
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: MODEL,
                max_tokens: 150,
                temperature: 0.3,
                messages: [
                    {
                        role: "system",
                        content: "You are an email priority analyzer. Analyze urgency, importance, and action requirements. Respond ONLY with valid JSON.",
                    },
                    {
                        role: "user",
                        content: `Subject: ${subject || "No subject"}
Snippet: ${snippet || "No content"}

Respond ONLY as JSON:
{"score": <number 1-100>, "reason": "<brief explanation>"}`,
                    },
                ],
            }),
        });

        console.log("📡 Groq API response status:", response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Priority API Error ${response.status}:`, errorText);
            
            const text = `${subject} ${snippet}`.toLowerCase();
            let fallbackScore = 50;
            let reason = "Keyword-based estimate";
            
            if (text.includes("urgent") || text.includes("asap") || text.includes("immediately") || text.includes("critical")) {
                fallbackScore = 90;
                reason = "Urgent keywords detected";
            } else if (text.includes("deadline") || text.includes("due") || text.includes("important")) {
                fallbackScore = 75;
                reason = "Deadline/important keywords";
            } else if (text.includes("meeting") || text.includes("interview") || text.includes("call")) {
                fallbackScore = 70;
                reason = "Meeting/event detected";
            } else if (text.includes("payment") || text.includes("invoice") || text.includes("bill")) {
                fallbackScore = 80;
                reason = "Payment-related";
            } else if (text.includes("fyi") || text.includes("newsletter") || text.includes("unsubscribe")) {
                fallbackScore = 25;
                reason = "Low priority content";
            }
            
            return NextResponse.json({
                result: { score: fallbackScore, reason },
            });
        }

        const data = await response.json();
        console.log("✅ Groq API success!");
        const raw = data.choices[0]?.message?.content || "";
        console.log("📝 AI response:", raw.substring(0, 100));

        const match = raw.match(/\{[\s\S]*?\}/);

        if (!match) {
            console.error("Priority API: No JSON found in response:", raw);
            return NextResponse.json({
                result: { score: 50, reason: "Could not parse AI response" },
            });
        }

        const parsed = JSON.parse(match[0]);
        
        if (parsed.score < 1 || parsed.score > 100) {
            parsed.score = Math.max(1, Math.min(100, parsed.score));
        }

        return NextResponse.json({
            result: parsed,
        });

    } catch (err: any) {
        console.error("Priority API Error:", err.message);

        return NextResponse.json({
            result: { score: 50, reason: "Processing error" },
        });
    }
}