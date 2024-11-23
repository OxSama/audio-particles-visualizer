/**
 * Formats seconds into MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string (MM:SS)
 */
export function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Converts MM:SS format to seconds
 * @param {string} timeString - Time in MM:SS format
 * @returns {number} Time in seconds
 */
export function timeToSeconds(timeString) {
    const [minutes, seconds] = timeString.split(':').map(Number);
    return minutes * 60 + seconds;
}

/**
 * Calculates percentage of current time in total duration
 * @param {number} currentTime - Current time in seconds
 * @param {number} duration - Total duration in seconds
 * @returns {number} Percentage (0-100)
 */
export function calculateProgress(currentTime, duration) {
    if (!duration) return 0;
    return (currentTime / duration) * 100;
}

/**
 * Converts percentage to time value
 * @param {number} percentage - Percentage (0-100)
 * @param {number} duration - Total duration in seconds
 * @returns {number} Time in seconds
 */
export function percentageToTime(percentage, duration) {
    return (percentage / 100) * duration;
}

/**
 * Formats duration for display with appropriate units
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration string
 */
export function formatDuration(seconds) {
    if (seconds < 60) {
        return `${Math.floor(seconds)}s`;
    } else if (seconds < 3600) {
        return formatTime(seconds);
    } else {
        const hours = Math.floor(seconds / 3600);
        const remainingSeconds = seconds % 3600;
        return `${hours}:${formatTime(remainingSeconds)}`;
    }
}