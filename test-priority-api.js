// Test with FREE models
const OPENROUTER_API_KEY = "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";

async function testFreeModels() {
  console.log("Testing FREE models...\n");
  
  const freeModels = [
    "openrouter/free",
    "liquid/lfm-2.5-1.2b-instruct:free",
    "arcee-ai/trinity-large-preview:free",
    "upstage/solar-pro-3:free",
    "stepfun/step-3.5-flash:free"
  ];
  
  const testEmail = {
    subject: "Urgent: Project deadline tomorrow",
    snippet: "We need to submit the final project by tomorrow 5pm."
  };
  
  for (const model of freeModels) {
    console.log(`\n=== Testing ${model} ===`);
    
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://mailmindd.app",
          "X-Title": "MailMindd",
        },
        body: JSON.stringify({
          model: model,
          max_tokens: 150,
          messages: [
            {
              role: "user",
              content: `Analyze this email and give a priority score from 1-100.

Subject: ${testEmail.subject}
Content: ${testEmail.snippet}

Respond ONLY as JSON: {"score": <number>, "reason": "<explanation>"}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log("❌ Error:", errorText.substring(0, 200));
        continue;
      }

      const data = await response.json();
      
      if (data.error) {
        console.log("❌ Error:", data.error.message);
        continue;
      }
      
      if (data.choices && data.choices[0]) {
        const content = data.choices[0].message.content;
        console.log("✅ Success!");
        console.log("Response:", content);
        
        // Try to parse JSON
        try {
          const match = content.match(/\{[\s\S]*?\}/);
          if (match) {
            const parsed = JSON.parse(match[0]);
            console.log("Parsed:", parsed);
            console.log("\n🎉 THIS MODEL WORKS! Use:", model);
            return model;
          }
        } catch (e) {
          console.log("Could not parse JSON");
        }
      }
    } catch (error) {
      console.log("❌ Request failed:", error.message);
    }
  }
  
  console.log("\n❌ No free models worked");
}

testFreeModels();
