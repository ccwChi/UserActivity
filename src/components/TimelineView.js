'use client';

import React, { useMemo, useState } from 'react';
import {
    eachDayOfInterval,
    format,
    differenceInDays,
    min,
    max,
    addDays,
    isValid
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

// Person colors (same as monthly view)
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

export function TimelineView({ allPeopleData }) {
    const [selectedTask, setSelectedTask] = useState(null);

    // Calculate date range from all tasks
    const { startDate, endDate, totalDays } = useMemo(() => {
        const allDates = [];

        allPeopleData.forEach(person => {
            person.tasks.forEach(task => {
                if (task.estStart && isValid(task.estStart)) allDates.push(task.estStart);
                if (task.estEnd && isValid(task.estEnd)) allDates.push(task.estEnd);
                if (task.actualEnd && isValid(task.actualEnd)) allDates.push(task.actualEnd);
            });
        });

        if (allDates.length === 0) {
            const now = new Date();
            return { startDate: now, endDate: addDays(now, 30), totalDays: 30 };
        }

        const minDate = min(allDates);
        const maxDate = max(allDates);
        const start = addDays(minDate, -5);
        const end = addDays(maxDate, 5);
        const days = differenceInDays(end, start) + 1;

        return { startDate: start, endDate: end, totalDays: days };
    }, [allPeopleData]);

    const DAY_WIDTH = 30; // pixels per day

    // Generate month headers
    const monthHeaders = useMemo(() => {
        const headers = [];
        let currentMonth = null;
        let monthStart = 0;

        for (let i = 0; i < totalDays; i++) {
            const day = addDays(startDate, i);
            const monthKey = format(day, 'yyyy-MM');

            if (monthKey !== currentMonth) {
                if (currentMonth !== null) {
                    headers.push({
                        month: currentMonth,
                        start: monthStart,
                        width: i - monthStart
                    });
                }
                currentMonth = monthKey;
                monthStart = i;
            }
        }

        // Add last month
        if (currentMonth !== null) {
            headers.push({
                month: currentMonth,
                start: monthStart,
                width: totalDays - monthStart
            });
        }

        return headers;
    }, [startDate, totalDays]);

    return (
        <div className="bg-white border border-gray-300 rounded-lg p-6 overflow-x-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Timeline View
            </h3>

            <div className="min-w-fit">
                {/* Month headers */}
                <div className="flex border-b border-gray-300 mb-2 sticky top-0 bg-white z-10">
                    <div className="w-32 shrink-0"></div>
                    <div className="flex">
                        {monthHeaders.map((header, idx) => (
                            <div
                                key={idx}
                                className="border-r border-gray-300 px-2 py-2 text-sm font-medium text-gray-700"
                                style={{ width: header.width * DAY_WIDTH }}
                            >
                                {format(new Date(header.month), 'MMM yyyy')}
                            </div>
                        ))}
                    </div>
                </div>

                {/* People rows */}
                {allPeopleData.map((person, personIdx) => {
                    // Get tasks for this person
                    const personTasks = person.tasks.filter(task => {
                        const start = task.estStart || task.actualEnd;
                        const end = task.estEnd || task.actualEnd;
                        return start && end;
                    });

                    // Stack tasks to avoid overlap
                    const taskRows = [];
                    personTasks.forEach(task => {
                        const start = task.estStart || task.actualEnd;
                        const end = task.estEnd || task.actualEnd;

                        // Find available row
                        let placed = false;
                        for (let row of taskRows) {
                            const hasOverlap = row.some(t => {
                                const tStart = t.estStart || t.actualEnd;
                                const tEnd = t.estEnd || t.actualEnd;
                                return !(end < tStart || start > tEnd);
                            });
                            if (!hasOverlap) {
                                row.push(task);
                                placed = true;
                                break;
                            }
                        }
                        if (!placed) {
                            taskRows.push([task]);
                        }
                    });

                    const rowHeight = Math.max(taskRows.length * 36 + 20, 60);

                    return (
                        <div key={personIdx} className="flex border-b border-gray-200 hover:bg-gray-50 transition-colors">
                            {/* Person name */}
                            <div className="w-32 shrink-0 p-3 font-medium text-gray-900 flex items-center sticky left-0 bg-white z-10">
                                {person.name}
                            </div>

                            {/* Timeline area */}
                            <div className="relative" style={{ width: totalDays * DAY_WIDTH, minHeight: rowHeight }}>
                                {/* Grid lines */}
                                <div className="absolute inset-0 flex pointer-events-none">
                                    {Array.from({ length: totalDays }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="border-r border-gray-200 h-full"
                                            style={{ width: DAY_WIDTH }}
                                        />
                                    ))}
                                </div>

                                {/* Task bars with 3D effect */}
                                {taskRows.map((row, rowIdx) => (
                                    <div key={rowIdx} className="absolute w-full" style={{ top: 10 + rowIdx * 36 }}>
                                        {row.map((task, taskIdx) => {
                                            const taskStart = task.estStart || task.actualEnd;
                                            const taskEnd = task.estEnd || task.actualEnd;
                                            const startOffset = differenceInDays(taskStart, startDate);
                                            const duration = differenceInDays(taskEnd, taskStart) + 1;

                                            return (
                                                <motion.div
                                                    key={task.id}
                                                    initial={{ opacity: 0, scaleX: 0 }}
                                                    animate={{ opacity: 1, scaleX: 1 }}
                                                    transition={{ duration: 0.3, delay: personIdx * 0.05 }}
                                                    className={`
                            absolute h-7 rounded cursor-pointer
                            ${getColorForPerson(person.name)}
                            flex items-center px-3 text-xs text-white font-medium
                            origin-left
                            transform transition-all duration-200
                            hover:scale-105 hover:z-50 hover:shadow-lg
                            ${selectedTask?.id === task.id ? 'scale-105 z-50 shadow-lg ring-2 ring-white' : ''}
                          `}
                                                    style={{
                                                        left: startOffset * DAY_WIDTH,
                                                        width: duration * DAY_WIDTH - 4,
                                                        zIndex: selectedTask?.id === task.id ? 100 : 10 + taskIdx,
                                                        boxShadow: `0 ${2 + taskIdx}px ${4 + taskIdx * 2}px rgba(0,0,0,0.15)`,
                                                    }}
                                                    onClick={() => setSelectedTask(selectedTask?.id === task.id ? null : task)}
                                                    onMouseEnter={() => setSelectedTask(task)}
                                                    onMouseLeave={() => setSelectedTask(null)}
                                                >
                                                    <span className="truncate">{task.item}</span>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
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
                            <div className="text-sm text-gray-700">
                                <div className="font-medium">{selectedTask.item}</div>
                                <div className="text-xs text-gray-500 mt-1">類別: {selectedTask.category}</div>
                                <div className="text-xs text-gray-500">
                                    {format(selectedTask.estStart || selectedTask.actualEnd, 'MM/dd')} - {format(selectedTask.estEnd || selectedTask.actualEnd, 'MM/dd')}
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
