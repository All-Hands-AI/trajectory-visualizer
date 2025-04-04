import React from 'react';
import { CSyntaxHighlighter } from "../../syntax-highlighter";
import { TrajectoryCard } from "../trajectory-card";
import { IPythonObservation } from '../../../types/share';

interface IPythonObservationProps {
  observation: IPythonObservation;
}

export const IPythonObservationComponent: React.FC<IPythonObservationProps> = ({ observation }) => {
  return (
    <TrajectoryCard 
      className="bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700"
      originalJson={observation}
    >
      <TrajectoryCard.Header className="bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200">IPython Output</TrajectoryCard.Header>
      <TrajectoryCard.Body>
        <CSyntaxHighlighter language="python">{observation.content}</CSyntaxHighlighter>
      </TrajectoryCard.Body>
    </TrajectoryCard>
  );
};