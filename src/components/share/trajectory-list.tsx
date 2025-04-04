import React from 'react';
import {
  isAgentStateChange,
  isUserMessage,
  isAssistantMessage,
  isCommandAction,
  isCommandObservation,
  isIPythonAction,
  isIPythonObservation,
  isFinishAction,
  isErrorObservation,
  isReadAction,
  isReadObservation,
  isEditAction,
  isEditObservation,
  trajectoryItemToTimelineEntry
} from "../../utils/share";
import { CSyntaxHighlighter } from "../syntax-highlighter";
import {
  AgentStateChangeComponent,
  UserMessageComponent,
  AssistantMessageComponent,
  CommandActionComponent,
  CommandObservationComponent,
  IPythonActionComponent,
  IPythonObservationComponent,
  FinishActionComponent,
  ReadActionComponent,
  ReadObservationComponent,
  EditActionComponent,
  EditObservationComponent,
  ErrorObservationComponent
} from "./trajectory-list-items";
import { TrajectoryCard } from "./trajectory-card";
import { TrajectoryItem } from '../../types/share';
import { TimelineEntry } from '../timeline/types';
import { Timeline } from '../timeline/Timeline';

interface TrajectoryListProps {
  trajectory: TrajectoryItem[];
}

export const TrajectoryList: React.FC<TrajectoryListProps> = ({ trajectory }) => {
  const [selectedIndex, setSelectedIndex] = React.useState<number>(0);
  
  const shouldDisplayItem = (item: TrajectoryItem): boolean => {
    // Filter out change_agent_state actions
    if ("action" in item && item.action === "change_agent_state" as const) {
      return false;
    }

    // Filter out null observations
    if ("observation" in item && typeof item.observation === "string" && item.observation === "null") {
      return false;
    }

    // Keep all other items
    return true;
  };

  // Apply filtering to remove unwanted events
  const filteredTrajectory = trajectory.filter(shouldDisplayItem);
  
  // Convert trajectory items to timeline entries
  const timelineEntries = React.useMemo(() => {
    return filteredTrajectory.map(item => trajectoryItemToTimelineEntry(item) as TimelineEntry);
  }, [filteredTrajectory]);
  
  const formatTimelineDate = (entry: TimelineEntry): string => {
    if (!entry.timestamp) {
      return 'N/A';
    }
    return new Date(entry.timestamp).toLocaleTimeString();
  };
  
  const handleCommandClick = (command: string): void => {
    navigator.clipboard.writeText(command.replace(/^\$ /, ''));
  };
  
  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* Timeline view */}
      <div className="lg:w-1/3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
        <div className="h-10 px-3 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Timeline ({timelineEntries.length} steps)
          </h3>
        </div>
        <div className="h-[calc(100%-2.5rem)]">
          <Timeline
            entries={timelineEntries}
            selectedIndex={selectedIndex}
            onStepSelect={setSelectedIndex}
            onCommandClick={handleCommandClick}
            formatTimelineDate={formatTimelineDate}
            createdAt={new Date().toISOString()}
          />
        </div>
      </div>
      
      {/* Detailed view */}
      <div className="lg:w-2/3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
        <div className="h-10 px-3 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Run Details
          </h3>
        </div>
        <div className="h-[calc(100%-2.5rem)] overflow-y-auto p-4">
          <div className="flex flex-col gap-4">
            {filteredTrajectory.map((item, index) => {
              if (index !== selectedIndex) return null;
              
              if (isAgentStateChange(item)) {
                return <AgentStateChangeComponent key={index} state={item} />;
              } else if (isUserMessage(item)) {
                return <UserMessageComponent key={index} message={item} />;
              } else if (isAssistantMessage(item)) {
                return <AssistantMessageComponent key={index} message={item} />;
              } else if (isCommandAction(item)) {
                return <CommandActionComponent key={index} command={item} />;
              } else if (isCommandObservation(item)) {
                return <CommandObservationComponent key={index} observation={item} />;
              } else if (isIPythonAction(item)) {
                return <IPythonActionComponent key={index} action={item} />;
              } else if (isIPythonObservation(item)) {
                return <IPythonObservationComponent key={index} observation={item} />;
              } else if (isFinishAction(item)) {
                return <FinishActionComponent key={index} action={item} />;
              } else if (isErrorObservation(item)) {
                return <ErrorObservationComponent key={index} observation={item} />;
              } else if (isReadAction(item)) {
                return <ReadActionComponent key={index} item={item} />;
              } else if (isReadObservation(item)) {
                return <ReadObservationComponent key={index} observation={item} />;
              } else if (isEditAction(item)) {
                return <EditActionComponent key={index} item={item} />;
              } else if (isEditObservation(item)) {
                return <EditObservationComponent key={index} observation={item} />;
              } else {
                return (
                  <TrajectoryCard key={index}>
                    <CSyntaxHighlighter
                      language="json"
                      key={index}
                    >
                      {JSON.stringify(item, null, 2)}
                    </CSyntaxHighlighter>
                  </TrajectoryCard>
                );
              }
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrajectoryList;