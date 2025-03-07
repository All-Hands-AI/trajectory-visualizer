import { convertOpenHandsTrajectory } from '../openhands-converter';

describe('Output Format Converter', () => {
  const timestamp = '2025-03-04T19:57:40.638806';

  const sampleOutputFormat = {
    instance_id: 'scikit-learn__scikit-learn-25973',
    test_result: {
      git_patch: 'diff --git a/file.py b/file.py\nindex abc..def 100644\n--- a/file.py\n+++ b/file.py\n@@ -1,3 +1,4 @@\n+# New line\n def test():\n     pass\n',
    },
    instruction: 'Please help me fix this code',
    metadata: {
      agent_class: 'CodeActAgent',
      llm_config: {
        model: 'gpt-4',
      },
    },
    history: [
      {
        id: 0,
        timestamp,
        source: 'user',
        message: 'Please help me fix this code',
        action: 'message',
      },
      {
        id: 1,
        timestamp,
        source: 'assistant',
        message: 'Let me analyze the code',
        action: 'think',
        args: {
          thought: 'I need to understand what the code does first'
        }
      },
      {
        id: 2,
        timestamp,
        source: 'assistant',
        message: 'Checking the code',
        action: 'execute_bash',
        args: {
          command: 'cat file.py'
        }
      }
    ],
    report: {
      empty_generation: false,
      resolved: true,
      failed_apply_patch: false,
      error_eval: false,
      test_timeout: false
    }
  };

  it('should convert output.json format to timeline entries', () => {
    const entries = convertOpenHandsTrajectory(sampleOutputFormat.history);

    // First entry is always a message showing the start
    expect(entries[0]).toMatchObject({
      type: 'message',
      title: 'Starting trajectory visualization',
      content: 'Trajectory loaded from OpenHands format',
      actorType: 'System'
    });

    // User message
    expect(entries[1]).toMatchObject({
      type: 'message',
      timestamp,
      title: 'Please help me fix this code',
      actorType: 'User'
    });

    // Assistant thought
    expect(entries[2]).toMatchObject({
      type: 'message',
      timestamp,
      title: 'Let me analyze the code',
      content: 'I need to understand what the code does first',
      actorType: 'Assistant'
    });

    // Assistant command
    expect(entries[3]).toMatchObject({
      type: 'command',
      timestamp,
      title: 'Checking the code',
      command: 'cat file.py',
      actorType: 'Assistant'
    });
  });

  it('should handle output.json format with minimal fields', () => {
    const minimalHistory = [
      {
        timestamp,
        source: 'user',
        message: 'Help me',
      },
      {
        timestamp,
        source: 'assistant',
        action: 'execute_bash',
        args: {
          command: 'ls'
        }
      }
    ];

    const entries = convertOpenHandsTrajectory(minimalHistory);
    expect(entries).toHaveLength(3); // Start message + 2 entries

    expect(entries[1]).toMatchObject({
      type: 'message',
      timestamp,
      title: 'Help me',
      actorType: 'User'
    });

    expect(entries[2]).toMatchObject({
      type: 'command',
      timestamp,
      command: 'ls',
      actorType: 'Assistant'
    });
  });
});