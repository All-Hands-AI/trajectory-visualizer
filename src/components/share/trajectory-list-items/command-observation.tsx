import React from 'react';
import { CSyntaxHighlighter } from "../../syntax-highlighter";
import { TrajectoryCard } from "../trajectory-card";
import { CommandObservation } from '../../../types/share';

interface CommandObservationProps {
  observation: CommandObservation;
}

export const CommandObservationComponent: React.FC<CommandObservationProps> = ({ observation }) => {
  return (
    <TrajectoryCard 
      className="bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700"
      originalJson={observation}
    >
      <TrajectoryCard.Header className="bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200">Shell Output</TrajectoryCard.Header>
      <TrajectoryCard.Body>
        <CSyntaxHighlighter language="shell">{observation.content}</CSyntaxHighlighter>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Exit code: {String(observation.extras?.metadata?.exit_code ?? observation.extras?.exit_code ?? 'N/A')}
        </div>
      </TrajectoryCard.Body>
    </TrajectoryCard>
  );
};