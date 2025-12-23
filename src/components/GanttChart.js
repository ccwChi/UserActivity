'use client';

import React, { useMemo } from 'react';
import { format, differenceInDays, addDays, startOfWeek, endOfWeek, isWithinInterval, min, max, isValid } from 'date-fns';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function GanttChart({ data }) {
    // 1. Calculate Date Range
    const { startDate, endDate, totalDays } = useMemo(() => {
        const dates = data.flatMap(d => [d.estStart, d.estEnd, d.actualEnd, d.actualStart].filter(d => !!d && isValid(d)));

        if (dates.length === 0) {
            const now = new Date();
            return { startDate: startOfWeek(now), endDate: endOfWeek(now), totalDays: 7 };
        }

        const minDate = min(dates);
        const maxDate = max(dates);
        // Add buffer
        const start = addDays(minDate, -2);
        const end = addDays(maxDate, 5);
        const days = differenceInDays(end, start) + 1;
        return { startDate: start, endDate: end, totalDays: days };
    }, [data]);

    // 2. Generate Timeline Columns
    const calendarCols = useMemo(() => {
        const cols = [];
        for (let i = 0; i < totalDays; i++) {
            const current = addDays(startDate, i);
            cols.push(current);
        }
        return cols;
    }, [startDate, totalDays]);

    // 3. Group by Category
    const groupedData = useMemo(() => {
        const groups = {};
        data.forEach(item => {
            // Filter out items with NO dates at all
            if (!item.estStart && !item.estEnd && !item.actualEnd) return;

            if (!groups[item.category]) groups[item.category] = [];
            groups[item.category].push(item);
        });
        return groups;
    }, [data]);

    const DAY_WIDTH = 40; // px per day

    return (
        <div className="w-full overflow-x-auto border border-gray-700 rounded-xl bg-gray-900 shadow-2xl">
            <div className="min-w-fit relative">
                {/* Header */}
                <div className="flex bg-gray-800 text-gray-300 sticky top-0 z-10 border-b border-gray-700">
                    <div className="w-48 p-4 shrink-0 font-bold bg-gray-800 sticky left-0 z-20 border-r border-gray-700">
                        Category / Task
                    </div>
                    <div className="flex">
                        {calendarCols.map((date, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "flex flex-col items-center justify-center border-r border-gray-700/50 text-xs",
                                    format(date, 'eee') === 'Sun' || format(date, 'eee') === 'Sat' ? 'bg-gray-800/50' : ''
                                )}
                                style={{ width: DAY_WIDTH }}
                            >
                                <span className="opacity-50 text-[10px]">{format(date, 'MMM')}</span>
                                <span className="font-mono">{format(date, 'd')}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Body */}
                <div className="divide-y divide-gray-700/50">
                    {Object.entries(groupedData).map(([category, items]) => (
                        <React.Fragment key={category}>
                            {items.map((item) => {
                                // Calculate position for Planned
                                const planStart = item.estStart ? differenceInDays(item.estStart, startDate) : -1;
                                const planDuration = (item.estStart && item.estEnd)
                                    ? differenceInDays(item.estEnd, item.estStart) + 1
                                    : (item.estEnd ? 1 : 0);

                                // Calculate position for Actual
                                const actStartVal = item.actualStart || (item.estStart || (item.actualEnd ? addDays(item.actualEnd, -1) : undefined));
                                const actStart = actStartVal ? differenceInDays(actStartVal, startDate) : -1;

                                const actDuration = (actStartVal && item.actualEnd)
                                    ? differenceInDays(item.actualEnd, actStartVal) + 1
                                    : (item.actualEnd ? 1 : 0);

                                return (
                                    <div key={item.id} className="flex hover:bg-gray-800/30 transition-colors group">
                                        <div className="w-48 p-3 shrink-0 text-sm font-medium text-gray-200 border-r border-gray-700 sticky left-0 bg-gray-900 group-hover:bg-gray-800/30 z-10 flex flex-col justify-center">
                                            <span className="text-xs text-blue-400 mb-0.5">{category}</span>
                                            <span className="truncate" title={item.item}>{item.item}</span>
                                        </div>

                                        <div className="relative h-16 flex-grow" style={{ width: totalDays * DAY_WIDTH }}>
                                            {/* Grid Lines */}
                                            <div className="absolute inset-0 flex pointer-events-none">
                                                {calendarCols.map((_, i) => (
                                                    <div key={i} className="border-r border-gray-800 h-full" style={{ width: DAY_WIDTH }} />
                                                ))}
                                            </div>

                                            {/* Planned Bar */}
                                            {planStart >= 0 && planDuration > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, scaleX: 0 }}
                                                    animate={{ opacity: 1, scaleX: 1 }}
                                                    transition={{ duration: 0.5, delay: 0.1 }}
                                                    className="absolute h-3 top-4 rounded-full bg-blue-500/30 border border-blue-500/50 text-[10px] flex items-center px-2 overflow-hidden whitespace-nowrap z-0 origin-left"
                                                    style={{
                                                        left: planStart * DAY_WIDTH + 2,
                                                        width: planDuration * DAY_WIDTH - 4
                                                    }}
                                                    title={`Plan: ${format(item.estStart, 'MM/dd')} - ${format(item.estEnd, 'MM/dd')}`}
                                                >
                                                </motion.div>
                                            )}

                                            {/* Actual Bar */}
                                            {actStart >= 0 && actDuration > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, scaleX: 0 }}
                                                    animate={{ opacity: 1, scaleX: 1 }}
                                                    transition={{ duration: 0.5, delay: 0.2 }}
                                                    className={cn(
                                                        "absolute h-4 top-8 rounded-full shadow-lg text-[10px] flex items-center justify-center z-1 origin-left",
                                                        item.status === 'completed' ? "bg-emerald-500" :
                                                            item.status === 'delayed' ? "bg-red-500" : "bg-amber-500"
                                                    )}
                                                    style={{
                                                        left: actStart * DAY_WIDTH + 2,
                                                        width: actDuration * DAY_WIDTH - 4
                                                    }}
                                                    title={`Actual: ${item.actualEnd ? format(item.actualEnd, 'MM/dd') : 'Inrogess'}`}
                                                >
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
}
