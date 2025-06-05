import React, { useState, useRef } from 'react';
import './Timeline.css';

const DAY_START = 7; // 7am
const DAY_END = 23;  // 11pm

// Demo segments for visual feedback
const DEMO_SEGMENTS = [
  {
    id: 'sleep',
    title: 'Sleep',
    type: 'optimal',
    startHour: 23,
    duration: 8,
    color: '#3b82f6',
    xp: 0,
  },
  {
    id: 'morning-task',
    title: 'Morning Project',
    type: 'user',
    startHour: 8,
    duration: 2,
    color: '#f59e42',
    xp: 100,
  },
  {
    id: 'lunch',
    title: 'Lunch',
    type: 'optimal',
    startHour: 12,
    duration: 1,
    color: '#22c55e',
    xp: 0,
  },
  {
    id: 'afternoon-task',
    title: 'Afternoon Study',
    type: 'user',
    startHour: 13,
    duration: 3,
    color: '#f44336',
    xp: 2500,
  },
  {
    id: 'dinner',
    title: 'Dinner',
    type: 'optimal',
    startHour: 18,
    duration: 1,
    color: '#22c55e',
    xp: 0,
  },
  {
    id: 'evening-task',
    title: 'Evening Review',
    type: 'user',
    startHour: 19,
    duration: 2,
    color: '#4CAF50',
    xp: 200,
  },
];

function fillTimelineBar(segments) {
  // Sort by startHour
  const sorted = [...segments].sort((a, b) => a.startHour - b.startHour);
  let filled = [];
  let current = DAY_START;
  for (let i = 0; i < sorted.length; i++) {
    const seg = sorted[i];
    if (seg.startHour > current) {
      filled.push({
        id: `filler-${current}`,
        title: 'Free Time',
        type: 'filler',
        startHour: current,
        duration: seg.startHour - current,
        color: '#6b7280',
        xp: 0,
      });
    }
    filled.push(seg);
    current = seg.startHour + seg.duration;
  }
  if (current < DAY_END) {
    filled.push({
      id: `filler-${current}`,
      title: 'Free Time',
      type: 'filler',
      startHour: current,
      duration: DAY_END - current,
      color: '#6b7280',
      xp: 0,
    });
  }
  return filled;
}

const Timeline = () => {
  // For demo, use the demo segments
  const segments = fillTimelineBar(DEMO_SEGMENTS);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);
  const [resizeMode, setResizeMode] = useState(null);
  const [dragStartTime, setDragStartTime] = useState(0);
  const timelineRef = useRef(null);

  const formatTime = (hour) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
  };

  const calculateTaskPosition = (segment) => {
    const startPercentage = ((segment.startHour - DAY_START) / (DAY_END - DAY_START)) * 100;
    const widthPercentage = (segment.duration / (DAY_END - DAY_START)) * 100;
    return {
      left: `${startPercentage}%`,
      width: `${widthPercentage}%`,
      background: segment.color,
      zIndex: segment.type === 'user' ? 2 : 1,
    };
  };

  // Drag/resize logic omitted for demo (can be added back for real data)

  return (
    <div className="timeline-container">
      <div className="timeline-header">
        <h2>Daily Schedule</h2>
      </div>
      <div className="timeline-bar-container">
        <div className="time-markers">
          {[...Array(DAY_END - DAY_START + 1).keys()].map(i => {
            const hour = DAY_START + i;
            return (
              <div key={hour} className="time-marker">
                <span className="hour-label">{formatTime(hour)}</span>
              </div>
            );
          })}
        </div>
        <div
          ref={timelineRef}
          className="timeline-bar super-wide"
        >
          {segments.map(segment => (
            <div
              key={segment.id}
              className={`timeline-task ${segment.type}`}
              style={calculateTaskPosition(segment)}
            >
              {segment.type === 'user' && (
                <div className="resize-handle start" />
              )}
              <div className="task-content">
                <h4>{segment.title}</h4>
                {segment.xp > 0 && <span className="task-xp">{segment.xp}xp</span>}
                <span className="task-time">
                  {formatTime(Math.floor(segment.startHour))} -
                  {formatTime(Math.floor(segment.startHour + segment.duration))}
                </span>
              </div>
              {segment.type === 'user' && (
                <div className="resize-handle end" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timeline; 