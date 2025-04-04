import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, test, expect } from 'vitest';
import { Timeline } from '../components/timeline/Timeline';
import { convertOpenHandsTrajectory } from '../utils/openhands-converter';

describe('Simple Screenshot Test', () => {
  // Mock the formatTimelineDate function
  const mockFormatTimelineDate = vi.fn().mockReturnValue('12:34 PM');
  const mockOnStepSelect = vi.fn();
  
  test('timeline should properly display entries with screenshots', () => {
    // Create a simple trajectory with a screenshot
    const simpleTrajectory = [
      {
        "id": 1,
        "timestamp": "2025-01-20T20:29:32.262843",
        "source": "user",
        "message": "This is a test message with a screenshot",
        "action": "message",
        "args": {
          "content": "This is a test message with a screenshot",
          "image_urls": [],
          "wait_for_response": false
        },
        "extras": {
          "metadata": {
            "screenshot": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
          }
        }
      }
    ];
    
    // Convert the simple trajectory to timeline entries
    const timelineEntries = convertOpenHandsTrajectory(simpleTrajectory);
    
    // Verify we have entries
    expect(timelineEntries.length).toBeGreaterThan(0);
    
    // Log the entries to see what's happening
    console.log('Timeline entries:', JSON.stringify(timelineEntries, null, 2));
    
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
    
    // Check for the test message
    expect(screen.getByText('This is a test message with a screenshot')).toBeInTheDocument();
    
    // Check for the screenshot
    const screenshot = screen.queryByAltText('Screenshot');
    expect(screenshot).toBeInTheDocument();
  });
});