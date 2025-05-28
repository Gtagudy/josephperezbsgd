import React, { useState, useRef } from 'react';
import './Timeline.css';

const Timeline = ({ tasks, onTaskClick, onCreateTask, onTaskUpdate }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [draggedTask, setDraggedTask] = useState(null);
    const [dragStart, setDragStart] = useState(0);
    const [resizeMode, setResizeMode] = useState(null);
    const [dragStartTime, setDragStartTime] = useState(0);
    const timelineRef = useRef(null);

    const timePeriods = [
        { label: 'Early Morning', start: 0, end: 6 },
        { label: 'Morning', start: 6, end: 12 },
        { label: 'Afternoon', start: 12, end: 18 },
        { label: 'Evening', start: 18, end: 24 }
    ];

    const formatTime = (hour) => {
        if (hour === 0) return '12 AM';
        if (hour === 12) return '12 PM';
        return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
    };

    const calculateTaskPosition = (task, period) => {
        const startHour = new Date(task.startTime).getHours();
        const startMinutes = new Date(task.startTime).getMinutes();
        const duration = task.duration || 1;
        
        // Calculate position relative to the period
        const periodDuration = period.end - period.start;
        const relativeStart = startHour - period.start;
        const relativeStartPercentage = ((relativeStart + startMinutes / 60) / periodDuration) * 100;
        const widthPercentage = (duration / periodDuration) * 100;
        
        // Clamp the values to ensure they stay within bounds
        const clampedStart = Math.max(0, Math.min(100, relativeStartPercentage));
        const clampedWidth = Math.min(100 - clampedStart, widthPercentage);
        
        return {
            left: `${clampedStart}%`,
            width: `${clampedWidth}%`
        };
    };

    const updateTask = (updatedTask) => {
        if (onTaskUpdate) {
            onTaskUpdate(updatedTask);
        }
    };

    const handleTaskMouseDown = (task, e, mode = null) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        setDraggedTask(task);
        setDragStart(e.clientX);
        setResizeMode(mode);
        setDragStartTime(Date.now());
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !draggedTask || !timelineRef.current) return;

        e.preventDefault();
        e.stopPropagation();
        const timeline = timelineRef.current;
        const rect = timeline.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        
        // Find the current period based on mouse position
        const periodWidth = 100 / timePeriods.length;
        const currentPeriodIndex = Math.floor(percentage / periodWidth);
        const currentPeriod = timePeriods[currentPeriodIndex];
        
        // Calculate hour and minutes relative to the current period
        const periodPercentage = (percentage % periodWidth) / periodWidth;
        const periodHours = currentPeriod.end - currentPeriod.start;
        const hour = currentPeriod.start + Math.floor(periodPercentage * periodHours);
        const minutes = Math.floor((periodPercentage * periodHours - Math.floor(periodPercentage * periodHours)) * 60);

        // Clamp the hour to valid range
        const clampedHour = Math.max(0, Math.min(23, hour));

        if (resizeMode === 'start') {
            const endHour = new Date(draggedTask.startTime).getHours() + draggedTask.duration;
            const newDuration = endHour - clampedHour;
            
            // Only update if the new duration is valid
            if (newDuration >= 0.5 && newDuration <= 24) {
                const newStartTime = new Date(draggedTask.startTime);
                newStartTime.setHours(clampedHour, minutes);
                
                const updatedTask = {
                    ...draggedTask,
                    startTime: newStartTime,
                    duration: newDuration
                };
                updateTask(updatedTask);
            }
        } else if (resizeMode === 'end') {
            const startHour = new Date(draggedTask.startTime).getHours();
            const newDuration = clampedHour - startHour;
            
            // Only update if the new duration is valid
            if (newDuration >= 0.5 && newDuration <= 24) {
                const updatedTask = {
                    ...draggedTask,
                    duration: newDuration
                };
                updateTask(updatedTask);
            }
        } else {
            // For moving tasks, ensure they stay within valid time range
            const taskDuration = draggedTask.duration;
            if (clampedHour + taskDuration <= 24) {
                const newStartTime = new Date(draggedTask.startTime);
                newStartTime.setHours(clampedHour, minutes);
                
                const updatedTask = {
                    ...draggedTask,
                    startTime: newStartTime
                };
                updateTask(updatedTask);
            }
        }
    };

    const handleMouseUp = (e) => {
        if (!isDragging) return;

        e.preventDefault();
        e.stopPropagation();
        
        // Check if this was a click (short duration) or a drag
        const dragDuration = Date.now() - dragStartTime;
        if (dragDuration < 200 && !resizeMode) {
            // It was a click, open the task
            onTaskClick(draggedTask);
        }
        
        setIsDragging(false);
        setDraggedTask(null);
        setResizeMode(null);
    };

    const handleTaskClick = (task, e) => {
        // Only handle click if we're not dragging
        if (!isDragging) {
            onTaskClick(task);
        }
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
                <div className="timeline-grid">
                    {timePeriods.map((period, index) => (
                        <div key={period.label} className="timeline-period">
                            <div className="period-header">
                                <span className="period-name">{period.label}</span>
                                <span className="period-time">{formatTime(period.start)} - {formatTime(period.end)}</span>
                            </div>
                            <div className="period-content">
                                <div className="time-markers">
                                    {Array.from({ length: period.end - period.start }, (_, i) => period.start + i).map(hour => (
                                        <div key={hour} className="time-marker">
                                            <span className="hour-label">{formatTime(hour)}</span>
                                            <div className="time-divisions">
                                                <div className="half-hour"></div>
                                                <div className="quarter-hour"></div>
                                                <div className="quarter-hour"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="period-tasks">
                                    {tasks
                                        .filter(task => {
                                            const taskHour = new Date(task.startTime).getHours();
                                            const taskEndHour = taskHour + task.duration;
                                            return (taskHour >= period.start && taskHour < period.end) || 
                                                   (taskEndHour > period.start && taskEndHour <= period.end) ||
                                                   (taskHour < period.start && taskEndHour > period.end);
                                        })
                                        .map(task => (
                                            <div
                                                key={task.id}
                                                className={`timeline-task ${task.priority.toLowerCase()}`}
                                                style={calculateTaskPosition(task, period)}
                                                onClick={(e) => handleTaskClick(task, e)}
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
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Timeline; 