import React, { useState } from 'react';
import { DiffViewer } from '../diff-viewer';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface GitDiffFile {
  oldFile: string;
  newFile: string;
  hunks: {
    oldStart: number;
    oldLines: number;
    newStart: number;
    newLines: number;
    content: string;
  }[];
}

interface CollapsableDiffPanelProps {
  instancePatch?: string;
  gitPatch?: string;
}

// Parse git diff format to extract file information
const parseGitDiff = (diffContent: string): GitDiffFile[] => {
  if (!diffContent) return [];
  
  const files: GitDiffFile[] = [];
  const fileRegex = /^diff --git a\/(.*?) b\/(.*?)$/gm;
  const hunkRegex = /^@@ -(\d+),(\d+) \+(\d+),(\d+) @@/gm;
  
  let fileMatch;
  while ((fileMatch = fileRegex.exec(diffContent)) !== null) {
    const oldFile = fileMatch[1];
    const newFile = fileMatch[2];
    
    // Get the content for this file diff
    const nextFileMatch = fileRegex.exec(diffContent);
    const endPos = nextFileMatch ? nextFileMatch.index : diffContent.length;
    fileRegex.lastIndex = nextFileMatch ? nextFileMatch.index : diffContent.length;
    
    const fileDiffContent = diffContent.substring(fileMatch.index, endPos);
    
    // Extract hunks
    const hunks = [];
    let hunkMatch;
    hunkRegex.lastIndex = 0;
    
    while ((hunkMatch = hunkRegex.exec(fileDiffContent)) !== null) {
      const oldStart = parseInt(hunkMatch[1], 10);
      const oldLines = parseInt(hunkMatch[2], 10);
      const newStart = parseInt(hunkMatch[3], 10);
      const newLines = parseInt(hunkMatch[4], 10);
      
      // Get the content for this hunk
      const nextHunkMatch = hunkRegex.exec(fileDiffContent);
      const hunkEndPos = nextHunkMatch ? nextHunkMatch.index : fileDiffContent.length;
      hunkRegex.lastIndex = nextHunkMatch ? nextHunkMatch.index : fileDiffContent.length;
      
      const hunkContent = fileDiffContent.substring(hunkMatch.index, hunkEndPos);
      
      hunks.push({
        oldStart,
        oldLines,
        newStart,
        newLines,
        content: hunkContent
      });
    }
    
    files.push({
      oldFile,
      newFile,
      hunks
    });
  }
  
  return files;
};

export const CollapsableDiffPanel: React.FC<CollapsableDiffPanelProps> = ({ instancePatch, gitPatch }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Parse the patches
  const instanceFiles = instancePatch ? parseGitDiff(instancePatch) : [];
  const gitFiles = gitPatch ? parseGitDiff(gitPatch) : [];
  
  // If there are no patches, don't render anything
  if (!instancePatch && !gitPatch) {
    return null;
  }
  
  return (
    <div className="mb-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
      {/* Header */}
      <button
        className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-700 text-left"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          File Changes {instanceFiles.length + gitFiles.length > 0 ? `(${instanceFiles.length + gitFiles.length} files)` : ''}
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
          {/* Instance Patch */}
          {instancePatch && (
            <div>
              <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Instance Patch</h3>
              <div className="space-y-4">
                {instanceFiles.map((file, index) => (
                  <div key={`instance-${index}`} className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                    <div className="bg-gray-50 dark:bg-gray-700 px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                      {file.newFile}
                    </div>
                    <DiffViewer oldStr="" newStr={instancePatch} splitView={true} />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Git Patch */}
          {gitPatch && (
            <div>
              <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Git Patch</h3>
              <div className="space-y-4">
                {gitFiles.map((file, index) => (
                  <div key={`git-${index}`} className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                    <div className="bg-gray-50 dark:bg-gray-700 px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                      {file.newFile}
                    </div>
                    <DiffViewer oldStr="" newStr={gitPatch} splitView={true} />
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