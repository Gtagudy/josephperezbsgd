import React from 'react';

export function About() {
  return (
    <div className="section-content">
      <h2>About Me</h2>
      <div className="content-block">
        <div className="about-section">
          <h3>Background</h3>
          <p>
            As a student at Neumont College of Computer Science, I'm constantly pushing
            the boundaries of what's possible in web development. My journey in
            programming started with a simple "Hello World" and has evolved into
            creating complex, interactive experiences.
          </p>
        </div>

        <div className="about-section">
          <h3>Skills</h3>
          <div className="skills-grid">
            <div className="skill-category">
              <h4>Frontend</h4>
              <ul>
                <li>React</li>
                <li>Three.js</li>
                <li>HTML/CSS</li>
                <li>JavaScript</li>
              </ul>
            </div>
            <div className="skill-category">
              <h4>Backend</h4>
              <ul>
                <li>Node.js</li>
                <li>Python</li>
                <li>Databases</li>
                <li>APIs</li>
              </ul>
            </div>
            <div className="skill-category">
              <h4>Tools</h4>
              <ul>
                <li>Git</li>
                <li>VS Code</li>
                <li>Figma</li>
                <li>Terminal</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="about-section">
          <h3>Interests</h3>
          <p>
            When I'm not coding, you can find me exploring new technologies,
            contributing to open-source projects, or learning about the latest
            trends in web development and 3D graphics.
          </p>
        </div>
      </div>
    </div>
  );
} 