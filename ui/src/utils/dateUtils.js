/**
 * Format a date for display
 * @param {string|Date} d - Date string or Date object
 * @returns {string} Formatted date string
 */
export function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
