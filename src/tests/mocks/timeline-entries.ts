import { TimelineEntry } from '../../components/timeline/types';

/**
 * Mock function to convert test trajectory data to timeline entries
 * This replaces the old convertOpenHandsTrajectory function for tests
 */
export function createMockTimelineEntries(testData: any[]): TimelineEntry[] {
  // Add a starting entry
  const entries: TimelineEntry[] = [{
    type: 'message',
    timestamp: new Date().toISOString(),
    title: 'Starting trajectory visualization',
    content: 'The following timeline shows the trajectory of the agent.',
    actorType: 'System',
    command: '',
    path: ''
  }];

  testData.forEach((item, index) => {
    // Create a basic timeline entry
    const entry: TimelineEntry = {
      type: 'message',
      timestamp: item.timestamp || new Date().toISOString(),
      title: item.message || 'No title',
      content: '',
      actorType: item.source === 'user' ? 'User' : item.source === 'agent' ? 'Assistant' : 'System',
      command: '',
      path: '',
      metadata: {}
    };

    // Process based on action type
    if (item.action === 'execute_bash' && item.args?.command) {
      entry.type = 'command';
      entry.command = item.args.command;
    } else if (item.action === 'run' && item.args?.command) {
      entry.type = 'command';
      entry.command = item.args.command;
    } else if (item.action === 'think' && item.args?.thought) {
      entry.type = 'message';
      entry.title = 'Thought';
      entry.content = item.args.thought;
    } else if (item.action === 'message' && item.args?.content) {
      entry.content = item.args.content;
    } else if (item.action === 'edit' && item.args?.path) {
      entry.type = 'edit';
      entry.path = item.args.path;
      if (item.args?.content) {
        entry.content = item.args.content;
      }
    }

    // Process observations
    if (item.observation === 'command_execution' || item.observation === 'run') {
      entry.type = 'command';
      entry.content = item.content || '';
      if (item.extras?.exit_code !== undefined) {
        entry.metadata = { ...entry.metadata, exit_code: item.extras.exit_code };
      }
    } else if (item.observation === 'edit') {
      entry.type = 'edit';
      entry.path = item.extras?.path || '';
      entry.content = item.content || '';
    }

    // Handle screenshots
    if (item.extras?.metadata?.screenshot) {
      entry.metadata = {
        ...entry.metadata,
        screenshot: item.extras.metadata.screenshot
      };
    }

    entries.push(entry);
  });

  return entries;
}