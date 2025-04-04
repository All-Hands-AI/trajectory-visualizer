import React, { memo } from 'react';

interface CommandBlockProps {
  command: string;
  onCopy?: (command: string) => void;
}

export const CommandBlock: React.FC<CommandBlockProps> = memo(({ command, onCopy }) => (
  <div className="group relative">
    <pre className="text-[11px] font-mono text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded overflow-x-auto leading-relaxed px-3 py-2">
      <span className="select-none text-gray-500 dark:text-gray-600 mr-2">$</span>{command}
    </pre>
    <button
      type="button"
      onClick={() => onCopy?.(command)}
      className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-700/50 text-gray-600 dark:text-gray-400"
    >
      <span className="sr-only">Copy command</span>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
      </svg>
    </button>
  </div>
));

CommandBlock.displayName = 'CommandBlock';

export default CommandBlock; 