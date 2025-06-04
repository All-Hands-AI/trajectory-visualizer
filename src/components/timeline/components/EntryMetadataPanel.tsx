import React from 'react';
import { TimelineEntry } from '../types';
import { DiffViewer } from '../../diff-viewer';

interface EntryMetadataPanelProps {
  entry: TimelineEntry;
}

const EntryMetadataPanel: React.FC<EntryMetadataPanelProps> = ({ entry }) => {
  // Check for patch files in the metadata
  const instancePatch = entry.metadata?.instance?.patch;
  const gitPatch = entry.metadata?.test_result?.git_patch;

  if (!instancePatch && !gitPatch) {
    return null;
  }

  return (
    <div className="space-y-4 mt-4">
      {/* Instance Patch Diff Viewer */}
      {instancePatch && (
        <div>
          <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Instance Patch</h4>
          <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
            <DiffViewer oldStr="" newStr={instancePatch} splitView={false} />
          </div>
        </div>
      )}

      {/* Git Patch Diff Viewer */}
      {gitPatch && (
        <div>
          <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Git Patch</h4>
          <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
            <DiffViewer oldStr="" newStr={gitPatch} splitView={false} />
          </div>
        </div>
      )}
    </div>
  );
};

export default EntryMetadataPanel;