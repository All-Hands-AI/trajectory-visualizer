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
  
  // Track system prompts to avoid duplication
  const systemPrompts = new Set();

  for (const event of events) {
    // Skip environment state changes that don't have a message
    if (event.source === 'environment' && event.observation === 'agent_state_changed' && !event.message) {
      continue;
    }

    if ('action' in event && event.action) {
      // This is an action event
      const entry: any = {
        type: getActionType(event.action),
        timestamp: event.timestamp || new Date().toISOString(),
        title: `${event.action}: ${event.message || ''}`.trim(),
        thought: event.args?.thought || event.cause,
        metadata: {},
        actorType: getActorType(event.source),
        command: '',
        path: '',
        content: ''
      };

      // Process based on action type
      switch (event.action) {
        case 'execute_bash':
        case 'run':
          if (event.args?.command) {
            entry.command = event.args.command;
            entry.type = 'command';
            // Add content if available
            if (event.args?.content) {
              entry.content = event.args.content;
            }
          }
          break;
          
        case 'execute_ipython_cell':
          if (event.args?.code) {
            entry.command = event.args.code;
            entry.type = 'command';
            // Add content if available
            if (event.args?.content) {
              entry.content = event.args.content;
            }
          }
          break;
          
        case 'browser':
          if (event.args?.code) {
            entry.command = event.args.code;
            entry.type = 'command';
          }
          break;
          
        case 'str_replace_editor':
          if (event.args?.path) {
            entry.path = event.args.path;
            entry.type = 'edit';
            
            // Add content for edit actions
            if (event.args?.command === 'str_replace' && event.args?.old_str && event.args?.new_str) {
              entry.content = `Changed from:\n${event.args.old_str}\n\nTo:\n${event.args.new_str}`;
            } else if (event.args?.command === 'create' && event.args?.file_text) {
              entry.content = `Created file with content:\n${event.args.file_text}`;
            } else if (event.args?.command === 'view') {
              entry.type = 'search';
              entry.content = event.args?.content || '';
            }
          }
          break;
          
        case 'edit':
          if (event.args?.path) {
            entry.path = event.args.path;
            entry.type = 'edit';
            
            // Add content for edit actions
            if (event.args && 'old_content' in event.args && 'new_content' in event.args) {
              entry.content = `Changed from:\n${event.args.old_content}\n\nTo:\n${event.args.new_content}`;
            } else if (event.args?.content) {
              entry.content = event.args.content;
            }
          }
          break;
          
        case 'read':
          if (event.args?.path) {
            entry.path = event.args.path;
            entry.type = 'search';
            if (event.args?.content) {
              entry.content = event.args.content;
            }
          }
          break;
          
        case 'think':
          if (event.args?.thought) {
            entry.thought = event.args.thought;
            entry.content = event.args.thought;
            entry.type = 'message';
          }
          break;
          
        case 'message':
        case 'condensation':
        case 'recall':
        case 'finish':
          entry.type = 'message';
          
          // Only use args.content for the actual content, not message
          let content = event.args?.content;
          
          // Use message only for the title if we don't have content
          if (!content) {
            entry.title = event.message || event.action;
          } else {
            // Check if this is a system prompt (contains <ROLE> tags)
            if (content.includes('<ROLE>') && content.includes('</ROLE>')) {
              // Create a hash of the content to check for duplicates
              const contentHash = content.substring(0, 100); // Use first 100 chars as a simple hash
              
              // Skip if we've already seen this system prompt
              if (systemPrompts.has(contentHash)) {
                console.log('Skipping duplicate system prompt');
                continue;
              }
              
              // Add to our set of seen system prompts
              systemPrompts.add(contentHash);
            }
          }
          
          entry.content = content;
          break;
          
        default:
          console.log(`Processing unknown action type: ${event.action}`);
          // For unknown actions, try to extract useful information
          if (event.args?.path) {
            entry.path = event.args.path;
          }
          if (event.args?.command) {
            entry.command = event.args.command;
          }
          if (event.args?.content) {
            entry.content = event.args.content;
          }
      }

      // Add any tool metadata
      if (event.tool_call_metadata) {
        entry.metadata = {
          ...entry.metadata,
          tool_name: event.tool_call_metadata.function_name || event.tool_call_metadata.tool_name,
          tool_call_id: event.tool_call_metadata.tool_call_id,
          ...event.tool_call_metadata.tool_args
        };
      }
      
      // Add extras if available
      if (event.extras) {
        entry.metadata = {
          ...entry.metadata,
          ...event.extras
        };
        
        // Add screenshot if available in extras.metadata
        if (event.extras.metadata?.screenshot) {
          entry.metadata.screenshot = event.extras.metadata.screenshot;
        }
      }

      entries.push(entry as TimelineEntry);
    } else if ('observation' in event) {
      // This is an observation event
      const entry: any = {
        type: event.observation === 'user_message' || event.observation === 'assistant_message' ? 'message' : getObservationType(event.observation || 'message', event.success),
        timestamp: event.timestamp || new Date().toISOString(),
        title: event.message || event.observation || 'No title',
        content: event.content || '',
        metadata: {},
        actorType: getActorType(event.source),
        command: '',
        path: '',
        thought: event.cause ? `Caused by event ID: ${event.cause}` : undefined
      };
      
      // Process based on observation type
      switch (event.observation) {
        case 'run':
        case 'execute_bash':
        case 'execute_ipython_cell':
          entry.type = 'command';
          if (event.extras?.command) {
            entry.command = event.extras.command;
          }
          if (event.content) {
            entry.content = event.content;
          } else if (event.extras?.content) {
            entry.content = event.extras.content;
          }
          break;
          
        case 'read':
          entry.type = 'search';
          if (event.extras?.path) {
            entry.path = event.extras.path;
          }
          if (event.content) {
            entry.content = event.content;
          } else if (event.extras?.content) {
            entry.content = event.extras.content;
          }
          break;
          
        case 'edit':
        case 'str_replace_editor':
          entry.type = 'edit';
          if (event.extras?.path) {
            entry.path = event.extras.path;
          }
          
          // Add content for edit observations
          if (event.extras && 'old_content' in event.extras && 'new_content' in event.extras) {
            entry.content = `Changed from:\n${event.extras.old_content}\n\nTo:\n${event.extras.new_content}`;
          } else if (event.extras?.old_str && event.extras?.new_str) {
            entry.content = `Changed from:\n${event.extras.old_str}\n\nTo:\n${event.extras.new_str}`;
          } else if (event.content) {
            entry.content = event.content;
          } else if (event.extras?.content) {
            entry.content = event.extras.content;
          }
          break;
          
        case 'think':
          entry.type = 'message';
          if (event.content) {
            entry.thought = event.content;
            entry.content = event.content;
          } else if (event.extras?.thought) {
            entry.thought = event.extras.thought;
            entry.content = event.extras.thought;
          }
          break;
          
        case 'error':
          entry.type = 'error';
          if (event.content) {
            entry.content = event.content;
            entry.title = event.message || 'Error';
          } else {
            entry.title = event.message || 'Error';
          }
          break;
          
        case 'agent_state_changed':
          entry.type = 'message';
          if (event.extras?.agent_state) {
            entry.title = `Agent state changed to: ${event.extras.agent_state}`;
            if (event.extras?.reason) {
              entry.content = `Reason: ${event.extras.reason}`;
            }
          }
          break;
          
        case 'user_message':
        case 'assistant_message':
        case 'message':
        case 'condensation':
        case 'recall':
          entry.type = 'message';
          
          // Only use content field for the actual content, not message
          let content = event.content;
          
          // Use message only for the title if we don't have content
          if (!content) {
            entry.title = event.message || event.observation;
          } else {
            // Check if this is a system prompt (contains <ROLE> tags)
            if (content.includes('<ROLE>') && content.includes('</ROLE>')) {
              // Create a hash of the content to check for duplicates
              const contentHash = content.substring(0, 100); // Use first 100 chars as a simple hash
              
              // Skip if we've already seen this system prompt
              if (systemPrompts.has(contentHash)) {
                console.log('Skipping duplicate system prompt');
                continue;
              }
              
              // Add to our set of seen system prompts
              systemPrompts.add(contentHash);
            }
          }
          
          entry.content = content;
          break;
          
        case 'null':
          entry.type = 'message';
          entry.title = event.message || 'No observation';
          break;
          
        default:
          console.log(`Processing unknown observation type: ${event.observation}`);
          // For unknown observations, try to extract useful information
          if (event.extras?.path) {
            entry.path = event.extras.path;
          }
          if (event.extras?.command) {
            entry.command = event.extras.command;
          }
          if (event.content) {
            entry.content = event.content;
          } else if (event.message) {
            entry.content = event.message;
          }
      }
      
      // Add extras as metadata
      if (event.extras) {
        entry.metadata = {
          ...entry.metadata,
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
      
      // Add tool call metadata if available
      if (event.tool_call_metadata) {
        entry.metadata = {
          ...entry.metadata,
          tool_name: event.tool_call_metadata.function_name || event.tool_call_metadata.tool_name,
          tool_call_id: event.tool_call_metadata.tool_call_id
        };
      }

      entries.push(entry as TimelineEntry);
    } else if (event.message) {
      // This is a message-only event
      const entry = {
        type: 'message',
        timestamp: event.timestamp || new Date().toISOString(),
        title: event.message,
        content: '', // Don't use message as content
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
    case 'run':
    case 'run_ipython':
    case 'execute_ipython_cell':
    case 'browser':
      return 'command';
    case 'str_replace_editor':
    case 'edit':
      return 'edit';
    case 'web_read':
    case 'read':
      return 'search';
    case 'think':
    case 'finish':
    case 'message':
    case 'condensation':
    case 'recall':
      return 'message';
    case 'error':
      return 'error';
    default:
      console.log(`Unknown action type: ${action}, defaulting to message`);
      return 'message';
  }
}

function getObservationType(observation: string, success?: boolean): TimelineEntry['type'] {
  if (success === false) {
    return 'error';
  }
  
  switch (observation) {
    case 'run':
    case 'run_ipython':
    case 'execute_ipython_cell':
    case 'browser':
      return 'command';
    case 'edit':
      return 'edit';
    case 'read':
      return 'search';
    case 'error':
      return 'error';
    case 'think':
    case 'message':
    case 'condensation':
    case 'recall':
    case 'agent_state_changed':
    case 'user_message':
    case 'assistant_message':
      return 'message';
    case 'null':
      return 'message';
    default:
      console.log(`Unknown observation type: ${observation}, defaulting to message`);
      return 'message';
  }
}