# Job Hunt AI - Testing & Validation Brief

## Project Overview
Job Hunt AI is an AI-powered job application automation platform that helps users manage resumes, discover matching jobs, and optimize applications using Claude AI. The platform prioritizes **100% honesty** - it never fabricates experience or skills.

**Repository**: https://github.com/player20/Job-Hunt-AI
**Latest Commit**: Add AI-powered resume tailoring and match analysis features

---

## Your Task

As an AI agent testing team, your objective is to **comprehensively test and validate** the Job Hunt AI platform. You should:

1. **Verify all functionality works error-free**
2. **Test the honesty enforcement** (critical requirement)
3. **Identify bugs, security issues, or edge cases**
4. **Evaluate code quality, architecture, and best practices**
5. **Assess user experience and usability**
6. **Provide actionable recommendations for improvements**

**Do not be biased.** Report issues objectively, even if they require significant rework.

---

## System Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite (Prisma ORM)
- **AI**: Claude 3 Haiku via Anthropic SDK
- **Job Sources**: RemoteOK, JSearch (RapidAPI), Remotive

### Key Components Implemented
1. ✅ Resume upload and AI-powered parsing (PDF/DOCX support)
2. ✅ Job scraping from 3 US-focused sources
3. ✅ AI match analysis (confidence scoring with caching)
4. ✅ AI resume tailoring (honest keyword optimization)
5. ⏳ Frontend UI for tailoring (pending)
6. ⏳ Application tracking dashboard (pending)
7. ⏳ PDF/DOCX export (pending)

---

## Critical Testing Areas

### 1. **Honesty Verification** (Highest Priority)

The platform MUST NEVER fabricate skills, experience, or achievements. Test these scenarios:

**Test Cases:**
- Upload a resume for a software engineer with **no AI/ML experience**
- Tailor it for a job requiring AI/ML expertise
- **Expected**: The system should NOT add AI/ML skills
- **Expected**: `keywordsNotApplied` should list AI/ML with reasoning

**Verification Questions:**
- Does the system enforce the 5 CORE RULES in `resumeTailor.ts:77-82`?
- Is `honestyScore` always 100?
- Are all changes in the `changes` array justified with truthful explanations?
- Can you trick the AI into lying? (Try edge cases)

**Files to Review:**
- `server/src/services/resumeTailor.ts` (lines 75-145 contain the honesty prompt)
- `server/src/services/matchAnalyzer.ts` (lines 96-101 enforce truthfulness)

---

### 2. **Backend API Testing**

**Test all endpoints with various inputs:**

#### Resume Endpoints (`/api/resumes`)
- `POST /api/resumes` - Upload PDF and DOCX files
  - ✅ Valid PDFs (test with real resumes)
  - ✅ Valid DOCX files
  - ❌ Invalid file types (exe, txt, jpg)
  - ❌ Files exceeding size limit
  - ❌ Corrupted PDF files
  - ❌ Password-protected PDFs

- `POST /api/resumes/:id/tailor` - Tailor resume for job
  - ✅ Valid resume + job with matching skills
  - ✅ Valid resume + job with no matching skills
  - ❌ Non-existent resume ID
  - ❌ Non-existent job ID
  - ❌ Malformed request body
  - ❌ Empty keywords array

#### Job Endpoints (`/api/jobs`)
- `GET /api/jobs` - Search jobs
  - ✅ No filters (should return all jobs)
  - ✅ Search by title ("engineer", "manager")
  - ✅ Filter by location ("Boulder", "remote")
  - ✅ Filter by salary ($80,000 minimum)
  - ✅ Pagination (offset and limit)
  - ❌ Invalid query parameters

- `POST /api/jobs/:id/analyze-match` - Analyze match
  - ✅ Valid job + resume (should return confidence score)
  - ✅ Second call (should use 24h cache)
  - ❌ Non-existent job ID
  - ❌ Non-existent resume ID
  - ❌ Missing resumeId in body

- `POST /api/jobs/scrape` - Scrape jobs
  - ✅ Should fetch jobs from 3 sources (RemoteOK, JSearch, Remotive)
  - ✅ Should deduplicate jobs
  - ❌ Handle API failures gracefully

#### Database Schema Verification
- Verify `JobMatchCache` model has unique constraint on `jobId + resumeId`
- Verify `TailoredResume` model stores all required fields
- Test cache expiration (24 hours for match analysis)

---

### 3. **Error Handling & Edge Cases**

**Test these scenarios:**

