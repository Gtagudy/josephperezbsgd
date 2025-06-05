import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projects } from '../config/ProjectConfig';

export function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const project = projects[projectId];

  if (!project) {
    return (
      <div className="section-content">
        <h2>Project Not Found</h2>
        <button onClick={() => navigate('/projects')}>Back to Projects</button>
      </div>
    );
  }

  return (
    <div className="section-content project-detail">
      <button 
        className="back-button"
        onClick={() => navigate('/projects')}
      >
        ← Back to Projects
      </button>
      
      <div className="project-header">
        <h2>{project.title}</h2>
        <div className="tech-stack">
          {project.technologies.map((tech, i) => (
            <span key={i} className="tech-tag">{tech}</span>
          ))}
        </div>
      </div>

      <div className="project-content">
        <section className="project-overview">
          <h3>Overview</h3>
          <p>{project.description}</p>
        </section>

        <section className="project-phases">
          <h3>Development Phases</h3>
          {project.phases?.map((phase, index) => (
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

        <section className="project-concepts">
          <h3>Key Concepts</h3>
          {project.concepts?.map((concept, index) => (
            <div key={index} className="concept">
              <h4>{concept.title}</h4>
              <p>{concept.description}</p>
            </div>
          ))}
        </section>

        {project.links && (
          <section className="project-links">
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
                  {link.title}
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
} 