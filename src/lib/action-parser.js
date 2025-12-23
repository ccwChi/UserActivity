import { parse } from 'date-fns';

/**
 * Parse CSV format action data
 * Format: 類別,項目,預估時間,實際時間,預計開始,預計完成,實際完成
 */
export const parseActionMarkdown = (csvText) => {
    const lines = csvText.split('\n').map(l => l.trim()).filter(l => l);
    const items = [];

    if (lines.length === 0) return [];

    // First line is header
    const headers = lines[0].split(',').map(h => h.trim());

    // Parse data rows (skip header)
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;

        // Split by comma
        const cells = line.split(',').map(c => c.trim());

        if (cells.length < headers.length) continue;

        // Map to object
        const rowData = {};
        headers.forEach((h, index) => {
            rowData[h] = cells[index] || '';
        });

        const category = rowData['類別'];
        const itemTitle = rowData['項目'];

        if (!category || !itemTitle) continue;

        // Parse date helper
        const parseDate = (dateStr) => {
            if (!dateStr || dateStr === '--') return undefined;
            try {
                // Format: M月d日 or --
                const parsed = parse(dateStr, 'M月d日', new Date());
                return parsed;
            } catch (e) {
                return undefined;
            }
        };

        const estStart = parseDate(rowData['預計開始']);
        const estEnd = parseDate(rowData['預計完成']);
        const actualEnd = parseDate(rowData['實際完成']);

        // Status Logic
        let status = 'pending';
        if (actualEnd) status = 'completed';
        else if (estEnd && estEnd < new Date()) status = 'delayed';

        // Create unique ID
        const id = `${category}-${itemTitle}-${i}`;

        items.push({
            id,
            category,
            item: itemTitle,
            estimatedTime: rowData['預估時間'],
            actualTime: rowData['實際時間'],
            estStart,
            estEnd,
            actualEnd,
            status,
            originalRow: rowData
        });
    }

    return items;
};
