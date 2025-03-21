import React from 'react';

interface Issue {
  title: string;
  body: string;
  number: number;
}

interface Metrics {
  accumulated_cost?: number;
}

interface ArtifactContent {
  issue?: Issue;
  metrics?: Metrics;
  success?: boolean;
}

interface ArtifactDetailsProps {
  content: ArtifactContent | null;
}

export const ArtifactDetails: React.FC<ArtifactDetailsProps> = ({ content }) => {
  if (!content) {
    return (
      <div className="text-xs text-gray-500 dark:text-gray-400">
        No metadata available.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {content.issue && (
        <div className="bg-gray-50/50 dark:bg-gray-700/50 rounded px-2 py-1.5">
          <p className="text-xs font-medium text-gray-900 dark:text-white line-clamp-1">{content.issue.title}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{content.issue.body}</p>
          <div className="mt-1 text-[10px] text-gray-400 dark:text-gray-500">
            #{content.issue.number}
          </div>
        </div>
      )}
      
      {content.metrics && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50/50 dark:bg-gray-700/50 rounded px-2 py-1.5">
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Total Cost</p>
            <p className="text-xs font-medium text-gray-900 dark:text-white tabular-nums">
              ${content.metrics.accumulated_cost?.toFixed(5) || 'N/A'}
            </p>
          </div>
          <div className="bg-gray-50/50 dark:bg-gray-700/50 rounded px-2 py-1.5">
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Status</p>
            <p className="text-xs font-medium text-gray-900 dark:text-white">
              {content.success ? 'Success' : 'Failed'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtifactDetails; 