#### API Key Issues
- Missing `CLAUDE_API_KEY` environment variable
- Invalid Claude API key
- Rate limit exceeded on Claude API
- Network timeout to Claude API

#### Database Issues
- Database file locked (concurrent writes)
- Disk full (cannot save resume)
- Prisma client disconnected

#### File Processing Issues
- Resume with no extractable text
- Resume in non-English language
- Resume with images but no text
- Very long resume (50+ pages)

#### AI Response Issues
- Claude returns malformed JSON
- Claude refuses to process (content policy)
- Claude returns incomplete response

---

### 4. **Job Scraping Verification**

**Verify all job sources work correctly:**

#### RemoteOK
- Should fetch US remote jobs
- Should extract: title, company, description, location, salary, URL

#### JSearch (RapidAPI)
- Requires `RAPIDAPI_KEY` environment variable
- Should aggregate jobs from Indeed, LinkedIn, Glassdoor
- Should handle API quota exceeded

#### Remotive
- Should fetch global remote jobs
- Should filter for US-friendly positions

**Common Tests:**
- No duplicate jobs in database (test `externalId` uniqueness)
- All jobs have required fields (title, company, description)
- Job descriptions are not truncated
- Posted dates are parsed correctly
- Salary ranges are extracted when available

---

### 5. **Frontend Testing** (When Implemented)

**User Experience:**
- Is resume upload intuitive? (drag-and-drop)
- Are loading states clear? (spinners, progress bars)
- Are errors user-friendly? (not raw stack traces)
- Is the job list easy to browse? (filters, search, pagination)

**Resume Tailoring UI:**
- Side-by-side comparison should show original vs. tailored
- Changes should be highlighted
- Keywords applied/skipped should be visible
- Export to PDF/DOCX should work

**Application Tracking:**
- Dashboard should show application stats
- Status updates should be easy to change
- Notes should be editable

---

### 6. **Security Testing**

**Test for common vulnerabilities:**

#### Injection Attacks
- SQL injection in job search filters
- NoSQL injection in Prisma queries
- Command injection in file processing

#### Authentication & Authorization
- Is there user authentication? (currently no)
- Can users access other users' resumes?
- Are file uploads validated for malicious content?

#### Data Privacy
- Are uploaded resumes stored securely?
- Is sensitive data (emails, phones) protected?
- Are API keys stored in environment variables (not code)?
- Is the Claude API key exposed in client-side code?

#### Rate Limiting
- Is there rate limiting on API endpoints?
- Can someone abuse the job scraping endpoint?
- Are Claude API calls limited to prevent cost overruns?

---

### 7. **Code Quality Review**

**Architecture:**
- Is the separation of concerns clear? (routes → services → database)
- Are services reusable and testable?
- Is error handling consistent across the codebase?

**TypeScript Usage:**
- Are types properly defined?
- Are `any` types avoided?
- Are interfaces used for complex objects?

**Best Practices:**
- Are environment variables validated on startup?
- Are secrets stored securely?
- Is logging structured and useful for debugging?
- Are database queries optimized (indexes, pagination)?

**Files to Review:**
- `server/src/app.ts` - Express app setup
- `server/src/config/env.ts` - Environment validation
- `server/src/middleware/security.ts` - Security headers, rate limiting
- `server/src/services/*.ts` - Business logic

---

### 8. **Performance Testing**

**Test under load:**
- Upload 10 resumes simultaneously
- Scrape jobs from all sources (should complete in <30s)
- Analyze 100 job-resume matches (should use caching)
- Tailor 10 resumes for the same job (should handle concurrency)

**Optimization Checks:**
- Is match analysis cached for 24 hours?
- Are database queries using indexes?
- Are large JSON fields (skills, experience) parsed only when needed?
- Is the frontend minified in production?

---

## Test Environment Setup

### 1. **Clone Repository**
```bash
git clone https://github.com/player20/Job-Hunt-AI.git
cd Job-Hunt-AI
```

### 2. **Install Dependencies**
```bash
npm install
```

### 3. **Configure Environment**
Create `.env` file in root:
```bash
NODE_ENV=development
PORT=3001
DATABASE_URL="file:./dev.db"
CLAUDE_API_KEY=sk-ant-api03-...  # Required for testing
RAPIDAPI_KEY=...                  # Optional (for JSearch)
FRONTEND_URL=http://localhost:3000
```

### 4. **Setup Database**
```bash
cd server
npx prisma generate
npx prisma migrate dev --name init
cd ..
```

### 5. **Start Servers**
```bash
npm run dev  # Starts both frontend (3000) and backend (3001)
```

