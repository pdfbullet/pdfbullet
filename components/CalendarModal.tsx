import React, { useState, useEffect } from 'react';

const LeftArrowIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor">
        <path d="M0 0h24v24H0V0z" fill="none"/>
        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59z"/>
    </svg>
);

const RightArrowIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor">
        <path d="M0 0h24v24H0V0z" fill="none"/>
        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z"/>
    </svg>
);

const CalendarModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();

    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const renderCalendarDays = () => {
        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-prev-${i}`} className="p-2"></div>);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
            days.push(
                <div key={day} className={`p-2 text-center rounded-full flex items-center justify-center font-semibold h-10 w-10
                    ${isToday ? 'bg-brand-red text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {day}
                </div>
            );
        }
        return days;
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 dark:bg-black/80 z-[100] flex items-center justify-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="calendar-modal-title"
        >
            <div 
                className="bg-white dark:bg-black w-full max-w-lg rounded-xl shadow-2xl animated-border"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Previous month">
                           <LeftArrowIcon className="h-6 w-6" />
                        </button>
                        <h2 id="calendar-modal-title" className="text-xl font-bold text-gray-800 dark:text-gray-100">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h2>
                        <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Next month">
                            <RightArrowIcon className="h-6 w-6" />
                        </button>
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {daysOfWeek.map(day => <div key={day}>{day}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                        {renderCalendarDays()}
                    </div>
                </div>
                 <div className="p-4 bg-gray-50 dark:bg-gray-900/50 text-center rounded-b-xl">
                    <button onClick={onClose} className="text-brand-red font-semibold hover:underline">Close</button>
                </div>
            </div>
        </div>
    );
};

export default CalendarModal;