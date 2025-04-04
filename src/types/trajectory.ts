import { TimelineEntry } from '../components/timeline/types';

// Common types for trajectory data
export interface TrajectoryHistoryEntry {
  id?: number;
  timestamp?: string; // Make timestamp optional for backward compatibility
  // Original OpenHands format
  source?: string;
  message?: string;
  action?: string;
  observation?: string;
  args?: {
    content?: string;
    path?: string;
    command?: string;
    thought?: string;
  };
  // Sample format
  type?: string;
  content?: string;
  actorType?: string;
  command?: string;
  path?: string;
  thought?: string;
  // Additional fields
  extras?: Record<string, any>;
  tool_call_metadata?: {
    tool_name?: string;
    tool_args?: Record<string, any>;
    function_name?: string;
    tool_call_id?: string;
    model_response?: any;
    total_calls_in_response?: number;
    [key: string]: any;
  };
  // For backward compatibility
  cause?: string | number;
  success?: boolean;
}

export interface TrajectoryData {
  history: TrajectoryHistoryEntry[];
  [key: string]: any;
}

// Helper functions for type checking and conversion
export function getActorType(source: string | undefined): 'User' | 'Assistant' | 'System' {
  if (source === 'user') return 'User';
  if (source === 'system' || source === 'environment') return 'System';
  return 'Assistant';
}

export function mapEntryTypeToTimelineType(type: string): TimelineEntry['type'] {
  switch (type) {
    case 'command':
      return 'command';
    case 'edit':
      return 'edit';
    case 'search':
      return 'search';
    case 'error':
      return 'error';
    case 'message':
      return 'message';
    case 'thought':
      return 'message'; // Thoughts are displayed as messages with special styling
    default:
      // Fallback to message type for unknown types
      return 'message';
  }
}