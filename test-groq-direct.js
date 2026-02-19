// Direct test of Groq API
const GROQ_API_KEY = process.env.GROQ_API_KEY || "your-api-key-here";

async function testGroq() {
  console.log("🧪 Testing Groq API...");
  console.log("📋 API Key:", GROQ_API_KEY.substring(0, 20) + "...");

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 50,
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content: "You are a test assistant. Respond with JSON only.",
          },
          {
            role: "user",
            content: 'Respond with: {"status": "working", "message": "API is functional"}',
          },
        ],
      }),
    });

    console.log("📡 Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error:", errorText);
      return;
    }

    const data = await response.json();
    console.log("✅ Success!");
    console.log("📝 Response:", JSON.stringify(data, null, 2));

  } catch (error) {
    console.error("❌ Exception:", error.message);
  }
}

testGroq();
