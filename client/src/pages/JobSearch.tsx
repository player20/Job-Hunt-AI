/**
 * JobSearch Page
 * Search and browse jobs with filters
 */

import { useState, useEffect } from 'react';
import { useJobs, useJobScraper } from '../hooks/useJobs';
import { useUserPreferences } from '../hooks/useUserPreferences';
import JobCard from '../components/jobs/JobCard';
import JobFilters from '../components/jobs/JobFilters';
import type { JobFilters as JobFiltersType } from '../types';

export default function JobSearch() {
  const { preferences } = useUserPreferences();

  const [filters, setFilters] = useState<JobFiltersType>({
    limit: 20,
    page: 1,
  });

  // Auto-populate filters from user preferences when loaded
  useEffect(() => {
    if (preferences && Object.keys(filters).length === 2) {
      // Only auto-populate on initial load (when filters only has limit and page)
      const newFilters: JobFiltersType = {
        limit: 20,
        page: 1,
      };

      // Use first desired location from preferences
      if (preferences.desiredLocations && preferences.desiredLocations.length > 0) {
        newFilters.location = preferences.desiredLocations[0];
      }

      // Use minimum salary from preferences
      if (preferences.desiredSalaryMin) {
        newFilters.salaryMin = preferences.desiredSalaryMin;
      }

      // Use remote preference
      if (preferences.remotePreference && preferences.remotePreference !== 'flexible') {
        if (preferences.remotePreference === 'remote_only') {
          newFilters.locationType = 'remote';
        } else {
          newFilters.locationType = preferences.remotePreference as 'hybrid' | 'onsite';
        }
      }

      // Use first desired job title as search
      if (preferences.desiredTitles && preferences.desiredTitles.length > 0) {
        newFilters.search = preferences.desiredTitles[0];
      }

      setFilters(newFilters);
    }
  }, [preferences]);

  const { jobs, total, isLoading, error, hasMore, refetch } = useJobs(filters);
  const { scrapeJobs, isScraping } = useJobScraper();

  const handleFiltersChange = (newFilters: JobFiltersType) => {
    setFilters({
      ...newFilters,
      limit: 20,
      page: 1,
    });
  };

  const handleLoadMore = () => {
    setFilters((prev) => ({
      ...prev,
      page: (prev.page || 1) + 1,
      limit: 20,
    }));
  };

  const handleScrapeJobs = async () => {
    try {
      await scrapeJobs();
      refetch();
    } catch (error) {
      console.error('Failed to scrape jobs:', error);
    }
  };

  const handleJobClick = (jobId: string) => {
    // TODO: Navigate to job details page or open modal
    console.log('Job clicked:', jobId);
  };

  return (
    <div className="job-search-page">
      <div className="page-header">
        <div>
          <h1>Job Search</h1>
          <p className="text-muted">
            Browse and search for jobs that match your preferences
          </p>
        </div>
        <button
          onClick={handleScrapeJobs}
          className="btn btn-secondary"
          disabled={isScraping}
        >
          {isScraping ? 'Fetching Jobs...' : 'Fetch Latest Jobs'}
        </button>
      </div>

      <div className="job-search-layout">
        <aside className="filters-sidebar">
          <JobFilters filters={filters} onFiltersChange={handleFiltersChange} />
        </aside>

        <main className="jobs-main">
          {isLoading && (
            <div className="loading-container">
              <div className="spinner"></div>
              <p className="text-muted">Loading jobs...</p>
            </div>
          )}

          {error && (
            <div className="error-container">
              <p className="error-message">
                Failed to load jobs. Please try again.
              </p>
              <button onClick={() => refetch()} className="btn btn-secondary">
                Retry
              </button>
            </div>
          )}

          {!isLoading && !error && jobs.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h2>No Jobs Found</h2>
              <p className="text-muted">
                {Object.keys(filters).length > 2
                  ? 'Try adjusting your filters or fetch the latest jobs.'
                  : 'Click "Fetch Latest Jobs" to get started!'}
              </p>
              <button
                onClick={handleScrapeJobs}
                className="btn btn-primary"
                disabled={isScraping}
              >
                {isScraping ? 'Fetching...' : 'Fetch Latest Jobs'}
              </button>
            </div>
          )}

          {!isLoading && !error && jobs.length > 0 && (
            <>
              <div className="jobs-header">
                <p className="jobs-count">
                  Showing <strong>{jobs.length}</strong> of{' '}
                  <strong>{total}</strong> jobs
                </p>
              </div>

              <div className="jobs-grid">
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onClick={() => handleJobClick(job.id)}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="load-more-container">
                  <button
                    onClick={handleLoadMore}
                    className="btn btn-secondary"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Loading...' : 'Load More Jobs'}
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <style>{`
        .job-search-page {
          max-width: 1400px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--spacing-xl, 2rem);
          gap: var(--spacing-lg, 1.5rem);
        }

        .page-header h1 {
          margin: 0 0 var(--spacing-xs, 0.5rem) 0;
          font-size: 2rem;
          font-weight: 700;
          color: var(--color-text, #111827);
        }

        .text-muted {
          color: var(--color-text-secondary, #6b7280);
          margin: 0;
        }

        .job-search-layout {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: var(--spacing-xl, 2rem);
        }

        .filters-sidebar {
          min-height: 400px;
        }

        .jobs-main {
          min-height: 400px;
        }

        .loading-container,
        .error-container,
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-xl, 2rem);
          text-align: center;
          min-height: 400px;
        }

        .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid var(--color-border, #e5e7eb);
          border-top-color: var(--color-primary, #3b82f6);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: var(--spacing-md, 1rem);
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .error-message {
          color: var(--color-error, #ef4444);
          margin-bottom: var(--spacing-md, 1rem);
        }

        .empty-state {
          background: var(--color-bg-secondary, #f9fafb);
          border: 2px dashed var(--color-border, #e5e7eb);
          border-radius: var(--radius-lg, 8px);
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: var(--spacing-md, 1rem);
        }

        .empty-state h2 {
          margin: 0 0 var(--spacing-sm, 0.75rem) 0;
          font-size: 1.5rem;
          color: var(--color-text, #111827);
        }

        .empty-state p {
          margin-bottom: var(--spacing-lg, 1.5rem);
          max-width: 400px;
        }

        .jobs-header {
          margin-bottom: var(--spacing-lg, 1.5rem);
        }

        .jobs-count {
          font-size: 0.875rem;
          color: var(--color-text-secondary, #6b7280);
          margin: 0;
        }

        .jobs-grid {
          display: grid;
          gap: var(--spacing-lg, 1.5rem);
        }

        .load-more-container {
          display: flex;
          justify-content: center;
          margin-top: var(--spacing-xl, 2rem);
        }

        @media (max-width: 1024px) {
          .job-search-layout {
            grid-template-columns: 1fr;
          }

          .filters-sidebar {
            order: 2;
          }

          .jobs-main {
            order: 1;
          }
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
          }

          .page-header button {
            align-self: stretch;
          }

          .job-search-page {
            padding: var(--spacing-md, 1rem);
          }
        }
      `}</style>
    </div>
  );
}
