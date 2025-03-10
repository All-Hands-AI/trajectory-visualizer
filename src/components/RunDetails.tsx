import React, { useEffect, useState, useCallback, useRef } from 'react';
import { RunDetailsResponse, WorkflowRun, Artifact } from '../types';
import { api } from '../services/api';
import RunDetailsSkeleton from './loading/RunDetailsSkeleton';
import { Timeline } from './timeline/Timeline';
import { TimelineEntry } from './timeline/types';
import ArtifactDetails from './artifacts/ArtifactDetails';
import RunHeader from './header/RunHeader';
import { convertOpenHandsTrajectory } from '../utils/openhands-converter';

interface RunDetailsProps {
  owner: string;
  repo: string;
  run: WorkflowRun;
  initialContent?: any;
}

const RunDetails: React.FC<RunDetailsProps> = ({ owner, repo, run, initialContent }) => {
  const [runDetails, setRunDetails] = useState<RunDetailsResponse | null>(null);

  const [artifactContent, setArtifactContent] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [contentLoading, setContentLoading] = useState<boolean>(false);
  const [processingArtifact, setProcessingArtifact] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(1);

  // Track if we're initializing
  const isInitializingRef = useRef(true);
  
  useEffect(() => {
    // Initialize the step index but use a different approach for initial vs. subsequent renders
    if (isInitializingRef.current) {
      // On initial render, set state without triggering effects
      isInitializingRef.current = false;
      // Only set if needed
      if (selectedStepIndex !== 1) {
        setSelectedStepIndex(1);
      }
    } else {
      // On subsequent run.id changes, reset to step 1
      setSelectedStepIndex(1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run.id]);

  // Create a reference for timelineEntries for use in multiple places
  const getTimelineEntries = useCallback(() => {
    try {
      // Check if this is an OpenHands trajectory
      if (artifactContent?.content?.trajectory) {
        return convertOpenHandsTrajectory(artifactContent.content.trajectory);
      }
      return artifactContent?.content?.history || artifactContent?.content?.jsonlHistory || [];
    } catch (error) {
      console.error('Failed to convert trajectory:', error);
      return [{
        type: 'error',
        timestamp: new Date().toISOString(),
        title: 'Error Processing Trajectory',
        content: `Failed to process trajectory: ${error instanceof Error ? error.message : 'Unknown error'}. The trajectory visualizer accepts the following formats:\n\n1. Array of events with action, args, timestamp, etc.\n2. Object with "entries" array containing events\n3. Object with "test_result.git_patch" containing a git patch`,
        actorType: 'System',
        command: '',
        path: ''
      }];
    }
  }, [artifactContent]);

  // Direct keyboard navigation for timeline steps
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if the event is from an input or textarea
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Get the timeline entries using our helper
      const timelineEntries = getTimelineEntries();
      const maxSteps = timelineEntries.length - 1;
      
      console.log('RunDetails: Key pressed:', event.key, 'Current step:', selectedStepIndex, 'Max steps:', maxSteps, 'Entries:', timelineEntries.length);
      
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        // Always try to move one step to the right
        if (selectedStepIndex < maxSteps) {
          // Use a callback to ensure we're working with the most current state
          setSelectedStepIndex((current) => {
            const nextStep = current < maxSteps ? current + 1 : current;
            console.log('RunDetails: Moving right to step:', nextStep);
            return nextStep;
          });
        } else {
          console.log('RunDetails: Already at last step');
        }
      } 
      else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        // Always try to move one step to the left, but not below 1
        if (selectedStepIndex > 1) {
          // Use a callback to ensure we're working with the most current state
          setSelectedStepIndex((current) => {
            const prevStep = current > 1 ? current - 1 : current;
            console.log('RunDetails: Moving left to step:', prevStep);
            return prevStep;
          });
        } else {
          console.log('RunDetails: Already at first step');
        }
      }
    };

    // Add the event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [getTimelineEntries, selectedStepIndex]);

  const handleCommandClick = useCallback((command: string): void => {
    navigator.clipboard.writeText(command.replace(/^\$ /, ''));
  }, []);

  const handleFileEditClick = useCallback((): void => {
    // Handle file edit click
  }, []);

  const handleArtifactSelect = useCallback(async (artifact: Artifact) => {
    if (!artifact) return;
    // Set loading state at the beginning of the process
    setContentLoading(true);

    try {
      console.log('Loading artifact content for:', artifact.name);
      const content = await api.getArtifactContent(owner, repo, artifact.id);
      console.log('Fetched artifact content:', content);
      
      // Check if the content has timeline entries
      const timelineEntries = content?.content?.history || content?.content?.jsonlHistory;
      console.log('Timeline entries from artifact:', timelineEntries?.length || 0);
      
      // For large artifacts, show processing state while we unzip and process
      if (timelineEntries && timelineEntries.length > 50) {
        console.log('Processing large artifact with', timelineEntries.length, 'entries');
        setProcessingArtifact(true);
        
        // Add a small delay to allow processing time for complex artifacts
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setArtifactContent(content);
    } catch (err) {
      console.error('Failed to fetch artifact content:', err);
      setArtifactContent(null);
    } finally {
      setContentLoading(false);
      setProcessingArtifact(false);
    }
  }, [owner, repo]);

  useEffect(() => {
    const fetchRunDetails = async () => {
      if (!owner || !repo || !run) return;

      try {
        setLoading(true);
        setProcessingArtifact(false); // Reset processing state
        
        if (initialContent) {
          // Use initial content if provided (for local trajectories)
          setRunDetails({
            run: run,
            jobs: { total_count: 0, jobs: [] },
            artifacts: { total_count: 0, artifacts: [] }
          });
          setArtifactContent(initialContent);
        } else {
          // Fetch from GitHub API
          const details = await api.getRunDetails(owner, repo, run.id);
          setRunDetails(details);

          // Reset artifact state when run changes
          setArtifactContent(null);

          // If there's exactly one artifact and run was successful, auto-select it
          if (details.artifacts?.artifacts?.length === 1 && run.conclusion === 'success') {
            // Keep the loading state active during auto-selection
            await handleArtifactSelect(details.artifacts.artifacts[0]);
          }
        }

        setError(null);
      } catch (err) {
        console.error('Failed to fetch run details:', err);
        setError('Failed to load run details. Please try again.');
      } finally {
        // Only stop loading if we're not processing an artifact
        if (!processingArtifact) {
          setLoading(false);
        }
      }
    };

    fetchRunDetails();
  }, [owner, repo, run, handleArtifactSelect, processingArtifact, initialContent]);

  const formatTimelineDate = useCallback((entry: TimelineEntry): string => {
    if (!entry.timestamp) {
      return run.created_at ? new Date(run.created_at).toLocaleTimeString() : 'N/A';
    }
    return new Date(entry.timestamp).toLocaleTimeString();
  }, [run.created_at]);

  // Show skeleton loader during any loading state (initial load, artifact loading, or content processing)
  if (loading || contentLoading || processingArtifact) {
    return <RunDetailsSkeleton />;
  }

  if (error || !runDetails) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900/10 rounded-lg">
        <p className="text-red-500 dark:text-red-400">{error || 'Failed to load run details'}</p>
      </div>
    );
  }

  // Use our helper function to get the timeline entries
  const timelineEntries = getTimelineEntries();
  console.log('Rendering with timeline entries:', timelineEntries.length);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Timeline and Artifact Content */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 overflow-hidden">
        {/* Timeline - full height with scrollable content */}
        <div className="flex-grow h-full lg:w-3/4 overflow-hidden">
          <div className="h-full flex flex-col border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
            {/* Timeline Header - fixed */}
            <div className="flex-none h-10 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Timeline ({timelineEntries.length > 0 ? timelineEntries.length - 1 : 0} steps)
              </h3>
            </div>
            
            {/* Timeline Content - scrollable */}
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar scrollbar-w-1.5 scrollbar-thumb-gray-200/75 dark:scrollbar-thumb-gray-700/75 scrollbar-track-transparent hover:scrollbar-thumb-gray-300/75 dark:hover:scrollbar-thumb-gray-600/75 scrollbar-thumb-rounded">
              <Timeline
                entries={timelineEntries}
                selectedIndex={selectedStepIndex}
                formatTimelineDate={formatTimelineDate}
                onStepSelect={setSelectedStepIndex}
                onCommandClick={handleCommandClick}
                onFileEditClick={handleFileEditClick}
                createdAt={run.created_at}
              />
            </div>
          </div>
        </div>

        {/* Artifact Metadata - fixed height, no scroll */}
        <div className="flex-none lg:w-1/4 h-full max-h-full border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm overflow-hidden flex flex-col">
          <div className="flex-none px-3 py-2 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Run Details</h3>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar scrollbar-w-1.5 scrollbar-thumb-gray-200/75 dark:scrollbar-thumb-gray-700/75 scrollbar-track-transparent hover:scrollbar-thumb-gray-300/75 dark:hover:scrollbar-thumb-gray-600/75 scrollbar-thumb-rounded">
            {/* Run Header (moved from top) */}
            <div className="p-3">
              <RunHeader run={run} artifactContent={artifactContent?.content} />
            </div>
            
            {/* Only show artifact details if they exist and are not part of the issue */}
            {artifactContent?.content && (artifactContent.content.metrics || (artifactContent.content && !artifactContent.content.issue)) && (
              <>
                {/* Divider */}
                <div className="border-t border-gray-200 dark:border-gray-700 mx-3 my-3"></div>
                
                {/* Artifact Details */}
                <div className="px-3 pb-3">
                  <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Artifact Data</h4>
                  <ArtifactDetails content={artifactContent?.content} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RunDetails; 