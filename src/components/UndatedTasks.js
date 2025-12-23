'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function UndatedTasks({ data }) {
    if (!data || data.length === 0) return null;

    return (
        <div className="w-full bg-white border border-gray-300 rounded-xl p-4 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-8 bg-purple-500 rounded-full"></span>
                Pending / Undated Tasks
            </h3>
            <div className="space-y-2">
                {data.map((item, idx) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-3 bg-gray-50 rounded border border-gray-200 flex items-center justify-between hover:bg-gray-100 transition-colors"
                    >
                        <div>
                            <div className="text-xs text-gray-600 mb-1">{item.category}</div>
                            <div className="text-sm text-gray-900">{item.item}</div>
                        </div>
                        <div className="flex gap-2 text-xs">
                            {item.estimatedTime && (
                                <span className="px-2 py-1 bg-gray-200 rounded text-gray-700">Est: {item.estimatedTime}</span>
                            )}
                            {item.actualTime && (
                                <span className="px-2 py-1 bg-gray-200 rounded text-gray-700">Act: {item.actualTime}</span>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
