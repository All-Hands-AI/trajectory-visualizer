import { TimelineEntry } from '../components/timeline/types';
import { 
  TrajectoryHistoryEntry, 
  TrajectoryData, 
  getActorType, 
  mapEntryTypeToTimelineType 
} from '../types/trajectory';

// For backward compatibility
type OpenHandsEvent = TrajectoryHistoryEntry;
type HistoryFormat = TrajectoryData;

export function convertOpenHandsTrajectory(trajectory: OpenHandsEvent[] | { entries: OpenHandsEvent[] } | { test_result: { git_patch: string } } | HistoryFormat): TimelineEntry[] {
  // Handle different formats
  let events: OpenHandsEvent[];
  
  if (Array.isArray(trajectory)) {
    events = trajectory;
  } else if ('entries' in trajectory) {
    events = trajectory.entries;
  } else if ('history' in trajectory && Array.isArray(trajectory.history)) {
    // Convert history entries to timeline format
    return (trajectory as HistoryFormat).history.map(entry => {
      // Handle the format in sample-trajectory.jsonl
      if ('type' in entry && 'content' in entry && 'actorType' in entry) {
        const timelineEntry: TimelineEntry = {
          type: mapEntryTypeToTimelineType(entry.type || ''),
          timestamp: entry.timestamp || new Date().toISOString(),
          title: entry.content ? entry.content.split('\n')[0] : '',
          content: entry.content,
          actorType: entry.actorType as 'User' | 'Assistant' | 'System',
          command: entry.command || '',
          path: entry.path || ''
        };

        // Handle thought type
        if (entry.type === 'thought') {
          timelineEntry.thought = entry.content;
          timelineEntry.content = undefined;
        }

        return timelineEntry;
      }
      
      // Handle the original OpenHands format
      const timelineEntry: TimelineEntry = {
        type: entry.action === 'read' ? 'search' : entry.action === 'message' ? 'message' : 'command',
        timestamp: entry.timestamp || new Date().toISOString(),
        title: entry.message,
        content: entry.args?.content || entry.message,
        actorType: entry.source === 'user' ? 'User' : entry.source === 'agent' ? 'Assistant' : 'System',
        command: '',
        path: entry.args?.path || ''
      };

      // Add command for execute_bash action
      if (entry.action === 'execute_bash' && entry.args?.command) {
        timelineEntry.command = entry.args.command;
      }

      // Add path for str_replace_editor action
      if (entry.action === 'str_replace_editor' && entry.args?.path) {
        timelineEntry.path = entry.args.path;
      }

      return timelineEntry;
    });
  } else if ('test_result' in trajectory && 'git_patch' in trajectory.test_result) {
    // Convert git patch to timeline entries
    const entries: TimelineEntry[] = [];

    // Add git patch entry
    entries.push({
      type: 'message',
      timestamp: new Date().toISOString(),
      title: 'Git Patch',
      content: trajectory.test_result.git_patch,
      actorType: 'System',
      command: '',
      path: ''
    } as TimelineEntry);

    // Add file changes
    const patch = trajectory.test_result.git_patch;
    const fileMatches = patch.matchAll(/^diff --git a\/(.*?) b\/(.*?)$/gm);
    for (const match of fileMatches) {
      const file = match[1];
      entries.push({
        type: 'edit',
        timestamp: new Date().toISOString(),
        title: `Changes in ${file}`,
        content: '',
        actorType: 'System',
        command: '',
        path: file
      } as TimelineEntry);
    }

    return entries;
  } else {
    throw new Error('Invalid trajectory format. Expected one of:\n1. Array of events with action, args, timestamp, etc.\n2. Object with "entries" array containing events\n3. Object with "history" array containing events\n4. Object with "test_result.git_patch" containing a git patch');
  }

  if (!Array.isArray(events)) {
    throw new Error('Invalid trajectory format. Events must be an array.');
  }
  // First entry is always a message showing the start
  const entries: TimelineEntry[] = [{
    type: 'message',
    timestamp: new Date().toISOString(),
    title: 'Starting trajectory visualization',
    content: 'Trajectory loaded from OpenHands format',
    actorType: 'System',
    command: '',
    path: ''
  } as TimelineEntry];

  for (const event of events) {
    // Skip environment state changes that don't have a message
    if (event.source === 'environment' && event.observation === 'agent_state_changed' && !event.message) {
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
        path: ''
      };

      // Add command for execute_bash action
      if (event.action === 'execute_bash' && event.args?.command) {
        entry.command = event.args.command;
      }

      // Add path for str_replace_editor action
      if (event.action === 'str_replace_editor' && event.args?.path) {
        entry.path = event.args.path;
      }

      // Add any tool metadata
      if (event.tool_call_metadata) {
        entry.metadata = {
          tool_name: event.tool_call_metadata.tool_name,
          ...event.tool_call_metadata.tool_args
        };
      }
      
      // Add screenshot if available in extras.metadata
      if (event.extras?.metadata?.screenshot) {
        entry.metadata = {
          ...entry.metadata,
          screenshot: event.extras.metadata.screenshot
        };
      }

      entries.push(entry as TimelineEntry);
    } else if (event.observation || event.message) {
      // This is an observation event or a message-only event
      const entry = {
        type: event.observation === 'user_message' || event.observation === 'assistant_message' ? 'message' : getObservationType(event.observation || 'message', event.success),
        timestamp: event.timestamp || new Date().toISOString(),
        title: event.message || event.observation || 'No title',
        content: event.content || '',
        metadata: {},
        actorType: getActorType(event.source),
        command: '',
        path: ''
      };
      
      // Add extras as metadata
      if (event.extras) {
        entry.metadata = {
          ...event.extras
        };
        
        // If extras.metadata exists, merge it with the entry metadata
        if (event.extras.metadata) {
          entry.metadata = {
            ...entry.metadata,
            ...event.extras.metadata
          };
        }
      }

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
    default:
      return 'message';
  }
}

function getObservationType(_observation: string, success?: boolean): TimelineEntry['type'] {
  if (success === false) {
    return 'error';
  }
  return 'message';
}