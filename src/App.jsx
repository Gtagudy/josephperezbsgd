import React, { useState } from 'react';
import { Room } from './components/Room';
import { Home } from './components/sections/Home';
import { Projects } from './components/sections/Projects';
import { About } from './components/sections/About';
import { Contact } from './components/sections/Contact';

const Navigation = ({ currentSection, setCurrentSection, setContentVisible }) => (
    <nav className="top-nav">
        <div className="nav-links">
        <a 
            href="#home" 
            className={currentSection === 'home' ? 'active' : ''}
            onClick={() => {
                setCurrentSection('home');
                setContentVisible(true);
            }}
        >
            Home
        </a>
        <a 
            href="#projects" 
            className={currentSection === 'projects' ? 'active' : ''}
            onClick={() => {
                setCurrentSection('projects');
                setContentVisible(true);
            }}
        >
            Projects
        </a>
        <a 
            href="#about" 
            className={currentSection === 'about' ? 'active' : ''}
            onClick={() => {
                setCurrentSection('about');
                setContentVisible(true);
            }}
        >
            About
        </a>
        <a 
            href="#contact" 
            className={currentSection === 'contact' ? 'active' : ''}
            onClick={() => {
                setCurrentSection('contact');
                setContentVisible(true);
            }}
        >
            Contact
        </a>
        </div>
    </nav>
);

const ContentToggle = ({ isVisible, setContentVisible }) => (
    <button 
        className="content-toggle"
        onClick={() => setContentVisible(!isVisible)}
        aria-label={isVisible ? 'Hide content' : 'Show content'}
    >
        {isVisible ? '→' : '←'}
    </button>
);

const ViewToggle = ({ is3DEnabled, setIs3DEnabled }) => (
    <button 
        className="view-toggle"
        onClick={() => setIs3DEnabled(!is3DEnabled)}
    >
        {is3DEnabled ? '🖥️ Switch to Simple View' : '🎮 Enable 3D View'}
    </button>
);

const Footer = () => (
    <footer>
        <p>© 2024 Portfolio - Built with React Three Fiber</p>
    </footer>
);

export default function App() {
const [currentSection, setCurrentSection] = useState('home');
const [is3DEnabled, setIs3DEnabled] = useState(true);
const [contentVisible, setContentVisible] = useState(false);

// Debug log
console.log('3D View State:', { is3DEnabled, contentVisible, currentSection });

const renderSection = () => {
    switch (currentSection) {
    case 'home':
        return <Home />;
    case 'projects':
        return <Projects />;
    case 'about':
        return <About />;
    case 'contact':
        return <Contact />;
    default:
        return <Home />;
    }
};

return (
    <>
    <Navigation currentSection={currentSection} setCurrentSection={setCurrentSection} setContentVisible={setContentVisible} />
    <main className={is3DEnabled ? 'scene-enabled' : 'scene-disabled'}>
        {is3DEnabled && <Room setCurrentSection={setCurrentSection} setContentVisible={setContentVisible} />}
        <div className={`content-overlay ${contentVisible ? 'visible' : ''}`}>
        {renderSection()}
        </div>
        {is3DEnabled && (
            <ContentToggle 
                isVisible={contentVisible}
                setContentVisible={setContentVisible}
            />
        )}
    </main>
    <ViewToggle is3DEnabled={is3DEnabled} setIs3DEnabled={setIs3DEnabled} />
    <Footer />
    </>
);
} 