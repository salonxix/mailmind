// Check available models
const OPENROUTER_API_KEY = "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";

async function checkModels() {
  console.log("Fetching available models...\n");
  
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      },
    });

    const data = await response.json();
    
    if (data.data) {
      console.log(`Found ${data.data.length} models\n`);
      
      // Filter for free or cheap models
      const affordableModels = data.data
        .filter(m => {
          const pricing = m.pricing;
          if (!pricing) return false;
          const promptCost = parseFloat(pricing.prompt || "999");
          const completionCost = parseFloat(pricing.completion || "999");
          return promptCost === 0 || (promptCost < 0.0001 && completionCost < 0.0001);
        })
        .slice(0, 20);
      
      console.log("Affordable models (free or very cheap):");
      affordableModels.forEach(m => {
        console.log(`- ${m.id}`);
        console.log(`  Prompt: $${m.pricing.prompt}, Completion: $${m.pricing.completion}`);
      });
      
      // Test the first available model
      if (affordableModels.length > 0) {
        console.log(`\n\nTesting ${affordableModels[0].id}...`);
        await testModel(affordableModels[0].id);
      }
    }
  } catch (error) {
    console.error("Failed:", error.message);
  }
}

async function testModel(modelId) {
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
        model: modelId,
        max_tokens: 150,
        messages: [
          {
            role: "user",
            content: `Analyze this email and respond ONLY with JSON:

Subject: Urgent: Project deadline tomorrow
Content: We need to submit the project by tomorrow 5pm

Format: {"score": <number 1-100>, "reason": "<brief explanation>"}`,
          },
        ],
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      console.log("❌ Error:", data.error.message);
    } else if (data.choices && data.choices[0]) {
      const content = data.choices[0].message.content;
      console.log("✅ Success!");
      console.log("Response:", content);
    }
  } catch (error) {
    console.log("❌ Request failed:", error.message);
  }
}

checkModels();
