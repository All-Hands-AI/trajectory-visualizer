import { TrajectoryData } from '../types/trajectory';

export type JsonlEntry = TrajectoryData;

export interface ParsedJsonlResult {
  entries: JsonlEntry[];
  currentIndex: number;
}

/**
 * Parses a JSONL file where each line is a JSON object with a .history element
 * @param content The JSONL file content as a string
 * @returns An array of parsed JSON objects
 */
export function parseJsonlFile(content: string): JsonlEntry[] {
  const lines = content.split('\n').filter(line => line.trim() !== '');
  
  return lines.map((line, index) => {
    try {
      const parsedLine = JSON.parse(line);
      if (!parsedLine.history || !Array.isArray(parsedLine.history)) {
        // Log warning but still return the parsed line
        return {
          ...parsedLine,
          _warning: `Line ${index + 1} does not have a valid history array`
        };
      }
      return parsedLine;
    } catch (error) {
      // Return an error object instead of logging to console
      return { history: [], error: `Failed to parse line ${index + 1}` };
    }
  });
}

