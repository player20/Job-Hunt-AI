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
    console.error('[JobScraper] Remotive API failed:', {
      error: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      timeout: error.code === 'ECONNABORTED',
    });
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
    console.error('[JobScraper] Arbeitnow API failed:', {
      error: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      timeout: error.code === 'ECONNABORTED',
    });
    return [];
  }
}

/**
 * Scrape jobs from RemoteOK API (US-focused remote jobs)
 */
async function scrapeRemoteOKJobs(): Promise<ScrapedJob[]> {
  try {
    const response = await axios.get('https://remoteok.com/api', {
      timeout: 10000,
      headers: {
        'User-Agent': 'Job-Hunt-AI/1.0',
      },
    });

    // RemoteOK returns an array, first item is metadata
    const jobs = Array.isArray(response.data) ? response.data.slice(1, 51) : [];

    return jobs.map((job: any) => ({
      title: job.position || job.title || 'Untitled Position',
      company: job.company || 'Unknown Company',
      description: job.description || '',
      requirements: job.tags || [],
      location: job.location || 'Remote - Worldwide',
      locationType: 'remote',
      salaryMin: job.salary_min ? parseInt(job.salary_min) : undefined,
      salaryMax: job.salary_max ? parseInt(job.salary_max) : undefined,
      sourceUrl: job.url || `https://remoteok.com/remote-jobs/${job.id}`,
      sourceBoard: 'RemoteOK',
      externalId: `remoteok-${job.id || job.slug}`,
      postedDate: job.date ? new Date(job.date) : new Date(),
    }));
  } catch (error: any) {
    console.error('[JobScraper] RemoteOK API failed:', {
      error: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      timeout: error.code === 'ECONNABORTED',
    });
    return [];
  }
}

/**
 * Scrape jobs from JSearch API via RapidAPI (US jobs - Indeed, LinkedIn, Glassdoor aggregator)
 * Note: Requires RAPIDAPI_KEY environment variable
 */
async function scrapeJSearchJobs(): Promise<ScrapedJob[]> {
  // Only run if API key is configured
  if (!process.env.RAPIDAPI_KEY) {
    console.log('[JobScraper] Skipping JSearch - no RAPIDAPI_KEY configured');
    return [];
  }

  try {
    const response = await axios.get('https://jsearch.p.rapidapi.com/search', {
      params: {
        query: 'software engineer in USA',
        page: '1',
        num_pages: '1',
        date_posted: 'week',
      },
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
      },
      timeout: 10000,
    });

    const jobs = response.data.data || [];

    return jobs.slice(0, 50).map((job: any) => ({
      title: job.job_title,
      company: job.employer_name,
      description: job.job_description || '',
      requirements: job.job_required_skills || [],
      location: `${job.job_city || ''}, ${job.job_state || ''}, ${job.job_country || 'USA'}`.trim(),
      locationType: job.job_is_remote ? 'remote' : 'onsite',
      salaryMin: job.job_min_salary ? parseInt(job.job_min_salary) : undefined,
      salaryMax: job.job_max_salary ? parseInt(job.job_max_salary) : undefined,
      sourceUrl: job.job_apply_link || job.job_google_link,
      sourceBoard: `JSearch (${job.job_publisher})`,
      externalId: `jsearch-${job.job_id}`,
      postedDate: job.job_posted_at_datetime_utc ? new Date(job.job_posted_at_datetime_utc) : new Date(),
    }));
  } catch (error: any) {
    console.error('[JobScraper] JSearch API failed:', {
      error: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      timeout: error.code === 'ECONNABORTED',
    });
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
    scrapeRemoteOKJobs(),
    scrapeJSearchJobs(),
  ]);

  const allJobs: ScrapedJob[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const sourceNames = ['Remotive', 'RemoteOK', 'JSearch'];
      console.log(`✅ ${sourceNames[index]}: ${result.value.length} jobs`);
      allJobs.push(...result.value);
    } else {
      const sourceNames = ['Remotive', 'RemoteOK', 'JSearch'];
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
