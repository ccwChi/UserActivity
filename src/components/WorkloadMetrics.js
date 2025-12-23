'use client';

import React from 'react';
import { calculateWorkloadMetrics } from '../lib/workload-calculator';
import { motion } from 'framer-motion';

export function WorkloadMetrics({ tasks, personName }) {
    const metrics = calculateWorkloadMetrics(tasks);

    const categories = Object.entries(metrics.categoryBreakdown)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5); // Top 5 categories

    return (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 space-y-6">
            <div>
                <h3 className="text-xl font-bold text-gray-100 mb-1">{personName}</h3>
                <p className="text-sm text-gray-400">Workload Overview</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800/50 rounded-lg p-4"
                >
                    <div className="text-3xl font-bold text-blue-400">{metrics.total}</div>
                    <div className="text-xs text-gray-400 mt-1">Total Tasks</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gray-800/50 rounded-lg p-4"
                >
                    <div className="text-3xl font-bold text-emerald-400">{metrics.completionRate}%</div>
                    <div className="text-xs text-gray-400 mt-1">Completion Rate</div>
                </motion.div>
            </div>

            {/* Status Breakdown */}
            <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-300">Status</h4>

                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">✓ Completed</span>
                        <span className="font-medium text-emerald-400">{metrics.completed}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">⏳ In Progress</span>
                        <span className="font-medium text-amber-400">{metrics.inProgress}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">⚠ Delayed</span>
                        <span className="font-medium text-red-400">{metrics.delayed}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">📋 Undated</span>
                        <span className="font-medium text-gray-400">{metrics.undated}</span>
                    </div>
                </div>
            </div>

            {/* Category Breakdown */}
            {categories.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-300">Top Categories</h4>
                    <div className="space-y-2">
                        {categories.map(([category, count], idx) => {
                            const percentage = Math.round((count / metrics.total) * 100);
                            return (
                                <div key={category}>
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="text-gray-400 truncate">{category}</span>
                                        <span className="text-gray-500">{count} ({percentage}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-800 rounded-full h-2">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
