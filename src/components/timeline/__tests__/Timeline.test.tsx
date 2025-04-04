import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, test, expect } from 'vitest';
import { Timeline } from '../Timeline';
import { TimelineEntry } from '../types';

// Mock the TimelineStep component
vi.mock('../components/TimelineStep', () => ({
  default: ({ entry, index, isSelected, onSelect }: any) => (
    <div 
      data-testid={`timeline-step-${index}`}
      data-selected={isSelected.toString()}
      onClick={() => onSelect(index)}
    >
      <span>{entry.type}</span>
      {entry.content && <span>{entry.content}</span>}
      {entry.command && <span>{entry.command}</span>}
    </div>
  )
}));

describe('Timeline Component', () => {
  const mockOnStepSelect = vi.fn();
  const mockOnCommandClick = vi.fn();
  const mockFormatTimelineDate = vi.fn().mockReturnValue('12:34 PM');

  // Basic test to ensure the component renders
  test('renders without crashing', () => {
    const entries: TimelineEntry[] = [
      {
        type: 'message',
        timestamp: '2025-03-28T12:34:56Z',
        content: 'Test content 1',
        actorType: 'User'
      },
      {
        type: 'message',
        timestamp: '2025-03-28T12:35:56Z',
        content: 'Test content 2',
        actorType: 'Assistant'
      }
    ];

    render(
      <Timeline
        entries={entries}
        selectedIndex={0}
        onStepSelect={mockOnStepSelect}
        onCommandClick={mockOnCommandClick}
        formatTimelineDate={mockFormatTimelineDate}
        createdAt="2025-03-28T12:34:56Z"
      />
    );

    expect(screen.getByTestId('timeline-step-0')).toBeInTheDocument();
    expect(screen.getByTestId('timeline-step-1')).toBeInTheDocument();
  });

  // Test for empty state
  test('renders empty state when no entries are provided', () => {
    render(
      <Timeline
        entries={[]}
        selectedIndex={0}
        onStepSelect={mockOnStepSelect}
        onCommandClick={mockOnCommandClick}
        formatTimelineDate={mockFormatTimelineDate}
        createdAt="2025-03-28T12:34:56Z"
      />
    );

    expect(screen.getByText('No timeline entries available')).toBeInTheDocument();
  });

  // Test for selected step
  test('passes isSelected prop correctly to TimelineStep', () => {
    const entries: TimelineEntry[] = [
      {
        type: 'message',
        timestamp: '2025-03-28T12:34:56Z',
        content: 'Test content 1',
        actorType: 'User'
      },
      {
        type: 'message',
        timestamp: '2025-03-28T12:35:56Z',
        content: 'Test content 2',
        actorType: 'Assistant'
      }
    ];

    render(
      <Timeline
        entries={entries}
        selectedIndex={1}
        onStepSelect={mockOnStepSelect}
        onCommandClick={mockOnCommandClick}
        formatTimelineDate={mockFormatTimelineDate}
        createdAt="2025-03-28T12:34:56Z"
      />
    );

    expect(screen.getByTestId('timeline-step-0')).toHaveAttribute('data-selected', 'false');
    expect(screen.getByTestId('timeline-step-1')).toHaveAttribute('data-selected', 'true');
  });

  // Test for different entry types
  test('renders different types of timeline entries', () => {
    const entries: TimelineEntry[] = [
      {
        type: 'message',
        timestamp: '2025-03-28T12:34:56Z',
        content: 'Test message',
        actorType: 'User'
      },
      {
        type: 'command',
        timestamp: '2025-03-28T12:35:56Z',
        command: 'ls -la',
        actorType: 'Assistant'
      },
      {
        type: 'edit',
        timestamp: '2025-03-28T12:36:56Z',
        path: '/path/to/file.txt',
        actorType: 'Assistant'
      }
    ];

    render(
      <Timeline
        entries={entries}
        selectedIndex={0}
        onStepSelect={mockOnStepSelect}
        onCommandClick={mockOnCommandClick}
        formatTimelineDate={mockFormatTimelineDate}
        createdAt="2025-03-28T12:34:56Z"
      />
    );

    expect(screen.getByText('message')).toBeInTheDocument();
    expect(screen.getByText('command')).toBeInTheDocument();
    expect(screen.getByText('edit')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
    expect(screen.getByText('ls -la')).toBeInTheDocument();
  });
});