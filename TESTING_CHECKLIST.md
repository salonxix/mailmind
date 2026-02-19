# ✅ Testing Checklist - AI Fix Verification

## Pre-Testing Setup

### 1. Environment Check
- [ ] `.env.local` file exists
- [ ] `OPENROUTER_API_KEY` is set
- [ ] API key starts with `sk-or-v1-`
- [ ] No syntax errors in code files

### 2. Dependencies
- [ ] Node.js installed
- [ ] `npm install` completed successfully
- [ ] No dependency errors

### 3. Development Server
- [ ] `npm run dev` starts without errors
- [ ] Server running on http://localhost:3000
- [ ] No compilation errors

---

## Functional Testing

### Priority Scoring

#### Test 1: Urgent Email
- [ ] Create/find email with "URGENT" in subject
- [ ] Check console for: `🔍 Calling Priority API`
- [ ] Verify status: `📡 Priority API Response Status: 200`
- [ ] Check score is 80-95 (not 50)
- [ ] Verify reason mentions urgency

#### Test 2: Low Priority Email
- [ ] Create/find email with "Newsletter" in subject
- [ ] Check console for API call
- [ ] Verify status: 200
- [ ] Check score is 20-35 (not 50)
- [ ] Verify reason mentions low priority

#### Test 3: Medium Priority Email
- [ ] Create/find regular email (no urgent keywords)
- [ ] Check console for API call
- [ ] Verify status: 200
- [ ] Check score is 45-65
- [ ] Verify reason is descriptive

#### Test 4: Varied Scores
- [ ] Load 10+ emails
- [ ] Verify NOT all scores are 50
- [ ] Verify scores range from 25-95
- [ ] Verify scores match email importance

### Deadline Extraction

#### Test 5: Today Deadline
- [ ] Find email with "today" or "tonight"
- [ ] Check console for: `🔍 Calling Deadline API`
- [ ] Verify status: 200
- [ ] Check deadline: "Today"
- [ ] Check urgency: "Very High"

#### Test 6: Tomorrow Deadline
- [ ] Find email with "tomorrow"
- [ ] Check console for API call
- [ ] Verify status: 200
- [ ] Check deadline: "Tomorrow"
- [ ] Check urgency: "High"

#### Test 7: No Deadline
- [ ] Find email without time keywords
- [ ] Check console for API call
- [ ] Verify status: 200
- [ ] Check deadline: null
- [ ] Check urgency: "None"

### Batch Processing

#### Test 8: Batch Size
- [ ] Load 20+ emails
- [ ] Check console for batch processing
- [ ] Verify 5 emails processed (not 3)
- [ ] Verify both priority and deadline called
- [ ] Total time ~40 seconds

#### Test 9: Progress Tracking
- [ ] Watch for progress indicators
- [ ] Verify priority progress updates
- [ ] Verify deadline progress updates
- [ ] Verify completion message

### Error Handling

#### Test 10: Keyword Fallback
- [ ] Disconnect internet (or block API)
- [ ] Load emails with "urgent" keyword
- [ ] Verify fallback score ~90
- [ ] Verify reason: "Urgent keywords detected"
- [ ] Reconnect internet

#### Test 11: Rate Limit Handling
- [ ] Load many emails quickly
- [ ] Watch for any 429 errors
- [ ] Should NOT see rate limit errors
- [ ] If seen, verify fallback works

---

## Console Log Verification

### Expected Success Logs
```
✅ 🔍 Calling Priority API for email: [subject]
✅ 📡 Priority API Response Status: 200
✅ 📊 Priority API Response: {result: {score: X, reason: "..."}}
✅ ✅ Priority Score: X - [reason]

✅ 🔍 Calling Deadline API for email: [subject]
✅ 📡 Deadline API Response Status: 200
✅ 📊 Deadline API Response: {result: {deadline: "...", urgency: "..."}}
✅ ✅ Deadline: ... - Urgency: ...
```

### Check for Errors
- [ ] No 429 (rate limit) errors
- [ ] No 500 (server) errors
- [ ] No 401 (auth) errors
- [ ] No "No JSON found" errors
- [ ] No undefined/null errors

---

## Performance Testing

### Test 12: Response Time
- [ ] Priority API responds in <3 seconds
- [ ] Deadline API responds in <3 seconds
- [ ] Total batch time ~40 seconds for 5 emails
- [ ] UI remains responsive during processing

