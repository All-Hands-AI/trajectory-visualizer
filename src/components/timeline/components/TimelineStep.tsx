import React, { memo } from 'react';
import { TimelineStepProps } from '../types';
import { getStepInfo } from '../utils/getStepInfo';
import { colorClasses } from '../utils/styles';
import MarkdownContent from './MarkdownContent';
import CommandBlock from './CommandBlock';

export const TimelineStep: React.FC<TimelineStepProps> = memo(({
  entry,
  index,
  isSelected,
  isLast,
  formatTimelineDate,
  onSelect,
  onCommandClick,
  onFileEditClick,
}) => {
  const { stepTitle, stepIcon, actorType, stepColor } = getStepInfo(entry);

  return (
    <div className="relative">
      {!isLast && (
        <div className="absolute left-[10px] top-8 bottom-0 w-[1px] bg-gradient-to-b from-gray-200/50 dark:from-gray-600/30 to-transparent" aria-hidden="true" />
      )}
      
      <div 
        className={`px-3 pt-1.5 pb-2.5 transition-colors duration-150 ${
          isSelected 
            ? 'bg-blue-50/50 dark:bg-blue-900/20 shadow-sm' 
            : 'hover:bg-gray-50/50 dark:hover:bg-gray-700/50'
        }`}
        onClick={() => onSelect(index)}
        tabIndex={0} 
        role="button"
        aria-pressed={isSelected}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(index);
          }
        }}
      >
        <div className="flex gap-3">
          {/* Icon */}
          <div className="flex-none">
            <div className={`w-5 h-5 flex items-center justify-center rounded-md ${colorClasses[stepColor]} shadow-sm ring-1 ring-black/5 dark:ring-white/5`}>
              {stepIcon}
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`inline-flex items-center h-[18px] px-1.5 rounded-md text-[10px] font-medium ${colorClasses[stepColor]} shadow-sm ring-1 ring-black/5 dark:ring-white/5`}>
                  {actorType}
                </span>
                <h4 className="text-xs font-medium text-gray-900 dark:text-white truncate max-w-[180px]">
                  {stepTitle}
                </h4>
                <time className="text-[10px] tabular-nums text-gray-400 dark:text-gray-500 font-medium">
                  {formatTimelineDate(entry)}
                </time>
              </div>
              {entry.metadata?.cost && (
                <span className="inline-flex items-center h-5 px-1.5 text-[10px] tabular-nums font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-md shadow-sm ring-1 ring-black/5 dark:ring-white/5">
                  ${entry.metadata.cost.toFixed(5)}
                </span>
              )}
            </div>

            {/* Content sections - only show previews in timeline */}
            <div className="space-y-1 mt-1.5">
              {/* Thought content */}
              {entry.thought && (
                <div className="text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20 rounded px-2 py-1 line-clamp-1 overflow-hidden">
                  <MarkdownContent content={entry.thought} />
                </div>
              )}
              
              {/* Regular content */}
              {entry.content && (
                <div className="text-xs text-gray-600 dark:text-gray-300 line-clamp-1 overflow-hidden">
                  <MarkdownContent content={entry.content} />
                </div>
              )}
              
              {/* Command content */}
              {entry.command && (
                <div className="line-clamp-1 overflow-hidden">
                  <CommandBlock command={entry.command} onCopy={onCommandClick} />
                </div>
              )}
              
              {/* File path for edits */}
              {entry.path && (
                <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                  <code className="font-mono bg-gray-50/50 dark:bg-gray-800/50 px-1 rounded truncate max-w-[180px]">
                    {entry.path}
                  </code>
                  {onFileEditClick && (
                    <button
                      type="button"
                      onClick={() => onFileEditClick()}
                      className="ml-auto text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 whitespace-nowrap"
                    >
                      View Changes
                    </button>
                  )}
                </div>
              )}
              
              {/* Entry metadata is now shown in the right panel */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

TimelineStep.displayName = 'TimelineStep';

export default TimelineStep; 