/**
 * Resume Preview Component
 * Display parsed resume data
 */

import type { Resume } from '../../types';
import './ResumePreview.css';

interface ResumePreviewProps {
  resume: Resume;
  onDelete?: () => void;
  onSetPrimary?: () => void;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  resume,
  onDelete,
  onSetPrimary,
}) => {
  const parseJSON = (jsonString: string | null) => {
    if (!jsonString) return [];
    try {
      return JSON.parse(jsonString);
    } catch {
      return [];
    }
  };

  const skills = parseJSON(resume.skills);
  const experience = parseJSON(resume.experience);
  const education = parseJSON(resume.education);
  const certifications = parseJSON(resume.certifications);

  return (
    <div className="resume-preview">
      <div className="resume-header">
        <div>
          <h2>{resume.fullName || 'Untitled Resume'}</h2>
          <p className="text-muted">{resume.fileName}</p>
        </div>
        <div className="resume-actions">
          {!resume.isPrimary && onSetPrimary && (
            <button onClick={onSetPrimary} className="btn btn-secondary" title="Set as primary">
              ⭐ Set Primary
            </button>
          )}
          {resume.isPrimary && (
            <span className="badge badge-primary">Primary</span>
          )}
          {onDelete && (
            <button onClick={onDelete} className="btn btn-danger" title="Delete resume">
              🗑️
            </button>
          )}
        </div>
      </div>

      <div className="resume-section">
        <h3>Contact Information</h3>
        <div className="info-grid">
          {resume.email && (
            <div>
              <strong>Email:</strong> {resume.email}
            </div>
          )}
          {resume.phone && (
            <div>
              <strong>Phone:</strong> {resume.phone}
            </div>
          )}
          {resume.location && (
            <div>
              <strong>Location:</strong> {resume.location}
            </div>
          )}
        </div>
      </div>

      {resume.summary && (
        <div className="resume-section">
          <h3>Summary</h3>
          <p>{resume.summary}</p>
        </div>
      )}

      {skills.length > 0 && (
        <div className="resume-section">
          <h3>Skills</h3>
          <div className="skills-list">
            {skills.map((skill: string, index: number) => (
              <span key={index} className="skill-badge">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {experience.length > 0 && (
        <div className="resume-section">
          <h3>Experience</h3>
          {experience.map((exp: any, index: number) => (
            <div key={index} className="experience-item">
              <div className="experience-header">
                <strong>{exp.title}</strong>
                <span className="text-muted">
                  {exp.startDate} - {exp.endDate || 'Present'}
                </span>
              </div>
              <div className="text-muted">{exp.company}</div>
              {exp.description && <p className="mt-1">{exp.description}</p>}
              {exp.achievements && exp.achievements.length > 0 && (
                <ul className="achievements-list">
                  {exp.achievements.map((achievement: string, i: number) => (
                    <li key={i}>{achievement}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <div className="resume-section">
          <h3>Education</h3>
          {education.map((edu: any, index: number) => (
            <div key={index} className="education-item">
              <div className="education-header">
                <strong>{edu.degree}</strong>
                <span className="text-muted">{edu.graduationDate}</span>
              </div>
              <div className="text-muted">{edu.institution}</div>
              {edu.gpa && <div className="text-muted">GPA: {edu.gpa}</div>}
            </div>
          ))}
        </div>
      )}

      {certifications.length > 0 && (
        <div className="resume-section">
          <h3>Certifications</h3>
          <ul>
            {certifications.map((cert: string, index: number) => (
              <li key={index}>{cert}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
