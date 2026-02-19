// Verification script to check if AI is working
import fs from 'fs';
import path from 'path';

console.log("🔍 Verifying AI Fix...\n");

// Check 1: Verify model in all AI routes
console.log("1️⃣ Checking AI route files...");

const aiRoutes = [
  'app/api/ai/priority/route.ts',
  'app/api/ai/categorize/route.ts',
  'app/api/ai/spam-detect/route.ts',
  'app/api/ai/extract-deadline/route.ts',
  'app/api/ai/reply/route.ts',
  'app/api/ai/summarize/route.ts',
  'app/api/ai/explain/route.ts',
  'app/api/ai/todo-title/route.ts',
  'app/api/calendar/extract/route.ts'
];

let allCorrect = true;

aiRoutes.forEach(route => {
  const filePath = path.join(__dirname, route);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('const MODEL = "openrouter/free"')) {
      console.log(`   ✅ ${route}`);
    } else if (content.includes('const MODEL = "qwen/qwen3-coder"')) {
      console.log(`   ❌ ${route} - Still using old model!`);
      allCorrect = false;
    } else if (content.includes('const MODEL = "anthropic/claude-sonnet-4.6"')) {
      console.log(`   ❌ ${route} - Using paid model!`);
      allCorrect = false;
    } else {
      console.log(`   ⚠️  ${route} - Unknown model`);
      allCorrect = false;
    }
  } else {
    console.log(`   ❌ ${route} - File not found!`);
    allCorrect = false;
  }
});

console.log();

// Check 2: Verify API key
console.log("2️⃣ Checking API key...");
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('OPENROUTER_API_KEY=sk-or-v1-')) {
    console.log("   ✅ API key is configured");
  } else {
    console.log("   ❌ API key not found or invalid");
    allCorrect = false;
  }
} else {
  console.log("   ❌ .env.local file not found!");
  allCorrect = false;
}

console.log();

// Check 3: Test API
console.log("3️⃣ Testing API connection...");

const OPENROUTER_API_KEY = "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";

async function testAPI() {
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
        model: "openrouter/free",
        max_tokens: 50,
        messages: [
          {
            role: "user",
            content: "Respond with JSON: {\"test\": \"success\"}",
          },
        ],
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.choices && data.choices[0]) {
        console.log("   ✅ API is working!");
        console.log("   Response:", data.choices[0].message.content.substring(0, 100));
      } else {
        console.log("   ⚠️  API responded but no choices");
        allCorrect = false;
      }
    } else {
      const errorText = await response.text();
      console.log("   ❌ API error:", response.status);
      console.log("   ", errorText.substring(0, 200));
      allCorrect = false;
    }
  } catch (error) {
    console.log("   ❌ API test failed:", error.message);
    allCorrect = false;
  }
}

testAPI().then(() => {
  console.log();
  console.log("═".repeat(50));
  
  if (allCorrect) {
    console.log("✅ ALL CHECKS PASSED!");
    console.log();
    console.log("Your AI should now be working. Next steps:");
    console.log("1. Restart your dev server (npm run dev)");
    console.log("2. Clear browser cache (Ctrl+Shift+R)");
    console.log("3. Sign in and load emails");
    console.log("4. Watch for AI progress indicator");
  } else {
    console.log("❌ SOME CHECKS FAILED!");
    console.log();
    console.log("Please fix the issues above and run this script again.");
  }
  
  console.log("═".repeat(50));
});
