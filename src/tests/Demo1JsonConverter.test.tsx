import { describe, test, expect } from 'vitest';
import { convertOpenHandsTrajectory } from '../utils/openhands-converter';
import demo1Data from '../../demo1.json';

describe('Demo1 JSON Converter Test', () => {
  test('convertOpenHandsTrajectory should properly convert demo1.json', () => {
    // Log the demo1.json data
    console.log('Demo1 data length:', demo1Data.length);
    console.log('First few demo1 entries:', JSON.stringify(demo1Data.slice(0, 3), null, 2));
    
    // Convert the demo1.json data to timeline entries
    const timelineEntries = convertOpenHandsTrajectory(demo1Data);
    
    // Log the entries to see what's happening
    console.log('Timeline entries count:', timelineEntries.length);
    console.log('First few entries:', JSON.stringify(timelineEntries.slice(0, 3), null, 2));
    
    // Verify we have entries
    expect(timelineEntries.length).toBeGreaterThan(1);
    
    // Verify the first entry is the "Starting trajectory visualization" entry
    expect(timelineEntries[0].title).toBe('Starting trajectory visualization');
  });
});