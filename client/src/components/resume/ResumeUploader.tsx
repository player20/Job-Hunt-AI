/**
 * Resume Uploader Component
 * Drag-and-drop file upload with progress
 */

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { resumeApi } from '../../services/api';
import type { Resume } from '../../types';
import './ResumeUploader.css';

interface ResumeUploaderProps {
  onUploadSuccess: (resume: Resume) => void;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({
  onUploadSuccess,
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) {
        return;
      }

      const file = acceptedFiles[0];
      setUploading(true);
      setProgress(0);
      setError(null);

      try {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);

        // Upload file
        const resume = await resumeApi.upload(file);

        clearInterval(progressInterval);
        setProgress(100);

        // Wait a moment to show 100% before calling success
        setTimeout(() => {
          setUploading(false);
          setProgress(0);
          onUploadSuccess(resume);
        }, 500);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to upload resume');
        setUploading(false);
        setProgress(0);
      }
    },
    [onUploadSuccess]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
        '.docx',
      ],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div className="resume-uploader">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''} ${
          uploading ? 'disabled' : ''
        }`}
      >
        <input {...getInputProps()} />

        {uploading ? (
          <div className="upload-status">
            <div className="spinner"></div>
            <p>Uploading and parsing resume...</p>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-muted">{progress}%</p>
          </div>
        ) : (
          <div className="upload-prompt">
            <div className="upload-icon">📄</div>
            {isDragActive ? (
              <p>Drop your resume here</p>
            ) : (
              <>
                <p>
                  <strong>Drag and drop</strong> your resume here
                </p>
                <p className="text-muted">or click to browse</p>
                <p className="text-muted mt-2">PDF or DOCX (max 10MB)</p>
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}
    </div>
  );
};
