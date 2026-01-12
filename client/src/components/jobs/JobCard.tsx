/**
 * JobCard Component
 * Displays a single job listing in a card format
 */

import type { Job, JobMatch } from '../../types';

interface JobCardProps {
  job: Job | JobMatch;
  onClick?: () => void;
}

export default function JobCard({ job, onClick }: JobCardProps) {
  const isMatch = 'matchScore' in job;
  const matchScore = isMatch ? (job as JobMatch).matchScore : undefined;

  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return null;

    const currency = job.salaryCurrency || 'USD';
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    if (job.salaryMin && job.salaryMax) {
      return `${formatter.format(job.salaryMin)} - ${formatter.format(job.salaryMax)}`;
    } else if (job.salaryMin) {
      return `${formatter.format(job.salaryMin)}+`;
    } else if (job.salaryMax) {
      return `Up to ${formatter.format(job.salaryMax)}`;
    }
    return null;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const salaryText = formatSalary();
  const postedText = formatDate(job.postedDate);

  return (
    <div
      className="job-card"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <div className="job-card-header">
        <div className="job-title-row">
          <h3 className="job-title">{job.title}</h3>
          {matchScore !== undefined && (
            <span className={`match-score match-score-${getScoreClass(matchScore)}`}>
              {matchScore}% Match
            </span>
          )}
        </div>
        <p className="job-company">{job.company}</p>
      </div>

      <div className="job-details">
        {job.location && (
          <span className="job-detail">
            <span className="icon">📍</span>
            {job.location}
          </span>
        )}
        {job.locationType && (
          <span className="job-detail location-type">
            {job.locationType === 'remote' && '🏠 Remote'}
            {job.locationType === 'hybrid' && '🔄 Hybrid'}
            {job.locationType === 'onsite' && '🏢 On-site'}
          </span>
        )}
        {salaryText && (
          <span className="job-detail">
            <span className="icon">💰</span>
            {salaryText}
          </span>
        )}
      </div>

      <p className="job-description">{truncateText(job.description, 150)}</p>

      <div className="job-card-footer">
        <span className="job-source">{job.sourceBoard}</span>
        {postedText && <span className="job-posted">{postedText}</span>}
      </div>

      <style>{`
        .job-card {
          background: var(--color-bg-secondary, #f9fafb);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: var(--radius-lg, 8px);
          padding: var(--spacing-lg, 1.5rem);
          cursor: ${onClick ? 'pointer' : 'default'};
          transition: all 0.2s ease;
        }

        .job-card:hover {
          ${onClick ? 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);' : ''}
          ${onClick ? 'transform: translateY(-2px);' : ''}
        }

        .job-card:focus {
          outline: 3px solid #3b82f6;
          outline-offset: 2px;
        }

        .job-card:focus:not(:focus-visible) {
          outline: none;
        }

        .job-card-header {
          margin-bottom: var(--spacing-md, 1rem);
        }

        .job-title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--spacing-md, 1rem);
        }

        .job-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--color-text, #111827);
          margin: 0 0 var(--spacing-xs, 0.5rem) 0;
          flex: 1;
        }

        .job-company {
          font-size: 1rem;
          color: var(--color-text-secondary, #6b7280);
          margin: 0;
        }

        .match-score {
          padding: var(--spacing-xs, 0.5rem) var(--spacing-md, 1rem);
          border-radius: var(--radius-md, 6px);
          font-size: 0.875rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .match-score-high {
          background-color: #d1fae5;
          color: #065f46;
        }

        .match-score-medium {
          background-color: #fef3c7;
          color: #92400e;
        }

        .match-score-low {
          background-color: #fee2e2;
          color: #991b1b;
        }

        .job-details {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-md, 1rem);
          margin-bottom: var(--spacing-md, 1rem);
        }

        .job-detail {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-xs, 0.5rem);
          font-size: 0.875rem;
          color: var(--color-text-secondary, #6b7280);
        }

        .job-detail .icon {
          font-size: 1rem;
        }

        .location-type {
          font-weight: 500;
        }

        .job-description {
          color: var(--color-text, #111827);
          font-size: 0.875rem;
          line-height: 1.5;
          margin: 0 0 var(--spacing-md, 1rem) 0;
        }

        .job-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: var(--spacing-md, 1rem);
          border-top: 1px solid var(--color-border, #e5e7eb);
        }

        .job-source {
          font-size: 0.75rem;
          color: var(--color-text-muted, #6b7280);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .job-posted {
          font-size: 0.75rem;
          color: var(--color-text-muted, #6b7280);
        }

        @media (max-width: 768px) {
          .job-card {
            padding: var(--spacing-md, 1rem);
          }

          .job-title {
            font-size: 1.125rem;
          }

          .job-details {
            gap: var(--spacing-sm, 0.75rem);
          }

          .job-title-row {
            flex-direction: column;
            gap: var(--spacing-sm, 0.75rem);
          }

          .match-score {
            align-self: flex-start;
          }
        }
      `}</style>
    </div>
  );
}

// Helper function to get score class
function getScoreClass(score: number): 'high' | 'medium' | 'low' {
  if (score >= 70) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
}

// Helper function to truncate text
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}
