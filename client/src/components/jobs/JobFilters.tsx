/**
 * JobFilters Component
 * Sidebar with search and filter controls
 */

import { useState, useEffect } from 'react';
import type { JobFilters as JobFiltersType } from '../../types';

interface JobFiltersProps {
  filters: JobFiltersType;
  onFiltersChange: (filters: JobFiltersType) => void;
}

export default function JobFilters({ filters, onFiltersChange }: JobFiltersProps) {
  const [search, setSearch] = useState(filters.search || '');
  const [location, setLocation] = useState(filters.location || '');
  const [locationType, setLocationType] = useState(filters.locationType || '');
  const [salaryMin, setSalaryMin] = useState<string>(
    filters.salaryMin?.toString() || ''
  );

  // Update local state when filters prop changes
  useEffect(() => {
    setSearch(filters.search || '');
    setLocation(filters.location || '');
    setLocationType(filters.locationType || '');
    setSalaryMin(filters.salaryMin?.toString() || '');
  }, [filters]);

  const handleApply = () => {
    onFiltersChange({
      search: search.trim() || undefined,
      location: location.trim() || undefined,
      locationType: locationType || undefined,
      salaryMin: salaryMin ? parseInt(salaryMin) : undefined,
    });
  };

  const handleClear = () => {
    setSearch('');
    setLocation('');
    setLocationType('');
    setSalaryMin('');
    onFiltersChange({});
  };

  const hasActiveFilters =
    search || location || locationType || salaryMin;

  return (
    <div className="job-filters">
      <div className="filters-header">
        <h3>Filters</h3>
        {hasActiveFilters && (
          <button onClick={handleClear} className="btn-clear">
            Clear All
          </button>
        )}
      </div>

      <div className="filter-group">
        <label htmlFor="search">
          <strong>Search</strong>
        </label>
        <input
          type="text"
          id="search"
          className="input"
          placeholder="Job title, company, keywords..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleApply();
            }
          }}
        />
      </div>

      <div className="filter-group">
        <label htmlFor="location">
          <strong>Location</strong>
        </label>
        <input
          type="text"
          id="location"
          className="input"
          placeholder="City, state, or country"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleApply();
            }
          }}
        />
      </div>

      <div className="filter-group">
        <label>
          <strong>Remote Type</strong>
        </label>
        <div className="radio-group">
          <label className="radio-option">
            <input
              type="radio"
              name="locationType"
              value=""
              checked={!locationType}
              onChange={() => setLocationType('')}
            />
            <span>All</span>
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="locationType"
              value="remote"
              checked={locationType === 'remote'}
              onChange={() => setLocationType('remote')}
            />
            <span>Remote</span>
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="locationType"
              value="hybrid"
              checked={locationType === 'hybrid'}
              onChange={() => setLocationType('hybrid')}
            />
            <span>Hybrid</span>
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="locationType"
              value="onsite"
              checked={locationType === 'onsite'}
              onChange={() => setLocationType('onsite')}
            />
            <span>On-site</span>
          </label>
        </div>
      </div>

      <div className="filter-group">
        <label htmlFor="salaryMin">
          <strong>Minimum Salary ($)</strong>
        </label>
        <input
          type="number"
          id="salaryMin"
          className="input"
          placeholder="e.g., 80000"
          value={salaryMin}
          onChange={(e) => setSalaryMin(e.target.value)}
          min="0"
          step="5000"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleApply();
            }
          }}
        />
      </div>

      <button onClick={handleApply} className="btn btn-primary btn-apply">
        Apply Filters
      </button>

      <style>{`
        .job-filters {
          background: var(--color-bg-secondary, #f9fafb);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: var(--radius-lg, 8px);
          padding: var(--spacing-lg, 1.5rem);
          position: sticky;
          top: var(--spacing-lg, 1.5rem);
        }

        .filters-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-lg, 1.5rem);
        }

        .filters-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--color-text, #111827);
        }

        .btn-clear {
          background: none;
          border: none;
          color: var(--color-primary, #3b82f6);
          font-size: 0.875rem;
          cursor: pointer;
          padding: var(--spacing-xs, 0.5rem);
          font-weight: 500;
        }

        .btn-clear:hover {
          text-decoration: underline;
        }

        .filter-group {
          margin-bottom: var(--spacing-lg, 1.5rem);
        }

        .filter-group label {
          display: block;
          margin-bottom: var(--spacing-xs, 0.5rem);
          color: var(--color-text, #111827);
        }

        .input {
          width: 100%;
          padding: var(--spacing-sm, 0.75rem);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: var(--radius-md, 6px);
          font-size: 0.875rem;
          background-color: white;
          color: var(--color-text, #111827);
        }

        .input:focus {
          outline: none;
          border-color: var(--color-primary, #3b82f6);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .radio-group {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm, 0.75rem);
          margin-top: var(--spacing-sm, 0.75rem);
        }

        .radio-option {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm, 0.75rem);
          cursor: pointer;
        }

        .radio-option input[type="radio"] {
          cursor: pointer;
        }

        .radio-option span {
          color: var(--color-text, #111827);
          font-size: 0.875rem;
        }

        .btn-apply {
          width: 100%;
          margin-top: var(--spacing-md, 1rem);
        }

        @media (max-width: 768px) {
          .job-filters {
            position: static;
            margin-bottom: var(--spacing-lg, 1.5rem);
          }
        }
      `}</style>
    </div>
  );
}
