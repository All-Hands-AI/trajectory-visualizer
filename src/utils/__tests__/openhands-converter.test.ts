import { convertOpenHandsTrajectory } from '../openhands-converter';

describe('OpenHands Trajectory Converter', () => {
  const timestamp = '2025-03-07T10:05:27Z';

  const sampleTrajectory = [
    {
      id: 1,
      timestamp,
      source: 'user',
      message: 'Starting task',
      cause: 'User request',
      action: 'execute_bash',
      args: {
        command: 'ls -la'
      },
      tool_call_metadata: {
        tool_name: 'execute_bash',
        tool_args: {
          command: 'ls -la'
        }
      }
    },
    {
      id: 2,
      timestamp,
      source: 'system',
      message: 'Command output',
      observation: 'command_output',
      content: 'total 12\ndrwxr-xr-x 2 user user 4096 Mar  7 10:05 .',
      extras: {
        exit_code: 0
      },
      success: true
    },
    {
      id: 3,
      timestamp,
      source: 'user',
      message: 'Editing file',
      cause: 'Need to modify code',
      action: 'str_replace_editor',
      args: {
        path: '/path/to/file.txt',
        command: 'str_replace',
        old_str: 'old content',
        new_str: 'new content'
      }
    },
    {
      id: 4,
      timestamp,
      source: 'system',
      message: 'File edited',
      observation: 'file_edited',
      content: 'File edited successfully',
      success: true
    },
    {
      id: 5,
      timestamp,
      source: 'user',
      message: 'Searching web',
      cause: 'Need information',
      action: 'web_read',
      args: {
        url: 'https://example.com'
      }
    },
    {
      id: 6,
      timestamp,
      source: 'system',
      message: 'Web content',
      observation: 'web_content',
      content: 'Example Domain',
      success: true
    },
    {
      id: 7,
      timestamp,
      source: 'system',
      message: 'Error occurred',
      observation: 'error',
      content: 'Command failed',
      success: false
    }
  ];

  it('should convert OpenHands trajectory to timeline entries', () => {
    const entries = convertOpenHandsTrajectory(sampleTrajectory);

    // First entry is always a message showing the start
    expect(entries[0]).toMatchObject({
      type: 'message',
      title: 'Starting trajectory visualization',
      content: 'Trajectory loaded from OpenHands format'
    });

    // Command entry
    expect(entries[1]).toMatchObject({
      type: 'command',
      timestamp,
      title: 'Starting task',
      thought: 'User request',
      command: 'ls -la',
      metadata: {
        tool_name: 'execute_bash',
        command: 'ls -la'
      }
    });

    // Command output
    expect(entries[2]).toMatchObject({
      type: 'message',
      timestamp,
      title: 'Command output',
      content: 'total 12\ndrwxr-xr-x 2 user user 4096 Mar  7 10:05 .',
      metadata: {
        exit_code: 0
      }
    });

    // File edit
    expect(entries[3]).toMatchObject({
      type: 'edit',
      timestamp,
      title: 'Editing file',
      thought: 'Need to modify code',
      path: '/path/to/file.txt'
    });

    // File edit result
    expect(entries[4]).toMatchObject({
      type: 'message',
      timestamp,
      title: 'File edited',
      content: 'File edited successfully'
    });

    // Web search
    expect(entries[5]).toMatchObject({
      type: 'search',
      timestamp,
      title: 'Searching web',
      thought: 'Need information'
    });

    // Web content
    expect(entries[6]).toMatchObject({
      type: 'message',
      timestamp,
      title: 'Web content',
      content: 'Example Domain'
    });

    // Error
    expect(entries[7]).toMatchObject({
      type: 'error',
      timestamp,
      title: 'Error occurred',
      content: 'Command failed'
    });
  });

  it('should handle empty trajectory', () => {
    const entries = convertOpenHandsTrajectory([]);
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      type: 'message',
      title: 'Starting trajectory visualization'
    });
  });

  it('should correctly identify user and assistant messages', () => {
    const trajectory = [
      {
        id: 1,
        timestamp: '2025-03-07T13:22:20.840987',
        source: 'user',
        message: 'Please read the README',
        observation: 'user_message',
        content: 'Please read the README'
      },
      {
        id: 2,
        timestamp: '2025-03-07T13:22:21.123456',
        source: 'assistant',
        message: 'I will help you with that',
        action: 'execute_bash',
        args: {
          command: 'cat README.md'
        }
      },
      {
        id: 3,
        timestamp: '2025-03-07T13:22:21.234567',
        source: 'system',
        message: 'Command output',
        observation: 'command_output',
        content: '# Example\nThis is a readme'
      }
    ];

    const entries = convertOpenHandsTrajectory(trajectory);

    // First entry is always the start message
    expect(entries[0].type).toBe('message');
    expect(entries[0].title).toBe('Starting trajectory visualization');

    // User message
    expect(entries[1]).toMatchObject({
      type: 'message',
      title: 'Please read the README',
      content: 'Please read the README',
      actorType: 'User'
    });

    // Assistant action
    expect(entries[2]).toMatchObject({
      type: 'command',
      title: 'I will help you with that',
      command: 'cat README.md',
      actorType: 'Assistant'
    });

    // System output
    expect(entries[3]).toMatchObject({
      type: 'message',
      title: 'Command output',
      content: '# Example\nThis is a readme',
      actorType: 'System'
    });
  });

  it('should handle missing optional fields', () => {
    const minimalTrajectory = [
      {
        action: 'execute_bash',
        args: { command: 'ls' }
      },
      {
        observation: 'command_output',
        content: 'file.txt'
      }
    ];

    const entries = convertOpenHandsTrajectory(minimalTrajectory);
    expect(entries).toHaveLength(3); // Start message + 2 entries

    expect(entries[1]).toMatchObject({
      type: 'command',
      command: 'ls'
    });

    expect(entries[2]).toMatchObject({
      type: 'message',
      content: 'file.txt'
    });
  });

  it('should handle new format with entries array', () => {
    const newFormatData = {
      entries: [
        {
          id: 1,
          timestamp: '2025-03-07T17:45:00.000Z',
          type: 'message',
          content: 'Hello, I need help with my code.',
          source: 'user',
          observation: 'user_message'
        },
        {
          id: 2,
          timestamp: '2025-03-07T17:45:10.000Z',
          type: 'thought',
          content: 'Let me analyze the code and identify potential issues.',
          source: 'assistant',
          observation: 'assistant_message'
        }
      ]
    };

    const result = convertOpenHandsTrajectory(newFormatData);

    // First entry is always a system message
    expect(result[0]).toMatchObject({
      type: 'message',
      actorType: 'System',
      title: 'Starting trajectory visualization'
    });

    // Second entry is the user message
    expect(result[1]).toMatchObject({
      type: 'message',
      timestamp: '2025-03-07T17:45:00.000Z',
      content: 'Hello, I need help with my code.',
      actorType: 'User'
    });

    // Third entry is the assistant message
    expect(result[2]).toMatchObject({
      type: 'message',
      timestamp: '2025-03-07T17:45:10.000Z',
      content: 'Let me analyze the code and identify potential issues.',
      actorType: 'Assistant'
    });
  });

  it('should handle history format', () => {
    const historyData = {
      history: [
        {
          id: 0,
          timestamp: '2025-03-07T17:45:00.000Z',
          source: 'user',
          message: 'Hello, I need help with my code.',
          action: 'message',
          args: {
            content: 'Hello, I need help with my code.'
          }
        },
        {
          id: 1,
          timestamp: '2025-03-07T17:45:10.000Z',
          source: 'agent',
          message: 'Let me check the code.',
          action: 'read',
          args: {
            path: '/workspace/code.py',
            content: 'def hello():\n    print("Hello")'
          }
        },
        {
          id: 2,
          timestamp: '2025-03-07T17:45:20.000Z',
          source: 'agent',
          message: 'Running tests',
          action: 'execute_bash',
          args: {
            command: 'python -m pytest'
          }
        }
      ]
    };

    const entries = convertOpenHandsTrajectory(historyData);
    
    // First entry is a message
    expect(entries[0]).toMatchObject({
      type: 'message',
      timestamp: '2025-03-07T17:45:00.000Z',
      title: 'Hello, I need help with my code.',
      content: 'Hello, I need help with my code.',
      actorType: 'User'
    });

    // Second entry is a search (read)
    expect(entries[1]).toMatchObject({
      type: 'search',
      timestamp: '2025-03-07T17:45:10.000Z',
      title: 'Let me check the code.',
      content: 'def hello():\n    print("Hello")',
      actorType: 'Assistant',
      path: '/workspace/code.py'
    });

    // Third entry is a command
    expect(entries[2]).toMatchObject({
      type: 'command',
      timestamp: '2025-03-07T17:45:20.000Z',
      title: 'Running tests',
      actorType: 'Assistant',
      command: 'python -m pytest'
    });
  });

  it('should handle git patch format', () => {
    const gitPatchData = {
      test_result: {
        git_patch: 'diff --git a/file1.txt b/file1.txt\nindex 123..456 789\n--- a/file1.txt\n+++ b/file1.txt\n@@ -1,1 +1,1 @@\n-old\n+new\ndiff --git a/file2.txt b/file2.txt\nindex 789..012 345\n--- a/file2.txt\n+++ b/file2.txt\n@@ -1,1 +1,1 @@\n-foo\n+bar'
      }
    };

    const entries = convertOpenHandsTrajectory(gitPatchData);
    expect(entries).toHaveLength(3); // Git patch message + 2 file changes

    // First entry is the git patch
    expect(entries[0]).toMatchObject({
      type: 'message',
      title: 'Git Patch',
      content: gitPatchData.test_result.git_patch,
      actorType: 'System'
    });

    // Second entry is the first file change
    expect(entries[1]).toMatchObject({
      type: 'edit',
      title: 'Changes in file1.txt',
      path: 'file1.txt',
      actorType: 'System'
    });

    // Third entry is the second file change
    expect(entries[2]).toMatchObject({
      type: 'edit',
      title: 'Changes in file2.txt',
      path: 'file2.txt',
      actorType: 'System'
    });
  });

  it('should handle invalid formats with error', () => {
    // Invalid format - not an array or object with entries
    expect(() => convertOpenHandsTrajectory({} as any)).toThrow('Invalid trajectory format');

    // Invalid format - entries is not an array
    expect(() => convertOpenHandsTrajectory({ entries: 'not an array' } as any)).toThrow('Events must be an array');

    // Invalid format - test_result without git_patch
    expect(() => convertOpenHandsTrajectory({ test_result: {} } as any)).toThrow('Invalid trajectory format');
  });

  it('should correctly process the message "Please read the README" through all steps', () => {
    // Step 1: Test the raw trajectory entry
    const trajectoryEntry = {
      id: 1,
      timestamp: '2025-03-07T13:22:36.000Z',
      source: 'user',  // This should be a user message
      message: 'Please read the README and then upgrade the npm dependencies.',
      observation: 'user_message',
      content: 'Please read the README and then upgrade the npm dependencies.'
    };

    // Step 2: Test conversion in openhands-converter
    const entries = convertOpenHandsTrajectory([trajectoryEntry]);
    
    // Verify the start message (first entry)
    expect(entries[0]).toMatchObject({
      type: 'message',
      title: 'Starting trajectory visualization',
      content: 'Trajectory loaded from OpenHands format',
      actorType: 'System'
    });

    // Verify the converted message entry
    const convertedEntry = entries[1];
    expect(convertedEntry).toMatchObject({
      type: 'message',
      timestamp: '2025-03-07T13:22:36.000Z',
      content: trajectoryEntry.content,
      actorType: 'User'
    });

    // Step 4: Verify the entry has all required fields for rendering
    expect(convertedEntry).toHaveProperty('timestamp');
    expect(convertedEntry).toHaveProperty('type', 'message');
    expect(convertedEntry).toHaveProperty('content');
    expect(convertedEntry).toHaveProperty('actorType', 'User');
    expect(convertedEntry.metadata).toBeDefined();
  });
});