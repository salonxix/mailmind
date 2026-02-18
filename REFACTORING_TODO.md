# Page.tsx Refactoring TODO

## Current Status
- ✅ Added component imports at top of file
- ✅ Removed inline helper functions (now in utils/emailHelpers.ts)
- ✅ Removed sendComposedEmail function (handled by ComposeModal)
- ✅ Removed Gemini/OpenAI code

## Remaining Work

### 1. Replace Inline Sidebar (Lines ~2100-2400)
**Current**: 300+ lines of inline JSX  
**Replace with**:
```tsx
<Sidebar
  sidebarOpen={sidebarOpen}
  setSidebarOpen={setSidebarOpen}
  activeFolder={activeFolder}
  setActiveFolder={setActiveFolder}
  activeTab={activeTab}
  setActiveTab={setActiveTab}
  showTodoView={showTodoView}
  setShowTodoView={setShowTodoView}
  showWeeklyAnalysis={showWeeklyAnalysis}
  setShowWeeklyAnalysis={setShowWeeklyAnalysis}
  showFocusMode={showFocusMode}
  setShowFocusMode={setShowFocusMode}
  setShowCompose={setShowCompose}
/>
```

### 2. Replace Inline WeeklyAnalysis (Lines ~2400-3000)
**Current**: 600+ lines of inline JSX  
**Replace with**:
```tsx
{showWeeklyAnalysis && (
  <WeeklyAnalysis analysis={getWeeklyAnalysis()} />
)}
```

### 3. Replace Inline FocusMode (Lines ~3000-3500)
**Current**: 500+ lines of inline JSX  
**Replace with**:
```tsx
{showFocusMode && (
  <FocusMode
    todaysTasks={getTodaysTasks()}
    getPriorityScore={getPriorityScore}
    getPriorityColor={getPriorityColor}
    extractDeadline={extractDeadline}
    openMailAndGenerateAI={openMailAndGenerateAI}
    markDone={markDone}
    selectedMail={selectedMail}
  />
)}
```

### 4. Replace Inline ComposeModal (Lines ~4400-4600)
**Current**: 200+ lines of inline JSX  
**Replace with**:
```tsx
<ComposeModal
  showCompose={showCompose}
  setShowCompose={setShowCompose}
/>
```

### 5. Use EmailDetail Component
The EmailDetail component exists but page.tsx still has inline email detail view.
Need to identify and replace that section.

## Expected Result
- Current: ~4180 lines
- Target: ~1000-1200 lines
- Reduction: ~3000 lines (72% reduction)

## Benefits
- ✅ Clean architecture
- ✅ Reusable components
- ✅ Easier to maintain
- ✅ Easier for judges to read
- ✅ Better TypeScript support
- ✅ Separation of concerns
