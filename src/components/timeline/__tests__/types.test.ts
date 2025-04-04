import { TimelineEntry } from '../types';
import { describe, test, expect } from 'vitest';

describe('Timeline Types', () => {
  test('TimelineEntry type supports screenshot in metadata', () => {
    // This is a type test, not a runtime test
    // We're just verifying that the TypeScript compiler accepts this structure
    const entry: TimelineEntry = {
      type: 'message',
      timestamp: '2025-03-28T12:34:56Z',
      content: 'Test content',
      actorType: 'Assistant',
      metadata: {
        screenshot: 'data:image/png;base64,abc123'
      }
    };

    // If the type definition is correct, this should compile
    expect(entry.metadata?.screenshot).toBe('data:image/png;base64,abc123');
  });

  test('TimelineEntry type supports all required fields', () => {
    // Test all the required and optional fields
    const entry: TimelineEntry = {
      type: 'message',
      timestamp: '2025-03-28T12:34:56Z',
      title: 'Test title',
      content: 'Test content',
      thought: 'Test thought',
      command: 'test command',
      path: '/path/to/file.txt',
      actorType: 'Assistant',
      metadata: {
        cost: 0.0001,
        screenshot: 'data:image/png;base64,abc123',
        customField: 'custom value'
      }
    };

    // Verify all fields are accessible
    expect(entry.type).toBe('message');
    expect(entry.timestamp).toBe('2025-03-28T12:34:56Z');
    expect(entry.title).toBe('Test title');
    expect(entry.content).toBe('Test content');
    expect(entry.thought).toBe('Test thought');
    expect(entry.command).toBe('test command');
    expect(entry.path).toBe('/path/to/file.txt');
    expect(entry.actorType).toBe('Assistant');
    expect(entry.metadata?.cost).toBe(0.0001);
    expect(entry.metadata?.screenshot).toBe('data:image/png;base64,abc123');
    expect(entry.metadata?.customField).toBe('custom value');
  });
});