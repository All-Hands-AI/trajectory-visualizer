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
  // Split the diff content by file
  const fileChunks = diffContent.split(/^diff --git /m).filter(chunk => chunk.trim().length > 0);
  
  for (const chunk of fileChunks) {
    // Add back the "diff --git" prefix that was removed by the split
    const fileContent = `diff --git ${chunk}`;
    
    // Extract file names
    const fileHeaderMatch = fileContent.match(/^diff --git a\/(.*?) b\/(.*?)$/m);
    if (!fileHeaderMatch) continue;
    
    const oldFile = fileHeaderMatch[1];
    const newFile = fileHeaderMatch[2];
    
    // Extract hunks
    const hunks = [];
    const hunkMatches = [...fileContent.matchAll(/^(@@ -\d+,\d+ \+\d+,\d+ @@.*)(?:\n(?!diff --git|@@).*)*$/gms)];
    
    for (const hunkMatch of hunkMatches) {
      const hunkHeader = hunkMatch[0].match(/^@@ -(\d+),(\d+) \+(\d+),(\d+) @@/);
      if (!hunkHeader) continue;
      
      const oldStart = parseInt(hunkHeader[1], 10);
      const oldLines = parseInt(hunkHeader[2], 10);
      const newStart = parseInt(hunkHeader[3], 10);
      const newLines = parseInt(hunkHeader[4], 10);
      
      // Get the content for this hunk (including the header)
      const hunkContent = hunkMatch[0];
      
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
          {/* Instance Patch (displayed as Groundtruth patch) */}
          {instancePatch && (
            <div>
              <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Groundtruth Patch</h3>
              <div className="space-y-4">
                {instanceFiles.map((file, index) => (
                  <div key={`instance-${index}`} className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                    <div className="bg-gray-50 dark:bg-gray-700 px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                      {file.newFile}
                    </div>
                    {/* Extract the content for this specific file from the patch */}
                    <DiffViewer 
                      oldStr="" 
                      newStr={file.hunks.map(hunk => hunk.content).join('\n')} 
                      splitView={true} 
                    />
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
                    {/* Extract the content for this specific file from the patch */}
                    <DiffViewer 
                      oldStr="" 
                      newStr={file.hunks.map(hunk => hunk.content).join('\n')} 
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