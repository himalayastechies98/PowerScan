/**
 * Convert Excel serial date to JavaScript Date string
 * Excel serial dates are the number of days since January 1, 1900
 */
export const excelDateToJS = (excelDate: number): string => {
    if (!excelDate) return '-';
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

/**
 * Convert Excel serial date to JavaScript Time string
 */
export const excelTimeToJS = (excelDate: number): string => {
    if (!excelDate) return '-';
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    return date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};
