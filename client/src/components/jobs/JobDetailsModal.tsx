/**
 * JobDetailsModal Component
 * Modal displaying full job details with match analysis
 */

import { useEffect, useState } from 'react';
import type { Job } from '../../types';

interface MatchAnalysis {
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

interface JobDetailsModalProps {
  job: Job;
  resumeId?: string;
  onClose: () => void;
  onTailorResume: () => void;
}

export default function JobDetailsModal({
  job,
  resumeId,
  onClose,
  onTailorResume,
}: JobDetailsModalProps) {
  const [matchAnalysis, setMatchAnalysis] = useState<MatchAnalysis | null>(null);
  const [isLoadingMatch, setIsLoadingMatch] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);

  // Load match analysis when modal opens
  useEffect(() => {
    if (resumeId) {
      loadMatchAnalysis();
    }
  }, [resumeId, job.id]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const loadMatchAnalysis = async () => {
    if (!resumeId) return;

    setIsLoadingMatch(true);
    setMatchError(null);

    try {
      const response = await fetch(
        `http://localhost:3001/api/jobs/${job.id}/analyze-match`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeId }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to analyze match');
      }

      const data = await response.json();
      setMatchAnalysis(data);
    } catch (error) {
      console.error('Match analysis error:', error);
      setMatchError('Failed to analyze match. Please try again.');
    } finally {
      setIsLoadingMatch(false);
    }
  };

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

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>{job.title}</h2>
            <p className="company">{job.company}</p>
          </div>
          <button
            className="close-button"
            onClick={onClose}
            aria-label="Close modal"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Job Details */}
        <div className="modal-body">
          <div className="job-meta">
            {job.location && (
              <span className="meta-item">
                📍 {job.location}
              </span>
            )}
            {job.locationType && (
              <span className="meta-item">
                {job.locationType === 'remote' && '🏠 Remote'}
                {job.locationType === 'hybrid' && '🔄 Hybrid'}
                {job.locationType === 'onsite' && '🏢 On-site'}
              </span>
            )}
            {formatSalary() && (
              <span className="meta-item">💰 {formatSalary()}</span>
            )}
          </div>

          {/* Match Analysis Section */}
          {resumeId && (
            <div className="match-section">
              {isLoadingMatch && (
                <div className="loading-match">
                  <div className="spinner-small"></div>
                  <p>Analyzing match with AI...</p>
                </div>
              )}

              {matchError && (
                <div className="error-box">
                  <p>{matchError}</p>
                  <button onClick={loadMatchAnalysis} className="btn-small">
                    Retry
                  </button>
                </div>
              )}

              {matchAnalysis && (
                <div className="match-results">
                  <div className="match-score-large">
                    <span className="score">{matchAnalysis.confidenceScore}%</span>
                    <span className="label">Match Score</span>
                  </div>

                  <div className="match-details">
                    <div className="match-column">
                      <h4>✅ Your Strengths</h4>
                      <ul>
                        {matchAnalysis.strengths.map((strength, i) => (
                          <li key={i}>{strength}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="match-column">
                      <h4>💪 Matched Skills</h4>
                      <div className="skills-tags">
                        {matchAnalysis.matchedSkills.map((skill, i) => (
                          <span key={i} className="skill-tag matched">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {matchAnalysis.gaps.length > 0 && (
                      <div className="match-column">
                        <h4>📈 Areas to Emphasize</h4>
                        <ul>
                          {matchAnalysis.gaps.map((gap, i) => (
                            <li key={i}>{gap}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="tailor-prompt">
                    <p className="recommendation">{matchAnalysis.recommendation}</p>
                    <button
                      className="btn btn-primary"
                      onClick={onTailorResume}
                      type="button"
                    >
                      🎯 Tailor My Resume for This Job
                    </button>
                    <p className="honesty-badge">
                      🛡️ 100% Honest AI - No fabrication, ever
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Job Description */}
          <div className="description-section">
            <h3>Job Description</h3>
            <div className="description-content">
              {stripHtml(job.description)}
            </div>
          </div>

          {/* Requirements */}
          {job.requirements && (
            <div className="requirements-section">
              <h3>Requirements</h3>
              <div className="requirements-list">
                {typeof job.requirements === 'string'
                  ? JSON.parse(job.requirements).map((req: string, i: number) => (
                      <span key={i} className="requirement-tag">
                        {req}
                      </span>
                    ))
                  : job.requirements}
              </div>
            </div>
          )}

          {/* Apply Link */}
          <div className="apply-section">
            <a
              href={job.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-large"
            >
              Apply on {job.sourceBoard} →
            </a>
          </div>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 2rem;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          max-width: 900px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 2rem;
          border-bottom: 2px solid #e5e7eb;
          position: sticky;
          top: 0;
          background: white;
          z-index: 10;
        }

        .modal-header h2 {
          margin: 0 0 0.5rem 0;
          font-size: 1.75rem;
          font-weight: 700;
          color: #111827;
        }

        .modal-header .company {
          margin: 0;
          font-size: 1.125rem;
          color: #6b7280;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #6b7280;
          cursor: pointer;
          padding: 0.5rem;
          line-height: 1;
          transition: all 0.2s;
          border-radius: 6px;
        }

        .close-button:hover {
          background: #f3f4f6;
          color: #111827;
        }

        .close-button:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        .modal-body {
          padding: 2rem;
        }

        .job-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .meta-item {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9375rem;
          color: #374151;
          font-weight: 500;
        }

        .match-section {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border: 2px solid #bae6fd;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .loading-match {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 2rem;
        }

        .spinner-small {
          width: 32px;
          height: 32px;
          border: 3px solid #e5e7eb;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .error-box {
          text-align: center;
          padding: 1rem;
        }

        .error-box p {
          color: #ef4444;
          margin-bottom: 1rem;
        }

        .btn-small {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }

        .match-results {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .match-score-large {
          text-align: center;
          padding: 1.5rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .match-score-large .score {
          display: block;
          font-size: 3rem;
          font-weight: 700;
          color: #3b82f6;
          line-height: 1;
          margin-bottom: 0.5rem;
        }

        .match-score-large .label {
          display: block;
          font-size: 0.875rem;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .match-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .match-column {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
        }

        .match-column h4 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
        }

        .match-column ul {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .match-column li {
          padding: 0.5rem 0;
          color: #374151;
          font-size: 0.9375rem;
          line-height: 1.5;
          border-bottom: 1px solid #f3f4f6;
        }

        .match-column li:last-child {
          border-bottom: none;
        }

        .skills-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .skill-tag {
          padding: 0.375rem 0.75rem;
          border-radius: 6px;
          font-size: 0.8125rem;
          font-weight: 500;
        }

        .skill-tag.matched {
          background: #d1fae5;
          color: #065f46;
        }

        .tailor-prompt {
          text-align: center;
          padding: 1.5rem;
          background: white;
          border-radius: 12px;
        }

        .recommendation {
          font-size: 1rem;
          color: #374151;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .honesty-badge {
          margin-top: 1rem;
          font-size: 0.875rem;
          color: #059669;
          font-weight: 600;
        }

        .description-section,
        .requirements-section {
          margin-bottom: 2rem;
        }

        .description-section h3,
        .requirements-section h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          margin: 0 0 1rem 0;
        }

        .description-content {
          color: #374151;
          line-height: 1.7;
          font-size: 0.9375rem;
          white-space: pre-wrap;
        }

        .requirements-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .requirement-tag {
          padding: 0.5rem 1rem;
          background: #f3f4f6;
          border-radius: 6px;
          font-size: 0.875rem;
          color: #374151;
          font-weight: 500;
        }

        .apply-section {
          padding-top: 2rem;
          border-top: 2px solid #e5e7eb;
          text-align: center;
        }

        .btn-large {
          padding: 1rem 2rem;
          font-size: 1.125rem;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .modal-overlay {
            padding: 0;
          }

          .modal-content {
            max-height: 100vh;
            border-radius: 0;
          }

          .modal-header {
            padding: 1rem;
          }

          .modal-body {
            padding: 1rem;
          }

          .match-details {
            grid-template-columns: 1fr;
          }

          .match-score-large .score {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
}
