import { NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = "llama-3.3-70b-versatile";

if (!GROQ_API_KEY) {
  console.error("❌ GROQ_API_KEY is not configured");
}

export async function POST(req: Request) {
  if (!GROQ_API_KEY) {
    return NextResponse.json({
      summary: "Unable to generate summary. API key not configured.",
    }, { status: 500 });
  }

  try {
    const { subject, snippet, from, date } = await req.json();

    // ✅ Trim input to avoid token overload
    const safeSnippet = (snippet || "").slice(0, 2000);

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: `
You are an email assistant.

Summarize this email clearly in this format:

📩 From: ...
📅 Received Date: ...
⏳ Deadline: (if mentioned)
📌 Summary: (2-3 lines)

Email:

Subject: ${subject}
From: ${from}
Received: ${date}

Body:
${safeSnippet}
          `,
          },
        ],
      }),
    });

    const data = await response.json();

    return NextResponse.json({
      summary: data.choices[0]?.message?.content || "Unable to generate summary",
    });
  } catch (error: any) {
    console.error("SUMMARY ERROR:", error);

    // ✅ Handle Rate Limit
    if (error?.status === 429) {
      return NextResponse.json(
        {
          summary:
            "⚠️ Rate limit reached. Please wait 1 minute and try again.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { summary: "❌ Error generating summary" },
      { status: 500 }
    );
  }
}
