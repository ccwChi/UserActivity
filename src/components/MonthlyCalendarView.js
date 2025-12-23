'use client';

import React, { useMemo, useState } from 'react';
import {
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    format,
    isSameDay,
    startOfWeek,
    endOfWeek
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

// Person colors - each person gets one main color
const PERSON_COLORS = {
    'Brian': 'bg-blue-500',
    'Jeff': 'bg-purple-500',
    'Jerry': 'bg-emerald-500',
    'Joey': 'bg-amber-500',
    'Kelvin': 'bg-pink-500',
    'Yammin': 'bg-cyan-500',
};

const getColorForPerson = (personName) => {
    return PERSON_COLORS[personName] || 'bg-gray-500';
};

export function MonthlyCalendarView({ allPeopleData, year, month }) {
    const [selectedTask, setSelectedTask] = useState(null);

    const monthStart = startOfMonth(new Date(year, month));
    const monthEnd = endOfMonth(new Date(year, month));

    // Get calendar grid (including padding days)
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    // Group days into weeks (rows of 7)
    const weeks = [];
    for (let i = 0; i < allDays.length; i += 7) {
        weeks.push(allDays.slice(i, i + 7));
    }

    // Process all tasks to create event bars
    const eventBars = useMemo(() => {
        const bars = [];

        allPeopleData.forEach(person => {
            person.tasks.forEach(task => {
                const start = task.estStart || task.actualEnd;
                const end = task.estEnd || task.actualEnd;

                if (!start || !end) return;

                // Only include tasks that overlap with this month
                if (end < calendarStart || start > calendarEnd) return;

                // Find which cells this task spans
                const taskStart = start < calendarStart ? calendarStart : start;
                const taskEnd = end > calendarEnd ? calendarEnd : end;

                bars.push({
                    id: task.id,
                    person: person.name,
                    task: task.item,
                    category: task.category,
                    start: taskStart,
                    end: taskEnd,
                    status: task.status
                });
            });
        });

        return bars;
    }, [allPeopleData, calendarStart, calendarEnd]);

    // Calculate bar positions for each week
    const getBarPositionsForWeek = (weekDays) => {
        const weekBars = eventBars.filter(bar => {
            return weekDays.some(day => day >= bar.start && day <= bar.end);
        });

        // Group bars by row (to avoid overlap)
        const rows = [];
        weekBars.forEach(bar => {
            // Find first available row
            let placed = false;
            for (let row of rows) {
                const hasOverlap = row.some(existingBar => {
                    return !(bar.end < existingBar.start || bar.start > existingBar.end);
                });
                if (!hasOverlap) {
                    row.push(bar);
                    placed = true;
                    break;
                }
            }
            if (!placed) {
                rows.push([bar]);
            }
        });

        return rows;
    };

    return (
        <div className="bg-white border border-gray-300 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {format(new Date(year, month), 'MMMM yyyy')}
            </h3>

            {/* Week day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-xs font-medium text-gray-600 py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar weeks */}
            <div className="space-y-1">
                {weeks.map((weekDays, weekIdx) => {
                    const barRows = getBarPositionsForWeek(weekDays);
                    const rowHeight = Math.max(barRows.length * 32 + 40, 80); // Dynamic height based on task count

                    return (
                        <div key={weekIdx} className="relative" style={{ minHeight: rowHeight }}>
                            {/* Day cells */}
                            <div className="grid grid-cols-7 gap-1">
                                {weekDays.map((day, dayIdx) => {
                                    const isCurrentMonth = day >= monthStart && day <= monthEnd;
                                    return (
                                        <div
                                            key={dayIdx}
                                            className={`
                        border border-gray-300 rounded p-2 min-h-[60px]
                        ${isCurrentMonth ? 'bg-gray-50' : 'bg-gray-100/50'}
                      `}
                                        >
                                            <span className={`text-xs ${isCurrentMonth ? 'text-gray-700' : 'text-gray-400'}`}>
                                                {format(day, 'd')}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Task bars overlay with 3D effect */}
                            {barRows.map((row, rowIdx) => (
                                <div key={rowIdx} className="absolute top-0 left-0 w-full pointer-events-none" style={{ top: 40 + rowIdx * 32 }}>
                                    {row.map((bar, barIdx) => {
                                        // Calculate position and width
                                        const startDayIndex = weekDays.findIndex(d => isSameDay(d, bar.start) || d > bar.start);
                                        const endDayIndex = weekDays.findIndex(d => isSameDay(d, bar.end));

                                        const actualStart = startDayIndex === -1 ? 0 : startDayIndex;
                                        const actualEnd = endDayIndex === -1 ? 6 : endDayIndex;

                                        const leftPercent = (actualStart / 7) * 100;
                                        const widthPercent = ((actualEnd - actualStart + 1) / 7) * 100;

                                        return (
                                            <motion.div
                                                key={bar.id}
                                                initial={{ opacity: 0, scaleX: 0 }}
                                                animate={{ opacity: 1, scaleX: 1 }}
                                                transition={{ duration: 0.3 }}
                                                className={`
                          absolute h-6 rounded pointer-events-auto cursor-pointer
                          ${getColorForPerson(bar.person)}
                          flex items-center px-2 text-xs text-white font-medium
                          origin-left
                          transform transition-all duration-200
                          hover:scale-105 hover:z-50 hover:shadow-lg
                          ${selectedTask?.id === bar.id ? 'scale-105 z-50 shadow-lg ring-2 ring-white' : ''}
                        `}
                                                style={{
                                                    left: `${leftPercent}%`,
                                                    width: `${widthPercent}%`,
                                                    zIndex: selectedTask?.id === bar.id ? 100 : 10 + barIdx,
                                                    boxShadow: `0 ${2 + barIdx}px ${4 + barIdx * 2}px rgba(0,0,0,0.15)`,
                                                }}
                                                onClick={() => setSelectedTask(selectedTask?.id === bar.id ? null : bar)}
                                                onMouseEnter={() => setSelectedTask(bar)}
                                                onMouseLeave={() => setSelectedTask(null)}
                                            >
                                                <span className="truncate">{bar.person}: {bar.task}</span>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>

            {/* Task detail popup */}
            <AnimatePresence>
                {selectedTask && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-xl p-4 max-w-sm z-[200]"
                    >
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded ${getColorForPerson(selectedTask.person)}`}></div>
                                <span className="font-semibold text-gray-900">{selectedTask.person}</span>
                            </div>
                            <div className="text-sm text-gray-700">
                                <div className="font-medium">{selectedTask.task}</div>
                                <div className="text-xs text-gray-500 mt-1">類別: {selectedTask.category}</div>
                                <div className="text-xs text-gray-500">
                                    {format(selectedTask.start, 'MM/dd')} - {format(selectedTask.end, 'MM/dd')}
                                </div>
                                <div className="text-xs mt-1">
                                    <span className={`px-2 py-0.5 rounded ${selectedTask.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            selectedTask.status === 'delayed' ? 'bg-red-100 text-red-700' :
                                                'bg-gray-100 text-gray-700'
                                        }`}>
                                        {selectedTask.status === 'completed' ? '✓ 完成' :
                                            selectedTask.status === 'delayed' ? '⚠ 延遲' : '⏳ 進行中'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-3 text-xs">
                {Object.entries(PERSON_COLORS).map(([person, color]) => (
                    <div key={person} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded ${color}`}></div>
                        <span className="text-gray-700">{person}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
