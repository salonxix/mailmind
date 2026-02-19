import { NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = "llama-3.3-70b-versatile";

if (!GROQ_API_KEY) {
  console.error("❌ GROQ_API_KEY is not configured in environment variables");
}

export async function POST(req: Request) {
    if (!GROQ_API_KEY) {
        return NextResponse.json({
            result: { deadline: null, urgency: "None", confidence: 50 },
        }, { status: 500 });
    }

    try {
        const { subject, snippet } = await req.json();

        if (!subject && !snippet) {
            return NextResponse.json({
                result: { deadline: null, urgency: "None", confidence: 50 },
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
                temperature: 0.2,
                messages: [
                    {
                        role: "system",
                        content: `You are a deadline extraction AI. Extract deadlines from emails.

Today: ${new Date().toLocaleDateString()}

Return format:
- "Today" - if due today
- "Tomorrow" - if due tomorrow  
- "DD MMM" - for specific dates (e.g., "21 Feb")
- null - if no deadline

Respond ONLY with valid JSON.`,
                    },
                    {
                        role: "user",
                        content: `Subject: ${subject || "No subject"}
Content: ${snippet || "No content"}

Respond ONLY as JSON:
{"deadline": <string or null>, "urgency": "<Very High/High/Medium/Low/None>", "confidence": <number 0-100>}`,
                    },
                ],
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Deadline API Error ${response.status}:`, errorText);
            
            const text = `${subject} ${snippet}`.toLowerCase();
            let deadline = null;
            let urgency = "None";
            let confidence = 60;
            
            if (text.includes("today") || text.includes("tonight") || text.includes("eod")) {
                deadline = "Today";
                urgency = "Very High";
                confidence = 80;
            } else if (text.includes("tomorrow")) {
                deadline = "Tomorrow";
                urgency = "High";
                confidence = 80;
            } else if (text.includes("this week") || text.includes("by friday")) {
                deadline = "This Week";
                urgency = "Medium";
                confidence = 70;
            } else if (text.includes("next week")) {
                deadline = "Next Week";
                urgency = "Low";
                confidence = 70;
            } else if (text.includes("deadline") || text.includes("due date") || text.includes("due by")) {
                deadline = "Check Email";
                urgency = "Medium";
                confidence = 60;
            }
            
            return NextResponse.json({
                result: { deadline, urgency, confidence },
            });
        }

        const data = await response.json();
        const raw = data.choices[0]?.message?.content || "";
        const match = raw.match(/\{[\s\S]*?\}/);

        if (!match) {
            console.error("Deadline API: No JSON found in response:", raw);
            return NextResponse.json({
                result: { deadline: null, urgency: "None", confidence: 50 },
            });
        }

        const parsed = JSON.parse(match[0]);
        return NextResponse.json({ result: parsed });

    } catch (err: any) {
        console.error("Deadline Extraction API Error:", err.message);
        return NextResponse.json({
            result: { deadline: null, urgency: "None", confidence: 0 },
        });
    }
}