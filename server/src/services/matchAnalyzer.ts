import { anthropic, CLAUDE_MODEL } from '../config/claude';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface MatchAnalysisResult {
  confidenceScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  transferableSkills: string[];
  strengths: string[];
  gaps: string[];
  recommendation: string;
  keywordsDetected: Array<{
    term: string;
    inResume: boolean;
    canAddTruthfully: boolean;
    reasoning: string;
  }>;
}

export async function analyzeJobMatch(
  jobId: string,
  resumeId: string
): Promise<MatchAnalysisResult> {
  // Check cache first
  const cached = await prisma.jobMatchCache.findUnique({
    where: {
      jobId_resumeId: {
        jobId,
        resumeId,
      },
    },
  });

  if (cached && Date.now() - cached.createdAt.getTime() < 24 * 60 * 60 * 1000) {
    console.log('[MatchAnalyzer] Using cached analysis');
    return {
      confidenceScore: cached.confidenceScore,
      matchedSkills: JSON.parse(cached.matchedSkills || '[]'),
      missingSkills: JSON.parse(cached.missingSkills || '[]'),
      transferableSkills: JSON.parse(cached.transferableSkills || '[]'),
      strengths: JSON.parse(cached.strengths || '[]'),
      gaps: JSON.parse(cached.gaps || '[]'),
      recommendation: cached.recommendation || '',
      keywordsDetected: JSON.parse(cached.keywordsDetected || '[]'),
    };
  }

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
${resume.summary || 'N/A'}

Skills:
${resume.skills || '[]'}

Experience:
${resume.experience || '[]'}

Education:
${resume.education || '[]'}
`.trim();

  // Call Claude AI for match analysis
  const prompt = `You are an expert resume reviewer and job matcher. Analyze how well this candidate's resume matches the job requirements.

RESUME:
${resumeText}

JOB TITLE: ${job.title}
COMPANY: ${job.company}
JOB DESCRIPTION:
${job.description}

JOB REQUIREMENTS:
${job.requirements || 'See description'}

Extract all important keywords and phrases from the job description. For each keyword:
- Check if it appears in the resume (exact or similar terms)
- Determine if the candidate has the underlying skill/experience even if the exact term isn't used
- Assess if the keyword could be truthfully added to the resume based on their actual experience

CRITICAL: Only suggest adding keywords where there is clear evidence in the resume that the candidate has that skill/experience.

Provide analysis in JSON format:
{
  "confidenceScore": 0-100,
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill3"],
  "transferableSkills": ["skill they have that's similar to required"],
  "keywordsDetected": [
    {
      "term": "agile methodologies",
      "inResume": false,
      "canAddTruthfully": true,
      "reasoning": "Resume mentions 'sprint planning' and 'iterative development' which are agile practices"
    }
  ],
  "strengths": ["3-5 bullet points explaining why they're a good fit"],
  "gaps": ["1-3 areas that need emphasis or are truly missing"],
  "recommendation": "One sentence recommendation"
}`;

  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2000,
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

  const analysis: MatchAnalysisResult = JSON.parse(jsonMatch[0]);

  // Cache the result
  await prisma.jobMatchCache.create({
    data: {
      jobId,
      resumeId,
      confidenceScore: analysis.confidenceScore,
      matchedSkills: JSON.stringify(analysis.matchedSkills),
      missingSkills: JSON.stringify(analysis.missingSkills),
      transferableSkills: JSON.stringify(analysis.transferableSkills),
      strengths: JSON.stringify(analysis.strengths),
      gaps: JSON.stringify(analysis.gaps),
      recommendation: analysis.recommendation,
      keywordsDetected: JSON.stringify(analysis.keywordsDetected),
    },
  });

  console.log(`[MatchAnalyzer] Analyzed match: ${analysis.confidenceScore}% confidence`);
  return analysis;
}
