import { 
  TrajectoryItem, 
  Config, 
  AgentStateChange, 
  UserMessage, 
  AssistantMessage, 
  CommandAction, 
  CommandObservation, 
  IPythonAction, 
  IPythonObservation, 
  FinishAction, 
  ErrorObservation, 
  ReadAction, 
  ReadObservation, 
  EditAction, 
  EditObservation,
  ThinkAction,
  ThinkObservation
} from '../types/share';

export const isConfig = (data: TrajectoryItem): data is Config =>
  "action" in data && data.action === "initialize";

export const isAgentStateChange = (data: TrajectoryItem): data is AgentStateChange =>
  "observation" in data && 
  data.observation === "agent_state_changed" &&
  (data.source === "environment" || data.source === "agent");

export const isUserMessage = (data: TrajectoryItem): data is UserMessage =>
  ("action" in data && data.action === "message" && 
   ((!("source" in data)) || data.source === "user"));

export const isAssistantMessage = (data: TrajectoryItem): data is AssistantMessage =>
  "action" in data && data.action === "message" && "source" in data && data.source === "agent";

export const isCommandAction = (data: TrajectoryItem): data is CommandAction =>
  "action" in data && data.action === "run" && data.source === "agent";

export const isCommandObservation = (data: TrajectoryItem): data is CommandObservation =>
  "observation" in data && data.observation === "run" && data.source === "agent";

export const isIPythonAction = (data: TrajectoryItem): data is IPythonAction =>
  "action" in data && data.action === "run_ipython" && data.source === "agent";

export const isIPythonObservation = (data: TrajectoryItem): data is IPythonObservation =>
  "observation" in data && data.observation === "run_ipython" && data.source === "agent";

export const isFinishAction = (data: TrajectoryItem): data is FinishAction =>
  "action" in data && data.action === "finish" && data.source === "agent";

export const isErrorObservation = (data: TrajectoryItem): data is ErrorObservation =>
  "observation" in data && data.observation === "error" && data.source === "agent";

export const isReadAction = (data: TrajectoryItem): data is ReadAction =>
  "action" in data && data.action === "read" && "source" in data && data.source === "agent";

export const isReadObservation = (data: TrajectoryItem): data is ReadObservation =>
  "observation" in data && data.observation === "read" && "source" in data && data.source === "agent";

export const isEditAction = (data: TrajectoryItem): data is EditAction =>
  "action" in data && data.action === "edit" && "source" in data && data.source === "agent";

export const isEditObservation = (data: TrajectoryItem): data is EditObservation =>
  "observation" in data && data.observation === "edit" && "source" in data && data.source === "agent";

export const isThinkAction = (data: TrajectoryItem): data is ThinkAction =>
  "action" in data && data.action === "think" && "source" in data && data.source === "agent";

export const isThinkObservation = (data: TrajectoryItem): data is ThinkObservation =>
  "observation" in data && data.observation === "think" && "source" in data && data.source === "agent";

// Convert a trajectory item to a timeline entry
export const trajectoryItemToTimelineEntry = (item: TrajectoryItem) => {
  if (isUserMessage(item)) {
    return {
      type: 'message',
      timestamp: new Date().toISOString(), // User messages might not have timestamps
      content: item.content || item.args?.content || '',
      actorType: 'User',
    };
  }
  
  if (isAssistantMessage(item)) {
    return {
      type: 'message',
      timestamp: item.timestamp,
      content: item.content || item.args?.content || '',
      actorType: 'Assistant',
    };
  }
  
  if (isCommandAction(item)) {
    return {
      type: 'command',
      timestamp: item.timestamp,
      command: item.args.command,
      thought: item.args.thought,
      actorType: 'Assistant',
    };
  }
  
  if (isCommandObservation(item)) {
    return {
      type: 'command',
      timestamp: item.timestamp,
      content: item.content,
      metadata: {
        exit_code: item.extras.exit_code,
      },
      actorType: 'System',
    };
  }
  
  if (isIPythonAction(item)) {
    return {
      type: 'command',
      timestamp: item.timestamp,
      command: item.args.code,
      thought: item.args.thought,
      actorType: 'Assistant',
    };
  }
  
  if (isIPythonObservation(item)) {
    return {
      type: 'command',
      timestamp: item.timestamp,
      content: item.content,
      actorType: 'System',
    };
  }
  
  if (isReadAction(item)) {
    return {
      type: 'command',
      timestamp: item.timestamp,
      command: `cat ${item.args.path}`,
      thought: item.args.thought || '',
      path: item.args.path,
      actorType: 'Assistant',
    };
  }
  
  if (isReadObservation(item)) {
    return {
      type: 'command',
      timestamp: item.timestamp,
      content: item.content,
      path: item.extras.path,
      actorType: 'System',
    };
  }
  
  if (isEditAction(item)) {
    return {
      type: 'edit',
      timestamp: item.timestamp,
      path: item.args.path,
      thought: item.args.thought || '',
      actorType: 'Assistant',
    };
  }
  
  if (isEditObservation(item)) {
    return {
      type: 'edit',
      timestamp: item.timestamp,
      content: item.content,
      path: item.extras.path,
      actorType: 'System',
    };
  }
  
  if (isErrorObservation(item)) {
    return {
      type: 'error',
      timestamp: item.timestamp,
      content: item.content,
      actorType: 'System',
    };
  }
  
  if (isFinishAction(item)) {
    return {
      type: 'message',
      timestamp: item.timestamp,
      content: item.args.thought,
      actorType: 'Assistant',
    };
  }
  
  // Default case
  return {
    type: 'message',
    timestamp: 'id' in item && 'timestamp' in item ? item.timestamp : new Date().toISOString(),
    content: JSON.stringify(item, null, 2),
    actorType: 'System',
  };
};