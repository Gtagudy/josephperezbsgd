import React, { useState } from 'react';
import './Profile.css';

// Mock data for initial state
const mockProfile = {
    username: "CityBuilder",
    jobTitle: "Junior Developer",
    level: 5,
    totalXP: 1250,
    nextLevelXP: 2000,
    skills: [
        { name: "Programming", level: 3, xp: 450, nextLevel: 600 },
        { name: "Design", level: 2, xp: 200, nextLevel: 400 },
        { name: "Project Management", level: 1, xp: 100, nextLevel: 300 }
    ],
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=CityBuilder"
};

const Profile = ({ isExpanded, onToggle }) => {
    const [profile, setProfile] = useState(mockProfile);
    const [isEditing, setIsEditing] = useState(false);

    const calculateProgress = (current, next) => {
        return (current / next) * 100;
    };

    return (
        <div className={`profile-container ${isExpanded ? 'expanded' : ''}`}>
            <div className="profile-preview" onClick={onToggle}>
                <img src={profile.avatar} alt="Profile" className="profile-avatar" />
                <div className="profile-info">
                    <h3>{profile.username}</h3>
                    <p>{profile.jobTitle}</p>
                    <div className="level-badge">Level {profile.level}</div>
                </div>
            </div>

            {isExpanded && (
                <div className="profile-details">
                    <div className="profile-header">
                        <h2>Profile</h2>
                        <button 
                            className="edit-button"
                            onClick={() => setIsEditing(!isEditing)}
                        >
                            {isEditing ? 'Save' : 'Edit'}
                        </button>
                    </div>

                    <div className="xp-progress">
                        <div className="xp-bar">
                            <div 
                                className="xp-fill"
                                style={{ width: `${calculateProgress(profile.totalXP, profile.nextLevelXP)}%` }}
                            />
                        </div>
                        <span className="xp-text">
                            {profile.totalXP} / {profile.nextLevelXP} XP
                        </span>
                    </div>

                    <div className="skills-section">
                        <h3>Skills</h3>
                        {profile.skills.map((skill, index) => (
                            <div key={index} className="skill-item">
                                <div className="skill-header">
                                    <span className="skill-name">{skill.name}</span>
                                    <span className="skill-level">Level {skill.level}</span>
                                </div>
                                <div className="skill-progress">
                                    <div 
                                        className="skill-fill"
                                        style={{ width: `${calculateProgress(skill.xp, skill.nextLevel)}%` }}
                                    />
                                </div>
                                <span className="skill-xp">
                                    {skill.xp} / {skill.nextLevel} XP
                                </span>
                            </div>
                        ))}
                    </div>

                    {isEditing && (
                        <div className="profile-edit">
                            <div className="edit-group">
                                <label>Username</label>
                                <input 
                                    type="text" 
                                    value={profile.username}
                                    onChange={(e) => setProfile({...profile, username: e.target.value})}
                                />
                            </div>
                            <div className="edit-group">
                                <label>Job Title</label>
                                <input 
                                    type="text" 
                                    value={profile.jobTitle}
                                    onChange={(e) => setProfile({...profile, jobTitle: e.target.value})}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Profile; 