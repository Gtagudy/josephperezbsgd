import React from 'react';

export function Projects() {
  const projects = [
    {
      title: "Interactive 3D Portfolio",
      description: "A React Three.js based portfolio with isometric design",
      tech: ["React", "Three.js", "React Three Fiber"],
      status: "In Progress"
    },
    {
      title: "Project Alpha",
      description: "A fictional project to demonstrate layout",
      tech: ["TypeScript", "Node.js", "MongoDB"],
      status: "Completed"
    },
    {
      title: "Project Beta",
      description: "Another fictional project for demonstration",
      tech: ["Python", "Django", "PostgreSQL"],
      status: "Planning"
    }
  ];

  return (
    <div className="section-content">
      <h2>Projects</h2>
      <div className="projects-grid">
        {projects.map((project, index) => (
          <div key={index} className="project-card">
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <div className="tech-stack">
              {project.tech.map((tech, i) => (
                <span key={i} className="tech-tag">{tech}</span>
              ))}
            </div>
            <div className="project-status">
              Status: <span className={`status-${project.status.toLowerCase()}`}>
                {project.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 