---

## Expected Test Outputs

### ✅ **Pass Criteria**
- All API endpoints return expected responses
- Resume tailoring NEVER fabricates information
- Match analysis provides accurate confidence scores
- Job scraping fetches jobs from all 3 sources
- Database schema supports all required features
- Error messages are helpful and user-friendly
- No critical security vulnerabilities
- Code follows best practices and is maintainable

### ❌ **Fail Criteria**
- Any endpoint crashes the server
- AI adds skills/experience not in original resume
- Match analysis returns confidence > 100 or < 0
- Job scraping fails silently
- Database migrations fail
- API keys are exposed in client-side code
- Sensitive data is logged or exposed
- Critical bugs prevent core functionality

---

## Reporting Guidelines

### Report Structure

```markdown
# Job Hunt AI - Test Results

## Executive Summary
[High-level overview: Pass/Fail, critical issues, overall assessment]

## Detailed Findings

### 1. Honesty Verification
- ✅ PASS: System correctly rejects fabricated skills
- ❌ FAIL: Found edge case where AI adds unverified experience
  - **Reproduction Steps**: [...]
  - **Expected**: [...]
  - **Actual**: [...]
  - **Severity**: Critical

### 2. Backend API Testing
[Results for each endpoint...]

### 3. Security Testing
[Vulnerabilities found, if any...]

### [Continue for all test areas...]

## Summary of Issues

| Severity | Count | Examples |
|----------|-------|----------|
| Critical | 2     | AI fabrication bug, SQL injection vulnerability |
| High     | 5     | Server crashes on invalid input, missing error handling |
| Medium   | 8     | Poor error messages, missing validation |
| Low      | 12    | Code style inconsistencies, missing comments |

## Recommendations

### Immediate Fixes (Critical)
1. [Fix honesty enforcement bug in resumeTailor.ts]
2. [Add input sanitization to prevent SQL injection]

### High Priority
3. [Add better error handling for file uploads]
4. [Implement rate limiting on expensive endpoints]

### Nice to Have
10. [Add TypeScript strict mode]
11. [Improve logging for debugging]

## Conclusion
[Overall assessment, readiness for production, next steps]
```

---

## Open Questions for Investigation

These are areas where the testing team should dig deeper:

1. **Concurrency**: What happens when 100 users upload resumes simultaneously?
2. **Cost Control**: How much does the Claude API cost per resume tailoring operation? Is there a budget limit?
3. **Data Retention**: How long are tailored resumes stored? Is there cleanup logic?
4. **Multi-user**: The system currently uses a default user. How should multi-user support work?
5. **Job Expiration**: Are expired job postings removed from the database?
6. **Resume Versions**: Can users maintain multiple resume versions? Which is used for tailoring?
7. **Offline Support**: Can the frontend work offline using service workers?
8. **Mobile Support**: Does the UI work on mobile devices?

---

## Success Metrics

After testing, answer these questions:

### Functional Correctness
- [ ] Can users upload resumes successfully?
- [ ] Does AI parsing extract all resume fields accurately?
- [ ] Are job searches fast and accurate?
- [ ] Does match analysis provide meaningful insights?
- [ ] Does resume tailoring maintain 100% honesty?

### Non-Functional Requirements
- [ ] Are all API responses under 2 seconds?
- [ ] Can the system handle 10 concurrent users?
- [ ] Are errors logged for debugging?
- [ ] Is the UI intuitive for non-technical users?
- [ ] Is the code maintainable and well-documented?

### Business Requirements
- [ ] Does the platform solve the user's problem (job hunting)?
- [ ] Is the AI providing real value (better match rates)?
- [ ] Are users likely to trust the tailored resumes?
- [ ] Is the cost per user reasonable (Claude API costs)?

---

## Additional Resources

- **Prisma Schema**: `server/prisma/schema.prisma`
- **API Documentation**: `server/src/app.ts` (inline comments)
- **Test Data**: Use real resumes and job postings for accurate testing
- **Claude API Docs**: https://docs.anthropic.com/claude/reference/

---

## Final Notes

- **Be thorough**: Test every endpoint, every edge case, every user flow
- **Be objective**: Report what you find, not what you hope to find
- **Be constructive**: Suggest fixes, not just problems
- **Be realistic**: Consider the MVP scope vs. production readiness

The goal is to ensure Job Hunt AI is **error-free, honest, secure, and ready for users**.

---

**Testing Team**: Please coordinate your efforts, divide test areas, and compile a unified report. Good luck!
