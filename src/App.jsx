import React, { useState } from 'react';
import { Room } from './components/Room';
import { Home } from './components/sections/Home';
import { Projects } from './components/sections/Projects';
import { About } from './components/sections/About';
import { Contact } from './components/sections/Contact';
import { TMCitySection } from './TM_City/TMCitySection';
import './TM_City/TMCityStyles.css';

const Navigation = ({ currentSection, setCurrentSection, setContentVisible, is3DEnabled }) => {
    const handleSectionChange = (section) => {
        setCurrentSection(section);
        setContentVisible(true);
        // Dispatch section change event
        window.dispatchEvent(new CustomEvent('sectionChange', {
            detail: { section }
        }));
    };

    return (
        <nav className="top-nav">
            <div className="nav-links">
                <a 
                    href="#home" 
                    className={currentSection === 'home' ? 'active' : ''}
                    onClick={() => handleSectionChange('home')}
                >
                    Home
                </a>
                <a 
                    href="#projects" 
                    className={currentSection === 'projects' ? 'active' : ''}
                    onClick={() => handleSectionChange('projects')}
                >
                    Projects
                </a>
                <a 
                    href="#about" 
                    className={currentSection === 'about' ? 'active' : ''}
                    onClick={() => handleSectionChange('about')}
                >
                    About
                </a>
                <a 
                    href="#contact" 
                    className={currentSection === 'contact' ? 'active' : ''}
                    onClick={() => handleSectionChange('contact')}
                >
                    Contact
                </a>
            </div>
        </nav>
    );
};

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
        <p>© 2025 Portfolio - Built with React Three Fiber + Cursor</p>
    </footer>
);

export default function App() {
    const [currentSection, setCurrentSection] = useState('home');
    const [is3DEnabled, setIs3DEnabled] = useState(false);
    const [contentVisible, setContentVisible] = useState(false);

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
        case 'tm-city':
            return <TMCitySection setCurrentSection={setCurrentSection} />;
        default:
            return <Home />;
        }
    };

    return (
        <>
        {currentSection !== 'tm-city' && (
            <Navigation 
                currentSection={currentSection} 
                setCurrentSection={setCurrentSection} 
                setContentVisible={setContentVisible}
                is3DEnabled={is3DEnabled}
            />
        )}
        <main className={is3DEnabled ? 'scene-enabled' : 'scene-disabled'}>
            {is3DEnabled && currentSection !== 'tm-city' && (
                <Room setCurrentSection={setCurrentSection} setContentVisible={setContentVisible} />
            )}
            <div className={`content-overlay ${contentVisible ? 'visible' : ''}`}>
                {renderSection()}
            </div>
            {is3DEnabled && currentSection !== 'tm-city' && (
                <ContentToggle 
                    isVisible={contentVisible}
                    setContentVisible={setContentVisible}
                />
            )}
        </main>
        {currentSection !== 'tm-city' && (
            <ViewToggle is3DEnabled={is3DEnabled} setIs3DEnabled={setIs3DEnabled} />
        )}
        <Footer />
        </>
    );
} 