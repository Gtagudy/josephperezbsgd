import React, { useState, useRef } from 'react';
import './Timeline.css';

const Timeline = ({ tasks, onTaskClick, onCreateTask }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [draggedTask, setDraggedTask] = useState(null);
    const [dragStart, setDragStart] = useState(0);
    const [resizeMode, setResizeMode] = useState(null); // 'start' or 'end'
    const timelineRef = useRef(null);

    const timePeriods = [
        { label: 'Morning', start: 6, end: 12 },
        { label: 'Afternoon', start: 12, end: 18 },
        { label: 'Evening', start: 18, end: 24 }
    ];

    const formatTime = (hour) => {
        if (hour === 0) return '12 AM';
        if (hour === 12) return '12 PM';
        return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
    };

    const calculateTaskPosition = (task) => {
        const startHour = new Date(task.startTime).getHours();
        const duration = task.duration || 1;
        const startPercentage = (startHour / 24) * 100;
        const widthPercentage = (duration / 24) * 100;
        
        return {
            left: `${startPercentage}%`,
            width: `${widthPercentage}%`,
            top: '0'
        };
    };

    const handleTaskMouseDown = (task, e, mode = null) => {
        e.preventDefault(); // Prevent text selection
        setIsDragging(true);
        setDraggedTask(task);
        setDragStart(e.clientX);
        setResizeMode(mode);
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !draggedTask || !timelineRef.current) return;

        e.preventDefault(); // Prevent text selection
        const timeline = timelineRef.current;
        const rect = timeline.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        const hour = Math.floor((percentage / 100) * 24);

        if (resizeMode === 'start') {
            // Resize from start
            const endHour = new Date(draggedTask.startTime).getHours() + draggedTask.duration;
            const newDuration = endHour - hour;
            if (newDuration >= 0.5) { // Minimum 30 minutes
                const updatedTask = {
                    ...draggedTask,
                    startTime: new Date(draggedTask.startTime.setHours(hour)),
                    duration: newDuration
                };
                // Here you would update the task in your state management
                console.log('Task resized from start:', updatedTask);
            }
        } else if (resizeMode === 'end') {
            // Resize from end
            const startHour = new Date(draggedTask.startTime).getHours();
            const newDuration = hour - startHour;
            if (newDuration >= 0.5) { // Minimum 30 minutes
                const updatedTask = {
                    ...draggedTask,
                    duration: newDuration
                };
                // Here you would update the task in your state management
                console.log('Task resized from end:', updatedTask);
            }
        } else {
            // Move task
            const updatedTask = {
                ...draggedTask,
                startTime: new Date(draggedTask.startTime.setHours(hour))
            };
            // Here you would update the task in your state management
            console.log('Task moved to hour:', hour);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setDraggedTask(null);
        setResizeMode(null);
    };

    return (
        <div className="timeline-container">
            <div className="timeline-header">
                <h2>Daily Schedule</h2>
                <button className="create-task-button" onClick={onCreateTask}>
                    Create Task
                </button>
            </div>
            
            <div 
                ref={timelineRef}
                className="timeline"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {timePeriods.map((period, index) => (
                    <div key={period.label} className="timeline-period">
                        <div className="period-label">{period.label}</div>
                        <div className="period-hours">
                            {Array.from({ length: period.end - period.start }, (_, i) => period.start + i).map(hour => (
                                <div key={hour} className="timeline-hour">
                                    <span>{formatTime(hour)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                
                <div className="timeline-tasks">
                    {tasks.map(task => (
                        <div
                            key={task.id}
                            className={`timeline-task ${task.priority.toLowerCase()}`}
                            style={calculateTaskPosition(task)}
                            onClick={() => onTaskClick(task)}
                        >
                            <div 
                                className="resize-handle start"
                                onMouseDown={(e) => handleTaskMouseDown(task, e, 'start')}
                            />
                            <div 
                                className="task-content"
                                onMouseDown={(e) => handleTaskMouseDown(task, e)}
                            >
                                <h4>{task.title}</h4>
                                <p>{task.description}</p>
                                <span className="task-time">
                                    {formatTime(new Date(task.startTime).getHours())} - 
                                    {formatTime(new Date(task.startTime).getHours() + task.duration)}
                                </span>
                            </div>
                            <div 
                                className="resize-handle end"
                                onMouseDown={(e) => handleTaskMouseDown(task, e, 'end')}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Timeline; 