import { anthropic, CLAUDE_MODEL } from '../config/claude';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TailoredResumeResult {
  tailoredResume: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
    skills: string[];
    experience: any[];
    education: any[];
  };
  changes: Array<{
    section: string;
    original: string;
    modified: string;
    type: 'keyword-add' | 'reorder' | 'rephrase' | 'emphasize';
    explanation: string;
    truthful: boolean;
  }>;
  keywordsApplied: Array<{
    term: string;
    location: string;
    context: string;
    alreadyPresent: boolean;
  }>;
  keywordsNotApplied: Array<{
    term: string;
    reason: string;
  }>;
  honestyScore: number;
}

export async function tailorResume(
  resumeId: string,
  jobId: string,
  keywordsList: string[]
): Promise<TailoredResumeResult> {
  // Fetch job and resume
  const [job, resume] = await Promise.all([
    prisma.job.findUnique({ where: { id: jobId } }),
    prisma.resume.findUnique({ where: { id: resumeId } }),
  ]);

  if (!job || !resume) {
    throw new Error('Job or Resume not found');
  }

  // Build resume text
  const resumeText = `
Name: ${resume.fullName}
Email: ${resume.email}
Phone: ${resume.phone}
Location: ${resume.location}

Summary:
${resume.summary || ''}

Skills:
${resume.skills || '[]'}

Experience:
${resume.experience || '[]'}

Education:
${resume.education || '[]'}
`.trim();

  const prompt = `You are an expert resume writer specializing in honest, strategic optimization. Your job is to tailor this resume for a specific job posting by integrating relevant keywords and optimizing presentation WITHOUT fabricating any information.

CORE RULES - NEVER VIOLATE:
1. NEVER invent skills, experience, or achievements that aren't in the original resume
2. ONLY add keywords where there is clear evidence the candidate has that skill/experience
3. When adding keywords, integrate them naturally into EXISTING bullet points or descriptions
4. If a keyword cannot be truthfully applied, explicitly mark it as "not applicable"
5. Maintain factual accuracy - only reframe, reorder, and optimize existing content

ORIGINAL RESUME:
${resumeText}

JOB TITLE: ${job.title}
COMPANY: ${job.company}
JOB DESCRIPTION: ${job.description}
KEY REQUIREMENTS: ${job.requirements || 'See description'}
KEYWORDS TO INTEGRATE (if truthful): ${keywordsList.join(', ')}

INSTRUCTIONS:
1. **Professional Summary**: Rewrite to align with role, using job description language where truthful
   - Integrate relevant keywords that match candidate's actual background

2. **Work Experience**: Optimize bullet points with keywords
   - Find places where job description keywords truthfully apply to their work
   - Rephrase bullet points to include these keywords naturally
   - Reorder experiences to show most relevant roles first

3. **Skills Section**: Reorganize to prioritize matching skills
   - Move skills that match job requirements to the top
   - DO NOT add skills they don't have

4. **Verification**: For each change, provide evidence from original resume justifying the modification

REQUIRED OUTPUT FORMAT (valid JSON only):
{
  "tailoredResume": {
    "fullName": "",
    "email": "",
    "phone": "",
    "location": "",
    "summary": "",
    "skills": [],
    "experience": [],
    "education": []
  },
  "changes": [
    {
      "section": "Professional Summary",
      "original": "...",
      "modified": "...",
      "type": "keyword-integration",
      "explanation": "Added 'scalable architecture' - resume shows they built systems for 10K users",
      "truthful": true
    }
  ],
  "keywordsApplied": [
    {
      "term": "cross-functional collaboration",
      "location": "Experience > Company X > Bullet 2",
      "context": "Worked with design and product teams",
      "alreadyPresent": false
    }
  ],
  "keywordsNotApplied": [
    {
      "term": "kubernetes",
      "reason": "No evidence of container orchestration experience in resume"
    }
  ],
  "honestyScore": 100
}`;

  console.log('[ResumeTailor] Calling Claude AI for resume tailoring...');

  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  // Parse JSON from response
  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse JSON from Claude response');
  }

  const result: TailoredResumeResult = JSON.parse(jsonMatch[0]);

  // Save tailored resume
  await prisma.tailoredResume.create({
    data: {
      originalResumeId: resumeId,
      jobId: jobId,
      content: JSON.stringify(result.tailoredResume),
      changes: JSON.stringify(result.changes),
      keywordsApplied: JSON.stringify(result.keywordsApplied),
      keywordsSkipped: JSON.stringify(result.keywordsNotApplied),
      honestyScore: result.honestyScore,
    },
  });

  console.log(`[ResumeTailor] Tailored resume created with honesty score: ${result.honestyScore}`);
  return result;
}
