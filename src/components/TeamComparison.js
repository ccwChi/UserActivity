'use client';

import React, { useMemo } from 'react';
import { compareWorkloads, getImbalanceColor } from '../lib/workload-calculator';
import { motion } from 'framer-motion';

export function TeamComparison({ peopleData }) {
    // peopleData = [{ name, tasks }, ...]
    const comparisons = useMemo(() => {
        return compareWorkloads(peopleData);
    }, [peopleData]);

    const maxTasks = Math.max(...comparisons.map(p => p.total), 1);

    return (
        <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-sm">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900">Team Workload Comparison</h3>
                <p className="text-sm text-gray-600 mt-1">Identify workload imbalance across team members</p>
            </div>

            <div className="space-y-4">
                {comparisons.map((person, idx) => {
                    const barWidth = (person.total / maxTasks) * 100;

                    return (
                        <motion.div
                            key={person.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="space-y-2"
                        >
                            {/* Person header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-gray-900">{person.name}</span>
                                    <span className={`
                    px-2 py-0.5 rounded-full text-[10px] font-medium
                    ${person.imbalance === 'overloaded' ? 'bg-red-500/20 text-red-400' : ''}
                    ${person.imbalance === 'high' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                    ${person.imbalance === 'balanced' ? 'bg-emerald-500/20 text-emerald-400' : ''}
                    ${person.imbalance === 'underutilized' ? 'bg-gray-500/20 text-gray-400' : ''}
                  `}>
                                        {person.imbalance === 'overloaded' && '🔥 Overloaded'}
                                        {person.imbalance === 'high' && '⚠️ High'}
                                        {person.imbalance === 'balanced' && '✓ Balanced'}
                                        {person.imbalance === 'underutilized' && '💤 Low'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-xs">
                                    <span className="text-gray-400">
                                        {person.total} tasks
                                    </span>
                                    <span className={`font-medium ${person.deviationPercent > 0 ? 'text-red-400' : 'text-emerald-400'
                                        }`}>
                                        {person.deviationPercent > 0 ? '+' : ''}{person.deviationPercent}%
                                    </span>
                                </div>
                            </div>

                            {/* Bar chart */}
                            <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${barWidth}%` }}
                                    transition={{ delay: idx * 0.1 + 0.2, duration: 0.6 }}
                                    className={`h-full ${getImbalanceColor(person.imbalance)} flex items-center px-3`}
                                >
                                    <div className="flex gap-4 text-xs text-white/90 font-medium">
                                        <span>✓ {person.completed}</span>
                                        <span>⏳ {person.inProgress}</span>
                                        <span>⚠ {person.delayed}</span>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Completion rate indicator */}
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Completion: {person.completionRate}%</span>
                                {person.undated > 0 && (
                                    <span className="text-gray-600">{person.undated} undated</span>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-6 border-t border-gray-300">
                <div className="flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-emerald-500"></div>
                        <span className="text-gray-700">Balanced</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-yellow-500"></div>
                        <span className="text-gray-700">High (&gt;20% above avg)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-red-500"></div>
                        <span className="text-gray-700">Overloaded (&gt;50% above avg)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-gray-500"></div>
                        <span className="text-gray-700">Underutilized (&lt;-30% below avg)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
