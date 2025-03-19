/**
 * Gets a value from an object using a path string with dot notation
 * Example: getNestedValue(obj, "user.profile.name")
 * 
 * @param obj The object to get the value from
 * @param path The path to the value using dot notation
 * @param defaultValue The default value to return if the path doesn't exist
 * @returns The value at the path or the default value
 */
export function getNestedValue(obj: any, path: string, defaultValue: any = undefined): any {
  if (!obj || !path) return defaultValue;
  
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
export function formatValueForDisplay(value: any): string {
  if (value === null || value === undefined) {
    return 'N/A';
  }
  
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  if (typeof value === 'number') {
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