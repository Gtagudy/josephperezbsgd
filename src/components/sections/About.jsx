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
              <h4>Software Development</h4>
              <ul>
                <li>C#</li>
                <li>JavaScript</li>
                <li>HTML/CSS</li>
                <li>React</li>
                <li>Three.js</li>
                <li>React Three Fiber</li>
                <li>Smack Studio</li>
                <li>JetBrains Rider</li>
                <li>Github</li>
                <li>Trello</li>
                <li>Visual Studio</li>
              </ul>
            </div>
            <div className="skill-category">
              <h4>Game Development</h4>
              <ul>
                <li>Unity</li>
                <li>Unreal Engine</li>
                <li>Smack Studio</li>
                <li>Itch.io</li>
              </ul>
            </div>
            <div className="skill-category">
              <h4>Etc</h4>
              <ul>
                <li>Longterm Development</li>
                <li>Art</li>
                <li>Writing</li>
                <li>Proper use of Artificial Intelligence</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="about-section">
          <h3>Interests</h3>
          <p>
            When I'm not coding a game or learning new technology I am playing a game, making art or writing. While these are quite the projects to make you busy, I make sure to do the best I can balance my time and apply focus on my work.
          </p>
        </div>
      </div>
    </div>
  );
} 