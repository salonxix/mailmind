import { describe, it, expect } from 'vitest';
import { validateCategorization } from './llm-oracle';

describe('AI Email Categorization - LLM Validated', () => {
  it('should categorize urgent emails as "Do Now"', async () => {
    const email = {
      subject: 'CRITICAL: Server Down - Immediate Action Required',
      snippet: 'Our production server is down. We need immediate action to restore service.',
    };

    const response = await fetch('http://localhost:3000/api/ai/categorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(email),
    });

    const data = await response.json();
    const category = data.result.category;

    const validation = await validateCategorization(email, category);

    console.log(`📁 Category: ${category}, LLM Validation:`, validation);

    expect(validation.isValid).toBe(true);
    expect(category).toBe('Do Now');
  }, 30000);

  it('should categorize decision requests as "Needs Decision"', async () => {
    const email = {
      subject: 'Approval Needed: Budget Proposal',
      snippet: 'Please review and approve the attached budget proposal for Q2. Your decision is needed by end of week.',
    };

    const response = await fetch('http://localhost:3000/api/ai/categorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(email),
    });

    const data = await response.json();
    const category = data.result.category;

    const validation = await validateCategorization(email, category);

    console.log(`📁 Category: ${category}, LLM Validation:`, validation);

    expect(validation.isValid).toBe(true);
    expect(['Needs Decision', 'Do Now']).toContain(category);
  }, 30000);

  it('should categorize FYI emails as "Waiting" or "Low Energy"', async () => {
    const email = {
      subject: 'FYI: Project Status Update',
      snippet: 'Just wanted to keep you in the loop. The project is progressing well. No action needed from you.',
    };

    const response = await fetch('http://localhost:3000/api/ai/categorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(email),
    });

    const data = await response.json();
    const category = data.result.category;

    const validation = await validateCategorization(email, category);

    console.log(`📁 Category: ${category}, LLM Validation:`, validation);

    expect(validation.isValid).toBe(true);
    expect(['Waiting', 'Low Energy']).toContain(category);
  }, 30000);
});
