import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { projects } from '../config/ProjectConfig';

export const ProjectDetailPortal = ({ projectId, isVisible, onClose, onNext, onPrev }) => {
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowRight') {
      onNext();
    } else if (e.key === 'ArrowLeft') {
      onPrev();
    }
  }, [onClose, onNext, onPrev]);

  useEffect(() => {
    if (isVisible) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isVisible, handleKeyDown]);

  if (!isVisible || !projectId) return null;

  const project = projects[projectId];
  if (!project) return null;

  return createPortal(
    <div className="project-detail-portal">
      <div className="project-detail-content">
        <button className="close-button" onClick={onClose}>×</button>
        <button className="nav-button prev" onClick={onPrev}>←</button>
        <button className="nav-button next" onClick={onNext}>→</button>
        
        <div className="project-header">
          <h2>{project.title}</h2>
        </div>
        
        <div className="project-content">
          <section>
            <h3>Overview</h3>
            <p>{project.description}</p>
          </section>

          <section>
            <h3>Technologies</h3>
            <div className="tech-stack">
              {project.technologies.map((tech, index) => (
                <span key={index} className="tech-tag">{tech}</span>
              ))}
            </div>
          </section>

          {project.phases && (
            <section>
              <h3>Development Phases</h3>
              {project.phases.map((phase, index) => (
                <div key={index} className="phase">
                  <h4>{phase.title}</h4>
                  <p>{phase.description}</p>
                  {phase.media && (
                    <div className="phase-media">
                      <img src={phase.media} alt={phase.title} />
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}

          {project.concepts && (
            <section>
              <h3>Key Concepts</h3>
              {project.concepts.map((concept, index) => (
                <div key={index} className="concept">
                  <h4>{concept.title}</h4>
                  <p>{concept.description}</p>
                  {concept.media && (
                    <div className="phase-media">
                      <img src={concept.media} alt={concept.title} />
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}

          {project.links && (
            <section>
              <h3>Links</h3>
              <div className="links-grid">
                {project.links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-link"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}; 