### Test 13: Cache Effectiveness
- [ ] Load emails first time (slow)
- [ ] Refresh page
- [ ] Verify cached scores load instantly
- [ ] No duplicate API calls for cached emails

---

## Model Verification

### Test 14: Model Configuration
- [ ] Check `app/api/ai/priority/route.ts`
- [ ] Verify: `const MODEL = "google/gemini-flash-1.5"`
- [ ] Check `app/api/ai/extract-deadline/route.ts`
- [ ] Verify: `const MODEL = "google/gemini-flash-1.5"`
- [ ] Check all other AI routes
- [ ] All should use `google/gemini-flash-1.5`

---

## Automated Testing

### Test 15: Run Test Script
```bash
node test-gemini-fix.js
```

Expected output:
- [ ] All 4 priority tests pass
- [ ] All 4 deadline tests pass
- [ ] No errors or exceptions
- [ ] Message: "✅ ALL TESTS PASSED!"

---

## Edge Cases

### Test 16: Empty Email
- [ ] Email with no subject or body
- [ ] Should return default score 50
- [ ] Should not crash

### Test 17: Very Long Email
- [ ] Email with 1000+ words
- [ ] Should process successfully
- [ ] Should return valid score

### Test 18: Special Characters
- [ ] Email with emojis, symbols
- [ ] Should process successfully
- [ ] Should return valid score

---

## Integration Testing

### Test 19: Email List Display
- [ ] Priority scores visible in email list
- [ ] Scores have correct colors:
  - Red (80-100): High priority
  - Yellow (50-79): Medium priority
  - Green (0-49): Low priority
- [ ] Deadlines visible where applicable

### Test 20: Email Detail View
- [ ] Click on email
- [ ] Priority score displayed
- [ ] Deadline displayed (if exists)
- [ ] Urgency level shown

---

## Regression Testing

### Test 21: Other Features Still Work
- [ ] Email sending works
- [ ] Email replying works
- [ ] Email archiving works
- [ ] Email search works
- [ ] Calendar integration works

---

## Documentation Review

### Test 22: Documentation Complete
- [ ] `AI_FIX_COMPLETE.md` exists
- [ ] `QUICK_START_AI_FIX.md` exists
- [ ] `CHANGES_SUMMARY.md` exists
- [ ] `AI_FLOW_DIAGRAM.md` exists
- [ ] `TESTING_CHECKLIST.md` exists (this file)
- [ ] All docs are accurate and helpful

---

## Final Verification

### Test 23: End-to-End Flow
1. [ ] Start fresh (clear cache)
2. [ ] Login with Gmail
3. [ ] Load inbox (20+ emails)
4. [ ] Wait for batch processing
5. [ ] Verify varied priority scores
6. [ ] Verify deadlines extracted
7. [ ] Check console logs are clean
8. [ ] Refresh page
9. [ ] Verify cached data loads instantly
10. [ ] No errors in console

### Test 24: User Experience
- [ ] AI processing is smooth
- [ ] No noticeable delays
- [ ] Progress indicators work
- [ ] Scores make sense
- [ ] Deadlines are accurate
- [ ] Overall experience is good

---

## Sign-Off

### Developer Checklist
- [ ] All code changes reviewed
- [ ] No syntax errors
- [ ] No TypeScript errors
- [ ] All tests pass
- [ ] Documentation complete
- [ ] Ready for production

### Test Results Summary
- Total Tests: 24
- Passed: ___
- Failed: ___
- Skipped: ___

### Issues Found
1. _______________
2. _______________
3. _______________

### Status
- [ ] ✅ All tests passed - Ready to use
- [ ] ⚠️ Some issues found - Needs fixes
- [ ] ❌ Major issues - Not ready

---

## Quick Test (5 Minutes)

If you only have 5 minutes, run these critical tests:

1. [ ] Start dev server
2. [ ] Login and load emails
3. [ ] Check console for API calls
4. [ ] Verify scores are NOT all 50
5. [ ] Run: `node test-gemini-fix.js`
6. [ ] Verify: "ALL TESTS PASSED"

If all 6 pass → ✅ AI is working correctly!

---

**Last Updated**: February 19, 2026  
**Version**: 1.0  
**Status**: Ready for testing
