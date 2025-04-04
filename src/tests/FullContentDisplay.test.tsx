import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, test, expect } from 'vitest';
import { Timeline } from '../components/timeline/Timeline';
import { TimelineEntry } from '../components/timeline/types';

describe('Full Content Display Test', () => {
  // Mock the formatTimelineDate function
  const mockFormatTimelineDate = vi.fn().mockReturnValue('12:34 PM');
  const mockOnStepSelect = vi.fn();

  test('timeline should display full content without truncation', () => {
    // Create a timeline entry with a long command and content
    const longCommand = 'npm install --save-dev @types/react @types/react-dom @types/node typescript ts-node ts-loader webpack webpack-cli webpack-dev-server html-webpack-plugin style-loader css-loader';
    const longContent = `This is a very long content that should not be truncated in the timeline view.
It contains multiple lines of text.
Line 1
Line 2
Line 3
Line 4
Line 5`;

    const entries: TimelineEntry[] = [
      {
        type: 'message',
        timestamp: new Date().toISOString(),
        title: 'Starting trajectory visualization',
        content: 'Trajectory loaded from OpenHands format',
        actorType: 'System',
        command: '',
        path: ''
      },
      {
        type: 'command',
        timestamp: new Date().toISOString(),
        title: 'Running command',
        content: '',
        actorType: 'Assistant',
        command: longCommand,
        path: ''
      },
      {
        type: 'message',
        timestamp: new Date().toISOString(),
        title: 'Long message',
        content: longContent,
        actorType: 'User',
        command: '',
        path: ''
      }
    ];

    // Render the Timeline component with the entries
    render(
      <Timeline
        entries={entries}
        selectedIndex={0}
        onStepSelect={mockOnStepSelect}
        formatTimelineDate={mockFormatTimelineDate}
        createdAt={new Date().toISOString()}
      />
    );

    // Check if the long command is fully displayed (not truncated)
    const commandElement = screen.getByText(/npm install --save-dev/);
    expect(commandElement).toBeInTheDocument();
    
    // Get the command element's parent div
    const commandParent = commandElement.closest('div');
    
    // Check that the command parent doesn't have the line-clamp-1 class
    expect(commandParent).not.toHaveClass('line-clamp-1');

    // Check if the long content is fully displayed (not truncated)
    const contentElement = screen.getByText(/This is a very long content/);
    expect(contentElement).toBeInTheDocument();
    
    // Get the content element's parent div
    const contentParent = contentElement.closest('div');
    
    // Check that the content parent doesn't have the line-clamp-1 class
    expect(contentParent).not.toHaveClass('line-clamp-1');
  });
});