/**
 * Test script to verify Gemini Flash AI integration
 * Run: node test-gemini-fix.js
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "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";
const MODEL = "google/gemini-flash-1.5";

// Test emails with different priority levels
const testEmails = [
  {
    subject: "URGENT: Payment Due Today",
    snippet: "Your invoice is due today. Please make payment immediately to avoid late fees.",
    expectedScore: "80-95",
    expectedDeadline: "Today"
  },
  {
    subject: "Meeting Tomorrow at 2 PM",
    snippet: "Don't forget about our meeting scheduled for tomorrow afternoon.",
    expectedScore: "65-80",
    expectedDeadline: "Tomorrow"
  },
  {
    subject: "Weekly Newsletter - February Edition",
    snippet: "Check out this week's updates and news from our team.",
    expectedScore: "20-35",
    expectedDeadline: null
  },
  {
    subject: "Project Deadline: Friday",
    snippet: "Reminder that the project deliverables are due by end of week.",
    expectedScore: "70-85",
    expectedDeadline: "This Week"
  }
];

async function testPriorityAPI(email) {
  console.log(`\n🔍 Testing Priority API for: "${email.subject}"`);
  
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
            content: `Subject: ${email.subject}
Snippet: ${email.snippet}

Respond ONLY as JSON:
{"score": <number 1-100>, "reason": "<brief explanation>"}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ HTTP Error ${response.status}:`, errorText);
      return { success: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    const raw = data.choices[0]?.message?.content || "";
    const match = raw.match(/\{[\s\S]*?\}/);

    if (!match) {
      console.error("❌ No JSON found in response:", raw);
      return { success: false, error: "No JSON in response" };
    }

    const parsed = JSON.parse(match[0]);
    console.log(`✅ Score: ${parsed.score} (Expected: ${email.expectedScore})`);
    console.log(`   Reason: ${parsed.reason}`);
    
    return { success: true, result: parsed };
  } catch (error) {
    console.error("❌ Error:", error.message);
    return { success: false, error: error.message };
  }
}

async function testDeadlineAPI(email) {
  console.log(`\n🔍 Testing Deadline API for: "${email.subject}"`);
  
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
            content: `Subject: ${email.subject}
Content: ${email.snippet}

Respond ONLY as JSON:
{"deadline": <string or null>, "urgency": "<Very High/High/Medium/Low/None>", "confidence": <number 0-100>}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ HTTP Error ${response.status}:`, errorText);
      return { success: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    const raw = data.choices[0]?.message?.content || "";
    const match = raw.match(/\{[\s\S]*?\}/);

    if (!match) {
      console.error("❌ No JSON found in response:", raw);
      return { success: false, error: "No JSON in response" };
    }

    const parsed = JSON.parse(match[0]);
    console.log(`✅ Deadline: ${parsed.deadline || "None"} (Expected: ${email.expectedDeadline || "None"})`);
    console.log(`   Urgency: ${parsed.urgency}, Confidence: ${parsed.confidence}%`);
    
    return { success: true, result: parsed };
  } catch (error) {
    console.error("❌ Error:", error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log("🚀 Testing Gemini Flash AI Integration");
  console.log("=====================================");
  console.log(`Model: ${MODEL}`);
  console.log(`API Key: ${OPENROUTER_API_KEY.substring(0, 20)}...`);
  
  let prioritySuccess = 0;
  let deadlineSuccess = 0;
  
  for (const email of testEmails) {
    // Test priority
    const priorityResult = await testPriorityAPI(email);
    if (priorityResult.success) prioritySuccess++;
    
    // Wait 4 seconds (rate limit: 15 RPM)
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // Test deadline
    const deadlineResult = await testDeadlineAPI(email);
    if (deadlineResult.success) deadlineSuccess++;
    
    // Wait 4 seconds before next email
    await new Promise(resolve => setTimeout(resolve, 4000));
  }
  
  console.log("\n\n📊 TEST RESULTS");
  console.log("================");
  console.log(`Priority API: ${prioritySuccess}/${testEmails.length} successful`);
  console.log(`Deadline API: ${deadlineSuccess}/${testEmails.length} successful`);
  
  if (prioritySuccess === testEmails.length && deadlineSuccess === testEmails.length) {
    console.log("\n✅ ALL TESTS PASSED! AI is working correctly.");
  } else {
    console.log("\n⚠️  SOME TESTS FAILED. Check errors above.");
  }
}

// Run tests
runTests().catch(console.error);
