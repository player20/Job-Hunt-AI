/**
 * Job Scraper Service
 * Fetches jobs from various sources (APIs, RSS feeds, web scraping)
 */

import axios from 'axios';

export interface ScrapedJob {
  title: string;
  company: string;
  description: string;
  requirements?: string[];
  location: string;
  locationType: string;
  salaryMin?: number;
  salaryMax?: number;
  sourceUrl: string;
  sourceBoard: string;
  externalId: string;
  postedDate?: Date;
}

/**
 * Scrape jobs from Remotive API (free job board API)
 */
async function scrapeRemotiveJobs(): Promise<ScrapedJob[]> {
  try {
    const response = await axios.get('https://remotive.com/api/remote-jobs', {
      timeout: 10000,
    });

    const jobs = response.data.jobs || [];

    return jobs.slice(0, 50).map((job: any) => ({
      title: job.title,
      company: job.company_name,
      description: job.description || '',
      requirements: job.tags || [],
      location: job.candidate_required_location || 'Remote',
      locationType: 'remote',
      salaryMin: job.salary ? parseInt(job.salary.split('-')[0]) : undefined,
      salaryMax: job.salary ? parseInt(job.salary.split('-')[1]) : undefined,
      sourceUrl: job.url,
      sourceBoard: 'Remotive',
      externalId: `remotive-${job.id}`,
      postedDate: job.publication_date ? new Date(job.publication_date) : new Date(),
    }));
  } catch (error: any) {
    console.error('Error scraping Remotive jobs:', error.message);
    return [];
  }
}

/**
 * Scrape jobs from Arbeitnow API (free European job board)
 */
async function scrapeArbeitnowJobs(): Promise<ScrapedJob[]> {
  try {
    const response = await axios.get('https://www.arbeitnow.com/api/job-board-api', {
      timeout: 10000,
    });

    const jobs = response.data.data || [];

    return jobs.slice(0, 50).map((job: any) => ({
      title: job.title,
      company: job.company_name,
      description: job.description || '',
      requirements: job.tags || [],
      location: job.location || 'Remote',
      locationType: job.remote ? 'remote' : 'onsite',
      sourceUrl: job.url,
      sourceBoard: 'Arbeitnow',
      externalId: `arbeitnow-${job.slug}`,
      postedDate: job.created_at ? new Date(job.created_at * 1000) : new Date(),
    }));
  } catch (error: any) {
    console.error('Error scraping Arbeitnow jobs:', error.message);
    return [];
  }
}

/**
 * Main scraper - fetches jobs from all sources
 */
export async function scrapeAllJobs(): Promise<ScrapedJob[]> {
  console.log('🔍 Starting job scraping from all sources...');

  const results = await Promise.allSettled([
    scrapeRemotiveJobs(),
    scrapeArbeitnowJobs(),
  ]);

  const allJobs: ScrapedJob[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const sourceNames = ['Remotive', 'Arbeitnow'];
      console.log(`✅ ${sourceNames[index]}: ${result.value.length} jobs`);
      allJobs.push(...result.value);
    } else {
      const sourceNames = ['Remotive', 'Arbeitnow'];
      console.error(`❌ ${sourceNames[index]} failed:`, result.reason);
    }
  });

  console.log(`✅ Total jobs scraped: ${allJobs.length}`);

  return allJobs;
}

/**
 * Deduplicate jobs by external ID
 */
export function deduplicateJobs(jobs: ScrapedJob[]): ScrapedJob[] {
  const seen = new Set<string>();
  return jobs.filter((job) => {
    if (seen.has(job.externalId)) {
      return false;
    }
    seen.add(job.externalId);
    return true;
  });
}
