import React from 'react';
import { CSyntaxHighlighter } from "../../syntax-highlighter";
import { TrajectoryCard } from "../trajectory-card";
import { ReadObservation } from '../../../types/share';

interface ReadObservationProps {
  observation: ReadObservation;
}

export const ReadObservationComponent: React.FC<ReadObservationProps> = ({ observation }) => {
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
      defaultCollapsed={true}
    >
      <TrajectoryCard.Header className="bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200">
        File Read Observation: {observation.extras.path}
      </TrajectoryCard.Header>
      <TrajectoryCard.Body>
        <CSyntaxHighlighter language={language}>{observation.content}</CSyntaxHighlighter>
      </TrajectoryCard.Body>
    </TrajectoryCard>
  );
};