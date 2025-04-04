import { TimelineEntry } from '../components/timeline/types';
import { convertOpenHandsTrajectory } from './openhands-converter';
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

/**
 * Converts a JSONL entry to timeline entries
 * @param entry The JSONL entry with a history array
 * @returns An array of timeline entries
 */
export function convertJsonlEntryToTimeline(entry: JsonlEntry): TimelineEntry[] {
  if (!entry.history || !Array.isArray(entry.history)) {
    return [{
      type: 'error',
      timestamp: new Date().toISOString(),
      title: 'Invalid History Format',
      content: 'The history field is missing or not an array',
      actorType: 'System',
      command: '',
      path: ''
    }];
  }

  try {
    return convertOpenHandsTrajectory({ history: entry.history });
  } catch (error) {
    return [{
      type: 'error',
      timestamp: new Date().toISOString(),
      title: 'Error Converting History',
      content: `Failed to convert history: ${error instanceof Error ? error.message : 'Unknown error'}`,
      actorType: 'System',
      command: '',
      path: ''
    }];
  }
}