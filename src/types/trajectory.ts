

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
    code?: string;
    old_str?: string;
    new_str?: string;
    old_content?: string;
    new_content?: string;
    file_text?: string;
    [key: string]: any;
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

