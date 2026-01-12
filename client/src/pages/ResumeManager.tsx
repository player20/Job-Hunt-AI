/**
 * Resume Manager Page
 * Upload and manage resumes with AI parsing
 */

import { useState } from 'react';
import { useResumes } from '../hooks/useResumes';
import { ResumeUploader } from '../components/resume/ResumeUploader';
import { ResumePreview } from '../components/resume/ResumePreview';
import type { Resume } from '../types';

export default function ResumeManager() {
  const { resumes, isLoading, update, delete: deleteResume } = useResumes();
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);

  const handleUploadSuccess = (resume: Resume) => {
    setSelectedResume(resume);
  };

  const handleSetPrimary = async (resumeId: string) => {
    try {
      await update({ id: resumeId, data: { isPrimary: true } });
    } catch (error) {
      console.error('Failed to set primary resume:', error);
    }
  };

  const handleDelete = async (resumeId: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) {
      return;
    }

    try {
      await deleteResume(resumeId);
      if (selectedResume?.id === resumeId) {
        setSelectedResume(null);
      }
    } catch (error) {
      console.error('Failed to delete resume:', error);
    }
  };

  return (
    <div>
      <h1>Resume Manager</h1>
      <p className="text-muted">
        Upload your resume and let AI extract structured data
      </p>

      <div className="mt-4">
        <div className="card">
          <h3>Upload Resume</h3>
          <p className="text-muted mt-2">
            Drag and drop your resume (PDF or DOCX) or click to browse. Our AI
            will automatically parse and extract your information.
          </p>
          <div className="mt-3">
            <ResumeUploader onUploadSuccess={handleUploadSuccess} />
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="mt-4 card text-center">
          <div className="spinner"></div>
          <p className="text-muted mt-2">Loading resumes...</p>
        </div>
      )}

      {!isLoading && resumes.length > 0 && (
        <div className="mt-4">
          <h2>Your Resumes ({resumes.length})</h2>
          <p className="text-muted">Click on a resume to view details</p>

          <div className="resume-grid mt-3">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className={`resume-card ${
                  selectedResume?.id === resume.id ? 'selected' : ''
                }`}
                onClick={() => setSelectedResume(resume)}
              >
                <div className="resume-card-header">
                  <h3>{resume.fullName || 'Untitled Resume'}</h3>
                  {resume.isPrimary && (
                    <span className="badge badge-primary">Primary</span>
                  )}
                </div>
                <p className="text-muted">{resume.fileName}</p>
                <p className="text-muted">
                  Uploaded: {new Date(resume.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedResume && (
        <div className="mt-4">
          <h2>Resume Details</h2>
          <div className="mt-3">
            <ResumePreview
              resume={selectedResume}
              onSetPrimary={() => handleSetPrimary(selectedResume.id)}
              onDelete={() => handleDelete(selectedResume.id)}
            />
          </div>
        </div>
      )}

      {!isLoading && resumes.length === 0 && !selectedResume && (
        <div className="mt-4 card text-center">
          <p className="text-muted">No resumes uploaded yet</p>
          <p className="text-muted">Upload your first resume above to get started!</p>
        </div>
      )}

      <style>{`
        .resume-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: var(--spacing-md);
        }

        .resume-card {
          padding: var(--spacing-lg);
          border: 2px solid var(--color-border);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all 0.2s;
          background-color: var(--color-bg);
        }

        .resume-card:hover {
          border-color: var(--color-primary);
          box-shadow: var(--shadow-md);
        }

        .resume-card.selected {
          border-color: var(--color-primary);
          background-color: rgba(37, 99, 235, 0.05);
        }

        .resume-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-sm);
        }

        .resume-card h3 {
          margin: 0;
          font-size: 1.125rem;
        }
      `}</style>
    </div>
  );
}
