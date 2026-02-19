import { describe, it, expect } from 'vitest';
import { validateDeadlineExtraction } from './llm-oracle';

describe('AI Deadline Extraction - LLM Validated', () => {
  it('should extract "Today" deadline correctly', async () => {
    const email = {
      subject: 'Report Due Today',
      snippet: 'Please submit your monthly report by end of day today. This is urgent.',
    };

    const response = await fetch('http://localhost:3000/api/ai/extract-deadline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(email),
    });

    const data = await response.json();
    const { deadline, urgency } = data.result;

    const validation = await validateDeadlineExtraction(email, deadline, urgency);

    console.log(`📅 Deadline: ${deadline}, Urgency: ${urgency}, LLM Validation:`, validation);

    expect(validation.isValid).toBe(true);
    expect(deadline).toContain('Today');
    expect(urgency).toBe('Very High');
  }, 30000);

  it('should extract "Tomorrow" deadline correctly', async () => {
    const email = {
      subject: 'Meeting Tomorrow at 2 PM',
      snippet: 'Reminder: We have our quarterly review meeting tomorrow afternoon.',
    };

    const response = await fetch('http://localhost:3000/api/ai/extract-deadline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(email),
    });

    const data = await response.json();
    const { deadline, urgency } = data.result;

    const validation = await validateDeadlineExtraction(email, deadline, urgency);

    console.log(`📅 Deadline: ${deadline}, Urgency: ${urgency}, LLM Validation:`, validation);

    expect(validation.isValid).toBe(true);
    expect(deadline).toContain('Tomorrow');
    expect(['High', 'Very High']).toContain(urgency);
  }, 30000);

  it('should return null for emails without deadlines', async () => {
    const email = {
      subject: 'General Information',
      snippet: 'Here is some general information for your reference. No action required.',
    };

    const response = await fetch('http://localhost:3000/api/ai/extract-deadline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(email),
    });

    const data = await response.json();
    const { deadline, urgency } = data.result;

    const validation = await validateDeadlineExtraction(email, deadline, urgency);

    console.log(`📅 Deadline: ${deadline}, Urgency: ${urgency}, LLM Validation:`, validation);

    expect(validation.isValid).toBe(true);
    expect(deadline).toBeNull();
    expect(['None', 'Low']).toContain(urgency);
  }, 30000);
});
