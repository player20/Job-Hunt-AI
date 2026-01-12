/**
 * Settings Page
 * User preferences and configuration
 */

import { useState, useEffect } from 'react';
import { useUserPreferences } from '../hooks/useUserPreferences';

export default function Settings() {
  const { preferences, isLoading, update, isUpdating } = useUserPreferences();

  // Form state
  const [desiredTitles, setDesiredTitles] = useState<string[]>([]);
  const [titleInput, setTitleInput] = useState('');
  const [desiredLocations, setDesiredLocations] = useState<string[]>([]);
  const [locationInput, setLocationInput] = useState('');
  const [remotePreference, setRemotePreference] = useState<string>('flexible');
  const [desiredSalaryMin, setDesiredSalaryMin] = useState<number>(0);
  const [desiredSalaryMax, setDesiredSalaryMax] = useState<number>(0);
  const [autoApply, setAutoApply] = useState(false);
  const [dailyApplicationLimit, setDailyApplicationLimit] = useState<number>(10);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load preferences when they're fetched
  useEffect(() => {
    if (preferences) {
      setDesiredTitles(preferences.desiredTitles || []);
      setDesiredLocations(preferences.desiredLocations || []);
      setRemotePreference(preferences.remotePreference || 'flexible');
      setDesiredSalaryMin(preferences.desiredSalaryMin || 0);
      setDesiredSalaryMax(preferences.desiredSalaryMax || 0);
      setAutoApply(preferences.autoApply || false);
      setDailyApplicationLimit(preferences.dailyApplicationLimit || 10);
    }
  }, [preferences]);

  const handleAddTitle = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && titleInput.trim()) {
      e.preventDefault();
      if (!desiredTitles.includes(titleInput.trim())) {
        setDesiredTitles([...desiredTitles, titleInput.trim()]);
      }
      setTitleInput('');
    }
  };

  const handleRemoveTitle = (title: string) => {
    setDesiredTitles(desiredTitles.filter((t) => t !== title));
  };

  const handleAddLocation = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && locationInput.trim()) {
      e.preventDefault();
      if (!desiredLocations.includes(locationInput.trim())) {
        setDesiredLocations([...desiredLocations, locationInput.trim()]);
      }
      setLocationInput('');
    }
  };

  const handleRemoveLocation = (location: string) => {
    setDesiredLocations(desiredLocations.filter((l) => l !== location));
  };

  const handleSave = async () => {
    try {
      await update({
        desiredTitles,
        desiredLocations,
        remotePreference,
        desiredSalaryMin,
        desiredSalaryMax,
        autoApply,
        dailyApplicationLimit,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      alert('Failed to save preferences. Please try again.');
    }
  };

  return (
    <div>
      <h1>Settings</h1>
      <p className="text-muted">Configure your job search preferences</p>

      {isLoading && (
        <div className="mt-4 card text-center">
          <div className="spinner"></div>
          <p className="text-muted mt-2">Loading preferences...</p>
        </div>
      )}

      {!isLoading && (
        <div className="mt-4">
          <div className="card">
            <h3>Job Preferences</h3>
            <p className="text-muted mt-2">
              Tell us what kind of jobs you're looking for.
            </p>

            <div className="form-group mt-4">
              <label htmlFor="desiredTitles">
                <strong>Desired Job Titles</strong>
              </label>
              <p className="text-muted">
                Press Enter after typing each title to add it
              </p>
              <input
                type="text"
                id="desiredTitles"
                className="input"
                placeholder="e.g., Software Engineer, Full Stack Developer"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onKeyDown={handleAddTitle}
              />
              <div className="tags-container mt-2">
                {desiredTitles.map((title) => (
                  <span key={title} className="tag">
                    {title}
                    <button
                      className="tag-remove"
                      onClick={() => handleRemoveTitle(title)}
                      aria-label={`Remove ${title}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="form-group mt-4">
              <label htmlFor="desiredLocations">
                <strong>Desired Locations</strong>
              </label>
              <p className="text-muted">
                Press Enter after typing each location to add it
              </p>
              <input
                type="text"
                id="desiredLocations"
                className="input"
                placeholder="e.g., San Francisco, Remote, New York"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyDown={handleAddLocation}
              />
              <div className="tags-container mt-2">
                {desiredLocations.map((location) => (
                  <span key={location} className="tag">
                    {location}
                    <button
                      className="tag-remove"
                      onClick={() => handleRemoveLocation(location)}
                      aria-label={`Remove ${location}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="form-group mt-4">
              <label>
                <strong>Remote Work Preference</strong>
              </label>
              <div className="radio-group mt-2">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="remotePreference"
                    value="remote_only"
                    checked={remotePreference === 'remote_only'}
                    onChange={(e) => setRemotePreference(e.target.value)}
                  />
                  <span>Remote Only</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="remotePreference"
                    value="hybrid"
                    checked={remotePreference === 'hybrid'}
                    onChange={(e) => setRemotePreference(e.target.value)}
                  />
                  <span>Hybrid</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="remotePreference"
                    value="onsite"
                    checked={remotePreference === 'onsite'}
                    onChange={(e) => setRemotePreference(e.target.value)}
                  />
                  <span>On-site</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="remotePreference"
                    value="flexible"
                    checked={remotePreference === 'flexible'}
                    onChange={(e) => setRemotePreference(e.target.value)}
                  />
                  <span>Flexible</span>
                </label>
              </div>
            </div>

            <div className="form-row mt-4">
              <div className="form-group">
                <label htmlFor="desiredSalaryMin">
                  <strong>Minimum Salary ($)</strong>
                </label>
                <input
                  type="number"
                  id="desiredSalaryMin"
                  className="input"
                  placeholder="e.g., 80000"
                  value={desiredSalaryMin || ''}
                  onChange={(e) =>
                    setDesiredSalaryMin(parseInt(e.target.value) || 0)
                  }
                  min="0"
                  step="5000"
                />
              </div>
              <div className="form-group">
                <label htmlFor="desiredSalaryMax">
                  <strong>Maximum Salary ($)</strong>
                </label>
                <input
                  type="number"
                  id="desiredSalaryMax"
                  className="input"
                  placeholder="e.g., 150000"
                  value={desiredSalaryMax || ''}
                  onChange={(e) =>
                    setDesiredSalaryMax(parseInt(e.target.value) || 0)
                  }
                  min="0"
                  step="5000"
                />
              </div>
            </div>
          </div>

          <div className="card mt-3">
            <h3>Application Settings</h3>
            <p className="text-muted mt-2">
              Configure how you want to apply to jobs.
            </p>

            <div className="form-group mt-4">
              <label className="checkbox-option">
                <input
                  type="checkbox"
                  checked={autoApply}
                  onChange={(e) => setAutoApply(e.target.checked)}
                />
                <span>
                  <strong>Enable Auto-Apply</strong>
                  <br />
                  <span className="text-muted">
                    Automatically apply to highly matched jobs (coming soon)
                  </span>
                </span>
              </label>
            </div>

            <div className="form-group mt-4">
              <label htmlFor="dailyApplicationLimit">
                <strong>Daily Application Limit</strong>
              </label>
              <p className="text-muted">
                Maximum number of applications to send per day
              </p>
              <input
                type="number"
                id="dailyApplicationLimit"
                className="input"
                value={dailyApplicationLimit}
                onChange={(e) =>
                  setDailyApplicationLimit(parseInt(e.target.value) || 10)
                }
                min="1"
                max="50"
              />
            </div>
          </div>

          <div className="mt-4 actions-bar">
            <button
              onClick={handleSave}
              className="btn btn-primary"
              disabled={isUpdating}
            >
              {isUpdating ? 'Saving...' : 'Save Preferences'}
            </button>
            {saveSuccess && (
              <span className="success-message">✓ Saved successfully!</span>
            )}
          </div>
        </div>
      )}

      <style>{`
        .form-group {
          margin-bottom: var(--spacing-lg);
        }

        .form-group label {
          display: block;
          margin-bottom: var(--spacing-xs);
        }

        .input {
          width: 100%;
          padding: var(--spacing-sm) var(--spacing-md);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          font-size: 1rem;
          background-color: var(--color-bg);
          color: var(--color-text);
        }

        .input:focus {
          outline: none;
          border-color: var(--color-primary);
        }

        .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-sm);
        }

        .tag {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-xs) var(--spacing-md);
          background-color: var(--color-primary);
          color: white;
          border-radius: var(--radius-md);
          font-size: 0.875rem;
        }

        .tag-remove {
          background: none;
          border: none;
          color: white;
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }

        .tag-remove:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }

        .radio-group {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .radio-option {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          cursor: pointer;
        }

        .radio-option input[type="radio"] {
          cursor: pointer;
        }

        .checkbox-option {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-sm);
          cursor: pointer;
        }

        .checkbox-option input[type="checkbox"] {
          margin-top: 2px;
          cursor: pointer;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-md);
        }

        .actions-bar {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }

        .success-message {
          color: var(--color-success, #10b981);
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
