/**
 * Shared utilities for AI API calls
 * Reduces code duplication across AI routes
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const BASE_URL = "https://openrouter.ai/api/v1/chat/completions";

export interface OpenRouterOptions {
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Call OpenRouter API with standardized error handling
 */
export async function callOpenRouter(
  messages: OpenRouterMessage[],
  options: OpenRouterOptions = {}
): Promise<any> {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const {
    maxTokens = 150,
    temperature = 0.3,
    model = "qwen/qwen3-coder",
  } = options;

  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://mailmindd.app",
      "X-Title": "MailMindd",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      messages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

/**
 * Extract JSON from AI response text
 * Handles cases where AI includes extra text around JSON
 */
export function extractJSON<T = any>(text: string): T {
  const match = text.match(/\{[\s\S]*?\}/);
  if (!match) {
    throw new Error("No JSON found in AI response");
  }
  return JSON.parse(match[0]);
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      // Don't retry on client errors (4xx)
      if (error.message?.includes("(4")) {
        throw error;
      }

      // Last attempt - throw error
      if (i === maxRetries - 1) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, i);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error("Retry failed");
}

/**
 * Validate required fields in request body
 */
export function validateRequest(
  body: any,
  requiredFields: string[]
): { valid: boolean; missing?: string[] } {
  const missing = requiredFields.filter((field) => !body[field]);

  if (missing.length > 0) {
    return { valid: false, missing };
  }

  return { valid: true };
}

/**
 * Truncate text to avoid token limits
 */
export function truncateText(text: string, maxLength = 2000): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Log API errors with context
 */
export function logAPIError(
  endpoint: string,
  error: any,
  context?: Record<string, any>
) {
  console.error(`[AI API Error] ${endpoint}`, {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    ...context,
  });
}
