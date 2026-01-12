# Job Hunt AI - Code-Specific Evaluation for AI Agents

## CRITICAL INSTRUCTIONS

**You MUST read the actual source code files listed below.** Do NOT provide generic recommendations. Your evaluation must reference specific line numbers and actual code from the repository.

**Repository**: https://github.com/player20/Job-Hunt-AI

---

## Required Files to Review

### Frontend Components (React + TypeScript)

1. **[client/src/App.tsx](https://github.com/player20/Job-Hunt-AI/blob/main/client/src/App.tsx)**
   - Main routing structure
   - Verify all routes are implemented

2. **[client/src/pages/JobSearch.tsx](https://github.com/player20/Job-Hunt-AI/blob/main/client/src/pages/JobSearch.tsx)**
   - **CRITICAL**: Line 87 has TODO comment for job details modal
   - Check if job search filters work
   - Verify empty states and loading states

3. **[client/src/components/jobs/JobCard.tsx](https://github.com/player20/Job-Hunt-AI/blob/main/client/src/components/jobs/JobCard.tsx)**
   - Check accessibility (keyboard navigation)
   - Verify color contrast ratios
   - Review responsive design

4. **[client/src/components/resume/ResumeUploader.tsx](https://github.com/player20/Job-Hunt-AI/blob/main/client/src/components/resume/ResumeUploader.tsx)**
   - Check file upload validation
   - Verify drag-and-drop implementation

### Backend API (Node.js + Express)

5. **[server/src/routes/jobs.ts](https://github.com/player20/Job-Hunt-AI/blob/main/server/src/routes/jobs.ts)**
   - Line 189-217: Match analysis endpoint
   - Verify error handling

6. **[server/src/routes/resumes.ts](https://github.com/player20/Job-Hunt-AI/blob/main/server/src/routes/resumes.ts)**
   - Line 291-331: Resume tailoring endpoint
   - Check if frontend consumes this API

7. **[server/src/services/matchAnalyzer.ts](https://github.com/player20/Job-Hunt-AI/blob/main/server/src/services/matchAnalyzer.ts)**
   - Review AI prompt for match analysis
   - Check honesty enforcement

8. **[server/src/services/resumeTailor.ts](https://github.com/player20/Job-Hunt-AI/blob/main/server/src/services/resumeTailor.ts)**
   - Line 75-145: Honesty enforcement prompt
   - Verify 5 CORE RULES are enforced

### Database Schema

9. **[server/prisma/schema.prisma](https://github.com/player20/Job-Hunt-AI/blob/main/server/prisma/schema.prisma)**
   - Line 180-201: JobMatchCache model
   - Line 207-226: TailoredResume model

---

## Specific Questions You MUST Answer

### 1. Job Details Modal
**Question**: Is there a job details modal component?
**File to Check**: Search for `JobDetailsModal.tsx` or `JobModal.tsx`
**Expected**: NOT FOUND (this is a missing feature)

**Evidence Required**:
```
✅ Searched client/src/components/jobs/ folder
✅ Found: JobCard.tsx, JobFilters.tsx
❌ Missing: JobDetailsModal.tsx
```

### 2. Resume Tailoring UI
**Question**: Is there a resume tailoring comparison UI?
**File to Check**: Search for `ResumeTailoringView.tsx` or `ResumeDiffViewer.tsx`
**Expected**: NOT FOUND (this is a missing feature)

**Evidence Required**:
```
✅ Backend API exists: server/src/routes/resumes.ts:291
✅ Backend service works: server/src/services/resumeTailor.ts
❌ Frontend UI missing: No component found
```

### 3. TODO Comments
**Question**: How many TODO comments are in the codebase?
**Files to Check**: All `.tsx` and `.ts` files
**Expected**: At least 1 critical TODO in JobSearch.tsx:87

**Evidence Required**:
```
// JobSearch.tsx:87
const handleJobClick = (jobId: string) => {
  // TODO: Navigate to job details page or open modal
  console.log('Job clicked:', jobId);
};
```

### 4. Accessibility Issues
**Question**: What accessibility violations exist?
**File to Check**: `client/src/components/jobs/JobCard.tsx`

**Evidence Required**:
- Line 216: `.job-source` color is `#9ca3af`
- Contrast ratio: 2.8:1 (FAILS WCAG AA requirement of 4.5:1)
- Missing custom focus indicators
- Emoji icons (📍 💰 🏠) may not work with screen readers

### 5. Technology Stack Validation
**Question**: What is the ACTUAL tech stack?
**Files to Check**: `package.json` files

**Expected Stack**:
- ✅ Frontend: React 18 + TypeScript + Vite
- ✅ Backend: Node.js + Express + TypeScript
- ✅ Database: SQLite (NOT MongoDB)
- ✅ AI: Claude 3 Haiku (NOT GPT)
- ❌ NO message brokers (RabbitMQ, Kafka)
- ❌ NO collaboration features

---

## Evaluation Checklist

For each item, provide:
- ✅ or ❌ status
- File path and line number as evidence
- Specific code snippet
- Recommendation

### Frontend Completeness
- [ ] Job details modal exists
- [ ] Resume tailoring UI exists
- [ ] PDF/DOCX export UI exists
- [ ] Application tracking dashboard works
- [ ] All TODO comments resolved

### Accessibility Compliance
- [ ] All text has 4.5:1 contrast ratio
- [ ] Focus indicators visible
- [ ] Keyboard navigation works
- [ ] ARIA labels present
- [ ] Screen reader compatible

### Backend Functionality
- [ ] Match analysis API tested
- [ ] Resume tailoring API tested
- [ ] Error handling comprehensive
- [ ] Honesty enforcement verified

### Code Quality
- [ ] No TypeScript `any` types
- [ ] Consistent code style
- [ ] No console.log in production
- [ ] Environment variables secured

---

## Expected Output Format

```markdown
# Job Hunt AI - Code Review Results

## Executive Summary
Based on reviewing the actual codebase at commit [hash], here are the findings:

**Overall Status**: 🟡 70% Complete (Backend ✅, Frontend ⚠️)

---

## Critical Issues Found

### 1. Job Details Modal Missing ❌
**File**: client/src/pages/JobSearch.tsx
**Line**: 87
**Evidence**:
\`\`\`typescript
// TODO: Navigate to job details page or open modal
console.log('Job clicked:', jobId);
\`\`\`
**Impact**: Users cannot view full job descriptions
**Priority**: 🔴 CRITICAL
**Recommendation**: Create `JobDetailsModal.tsx` component

### 2. Resume Tailoring UI Missing ❌
**Files Checked**:
- ❌ client/src/components/resume/ResumeTailoringView.tsx (NOT FOUND)
- ❌ client/src/components/resume/ResumeDiffViewer.tsx (NOT FOUND)
- ✅ server/src/services/resumeTailor.ts (EXISTS - backend ready)

**Impact**: Backend works but users have no UI to use it
**Priority**: 🔴 CRITICAL
**Recommendation**: Build comparison view showing original vs. tailored

### 3. Accessibility Violation ⚠️
**File**: client/src/components/jobs/JobCard.tsx
**Line**: 216
**Evidence**:
\`\`\`css
.job-source {
  color: #9ca3af; /* 2.8:1 contrast - FAILS WCAG AA */
}
\`\`\`
**Impact**: Text not readable for users with vision impairments
**Priority**: 🟡 HIGH
**Fix**: Change to `#6b7280` (4.5:1 contrast)

[Continue for all issues...]

---

## Code Quality Score: 8/10

| Category | Score | Evidence |
|----------|-------|----------|
| TypeScript Usage | 9/10 | Strong typing, minimal `any` |
| Error Handling | 7/10 | Good try-catch, needs more specifics |
| Accessibility | 6/10 | Partial WCAG compliance |
| Code Organization | 9/10 | Clear separation of concerns |

---

## Technology Stack Verified

**Actual Stack** (from package.json):
- React 18.2.0 ✅
- TypeScript 5.x ✅
- Express.js ✅
- Prisma + SQLite ✅
- Claude API (Anthropic SDK) ✅

**NOT in Stack**:
- ❌ MongoDB (uses SQLite)
- ❌ Message brokers (RabbitMQ, Kafka)
- ❌ Collaboration features

---

## Next Steps

1. Implement job details modal (6 hours)
2. Build resume tailoring UI (10 hours)
3. Fix accessibility issues (3 hours)
4. Add PDF/DOCX export (5 hours)

**Total Work**: ~24 hours to MVP-ready
```

---

## Anti-Patterns to Avoid

**❌ DON'T DO THIS**:
```
"The application should consider adding collaboration features..."
```
(Generic recommendation not based on actual requirements)

**✅ DO THIS INSTEAD**:
```
"The application is missing a job details modal. Evidence:
JobSearch.tsx:87 has a TODO comment. The handleJobClick function
only logs to console instead of opening a modal."
```
(Specific finding with file path and line number)

---

## Clone & Test Instructions

```bash
# Clone repository
git clone https://github.com/player20/Job-Hunt-AI.git
cd Job-Hunt-AI

# Install dependencies
npm install

# Setup database
cd server
npx prisma generate
npx prisma migrate dev
cd ..

# Start servers
npm run dev

# Test in browser
# Frontend: http://localhost:3000
# Backend: http://localhost:3001

# Test job details click
# Navigate to /jobs, click a job card
# Expected: Console log (should be modal)
```

---

## Validation Checklist

Before submitting your review, verify:

- [ ] I cloned the repository and reviewed actual code
- [ ] I referenced specific file paths and line numbers
- [ ] I tested the application locally
- [ ] I did NOT provide generic recommendations
- [ ] I found the TODO comment on JobSearch.tsx:87
- [ ] I verified the technology stack from package.json
- [ ] I checked for missing components (JobDetailsModal, ResumeTailoringView)

If you answered NO to any item, your review is INCOMPLETE.

---

## Conclusion

This prompt forces you to:
1. Read actual source code
2. Provide evidence (file paths, line numbers)
3. Test the application
4. Find specific issues
5. Avoid generic advice

Follow these instructions exactly to provide a useful, actionable code review.
