import { describe, it, expect } from 'vitest';
import { validateSpamDetection } from './llm-oracle';

describe('AI Spam Detection - LLM Validated', () => {
  it('should detect promotional spam', async () => {
    const email = {
      from: 'deals@superstore.com',
      subject: '🔥 HUGE SALE! 90% OFF Everything - Limited Time Only!!!',
      snippet: 'Act now! This amazing offer wont last. Click here to claim your discount before its too late!',
    };

    const response = await fetch('http://localhost:3000/api/ai/spam-detect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(email),
    });

    const data = await response.json();
    const isSpam = data.result.isSpam;

    const validation = await validateSpamDetection(email, isSpam);

    console.log(`🚫 Spam: ${isSpam}, LLM Validation:`, validation);

    expect(validation.isValid).toBe(true);
    expect(isSpam).toBe(true);
  }, 30000);

  it('should not flag legitimate work emails as spam', async () => {
    const email = {
      from: 'manager@company.com',
      subject: 'Project Update and Next Steps',
      snippet: 'Hi team, here is an update on our current project status. Please review and provide feedback.',
    };

    const response = await fetch('http://localhost:3000/api/ai/spam-detect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(email),
    });

    const data = await response.json();
    const isSpam = data.result.isSpam;

    const validation = await validateSpamDetection(email, isSpam);

    console.log(`🚫 Spam: ${isSpam}, LLM Validation:`, validation);

    expect(validation.isValid).toBe(true);
    expect(isSpam).toBe(false);
  }, 30000);

  it('should detect phishing attempts', async () => {
    const email = {
      from: 'security@paypa1.com',
      subject: 'Urgent: Verify Your Account Now',
      snippet: 'Your account has been compromised. Click this link immediately to verify your identity and prevent suspension.',
    };

    const response = await fetch('http://localhost:3000/api/ai/spam-detect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(email),
    });

    const data = await response.json();
    const isSpam = data.result.isSpam;

    const validation = await validateSpamDetection(email, isSpam);

    console.log(`🚫 Spam: ${isSpam}, LLM Validation:`, validation);

    expect(validation.isValid).toBe(true);
    expect(validation.confidence).toBeGreaterThan(70);
  }, 30000);
});
