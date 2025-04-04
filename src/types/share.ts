export interface Config {
  action: "initialize";
  args: {
    AGENT: string;
    CONFIRMATION_MODE: boolean;
    LANGUAGE: string;
    LLM_API_KEY: string;
    LLM_MODEL: string;
  }
}

export interface AgentStateChangeAction {
  id: number;
  message: string;
  source: "environment" | "agent";
  timestamp: string;
  action: "change_agent_state";
  args: {
    agent_state: "init" | "loading" | "running" | "awaiting_user_input" | "finished";
    thought: string;
  };
}

export interface AgentStateChangeObservation {
  id: number;
  message: string;
  source: "environment" | "agent";
  timestamp: string;
  observation: "agent_state_changed";
  content: string;
  extras: {
    agent_state: "init" | "loading" | "running" | "awaiting_user_input" | "finished";
  };
}

export type AgentStateChange = AgentStateChangeAction | AgentStateChangeObservation;

export interface UserMessage {
  action: "message";
  source?: "user";
  content?: string;
  args?: {
    content: string;
    images_urls: string[];
  };
}

export interface AssistantMessage {
  id: number;
  action: "message";
  message: string;
  source: "agent";
  timestamp: string; // ISO 8601
  content?: string;
  args?: {
    content: string;
    images_urls: string[] | null;
    wait_for_response: boolean;
  };
}

export interface CommandAction {
  id: number;
  action: "run";
  message: string;
  source: "agent";
  timestamp: string;
  args: {
    command: string;
    is_confirmed: "confirmed";
    thought: string;
  };
}


export interface NullObservation {
  id: number;
  cause: number;
  observation: "null";
  message: string;
  content: string;
  source: "environment" | "user";
  timestamp: string;
  extras: Record<string, unknown>;
}

export interface CommandObservation {
  id: number;
  cause: number;
  observation: "run";
  message: string;
  content: string;
  source: "agent";
  timestamp: string;
  extras: {
    command: string;
    command_id: number;
    exit_code: number;
    metadata: Record<string, unknown>;
  };
}

export interface IPythonAction {
  id: number;
  action: "run_ipython";
  message: string;
  source: "agent";
  timestamp: string;
  args: {
    code: string;
    is_confirmed: "confirmed";
    kernel_init_code: string;
    thought: string;
  };
}

export interface IPythonObservation {
  id: number;
  cause: number;
  observation: "run_ipython";
  message: string;
  content: string;
  source: "agent";
  timestamp: string;
  extras: {
    code: string;
  };
}

export interface FinishAction {
  id: number;
  message: string;
  source: "agent";
  timestamp: string;
  action: "finish";
  args: {
    outputs: Record<string, unknown>;
    thought?: string;
    final_thought?: string;
    task_completed?: string;
  };
}

export interface ErrorObservation {
  id: number;
  message: string;
  source: "agent";
  timestamp: string;
  observation: "error";
  content: string;
  extras: Record<string, unknown>;
}

export interface ReadAction {
  id: number;
  action: "read";
  message: string;
  source: "agent";
  timestamp: string;
  args: {
    path: string;
    thought?: string;
  };
}

export interface ReadObservation {
  id: number;
  cause: number;
  observation: "read";
  message: string;
  content: string;
  source: "agent";
  timestamp: string;
  extras: {
    path: string;
  };
}

export interface EditAction {
  id: number;
  action: "edit";
  message: string;
  source: "agent";
  timestamp: string;
  args: {
    path: string;
    old_content: string;
    new_content: string;
    thought?: string;
  };
}

export interface EditObservation {
  id: number;
  cause: number;
  observation: "edit";
  message: string;
  content: string;
  source: "agent";
  timestamp: string;
  extras: {
    path: string;
    old_content: string;
    new_content: string;
  };
}

export interface ThinkAction {
  id: number;
  action: "think";
  message: string;
  source: "agent";
  timestamp: string;
  args: {
    thought: string;
  };
  tool_call_metadata?: Record<string, any>;
  llm_metrics?: Record<string, any>;
}

export interface ThinkObservation {
  id: number;
  cause: number;
  observation: "think";
  message: string;
  content: string;
  source: "agent";
  timestamp: string;
  extras: Record<string, unknown>;
  tool_call_metadata?: Record<string, any>;
}

export type TrajectoryItem = AgentStateChange | UserMessage | AssistantMessage | CommandAction | CommandObservation | IPythonAction | IPythonObservation | FinishAction | Config | ErrorObservation | NullObservation | ReadAction | ReadObservation | EditAction | EditObservation | ThinkAction | ThinkObservation;