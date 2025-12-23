'use client';

import React, { useMemo } from 'react';
import { format, startOfMonth, getDay } from 'date-fns';
import { generateMonthHeatmap, getIntensityColor } from '../lib/workload-calculator';
import { motion } from 'framer-motion';

export function CalendarHeatmap({ tasks, year, month }) {
    const heatmapData = useMemo(() => {
        return generateMonthHeatmap(tasks, year, month);
    }, [tasks, year, month]);

    // Add empty cells for alignment (start from Sunday)
    const firstDayOfMonth = startOfMonth(new Date(year, month));
    const startDayOfWeek = getDay(firstDayOfMonth); // 0 = Sunday
    const emptyCells = Array(startDayOfWeek).fill(null);

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-100 mb-4">
                {format(new Date(year, month), 'MMMM yyyy')}
            </h3>

            {/* Week day headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
                {weekDays.map(day => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
                {/* Empty cells for alignment */}
                {emptyCells.map((_, idx) => (
                    <div key={`empty-${idx}`} className="aspect-square" />
                ))}

                {/* Actual days */}
                {heatmapData.map((day, idx) => (
                    <motion.div
                        key={format(day.date, 'yyyy-MM-dd')}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.01 }}
                        className={`
              aspect-square rounded-lg border border-gray-700 
              ${getIntensityColor(day.intensity)}
              hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer
              flex flex-col items-center justify-center
              group relative
            `}
                        title={`${format(day.date, 'MMM d')}: ${day.taskCount} tasks`}
                    >
                        <span className="text-xs font-medium text-white">
                            {format(day.date, 'd')}
                        </span>
                        {day.taskCount > 0 && (
                            <span className="text-[10px] text-white/80 font-bold">
                                {day.taskCount}
                            </span>
                        )}

                        {/* Tooltip on hover */}
                        {day.tasks.length > 0 && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                                <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl max-w-xs">
                                    <div className="text-xs font-bold text-gray-300 mb-2">
                                        {format(day.date, 'MMM d, yyyy')} ({day.taskCount} tasks)
                                    </div>
                                    <div className="space-y-1 max-h-32 overflow-y-auto">
                                        {day.tasks.slice(0, 5).map(task => (
                                            <div key={task.id} className="text-[10px] text-gray-400 truncate">
                                                • {task.item}
                                            </div>
                                        ))}
                                        {day.tasks.length > 5 && (
                                            <div className="text-[10px] text-gray-500 italic">
                                                +{day.tasks.length - 5} more...
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center justify-center gap-4 text-xs">
                <span className="text-gray-400">Less</span>
                <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map(level => (
                        <div
                            key={level}
                            className={`w-4 h-4 rounded ${getIntensityColor(level)}`}
                        />
                    ))}
                </div>
                <span className="text-gray-400">More</span>
            </div>
        </div>
    );
}
