/**
 * Claude AI Service
 * AI-powered features using Anthropic's Claude API
 */

import { anthropic, CLAUDE_MODEL, DEFAULT_MAX_TOKENS } from '../config/claude';
import type { Resume, Job } from '@prisma/client';

// ============================================
// TYPES
// ============================================

export interface ParsedResumeData {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  skills?: string[];
  experience?: WorkExperience[];
  education?: Education[];
  certifications?: string[];
}

export interface WorkExperience {
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  description: string;
  achievements: string[];
}

export interface Education {
  degree: string;
  institution: string;
  graduationDate: string;
  gpa?: string;
}

export interface JobMatch {
  jobId: string;
  score: number;
  reasons: string;
}

// ============================================
// CLAUDE SERVICE
// ============================================

export class ClaudeService {
  /**
   * Parse resume text into structured data using Claude
   */
  async parseResume(rawText: string): Promise<ParsedResumeData> {
    try {
      const message = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: DEFAULT_MAX_TOKENS,
        messages: [
          {
            role: 'user',
            content: `You are a resume parsing expert. Parse this resume and extract structured data in JSON format.

Resume text:
${rawText}

Return ONLY valid JSON (no markdown, no explanations) with this exact structure:
{
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "summary": "string",
  "skills": ["skill1", "skill2"],
  "experience": [
    {
      "title": "string",
      "company": "string",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM or null for current",
      "description": "string",
      "achievements": ["achievement1"]
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "graduationDate": "YYYY",
      "gpa": "string or null"
    }
  ],
  "certifications": ["cert1", "cert2"]
}

Important:
- Extract all available information
- Use null for missing fields
- Format dates as specified
- Keep achievements concise
- Include all relevant skills`,
          },
        ],
      });

      const content = message.content[0];
      if (content.type === 'text') {
        // Remove markdown code blocks if present
        let jsonText = content.text.trim();
        if (jsonText.startsWith('```json')) {
          jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
        } else if (jsonText.startsWith('```')) {
          jsonText = jsonText.replace(/```\n?/g, '');
        }

        const parsed = JSON.parse(jsonText);
        return parsed as ParsedResumeData;
      }

      throw new Error('Failed to parse resume: Invalid response format');
    } catch (error) {
      console.error('Error parsing resume with Claude:', error);
      throw new Error('Failed to parse resume with AI');
    }
  }

  /**
   * Match jobs to resume and provide scores
   */
  async matchJobs(
    resume: Resume,
    jobs: Job[]
  ): Promise<JobMatch[]> {
    try {
      // Prepare resume data
      const resumeData = {
        fullName: resume.fullName,
        summary: resume.summary,
        skills: resume.skills ? JSON.parse(resume.skills) : [],
        experience: resume.experience ? JSON.parse(resume.experience) : [],
        education: resume.education ? JSON.parse(resume.education) : [],
      };

      // Prepare job data
      const jobsData = jobs.map((job) => ({
        id: job.id,
        title: job.title,
        company: job.company,
        description: job.description,
        requirements: job.requirements ? JSON.parse(job.requirements) : [],
      }));

      const message = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 3000,
        messages: [
          {
            role: 'user',
            content: `You are a career advisor. Given this resume and job listings, rank each job by match score (0-100) and provide reasoning.

Resume:
${JSON.stringify(resumeData, null, 2)}

Jobs:
${JSON.stringify(jobsData, null, 2)}

Return ONLY valid JSON array (no markdown) with this structure:
[
  {
    "jobId": "string",
    "score": number (0-100),
    "reasons": "2-3 sentences explaining why this job is a good/bad match"
  }
]

Scoring criteria:
- Skills match: 40%
- Experience relevance: 30%
- Education fit: 15%
- Job level appropriateness: 15%`,
          },
        ],
      });

      const content = message.content[0];
      if (content.type === 'text') {
        let jsonText = content.text.trim();
        if (jsonText.startsWith('```json')) {
          jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
        } else if (jsonText.startsWith('```')) {
          jsonText = jsonText.replace(/```\n?/g, '');
        }

        const matches = JSON.parse(jsonText);
        return matches as JobMatch[];
      }

      throw new Error('Failed to match jobs: Invalid response format');
    } catch (error) {
      console.error('Error matching jobs with Claude:', error);
      throw new Error('Failed to match jobs with AI');
    }
  }

  /**
   * Generate cover letter for a job application
   */
  async generateCoverLetter(resume: Resume, job: Job): Promise<string> {
    try {
      const message = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: `Write a professional cover letter for this candidate applying to this job.

Candidate:
Name: ${resume.fullName}
Summary: ${resume.summary}
Skills: ${resume.skills}
Experience: ${resume.experience}

Job:
Title: ${job.title}
Company: ${job.company}
Description: ${job.description}

Requirements:
- Keep it concise (250-300 words)
- Professional tone
- Highlight relevant experience and skills
- Show enthusiasm for the role
- Include specific examples from their experience
- End with a strong call to action

Return only the cover letter text (no subject line, no "Dear Hiring Manager" - start with the body).`,
          },
        ],
      });

      const content = message.content[0];
      if (content.type === 'text') {
        return content.text.trim();
      }

      throw new Error('Failed to generate cover letter: Invalid response format');
    } catch (error) {
      console.error('Error generating cover letter with Claude:', error);
      throw new Error('Failed to generate cover letter with AI');
    }
  }

  /**
   * Tailor resume for a specific job
   */
  async tailorResume(resume: Resume, job: Job): Promise<string> {
    try {
      const message = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `Tailor this resume for the specific job by emphasizing relevant skills and experience.

Original Resume:
${JSON.stringify(
              {
                fullName: resume.fullName,
                summary: resume.summary,
                skills: resume.skills,
                experience: resume.experience,
                education: resume.education,
              },
              null,
              2
            )}

Target Job:
Title: ${job.title}
Company: ${job.company}
Description: ${job.description}

Return a tailored resume in markdown format that:
- Emphasizes relevant skills and experience
- Uses keywords from the job description
- Highlights achievements relevant to the role
- Maintains honesty (don't fabricate experience)
- Keeps the same structure but rewords for impact`,
          },
        ],
      });

      const content = message.content[0];
      if (content.type === 'text') {
        return content.text.trim();
      }

      throw new Error('Failed to tailor resume: Invalid response format');
    } catch (error) {
      console.error('Error tailoring resume with Claude:', error);
      throw new Error('Failed to tailor resume with AI');
    }
  }
}

// Export singleton instance
export const claudeService = new ClaudeService();
