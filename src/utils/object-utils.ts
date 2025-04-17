/**
 * Gets a value from an object using a path string with dot notation
 * Supports special functions like len() for arrays
 * Examples: 
 *   getNestedValue(obj, "user.profile.name")
 *   getNestedValue(obj, "len(history)")
 * 
 * @param obj The object to get the value from
 * @param path The path to the value using dot notation
 * @param defaultValue The default value to return if the path doesn't exist
 * @returns The value at the path or the default value
 */
export function getNestedValue(obj: any, path: string, defaultValue: any = undefined): any {
  if (!obj || !path) return defaultValue;
  
  // Handle special functions
  if (path === 'duration') {
    if (!obj.history || !Array.isArray(obj.history) || obj.history.length === 0 || !obj.history[0].timestamp) {
      return defaultValue;
    }
    const startTime = new Date(obj.history[0].timestamp);
    const endTime = new Date(obj.history[obj.history.length - 1].timestamp);
    return endTime.getTime() - startTime.getTime();
  }

  if (path.startsWith('len(') && path.endsWith(')')) {
    const innerPath = path.substring(4, path.length - 1);
    const value = getNestedValue(obj, innerPath, null);
    
    if (value === null) return defaultValue;
    
    if (Array.isArray(value)) {
      return value.length;
    }
    
    if (typeof value === 'string') {
      return value.length;
    }
    
    if (typeof value === 'object' && value !== null) {
      return Object.keys(value).length;
    }
    
    return defaultValue;
  }
  
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return defaultValue;
    }
    
    current = current[key];
    
    if (current === undefined) {
      return defaultValue;
    }
  }
  
  return current !== undefined ? current : defaultValue;
}

/**
 * Formats a value for display based on its type
 * 
 * @param value The value to format
 * @returns A string representation of the value
 */
export function formatValueForDisplay(value: any, path?: string): string {
  if (value === null || value === undefined) {
    return 'N/A';
  }
  
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  if (typeof value === 'number') {
    // Special handling for duration values (they come in milliseconds)
    if (path === 'duration') {
      const durationSec = Math.round(value / 1000);
      const durationMin = Math.floor(durationSec / 60);
      const remainingSec = durationSec % 60;
      return durationMin > 0 ? `${durationMin}m ${remainingSec}s` : `${remainingSec}s`;
    }
    // Format numbers with up to 4 decimal places
    return Number.isInteger(value) ? value.toString() : value.toFixed(4);
  }
  
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return `Array(${value.length})`;
    }
    try {
      return JSON.stringify(value).substring(0, 30) + (JSON.stringify(value).length > 30 ? '...' : '');
    } catch (e) {
      return '[Object]';
    }
  }
  
  return String(value);
}