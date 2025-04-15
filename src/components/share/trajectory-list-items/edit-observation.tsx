import React, { useState } from 'react';
import { CSyntaxHighlighter } from "../../syntax-highlighter";
import { TrajectoryCard } from "../trajectory-card";
import { EditObservation } from '../../../types/share';
import { DiffViewer } from '../../diff-viewer';

interface EditObservationProps {
  observation: EditObservation;
}

export const EditObservationComponent: React.FC<EditObservationProps> = ({ observation }) => {
  // Check if changes are empty
  const hasChanges = observation.extras.old_content && observation.extras.new_content && 
                    observation.extras.old_content !== observation.extras.new_content;
  
  const [showDiff, setShowDiff] = useState(hasChanges);
  const [showRawOutput, setShowRawOutput] = useState(!hasChanges);
  
  // Determine language based on file extension
  const getLanguage = (path: string) => {
    const extension = path.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'py':
        return 'python';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      case 'sh':
        return 'bash';
      default:
        return 'text';
    }
  };

  const language = getLanguage(observation.extras.path);

  return (
    <TrajectoryCard 
      className="bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700"
      originalJson={observation}
      timestamp={observation.timestamp}
    >
      <TrajectoryCard.Header className="bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200">
        <div className="flex justify-between items-center w-full">
          <span>File Edit Observation: {observation.extras.path}</span>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowDiff(!showDiff)} 
              className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              {showDiff ? 'Hide Diff' : 'Show Diff'}
            </button>
            <button 
              onClick={() => setShowRawOutput(!showRawOutput)} 
              className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              {showRawOutput ? 'Hide Raw Output' : 'Show Raw Output'}
            </button>
          </div>
        </div>
      </TrajectoryCard.Header>
      <TrajectoryCard.Body>
        {showDiff && (
          <div className="mb-3">
            <div className="text-xs font-medium mb-1">Changes:</div>
            <div className="border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
              <DiffViewer 
                oldStr={observation.extras.old_content || ''} 
                newStr={observation.extras.new_content || ''} 
                language={language}
              />
            </div>
          </div>
        )}
        
        {showRawOutput && (
          <div className="mt-3">
            <div className="text-xs font-medium mb-1">Raw Output:</div>
            <CSyntaxHighlighter language={language}>{observation.content}</CSyntaxHighlighter>
          </div>
        )}
      </TrajectoryCard.Body>
    </TrajectoryCard>
  );
};