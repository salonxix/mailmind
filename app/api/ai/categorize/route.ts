import { NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = "llama-3.3-70b-versatile";

if (!GROQ_API_KEY) {
  console.error("❌ GROQ_API_KEY is not configured in environment variables");
}

export async function POST(req: Request) {
    if (!GROQ_API_KEY) {
        return NextResponse.json({
            result: { category: "Low Energy", confidence: 50 },
        }, { status: 500 });
    }

    try {
        const { subject, snippet } = await req.json();

        if (!subject && !snippet) {
            return NextResponse.json({
                result: { category: "Low Energy", confidence: 50 },
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
                max_tokens: 150,
                temperature: 0.3,
                messages: [
                    {
                        role: "system",
                        content: `You are an email categorization AI. Categorize into ONE category:
- "Do Now": Urgent, time-sensitive, immediate action needed
- "Needs Decision": Requires approval, input, or choice
- "Waiting": Updates, FYI, can wait
- "Low Energy": Low priority, promotional, newsletters

Respond ONLY with valid JSON.`,
                    },
                    {
                        role: "user",
                        content: `Subject: ${subject || "No subject"}
Snippet: ${snippet || "No content"}

Respond ONLY as JSON:
{"category": "<one of the 4 categories>", "confidence": <number 0-100>}`,
                    },
                ],
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Categorize API Error:", response.status, errorText);
            
            // ✅ Better fallback based on keywords
            const text = `${subject} ${snippet}`.toLowerCase();
            let fallbackCategory = "Low Energy";
            
            if (text.includes("urgent") || text.includes("asap") || text.includes("deadline")) {
                fallbackCategory = "Do Now";
            } else if (text.includes("decision") || text.includes("approve") || text.includes("review")) {
                fallbackCategory = "Needs Decision";
            } else if (text.includes("update") || text.includes("fyi") || text.includes("notification")) {
                fallbackCategory = "Waiting";
            }
            
            return NextResponse.json({
                result: { category: fallbackCategory, confidence: 60 },
            });
        }

        const data = await response.json();
        const raw = data.choices[0]?.message?.content || "";
        const match = raw.match(/\{[\s\S]*?\}/);

        if (!match) {
            console.error("Categorize API: No JSON found in response:", raw);
            return NextResponse.json({
                result: { category: "Low Energy", confidence: 50 },
            });
        }

        const parsed = JSON.parse(match[0]);
        
        // ✅ Validate category
        const validCategories = ["Do Now", "Needs Decision", "Waiting", "Low Energy"];
        if (!validCategories.includes(parsed.category)) {
            parsed.category = "Low Energy";
        }
        
        return NextResponse.json({ result: parsed });

    } catch (err: any) {
        console.error("Categorize API Error:", err.message);
        return NextResponse.json(
            { result: { category: "Low Energy", confidence: 0 } },
            { status: 500 }
        );
    }
}
