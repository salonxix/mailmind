import { NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = "llama-3.3-70b-versatile";

if (!GROQ_API_KEY) {
  console.error("❌ GROQ_API_KEY is not configured");
}

export async function POST(req: Request) {
  if (!GROQ_API_KEY) {
    return NextResponse.json({
      events: [],
      error: "API key not configured"
    }, { status: 500 });
  }

  try {
    const { subject, body, snippet } = await req.json();

    const emailText = `${subject}\n\n${body || snippet}`;

    const prompt = `Extract calendar events from this email. Return ONLY a JSON array of events.

Email:
${emailText}

Extract:
- Meetings (with date, time if mentioned)
- Deadlines (with date)
- Appointments (with date, time)
- Reminders (with date)

Return format:
[
  {
    "title": "Meeting with client",
    "date": "2026-02-25",
    "time": "14:00",
    "type": "meeting",
    "description": "Discuss Q1 budget"
  }
]

If no events found, return empty array [].
IMPORTANT: Return ONLY valid JSON, no other text.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    const responseText = data.choices[0]?.message?.content || "[]";
    
    // Extract JSON from response
    let events = [];
    try {
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        events = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error("Failed to parse events:", e);
    }

    return NextResponse.json({ events });
  } catch (error: any) {
    console.error("Calendar extraction error:", error);
    return NextResponse.json({ events: [], error: error.message });
  }
}
