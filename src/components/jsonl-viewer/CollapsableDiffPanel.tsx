import React, { useState } from 'react';
import { DiffViewer } from '../diff-viewer';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import parseDiff from 'parse-diff';

// Create a type declaration for parse-diff
declare module 'parse-diff' {
  export default function parseDiff(diff: string): ParsedFile[];
}

interface ParsedFile {
  chunks: {
    changes: {
      type: string;
      content: string;
    }[];
  }[];
  from?: string;
  to?: string;
}

interface CollapsableDiffPanelProps {
  instancePatch?: string;
  gitPatch?: string;
}

// Helper functions to extract old and new content from a parsed file
const extractOldContent = (file: any): string => {
  let content = '';
  
  if (file.chunks) {
    for (const chunk of file.chunks) {
      for (const change of chunk.changes) {
        if (change.type === 'normal' || change.type === 'del') {
          content += change.content.substring(1) + '\n';
        }
      }
    }
  }
  
  return content;
};

const extractNewContent = (file: any): string => {
  let content = '';
  
  if (file.chunks) {
    for (const chunk of file.chunks) {
      for (const change of chunk.changes) {
        if (change.type === 'normal' || change.type === 'add') {
          content += change.content.substring(1) + '\n';
        }
      }
    }
  }
  
  return content;
};

export const CollapsableDiffPanel: React.FC<CollapsableDiffPanelProps> = ({ instancePatch, gitPatch }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Parse the patches using parse-diff
  const instanceFiles = instancePatch ? parseDiff(instancePatch) : [];
  const gitFiles = gitPatch ? parseDiff(gitPatch) : [];
  
  // If there are no patches, don't render anything
  if (!instancePatch && !gitPatch) {
    return null;
  }
  
  // Count total files
  const totalFiles = instanceFiles.length + gitFiles.length;
  
  return (
    <div className="mb-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
      {/* Header */}
      <button
        className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-700 text-left"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          File Changes {totalFiles > 0 ? `(${totalFiles} files)` : ''}
        </span>
        {isExpanded ? (
          <ChevronDownIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        ) : (
          <ChevronRightIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        )}
      </button>
      
      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Instance Patch (displayed as Groundtruth patch) */}
          {instancePatch && instanceFiles.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Groundtruth Patch</h3>
              <div className="space-y-4">
                {instanceFiles.map((file, index) => (
                  <div key={`instance-${index}`} className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                    <div className="bg-gray-50 dark:bg-gray-700 px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                      {file.to}
                    </div>
                    {/* Create a proper diff view with old and new content */}
                    <DiffViewer 
                      oldStr={extractOldContent(file)} 
                      newStr={extractNewContent(file)} 
                      splitView={true} 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Git Patch */}
          {gitPatch && gitFiles.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Git Patch</h3>
              <div className="space-y-4">
                {gitFiles.map((file, index) => (
                  <div key={`git-${index}`} className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                    <div className="bg-gray-50 dark:bg-gray-700 px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                      {file.to}
                    </div>
                    {/* Create a proper diff view with old and new content */}
                    <DiffViewer 
                      oldStr={extractOldContent(file)} 
                      newStr={extractNewContent(file)} 
                      splitView={true} 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CollapsableDiffPanel;