import { TimelineEntry } from '../components/timeline/types';

// Re-export the TimelineEntry type to ensure we're using the same type
interface OpenHandsTimelineEntry extends TimelineEntry {}

interface OpenHandsEvent {
  id?: number;
  timestamp?: string;
  source?: string;
  message?: string;
  cause?: string;
  action?: string;
  observation?: string;
  tool_call_metadata?: {
    tool_name: string;
    tool_args: Record<string, any>;
  };
  args?: Record<string, any>;
  content?: string;
  extras?: Record<string, any>;
  success?: boolean;
}

function getActorType(source: string | undefined): 'User' | 'Assistant' | 'System' {
  if (source === 'user') return 'User';
  if (source === 'system' || source === 'environment') return 'System';
  return 'Assistant';
}

export function convertOpenHandsTrajectory(trajectory: OpenHandsEvent[]): OpenHandsTimelineEntry[] {
  // First entry is always a message showing the start
  const entries: OpenHandsTimelineEntry[] = [{
    type: 'message',
    timestamp: new Date().toISOString(),
    title: 'Starting trajectory visualization',
    content: 'Trajectory loaded from OpenHands format',
    actorType: 'System',
    command: '',
    path: ''
  } as TimelineEntry];

  for (const event of trajectory) {
    // Skip environment state changes
    if (event.source === 'environment' && event.observation === 'agent_state_changed') {
      continue;
    }

    if (event.action) {
      // This is an action event
      const entry = {
        type: getActionType(event.action),
        timestamp: event.timestamp || new Date().toISOString(),
        title: event.message || event.action,
        thought: event.cause,
        metadata: {},
        actorType: getActorType(event.source),
        command: '',
        path: '',
        content: ''
      };

      // Add command for execute_bash action
      if (event.action === 'execute_bash' && event.args?.command) {
        entry.command = event.args.command;
      }

      // Add path for str_replace_editor action
      if (event.action === 'str_replace_editor' && event.args?.path) {
        entry.path = event.args.path;
      }

      // Add thought content for think action
      if (event.action === 'think' && event.args?.thought) {
        entry.content = event.args.thought;
      }

      // Add any tool metadata
      if (event.tool_call_metadata) {
        const metadata: Record<string, any> = {};
        if ('function_name' in event.tool_call_metadata) {
          metadata.tool_name = event.tool_call_metadata.function_name;
          if ('tool_args' in event.tool_call_metadata) {
            Object.assign(metadata, event.tool_call_metadata.tool_args);
          }
        } else if ('tool_name' in event.tool_call_metadata) {
          metadata.tool_name = event.tool_call_metadata.tool_name;
          if ('tool_args' in event.tool_call_metadata) {
            Object.assign(metadata, event.tool_call_metadata.tool_args);
          }
        }
        entry.metadata = metadata;
      }

      entries.push(entry as TimelineEntry);
    } else {
      // This is an observation event or a message without action
      const entry = {
        type: event.observation === 'user_message' || event.observation === 'assistant_message' ? 'message' : getObservationType(event.observation, event.success),
        timestamp: event.timestamp || new Date().toISOString(),
        title: event.message || event.observation || '',
        content: event.content || '',
        metadata: event.extras || {},
        actorType: getActorType(event.source),
        command: '',
        path: ''
      };

      entries.push(entry as TimelineEntry);
    }
  }

  return entries;
}

function getActionType(action: string): TimelineEntry['type'] {
  switch (action) {
    case 'execute_bash':
      return 'command';
    case 'str_replace_editor':
      return 'edit';
    case 'web_read':
    case 'browser':
      return 'search';
    case 'think':
      return 'message';
    default:
      return 'message';
  }
}

function getObservationType(_observation: string | undefined, success?: boolean): TimelineEntry['type'] {
  if (success === false) {
    return 'error';
  }
  return 'message';
}