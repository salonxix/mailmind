# LLM-Powered Automation Testing

## Overview

This testing suite implements **LLM-as-Test-Oracle** - a unique approach where an LLM validates the quality and correctness of AI outputs. Instead of hardcoded assertions, we use another LLM to judge if the AI's responses are reasonable.

## Architecture

```
Test Flow:
1. Send sample email to AI endpoint
2. Get AI response (priority score, category, etc.)
3. Ask LLM Oracle: "Is this response reasonable?"
4. LLM validates and provides confidence score
5. Test passes/fails based on LLM's judgment
```

## Test Categories

### 1. Priority Scoring (`ai-priority.test.ts`)
Tests if priority scores are reasonable for different email types:
- ✅ Urgent deadlines → High scores (80-100)
- ✅ Normal emails → Medium scores (40-60)
- ✅ Newsletters → Low scores (0-30)
- ✅ Meeting invitations → Medium-high scores (60-80)

### 2. Email Categorization (`ai-categorization.test.ts`)
Validates email category assignments:
- ✅ Urgent emails → "Do Now"
- ✅ Decision requests → "Needs Decision"
- ✅ FYI emails → "Waiting" or "Low Energy"

### 3. Spam Detection (`ai-spam-detection.test.ts`)
Tests spam/phishing detection accuracy:
- ✅ Promotional emails → Detected as spam
- ✅ Legitimate work emails → Not flagged
- ✅ Phishing attempts → Detected with high confidence

### 4. Deadline Extraction (`ai-deadline-extraction.test.ts`)
Validates deadline parsing:
- ✅ "Today" deadlines → Extracted correctly
- ✅ "Tomorrow" deadlines → Extracted with high urgency
- ✅ No deadline → Returns null appropriately

### 5. Reply Quality (`ai-reply-quality.test.ts`)
Assesses generated reply quality:
- ✅ Professional tone for formal emails
- ✅ Friendly tone for casual emails
- ✅ Addresses original content
- ✅ Appropriate length and structure

## Running Tests

### Prerequisites
1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Ensure `GROQ_API_KEY` is set in `.env.local`

### Run All Tests
```bash
npm test
```

### Watch Mode (Re-run on changes)
```bash
npm run test:watch
```

### Interactive UI
```bash
npm run test:ui
```

### With Coverage
```bash
npm run test:coverage
```

## LLM Oracle

The `llm-oracle.ts` utility provides validation functions:

```typescript
// Example: Validate priority score
const validation = await validatePriorityScore(email, score);
// Returns: { isValid: true, confidence: 85, reasoning: "..." }
```

### Oracle Response Format
```json
{
  "isValid": true,
  "confidence": 85,
  "reasoning": "Score is appropriate for urgent deadline",
  "score": 90
}
```

## Test Results Interpretation

### Confidence Levels
- **90-100**: Very confident in validation
- **70-89**: Confident, minor uncertainty
- **50-69**: Moderate confidence
- **<50**: Low confidence, may need review

### Expected Pass Rates
- Priority Scoring: 90%+ (LLM confidence >70)
- Categorization: 85%+ (LLM confidence >60)
- Spam Detection: 95%+ (LLM confidence >80)
- Deadline Extraction: 80%+ (LLM confidence >60)
- Reply Quality: 75%+ (LLM confidence >60)

## Why LLM-as-Oracle?

### Traditional Testing
```typescript
expect(score).toBe(85); // Brittle, exact match
```

### LLM-Powered Testing
```typescript
const validation = await validatePriorityScore(email, score);
expect(validation.isValid).toBe(true); // Flexible, semantic validation
```

### Benefits
1. **Semantic Understanding**: LLM understands context, not just numbers
2. **Flexible Validation**: Accepts reasonable variations
3. **Explainable**: Provides reasoning for pass/fail
4. **Confidence Scores**: Quantifies certainty
5. **Realistic**: Mimics human judgment

## Example Test Output

```
✓ tests/ai-priority.test.ts (4)
  ✓ AI Priority Scoring - LLM Validated (4)
    ✓ should assign high priority to urgent deadline emails
      📊 Score: 92, LLM Validation: {
        isValid: true,
        confidence: 95,
        reasoning: "Score is highly appropriate for urgent payment deadline"
      }
    ✓ should assign medium priority to normal emails
      📊 Score: 55, LLM Validation: {
        isValid: true,
        confidence: 88,
        reasoning: "Medium score fits informational team update"
      }
```

## Adding New Tests

1. Create test file in `tests/` directory
2. Import LLM oracle functions
3. Write test with LLM validation:

```typescript
import { validatePriorityScore } from './llm-oracle';

it('should handle custom scenario', async () => {
  const email = { subject: '...', snippet: '...' };
  
  // Call your AI endpoint
  const response = await fetch('http://localhost:3000/api/ai/priority', {
    method: 'POST',
    body: JSON.stringify(email),
  });
  
  const { result } = await response.json();
  
  // Validate with LLM
  const validation = await validatePriorityScore(email, result.score);
  
  expect(validation.isValid).toBe(true);
  expect(validation.confidence).toBeGreaterThan(70);
});
```

## Troubleshooting

### Tests Timing Out
- Increase timeout in test: `it('test', async () => {...}, 60000)`
- Check if dev server is running
- Verify API endpoints are accessible

### Low Confidence Scores
- Review LLM reasoning in console output
- Adjust test expectations if LLM is correct
- Improve AI endpoint if LLM identifies issues

### API Key Issues
- Verify `GROQ_API_KEY` in `.env.local`
- Check `tests/setup.ts` loads environment correctly
- Ensure API key has sufficient quota

## Best Practices

1. **Always log LLM validation**: See reasoning for failures
2. **Set reasonable confidence thresholds**: 70+ for most tests
3. **Use descriptive test names**: Explain what's being validated
4. **Test edge cases**: Empty emails, special characters, etc.
5. **Monitor LLM costs**: Each test makes 2 LLM calls (AI + Oracle)

## Future Enhancements

- [ ] Add performance benchmarks
- [ ] Test multilingual emails
- [ ] Validate summarization quality
- [ ] Test calendar event extraction
- [ ] Add regression test suite
- [ ] Implement A/B testing for model comparison

---

**Note**: This testing approach is unique because the LLM acts as a flexible, intelligent test oracle that can judge output quality semantically, not just syntactically.
