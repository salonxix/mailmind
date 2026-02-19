import { NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = "llama-3.3-70b-versatile";

if (!GROQ_API_KEY) {
  console.error("❌ GROQ_API_KEY is not configured");
}

export async function POST(req: Request) {
  if (!GROQ_API_KEY) {
    return NextResponse.json({
      explanation: "Unable to generate explanation. API key not configured.",
    }, { status: 500 });
  }

  try {
    const { subject, snippet } = await req.json();

    // ✅ Trim input
    const safeSnippet = (snippet || "").slice(0, 2000);

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 400,
        messages: [
          {
            role: "user",
            content: `
Explain why this email is important in 2-3 bullet points.

Subject: ${subject}

Body:
${safeSnippet}
          `,
          },
        ],
      }),
    });

    const data = await response.json();

    return NextResponse.json({
      explanation: data.choices[0]?.message?.content || "Unable to generate explanation",
    });
  } catch (error: any) {
    console.error("EXPLAIN ERROR:", error);

    if (error?.status === 429) {
      return NextResponse.json(
        {
          explanation:
            "⚠️ Rate limit reached. Please wait 1 minute before retrying.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { explanation: "❌ Error generating explanation" },
      { status: 500 }
    );
  }
}
