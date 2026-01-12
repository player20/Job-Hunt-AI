# Job Hunt AI - AI-Powered Job Application Automation Platform

A local-first, full-stack job application automation platform that helps you manage resumes, discover matching jobs, and track applications using AI-powered features via Claude API.

## Features

✨ **MVP Features:**
- 📄 **Resume Upload & AI-Powered Parsing** - Upload PDF/DOCX resumes and extract structured data using Claude AI
- 🎯 **Intelligent Job Matching** - AI-powered job matching with match scores (0-100) and reasoning
- 📊 **Application Dashboard & Tracking** - Track application status, view statistics, and manage your job search

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (fast dev server)
- React Router (routing)
- Axios (API client)
- React Query (data fetching/caching)

**Backend:**
- Node.js + Express + TypeScript
- Prisma ORM + SQLite (local database)
- Claude API (AI features)
- Multer (file uploads)
- pdf-parse & mammoth (resume parsing)

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Claude API key ([Get one here](https://console.anthropic.com/))

## Quick Start

### 1. Clone and Install

```bash
# Navigate to the project directory
cd job-hunt-ai

# Install all dependencies
npm install
```

### 2. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your Claude API key
# Required: CLAUDE_API_KEY=sk-ant-api03-...
```

### 3. Setup Database

```bash
# Generate Prisma client and run migrations
cd server
npx prisma generate
npx prisma migrate dev --name init
cd ..
```

### 4. Start Development Servers

```bash
# Start both client and server concurrently
npm run dev

# Or start them separately:
# npm run dev:server  # Server at http://localhost:3001
# npm run dev:client  # Client at http://localhost:3000
```

### 5. Open the App

Open your browser and navigate to: [http://localhost:3000](http://localhost:3000)

## Project Structure

```
job-hunt-ai/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API client
│   │   ├── hooks/           # Custom React hooks
│   │   └── types/           # TypeScript types
│   └── package.json
├── server/                  # Node.js backend
│   ├── prisma/              # Database schema
│   ├── src/
│   │   ├── config/          # Configuration
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utilities
│   └── package.json
└── package.json             # Root workspace config
```

## Available Scripts

### Root Commands

```bash
npm run dev              # Start both client and server
npm run dev:server       # Start only server (port 3001)
npm run dev:client       # Start only client (port 3000)
npm run build            # Build both client and server
npm run start            # Start production server
npm run setup            # Run complete setup (install + migrate)
```

### Server Commands

```bash
cd server
npm run dev              # Start dev server with hot reload
npm run build            # Build TypeScript to JavaScript
npm run start            # Start production server
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio (database GUI)
```

### Client Commands

```bash
cd client
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run preview          # Preview production build
```

## Environment Variables

Create a `.env` file in the root directory with these variables:

```bash
# Required
CLAUDE_API_KEY=sk-ant-api03-...

# Optional (defaults shown)
NODE_ENV=development
PORT=3001
DATABASE_URL="file:./dev.db"
FRONTEND_URL=http://localhost:3000
JOB_SCRAPING_ENABLED=true
JOB_CACHE_TTL=21600
AI_DAILY_QUOTA=50
```

## Data Storage

All data is stored locally to ensure privacy:

- **Database**: SQLite database file at `server/dev.db`
- **Resume Files**: Stored in `~/.job-hunt-ai/resumes/`
- **Cache**: Stored in `~/.job-hunt-ai/cache/`

To backup your data, simply copy these locations.

## Usage Guide

### 1. Upload Your Resume

1. Navigate to the "Resume Manager" page
2. Drag and drop your PDF or DOCX resume
3. Wait for Claude AI to parse and extract structured data
4. Review and edit the parsed information

### 2. Discover Jobs

1. Go to the "Job Search" page
2. Use filters to narrow down results (location, title, salary, etc.)
3. View AI match scores for each job
4. Click on jobs to see full details and match reasoning

### 3. Track Applications

1. Click "Apply" on any job listing
2. Optionally generate an AI-powered cover letter
3. Track application status from the Dashboard
4. Update status and add notes as you progress

## API Endpoints

### Resume Routes
- `POST /api/resumes` - Upload resume
- `GET /api/resumes` - List resumes
- `GET /api/resumes/:id` - Get resume details
- `PUT /api/resumes/:id` - Update resume
- `DELETE /api/resumes/:id` - Delete resume

### Job Routes
- `GET /api/jobs` - Search jobs
- `POST /api/jobs/match` - Get AI-matched jobs
- `GET /api/jobs/:id` - Get job details

### Application Routes
- `GET /api/applications` - List applications
- `POST /api/applications` - Create application
- `PUT /api/applications/:id` - Update application

### AI Routes
- `POST /api/ai/parse-resume` - Parse resume with Claude
- `POST /api/ai/match-jobs` - Match jobs with Claude
- `POST /api/ai/generate-cover-letter` - Generate cover letter

## Troubleshooting

### Port Already in Use

If ports 3000 or 3001 are already in use, modify the ports in:
- `.env` (PORT=3001)
- `client/vite.config.ts` (server.port)

### Database Issues

Reset the database:
```bash
cd server
rm dev.db
npx prisma migrate reset
npx prisma migrate dev
```

### Claude API Errors

- Verify your API key in `.env`
- Check your API quota at [console.anthropic.com](https://console.anthropic.com/)
- The app caches AI responses for 24 hours to reduce API usage

## Privacy & Security

- ✅ All data stored locally by default
- ✅ No cloud sync without explicit user consent
- ✅ Resume files never leave your machine (except to Claude API for parsing)
- ✅ Claude API calls are clearly indicated to users
- ✅ Option to use your own Claude API key
- ✅ Rate limiting and security headers enabled

## Development

### Adding New Job Boards

1. Create a new scraper in `server/src/services/jobScraper.ts`
2. Add the source to `JOB_SOURCES` array
3. Implement ethical scraping with rate limiting

### Customizing AI Prompts

AI prompts are located in:
- `server/src/services/claudeService.ts`
- `server/src/services/resumeParser.ts`

Modify these to customize AI behavior.

## Roadmap

### Future Enhancements
- [ ] Cover letter generation
- [ ] Resume tailoring for specific jobs
- [ ] Auto-application submission
- [ ] Interview preparation tips
- [ ] LinkedIn integration
- [ ] Email monitoring
- [ ] Mobile app version

## License

MIT

## Support

For issues or questions, please check:
1. This README
2. `.env.example` for configuration options
3. Console logs for error messages

## Credits

Built with Claude AI assistance and inspired by the need for a privacy-first job application automation tool.
