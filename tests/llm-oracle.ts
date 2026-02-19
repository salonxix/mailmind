/**
 * LLM Test Oracle - Uses LLM to validate AI output quality
 * This is the unique twist: the LLM acts as the test oracle
 */

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = "llama-3.3-70b-versatile";

export interface OracleValidation {
  isValid: boolean;
  confidence: number;
  reasoning: string;
  score?: number;
}

/**
 * Ask LLM to validate if an AI output is reasonable
 */
export async function validateWithLLM(
  prompt: string,
  expectedCriteria: string
): Promise<OracleValidation> {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY not configured");
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 200,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: `You are a test oracle that validates AI outputs. Analyze if the output meets the criteria and respond ONLY with valid JSON:
{
  "isValid": <true/false>,
  "confidence": <0-100>,
  "reasoning": "<brief explanation>",
  "score": <optional 0-100 quality score>
}`,
          },
          {
            role: "user",
            content: `${prompt}\n\nCriteria: ${expectedCriteria}\n\nValidate and respond with JSON only.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM Oracle failed: ${response.status}`);
    }

    const data = await response.json();
    const raw = data.choices[0]?.message?.content || "";
    const match = raw.match(/\{[\s\S]*?\}/);

    if (!match) {
      throw new Error("No JSON in LLM response");
    }

    return JSON.parse(match[0]);
  } catch (error) {
    console.error("LLM Oracle error:", error);
    throw error;
  }
}

/**
 * Validate priority score reasonableness
 */
export async function validatePriorityScore(
  email: { subject: string; snippet: string },
  actualScore: number
): Promise<OracleValidation> {
  const prompt = `Email Subject: "${email.subject}"
Email Content: "${email.snippet}"
AI Priority Score: ${actualScore}/100`;

  const criteria = `The priority score should be:
- 80-100 for urgent/critical emails with deadlines
- 60-79 for important emails requiring action
- 40-59 for normal emails
- 20-39 for low priority/informational
- 0-19 for spam/promotional
Is the score ${actualScore} reasonable for this email?`;

  return validateWithLLM(prompt, criteria);
}

/**
 * Validate email categorization
 */
export async function validateCategorization(
  email: { subject: string; snippet: string },
  actualCategory: string
): Promise<OracleValidation> {
  const prompt = `Email Subject: "${email.subject}"
Email Content: "${email.snippet}"
AI Category: "${actualCategory}"`;

  const criteria = `Categories:
- "Do Now": Urgent, time-sensitive, immediate action
- "Needs Decision": Requires approval/input
- "Waiting": Updates, FYI, can wait
- "Low Energy": Low priority, promotional
Is "${actualCategory}" the correct category?`;

  return validateWithLLM(prompt, criteria);
}

/**
 * Validate spam detection
 */
export async function validateSpamDetection(
  email: { subject: string; snippet: string; from: string },
  isSpam: boolean
): Promise<OracleValidation> {
  const prompt = `From: "${email.from}"
Subject: "${email.subject}"
Content: "${email.snippet}"
AI Spam Detection: ${isSpam ? "SPAM" : "NOT SPAM"}`;

  const criteria = `Spam indicators:
- Promotional language (sale, discount, limited time)
- Suspicious sender patterns
- Phishing attempts
- Too-good-to-be-true offers
Is the spam detection (${isSpam}) correct?`;

  return validateWithLLM(prompt, criteria);
}

/**
 * Validate deadline extraction
 */
export async function validateDeadlineExtraction(
  email: { subject: string; snippet: string },
  deadline: string | null,
  urgency: string
): Promise<OracleValidation> {
  const prompt = `Email Subject: "${email.subject}"
Email Content: "${email.snippet}"
Extracted Deadline: ${deadline || "None"}
Urgency Level: ${urgency}`;

  const criteria = `Check if:
- Deadline extraction is accurate (today, tomorrow, specific date, or none)
- Urgency level matches the deadline (Very High for today, High for tomorrow, etc.)
- No false positives (extracting deadlines when none exist)
Is the extraction correct?`;

  return validateWithLLM(prompt, criteria);
}

/**
 * Validate reply quality
 */
export async function validateReplyQuality(
  originalEmail: { subject: string; body: string },
  generatedReply: string,
  tone: string
): Promise<OracleValidation> {
  const prompt = `Original Email: "${originalEmail.subject}"
Content: "${originalEmail.body}"
Generated Reply: "${generatedReply}"
Expected Tone: ${tone}`;

  const criteria = `The reply should:
- Address the original email's content
- Match the requested tone (${tone})
- Be professional and coherent
- Not be too long or too short
- Include appropriate greeting/closing
Is this a good quality reply?`;

  return validateWithLLM(prompt, criteria);
}
