export interface TimelineEntry {
  type: 'command' | 'edit' | 'search' | 'error' | 'message';
  timestamp: string;
  title?: string;
  content?: string;
  thought?: string;
  command?: string;
  path?: string;
  actorType?: 'User' | 'Assistant' | 'System';
  metadata?: {
    cost?: number;
    screenshot?: string;
    [key: string]: any;
  };
  screenshot?: string;
}

export type StepColor = 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple' | 'indigo';

export interface StepInfo {
  stepTitle: string;
  stepIcon: React.ReactNode;
  actorType: 'User' | 'Assistant' | 'System';
  stepColor: StepColor;
}

export interface TimelineStepProps {
  entry: TimelineEntry;
  index: number;
  isSelected: boolean;
  isLast: boolean;
  formatTimelineDate: (entry: TimelineEntry) => string;
  onSelect: (index: number) => void;
  onCommandClick?: (command: string) => void;
  onFileEditClick?: () => void;
}

export interface TimelineProps {
  entries: TimelineEntry[];
  selectedIndex: number;
  onStepSelect: (index: number) => void;
  onCommandClick?: (command: string) => void;
  onFileEditClick?: () => void;
  formatTimelineDate: (entry: TimelineEntry) => string;
  createdAt: string;
} 