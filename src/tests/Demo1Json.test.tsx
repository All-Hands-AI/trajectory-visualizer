import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, test, expect } from 'vitest';
import { Timeline } from '../components/timeline/Timeline';
import { convertOpenHandsTrajectory } from '../utils/openhands-converter';
import demo1Data from '../../demo1.json';

describe('Demo1 JSON Display Test', () => {
  // Mock the formatTimelineDate function
  const mockFormatTimelineDate = vi.fn().mockReturnValue('12:34 PM');
  const mockOnStepSelect = vi.fn();
  
  test('demo1.json should be properly displayed in the timeline', () => {
    // Convert the demo1.json data to timeline entries
    const timelineEntries = convertOpenHandsTrajectory(demo1Data);
    
    // Log the entries to see what's happening
    console.log('Timeline entries count:', timelineEntries.length);
    console.log('First few entries:', JSON.stringify(timelineEntries.slice(0, 3), null, 2));
    
    // Verify we have entries
    expect(timelineEntries.length).toBeGreaterThan(0);
    
    // Render the Timeline component with the converted entries
    render(
      <Timeline
        entries={timelineEntries}
        selectedIndex={0}
        onStepSelect={mockOnStepSelect}
        formatTimelineDate={mockFormatTimelineDate}
        createdAt={new Date().toISOString()}
      />
    );
    
    // Check if the timeline is rendered with entries
    expect(screen.queryByText('No timeline entries available')).not.toBeInTheDocument();
    
    // Check for the starting entry
    expect(screen.getByText('Starting trajectory visualization')).toBeInTheDocument();
  });
});