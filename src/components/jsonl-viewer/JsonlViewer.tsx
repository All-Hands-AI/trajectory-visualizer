import React, { useState, useEffect, useMemo } from 'react';
import { JsonlEntry, parseJsonlFile } from '../../utils/jsonl-parser';
import JsonlViewerSettings, { JsonlViewerSettings as JsonlViewerSettingsType } from './JsonlViewerSettings';
import { getNestedValue, formatValueForDisplay } from '../../utils/object-utils';
import { TrajectoryItem } from '../../types/share';
import JsonVisualizer from '../json-visualizer/JsonVisualizer';
import { DEFAULT_JSONL_VIEWER_SETTINGS } from '../../config/jsonl-viewer-config';
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
  isThinkAction,
  isThinkObservation
} from "../../utils/share";
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
  ErrorObservationComponent,
  ThinkActionComponent,
  ThinkObservationComponent
} from "../share/trajectory-list-items";
import { CSyntaxHighlighter } from "../syntax-highlighter";
import { TrajectoryCard } from "../share/trajectory-card";

interface JsonlViewerProps {
  content: string;
}

const JsonlViewer: React.FC<JsonlViewerProps> = ({ content }) => {
  const [entries, setEntries] = useState<JsonlEntry[]>([]);
  const [currentEntryIndex, setCurrentEntryIndex] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [trajectoryItems, setTrajectoryItems] = useState<TrajectoryItem[]>([]);
  const [settings, setSettings] = useState<JsonlViewerSettingsType>(DEFAULT_JSONL_VIEWER_SETTINGS);
  const [originalEntries, setOriginalEntries] = useState<JsonlEntry[]>([]);

  // Parse the JSONL file on component mount or when content changes
  useEffect(() => {
    try {
      const parsedEntries = parseJsonlFile(content);
      setOriginalEntries(parsedEntries);
      
      // Apply initial sorting
      sortAndSetEntries(parsedEntries, settings);
      
      // Extract trajectory items if available
      if (parsedEntries.length > 0) {
        const currentEntry = parsedEntries[0];
        if (currentEntry.history && Array.isArray(currentEntry.history)) {
          setTrajectoryItems(currentEntry.history as TrajectoryItem[]);
        }
      }
    } catch (err) {
      console.error('Error parsing JSONL file:', err);
      setError(`Failed to parse JSONL file: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  // Sort entries based on settings
  const sortAndSetEntries = (entriesToSort: JsonlEntry[], currentSettings: JsonlViewerSettingsType) => {
    if (entriesToSort.length === 0) {
      setError('No valid entries found in the JSONL file');
      return;
    }
    
    // Create a copy of the entries to sort
    const sortedEntries = [...entriesToSort].sort((a, b) => {
      // Get values using the sort field
      const valueA = getNestedValue(a, currentSettings.sortField, null);
      const valueB = getNestedValue(b, currentSettings.sortField, null);
      
      // Handle null/undefined values
      if (valueA === null && valueB === null) return 0;
      if (valueA === null) return 1;
      if (valueB === null) return -1;
      
      // Compare based on type
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return currentSettings.sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      }
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return currentSettings.sortDirection === 'asc' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      }
      
      // Convert to string for other types
      const strA = String(valueA);
      const strB = String(valueB);
      return currentSettings.sortDirection === 'asc' 
        ? strA.localeCompare(strB) 
        : strB.localeCompare(strA);
    });
    
    setEntries(sortedEntries);
    
    // Set the first entry as current
    if (sortedEntries.length > 0) {
      setCurrentEntryIndex(0);
    }
  };

  // Handle settings changes
  const handleSettingsChange = (newSettings: JsonlViewerSettingsType) => {
    setSettings(newSettings);
    sortAndSetEntries(originalEntries, newSettings);
  };

  const handleSelectEntry = (index: number) => {
    setCurrentEntryIndex(index);
    
    // Update trajectory items when selecting a new entry
    if (entries.length > 0 && index < entries.length) {
      const selectedEntry = entries[index];
      if (selectedEntry.history && Array.isArray(selectedEntry.history)) {
        setTrajectoryItems(selectedEntry.history as TrajectoryItem[]);
      } else {
        setTrajectoryItems([]);
      }
    }
  };

  // Get entry display name for the sidebar
  const getEntryDisplayName = (entry: JsonlEntry, index: number): string => {
    if (entry.instance_id) return `Instance #${entry.instance_id}`;
    if (entry.id) return `Entry #${entry.id}`;
    return `Entry ${index + 1}`;
  };

  // Get a summary of the entry for the sidebar
  const getEntrySummary = (entry: JsonlEntry): React.ReactNode => {
    // If we have custom display fields, use those
    if (settings.displayFields.length > 0) {
      return (
        <div className="space-y-1">
          {settings.displayFields.map((field, idx) => {
            const value = getNestedValue(entry, field, null);
            const displayValue = formatValueForDisplay(value);
            
            // Format the field name for display
            let displayField = field;
            if (field.startsWith('len(') && field.endsWith(')')) {
              const innerField = field.substring(4, field.length - 1);
              displayField = `${innerField} length`;
            }
            
            return (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">{displayField}:</span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{displayValue}</span>
              </div>
            );
          })}
        </div>
      );
    }
    
    // Default behavior if no custom fields
    // Try to find a meaningful summary from the entry
    if (entry.task) return String(entry.task).substring(0, 30) + (String(entry.task).length > 30 ? '...' : '');
    if (entry.query) return String(entry.query).substring(0, 30) + (String(entry.query).length > 30 ? '...' : '');
    if (entry.prompt) return String(entry.prompt).substring(0, 30) + (String(entry.prompt).length > 30 ? '...' : '');
    
    // If history exists, try to get the first user message
    if (entry.history && entry.history.length > 0) {
      const userMessage = entry.history.find(item => 
        (item.actorType === 'User' || item.source === 'user') && item.content
      );
      if (userMessage && userMessage.content) {
        return String(userMessage.content).substring(0, 30) + (String(userMessage.content).length > 30 ? '...' : '');
      }
    }
    
    return 'No summary available';
  };

  if (error) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900/10 rounded-lg">
        <p className="text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  // Get the current entry without the history field for the JSON visualizer
  const currentEntryWithoutHistory = useMemo(() => {
    if (!entries[currentEntryIndex]) return null;
    return { ...entries[currentEntryIndex], history: undefined };
  }, [entries, currentEntryIndex]);

  // Function to filter out unwanted trajectory items
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

  // Filter the trajectory items
  const filteredTrajectoryItems = useMemo(() => {
    return trajectoryItems.filter(shouldDisplayItem);
  }, [trajectoryItems]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Settings */}
      <JsonlViewerSettings 
        settings={settings} 
        onSettingsChange={handleSettingsChange} 
      />
      
      {/* Main content with sidebar, timeline, and metadata */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 overflow-hidden">
        {/* Sidebar with entries list */}
        <div className="flex-none lg:w-1/5 h-full max-h-full border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm overflow-hidden flex flex-col">
          <div className="flex-none px-3 py-2 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Evaluation Instances ({entries.length})
            </h3>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Sorted by: {settings.sortField} ({settings.sortDirection === 'asc' ? 'ascending' : 'descending'})
            </div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar scrollbar-w-1.5 scrollbar-thumb-gray-200/75 dark:scrollbar-thumb-gray-700/75 scrollbar-track-transparent hover:scrollbar-thumb-gray-300/75 dark:hover:scrollbar-thumb-gray-600/75 scrollbar-thumb-rounded">
            {entries.map((entry, index) => (
              <div 
                key={index}
                onClick={() => handleSelectEntry(index)}
                className={`px-3 py-2 cursor-pointer border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                  index === currentEntryIndex ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {getEntryDisplayName(entry, index)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {getEntrySummary(entry)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline with trajectory components - full height with scrollable content */}
        <div className="flex-grow h-full lg:w-3/5 overflow-hidden">
          <div className="h-full flex flex-col border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
            {/* Timeline Header - fixed */}
            <div className="flex-none h-10 px-3 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Trajectory ({filteredTrajectoryItems.length} steps)
              </h3>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {entries[currentEntryIndex] && (
                  <span>
                    {getEntryDisplayName(entries[currentEntryIndex], currentEntryIndex)}
                  </span>
                )}
              </div>
            </div>
            
            {/* Timeline Content - scrollable */}
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar scrollbar-w-1.5 scrollbar-thumb-gray-200/75 dark:scrollbar-thumb-gray-700/75 scrollbar-track-transparent hover:scrollbar-thumb-gray-300/75 dark:hover:scrollbar-thumb-gray-600/75 scrollbar-thumb-rounded p-4">
              {filteredTrajectoryItems.length > 0 ? (
                <div className="flex flex-col items-center gap-4">
                  {filteredTrajectoryItems.map((item, index) => {
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
                    } else if (isThinkAction(item)) {
                      return <ThinkActionComponent key={index} action={item} />;
                    } else if (isThinkObservation(item)) {
                      return <ThinkObservationComponent key={index} observation={item} />;
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
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <p className="text-xl font-medium mb-2">No trajectory data available</p>
                    <p>The selected entry does not contain a valid trajectory history.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* JSON Visualizer - fixed height, no scroll */}
        <div className="flex-none lg:w-1/5 h-full max-h-full border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm overflow-hidden flex flex-col">
          <div className="flex-none px-3 py-2 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Entry Metadata</h3>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar scrollbar-w-1.5 scrollbar-thumb-gray-200/75 dark:scrollbar-thumb-gray-700/75 scrollbar-track-transparent hover:scrollbar-thumb-gray-300/75 dark:hover:scrollbar-thumb-gray-600/75 scrollbar-thumb-rounded p-3">
            {currentEntryWithoutHistory ? (
              <JsonVisualizer data={currentEntryWithoutHistory} initialExpanded={true} />
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                No metadata available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JsonlViewer;