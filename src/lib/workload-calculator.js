import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, differenceInDays } from 'date-fns';

/**
 * Calculate workload metrics for a person's tasks
 */
export const calculateWorkloadMetrics = (tasks) => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const delayed = tasks.filter(t => t.status === 'delayed').length;
    const inProgress = tasks.filter(t => t.status !== 'completed' && t.status !== 'delayed').length;

    // Category breakdown
    const categoryCount = {};
    tasks.forEach(task => {
        categoryCount[task.category] = (categoryCount[task.category] || 0) + 1;
    });

    // Calculate tasks per day (for tasks with dates)
    const datedTasks = tasks.filter(t => t.estStart || t.estEnd || t.actualEnd);
    const undatedTasks = tasks.filter(t => !t.estStart && !t.estEnd && !t.actualEnd);

    return {
        total,
        completed,
        delayed,
        inProgress,
        undated: undatedTasks.length,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        categoryBreakdown: categoryCount,
        datedTaskCount: datedTasks.length
    };
};

/**
 * Get tasks for a specific day
 */
export const getTasksForDay = (tasks, date) => {
    return tasks.filter(task => {
        // Check if task is active on this day
        const start = task.estStart || task.actualEnd;
        const end = task.estEnd || task.actualEnd;

        if (!start && !end) return false;

        if (start && end) {
            return date >= start && date <= end;
        } else if (start) {
            return isSameDay(date, start);
        } else if (end) {
            return isSameDay(date, end);
        }

        return false;
    });
};

/**
 * Generate calendar heatmap data for a month
 */
export const generateMonthHeatmap = (tasks, year, month) => {
    const monthStart = startOfMonth(new Date(year, month));
    const monthEnd = endOfMonth(new Date(year, month));
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return days.map(day => {
        const dayTasks = getTasksForDay(tasks, day);
        return {
            date: day,
            taskCount: dayTasks.length,
            tasks: dayTasks,
            intensity: getIntensityLevel(dayTasks.length)
        };
    });
};

/**
 * Determine intensity level based on task count
 */
const getIntensityLevel = (count) => {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 8) return 3;
    return 4; // overloaded
};

/**
 * Compare workload across multiple people
 */
export const compareWorkloads = (peopleData) => {
    // peopleData = [{ name, tasks }, ...]
    const comparisons = peopleData.map(person => {
        const metrics = calculateWorkloadMetrics(person.tasks);
        return {
            name: person.name,
            ...metrics
        };
    });

    // Calculate average for comparison
    const avgTotal = comparisons.reduce((sum, p) => sum + p.total, 0) / comparisons.length;

    // Determine imbalance level
    comparisons.forEach(person => {
        const deviation = ((person.total - avgTotal) / avgTotal) * 100;
        if (deviation > 50) {
            person.imbalance = 'overloaded'; // Red
        } else if (deviation > 20) {
            person.imbalance = 'high'; // Yellow
        } else if (deviation < -30) {
            person.imbalance = 'underutilized'; // Gray
        } else {
            person.imbalance = 'balanced'; // Green
        }
        person.deviationPercent = Math.round(deviation);
    });

    return comparisons;
};

/**
 * Get intensity color class
 */
export const getIntensityColor = (intensity) => {
    const colors = [
        'bg-gray-800', // 0 tasks
        'bg-blue-700', // 1-2 tasks
        'bg-yellow-600', // 3-5 tasks
        'bg-orange-500', // 6-8 tasks
        'bg-red-500' // 9+ tasks
    ];
    return colors[intensity] || colors[0];
};

/**
 * Get imbalance color class
 */
export const getImbalanceColor = (imbalance) => {
    const colors = {
        'balanced': 'bg-emerald-500',
        'high': 'bg-yellow-500',
        'overloaded': 'bg-red-500',
        'underutilized': 'bg-gray-500'
    };
    return colors[imbalance] || colors.balanced;
};
