import React, { useState } from 'react';
import Calendar from './Calendar';
import Timeline from './Timeline';
import './TaskManager.css';

const TaskCategories = {
    WORK: 'Work',
    PERSONAL: 'Personal',
    HEALTH: 'Health',
    EDUCATION: 'Education',
    OTHER: 'Other'
};

const PriorityLevels = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    URGENT: 'Urgent'
};

const RepeatOptions = {
    NONE: 'None',
    DAILY: 'Daily',
    WEEKLY: 'Weekly',
    MONTHLY: 'Monthly'
};

// Mock skills data
const AvailableSkills = [
    { id: 1, name: "Programming", xpMultiplier: 1.2 },
    { id: 2, name: "Design", xpMultiplier: 1.0 },
    { id: 3, name: "Project Management", xpMultiplier: 1.1 }
];

// Mock tasks for today and tomorrow
const mockTasks = [
    {
        id: 1,
        title: "Morning Standup",
        description: "Daily team sync",
        category: TaskCategories.WORK,
        priority: PriorityLevels.MEDIUM,
        startTime: new Date(new Date().setHours(9, 0, 0, 0)),
        duration: 1,
        skillId: 3,
        skillName: "Project Management",
        completed: false
    },
    {
        id: 2,
        title: "Code Review",
        description: "Review pull requests",
        category: TaskCategories.WORK,
        priority: PriorityLevels.HIGH,
        startTime: new Date(new Date().setHours(10, 30, 0, 0)),
        duration: 2,
        skillId: 1,
        skillName: "Programming",
        completed: false
    },
    {
        id: 3,
        title: "Lunch Break",
        description: "Take a break and eat",
        category: TaskCategories.PERSONAL,
        priority: PriorityLevels.LOW,
        startTime: new Date(new Date().setHours(12, 30, 0, 0)),
        duration: 1,
        skillId: 2,
        skillName: "Design",
        completed: false
    },
    {
        id: 4,
        title: "Design Meeting",
        description: "Discuss new UI components",
        category: TaskCategories.WORK,
        priority: PriorityLevels.MEDIUM,
        startTime: new Date(new Date().setHours(14, 0, 0, 0)),
        duration: 1.5,
        skillId: 2,
        skillName: "Design",
        completed: false
    }
];

const TaskManager = () => {
    const [tasks, setTasks] = useState(mockTasks);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        category: TaskCategories.WORK,
        priority: PriorityLevels.MEDIUM,
        startTime: new Date(),
        duration: 1,
        skillId: AvailableSkills[0].id,
        completed: false
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTask(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newTask.title.trim()) return;

        const selectedSkill = AvailableSkills.find(skill => skill.id === parseInt(newTask.skillId));
        const baseXP = calculateBaseXP(newTask);
        const skillXP = Math.round(baseXP * (selectedSkill?.xpMultiplier || 1));

        setTasks(prev => [...prev, {
            ...newTask,
            id: Date.now(),
            skillName: selectedSkill?.name,
            baseXP,
            skillXP
        }]);

        setShowTaskForm(false);
        setNewTask({
            title: '',
            description: '',
            category: TaskCategories.WORK,
            priority: PriorityLevels.MEDIUM,
            startTime: new Date(),
            duration: 1,
            skillId: AvailableSkills[0].id,
            completed: false
        });
    };

    const calculateBaseXP = (task) => {
        let xp = 10; // Base XP
        switch (task.priority) {
            case PriorityLevels.LOW:
                xp += 5;
                break;
            case PriorityLevels.MEDIUM:
                xp += 10;
                break;
            case PriorityLevels.HIGH:
                xp += 15;
                break;
            case PriorityLevels.URGENT:
                xp += 20;
                break;
        }
        xp += task.duration * 2;
        return xp;
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setShowTaskForm(true);
        setNewTask(task);
    };

    const handleCreateTask = () => {
        setSelectedTask(null);
        setShowTaskForm(true);
        setNewTask({
            title: '',
            description: '',
            category: TaskCategories.WORK,
            priority: PriorityLevels.MEDIUM,
            startTime: new Date(),
            duration: 1,
            skillId: AvailableSkills[0].id,
            completed: false
        });
    };

    return (
        <div className="task-manager">
            <div className="task-manager-grid">
                <div className="calendar-section">
                    <Calendar 
                        selectedDate={selectedDate}
                        onDateSelect={setSelectedDate}
                    />
                </div>
                
                <div className="timeline-section">
                    <Timeline 
                        tasks={tasks.filter(task => 
                            task.startTime.toDateString() === selectedDate.toDateString()
                        )}
                        onTaskClick={handleTaskClick}
                        onCreateTask={handleCreateTask}
                    />
                </div>
            </div>

            {showTaskForm && (
                <div className="task-form-overlay">
                    <div className="task-form-container">
                        <h2>{selectedTask ? 'Edit Task' : 'Create New Task'}</h2>
                        <form onSubmit={handleSubmit} className="task-form">
                            <div className="form-group">
                                <label htmlFor="title">Task Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={newTask.title}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={newTask.description}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="category">Category</label>
                                <select
                                    id="category"
                                    name="category"
                                    value={newTask.category}
                                    onChange={handleInputChange}
                                >
                                    {Object.values(TaskCategories).map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="priority">Priority</label>
                                <select
                                    id="priority"
                                    name="priority"
                                    value={newTask.priority}
                                    onChange={handleInputChange}
                                >
                                    {Object.values(PriorityLevels).map(priority => (
                                        <option key={priority} value={priority}>{priority}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="skillId">Skill to Level</label>
                                <select
                                    id="skillId"
                                    name="skillId"
                                    value={newTask.skillId}
                                    onChange={handleInputChange}
                                >
                                    {AvailableSkills.map(skill => (
                                        <option key={skill.id} value={skill.id}>
                                            {skill.name} (x{skill.xpMultiplier} XP)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="startTime">Start Time</label>
                                <input
                                    type="time"
                                    id="startTime"
                                    name="startTime"
                                    value={newTask.startTime.toTimeString().slice(0, 5)}
                                    onChange={(e) => {
                                        const [hours, minutes] = e.target.value.split(':');
                                        const newDate = new Date(newTask.startTime);
                                        newDate.setHours(parseInt(hours), parseInt(minutes));
                                        setNewTask(prev => ({ ...prev, startTime: newDate }));
                                    }}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="duration">Duration (hours)</label>
                                <input
                                    type="number"
                                    id="duration"
                                    name="duration"
                                    value={newTask.duration}
                                    onChange={handleInputChange}
                                    min="0.5"
                                    step="0.5"
                                />
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="submit-button">
                                    {selectedTask ? 'Update Task' : 'Create Task'}
                                </button>
                                <button 
                                    type="button" 
                                    className="cancel-button"
                                    onClick={() => setShowTaskForm(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskManager; 