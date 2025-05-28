import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import TaskManager from './components/TaskManager';
import Profile from './components/Profile';
import './components/TaskManager.css';
import './components/Profile.css';

const TMCityNavigation = ({ currentView, setCurrentView, setCurrentSection }) => (
    <nav className="tm-city-nav">
        <div className="nav-links">
            <a 
                href="#home" 
                className={currentView === 'home' ? 'active' : ''}
                onClick={() => setCurrentView('home')}
            >
                Home
            </a>
            <a 
                href="#tasks" 
                className={currentView === 'tasks' ? 'active' : ''}
                onClick={() => setCurrentView('tasks')}
            >
                Tasks
            </a>
            <a 
                href="#explore" 
                className={currentView === 'explore' ? 'active' : ''}
                onClick={() => setCurrentView('explore')}
            >
                Explore City
            </a>
            <a 
                href="#back" 
                onClick={() => setCurrentSection('home')}
            >
                Back to Main Site
            </a>
        </div>
    </nav>
);

const TMCityContentToggle = ({ isVisible, setContentVisible }) => (
    <button 
        className="tm-city-content-toggle"
        onClick={() => setContentVisible(!isVisible)}
        aria-label={isVisible ? 'Hide content' : 'Show content'}
    >
        {isVisible ? '→' : '←'}
    </button>
);

const TMCityScene = () => {
    return (
        <Canvas style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="#4CAF50" />
            </mesh>
            <gridHelper args={[10, 10]} />
        </Canvas>
    );
};

export const TMCitySection = ({ setCurrentSection }) => {
    const [currentView, setCurrentView] = useState('home');
    const [contentVisible, setContentVisible] = useState(false);
    const [profileExpanded, setProfileExpanded] = useState(false);

    const renderView = () => {
        switch (currentView) {
            case 'home':
                return (
                    <div className="tm-city-home">
                        <h1>Welcome to Time Management City</h1>
                        <p>Manage your tasks, earn XP, and build your city!</p>
                        <div className="home-features">
                            <div className="feature">
                                <h3>Task Management</h3>
                                <p>Create and manage your daily tasks with categories and priorities</p>
                            </div>
                            <div className="feature">
                                <h3>Earn XP</h3>
                                <p>Complete tasks to earn experience points and level up</p>
                            </div>
                            <div className="feature">
                                <h3>Build Your City</h3>
                                <p>Use your XP to build and expand your city</p>
                            </div>
                        </div>
                    </div>
                );
            case 'tasks':
                return <TaskManager />;
            case 'explore':
                return null;
            default:
                return null;
        }
    };

    return (
        <div className="tm-city-container">
            <TMCityNavigation 
                currentView={currentView} 
                setCurrentView={setCurrentView} 
                setCurrentSection={setCurrentSection}
            />
            <Profile 
                isExpanded={profileExpanded}
                onToggle={() => setProfileExpanded(!profileExpanded)}
            />
            <main className="tm-city-main">
                <TMCityScene />
                <div className={`tm-city-content-overlay ${contentVisible ? 'visible' : ''}`}>
                    {renderView()}
                </div>
                <TMCityContentToggle 
                    isVisible={contentVisible}
                    setContentVisible={setContentVisible}
                />
            </main>
        </div>
    );
}; 