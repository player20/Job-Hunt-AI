# Technical Debt & Future Improvements

This document tracks technical debt and future improvements identified by the multi-agent team evaluation.

## Priority 1: Security & Scalability (Post-MVP)

### 1. Authentication & Authorization
**Status**: Not implemented (single-user MVP)
**Impact**: Medium - Required for multi-user support
**Effort**: High

- Implement user authentication (JWT, sessions, or OAuth)
- Add role-based access control (RBAC)
- Secure API endpoints with auth middleware
- Add user registration and login flows

**Why deferred**: MVP is designed as a single-user local application. Auth adds significant complexity and isn't needed for initial validation.

### 2. Database Migration (SQLite → PostgreSQL)
**Status**: Using SQLite
**Impact**: Medium - Better performance for large datasets
**Effort**: Medium

**Current limitations**:
- Case-insensitive search only works for ASCII characters
- Performance degrades with large job inventories (>10,000 jobs)
- No full-text search capabilities

**Migration plan**:
1. Create PostgreSQL schema from Prisma
2. Write data migration script
3. Update connection strings
4. Test all queries
5. Update deployment config

**Why deferred**: SQLite is sufficient for MVP with <5,000 jobs. Migration makes sense when scaling to thousands of users or 50,000+ jobs.

## Priority 2: Performance & Optimization

### 3. Asynchronous Job Scraping
**Status**: Synchronous API endpoint
**Impact**: Low - Only affects scrape duration (10-30s)
**Effort**: Medium

**Current**: POST /api/jobs/scrape blocks until complete
**Recommended**: Background worker (Bull, BullMQ, or node-cron)

```typescript
// Future implementation
import Queue from 'bull';

const jobQueue = new Queue('job-scraping', {
  redis: { host: 'localhost', port: 6379 }
});

jobQueue.process(async (job) => {
  await scrapeAllJobs();
});

// Endpoint just enqueues the job
router.post('/scrape', (req, res) => {
  jobQueue.add({});
  res.json({ message: 'Scraping started', status: 'queued' });
});
```

**Why deferred**: 10-30 second scrape time is acceptable for MVP. Users click "Fetch Jobs" infrequently.

### 4. Caching Layer (Redis/In-Memory)
**Status**: No caching
**Impact**: Low - API responses are fast (<100ms)
**Effort**: Medium

**Recommended caching**:
- User preferences (TTL: 1 hour)
- Job search results (TTL: 5 minutes)
- Claude API responses (TTL: 24 hours) - **Already implemented**

```typescript
// Future implementation
import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 300 }); // 5 min default

router.get('/jobs', async (req, res) => {
  const cacheKey = JSON.stringify(req.query);
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  const jobs = await prisma.job.findMany({ /* ... */ });
  cache.set(cacheKey, jobs);
  res.json(jobs);
});
```

**Why deferred**: Database queries are already fast. Caching provides diminishing returns until user base grows.

## Priority 3: DevOps & Monitoring

### 5. Enhanced Logging & Monitoring
**Status**: Basic console.log statements
**Impact**: Low - Easy to debug locally
**Effort**: Low

**Recommended**:
- Structured logging (Winston, Pino)
- Log levels (error, warn, info, debug)
- Request correlation IDs
- Performance metrics

