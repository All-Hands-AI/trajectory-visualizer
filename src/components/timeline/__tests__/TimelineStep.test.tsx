import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, test, expect } from 'vitest';
import TimelineStep from '../components/TimelineStep';
import { TimelineEntry } from '../types';

// Mock the formatTimelineDate function
const mockFormatTimelineDate = vi.fn().mockReturnValue('12:34 PM');
const mockOnSelect = vi.fn();
const mockOnCommandClick = vi.fn();

describe('TimelineStep Component', () => {
  // Basic test to ensure the component renders
  test('renders without crashing', () => {
    const entry: TimelineEntry = {
      type: 'message',
      timestamp: '2025-03-28T12:34:56Z',
      content: 'Test content',
      actorType: 'Assistant'
    };

    render(
      <TimelineStep
        entry={entry}
        index={0}
        isSelected={false}
        isLast={false}
        formatTimelineDate={mockFormatTimelineDate}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getAllByText('Test content').length).toBeGreaterThan(0);
    expect(screen.getByText('Assistant')).toBeInTheDocument();
  });

  // Test for command rendering
  test('renders command block when command is provided', () => {
    const entry: TimelineEntry = {
      type: 'command',
      timestamp: '2025-03-28T12:34:56Z',
      command: 'ls -la',
      actorType: 'Assistant'
    };

    render(
      <TimelineStep
        entry={entry}
        index={0}
        isSelected={false}
        isLast={false}
        formatTimelineDate={mockFormatTimelineDate}
        onSelect={mockOnSelect}
        onCommandClick={mockOnCommandClick}
      />
    );

    expect(screen.getByText('ls -la')).toBeInTheDocument();
  });

  // Test for thought rendering
  test('renders thought content when thought is provided', () => {
    const entry: TimelineEntry = {
      type: 'message',
      timestamp: '2025-03-28T12:34:56Z',
      thought: 'This is a thought',
      actorType: 'Assistant'
    };

    render(
      <TimelineStep
        entry={entry}
        index={0}
        isSelected={false}
        isLast={false}
        formatTimelineDate={mockFormatTimelineDate}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('This is a thought')).toBeInTheDocument();
  });

  // Test for screenshot rendering
  test('renders screenshot when metadata.screenshot is provided', () => {
    const entry: TimelineEntry = {
      type: 'message',
      timestamp: '2025-03-28T12:34:56Z',
      content: 'Test with screenshot',
      actorType: 'Assistant',
      metadata: {
        screenshot: 'data:image/png;base64,abc123'
      }
    };

    render(
      <TimelineStep
        entry={entry}
        index={0}
        isSelected={false}
        isLast={false}
        formatTimelineDate={mockFormatTimelineDate}
        onSelect={mockOnSelect}
      />
    );

    const screenshot = screen.getByAltText('Screenshot');
    expect(screenshot).toBeInTheDocument();
    expect(screenshot).toHaveAttribute('src', 'data:image/png;base64,abc123');
  });

  // Test for file path rendering
  test('renders file path when path is provided', () => {
    const entry: TimelineEntry = {
      type: 'edit',
      timestamp: '2025-03-28T12:34:56Z',
      path: '/path/to/file.txt',
      actorType: 'Assistant'
    };

    render(
      <TimelineStep
        entry={entry}
        index={0}
        isSelected={false}
        isLast={false}
        formatTimelineDate={mockFormatTimelineDate}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('/path/to/file.txt')).toBeInTheDocument();
  });
});