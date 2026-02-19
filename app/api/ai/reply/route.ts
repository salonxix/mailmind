import { NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = "llama-3.3-70b-versatile";

if (!GROQ_API_KEY) {
  console.error("❌ GROQ_API_KEY is not configured");
}

export async function POST(req: Request) {
    if (!GROQ_API_KEY) {
        return NextResponse.json({
            reply: "Unable to generate reply. API key not configured.",
        }, { status: 500 });
    }

    try {
        const { subject, snippet } = await req.json();

        // ✅ Validate input
        if (!subject && !snippet) {
            return NextResponse.json({
                reply: "Please provide email content to generate a reply.",
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
                max_tokens: 300, // Reduced from 500
                temperature: 0.4, // Added for more natural replies
                messages: [
                    {
                        role: "system",
                        content:
                            "You are an email assistant. Write a short, polite, professional reply. Keep it concise and actionable.",
                    },
                    {
                        role: "user",
                        content: `Subject: ${subject || "No subject"}

Email Content:
${snippet || "No content"}

Write a professional reply:`,
                    },
                ],
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Reply API Error:", response.status, errorText);
            return NextResponse.json({
                reply: "Thank you for your email. I will review it and get back to you soon.",
            });
        }

        const data = await response.json();
        const replyText =
            data.choices[0]?.message?.content || "Thank you for your email. I will respond shortly.";

        return NextResponse.json({
            reply: replyText,
        });
    } catch (err: any) {
        console.error("Reply Generation Error:", err.message);
        return NextResponse.json(
            { 
                reply: "Thank you for your email. I will review it and respond soon.",
                error: err.message 
            },
            { status: 500 }
        );
    }
}