**Partial implementation**:
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
```

**Why deferred**: Console logs are sufficient for local development. Implement when deploying to production.

### 6. Containerization (Docker) & Orchestration (Kubernetes)
**Status**: Local development only
**Impact**: N/A for MVP
**Effort**: Medium-High

**Recommended**:
- Dockerfile for server and client
- docker-compose.yml for local dev
- Kubernetes manifests for production

**Why deferred**: Not needed for single-user local app. Implement when deploying to cloud or distributing to users.

## Priority 4: Testing

### 7. Comprehensive Test Suite
**Status**: No tests
**Impact**: Medium - Increases confidence in changes
**Effort**: High

**Recommended test coverage**:

#### Backend Unit Tests
```typescript
// server/tests/unit/jobScraper.test.ts
describe('Job Scraper', () => {
  it('should scrape jobs from Remotive API', async () => {
    const jobs = await scrapeRemotiveJobs();
    expect(jobs).toBeInstanceOf(Array);
    expect(jobs[0]).toHaveProperty('title');
  });

  it('should deduplicate jobs by externalId', () => {
    const jobs = [
      { externalId: '1', title: 'Job 1' },
      { externalId: '1', title: 'Job 1 Duplicate' },
    ];
    const unique = deduplicateJobs(jobs);
    expect(unique).toHaveLength(1);
  });
});
```

#### Integration Tests
```typescript
// server/tests/integration/resume-upload.test.ts
describe('Resume Upload Flow', () => {
  it('should upload PDF and parse with Claude', async () => {
    const response = await request(app)
      .post('/api/resumes')
      .attach('resume', 'tests/fixtures/sample-resume.pdf');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('fullName');
    expect(response.body.skills).toBeInstanceOf(Array);
  });
});
```

#### E2E Tests (Playwright/Cypress)
```typescript
// client/tests/e2e/job-search.spec.ts
test('complete job search flow', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('text=Job Search');
  await page.click('button:has-text("Fetch Latest Jobs")');
  await page.waitForSelector('.job-card');

  const jobCards = await page.locator('.job-card').count();
  expect(jobCards).toBeGreaterThan(0);
});
```

**Why deferred**: Manual testing is sufficient for MVP. Automated tests provide ROI when codebase grows or team expands.

### 8. Performance Testing
**Status**: Not performed
**Impact**: Low - No performance issues observed
**Effort**: Medium

**Recommended tests**:
- Load testing (Artillery, k6): Simulate 100 concurrent users
- Stress testing: Find breaking point
- Endurance testing: 24-hour stability test

**Why deferred**: Not critical for single-user local app. Implement when deploying to production with expected load.

## What's Already Implemented Well ✅

The agents confirmed these are working correctly:

1. ✅ **Resume Upload & AI Parsing** - PDF/DOCX with fallback parser
2. ✅ **Job Scraping** - Remotive and Arbeitnow APIs
3. ✅ **User Preferences** - Settings page auto-populates filters
4. ✅ **Job Search** - Filters work correctly
5. ✅ **Error Handling** - Graceful fallbacks for API failures
6. ✅ **Code Quality** - TypeScript, best practices, clean architecture
7. ✅ **SQLite Optimization** - Removed `mode: 'insensitive'` for nullable fields

## Recommendations for Next Sprint

**If staying MVP (local app)**:
1. Add basic error logging
2. Create test file structure (even if tests aren't written)
3. Document API endpoints in Postman/OpenAPI
4. User testing with 3-5 beta users

**If preparing for production**:
1. Implement authentication (#1)
2. Migrate to PostgreSQL (#2)
3. Add Redis caching (#4)
4. Write integration tests (#7)
5. Deploy to Render/Railway with Docker (#6)

**If seeking funding/users**:
1. Focus on UX polish
2. Add more job boards (Indeed, LinkedIn via RapidAPI)
3. Implement cover letter generation
4. Build landing page and marketing site

## Decision Log

| Item | Decision | Rationale |
|------|----------|-----------|
| Authentication | Defer | Single-user MVP doesn't need auth |
| PostgreSQL | Defer | SQLite sufficient for <5,000 jobs |
| Job Scraping Worker | Defer | 10-30s scrape time is acceptable |
| Redis Caching | Defer | DB queries already fast |
| Docker/K8s | Defer | Local app doesn't need deployment infra |
| Logging | Partial | Add structured logging, defer monitoring |
| Testing | Defer | Manual testing OK for MVP, automate when scaling |

---

**Last Updated**: January 11, 2026
**Evaluation Source**: Multi-Agent Team (13 agents: QA, Senior, BackendEngineer, FrontendEngineer, etc.)
