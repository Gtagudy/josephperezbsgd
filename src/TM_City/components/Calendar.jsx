import React, { useState } from 'react';
import './Calendar.css';

const Calendar = ({ selectedDate, onDateSelect }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const daysInMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        0
    ).getDate();

    const firstDayOfMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1
    ).getDay();

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const navigateMonth = (direction) => {
        setCurrentMonth(new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth() + direction,
            1
        ));
    };

    const isToday = (day) => {
        const today = new Date();
        return day === today.getDate() &&
            currentMonth.getMonth() === today.getMonth() &&
            currentMonth.getFullYear() === today.getFullYear();
    };

    const isSelected = (day) => {
        return day === selectedDate.getDate() &&
            currentMonth.getMonth() === selectedDate.getMonth() &&
            currentMonth.getFullYear() === selectedDate.getFullYear();
    };

    const renderCalendarDays = () => {
        const days = [];
        const totalDays = 42; // 6 rows of 7 days

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(
                <div
                    key={day}
                    className={`calendar-day ${isToday(day) ? 'today' : ''} ${isSelected(day) ? 'selected' : ''}`}
                    onClick={() => onDateSelect(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
                >
                    {day}
                </div>
            );
        }

        // Add empty cells for remaining days
        const remainingDays = totalDays - (firstDayOfMonth + daysInMonth);
        for (let i = 0; i < remainingDays; i++) {
            days.push(<div key={`empty-end-${i}`} className="calendar-day empty"></div>);
        }

        return days;
    };

    return (
        <div className="calendar">
            <div className="calendar-header">
                <button onClick={() => navigateMonth(-1)}>&lt;</button>
                <h2>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h2>
                <button onClick={() => navigateMonth(1)}>&gt;</button>
            </div>
            <div className="calendar-weekdays">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
            </div>
            <div className="calendar-days">
                {renderCalendarDays()}
            </div>
        </div>
    );
};

export default Calendar; 