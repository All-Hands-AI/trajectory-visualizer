import React, { useEffect, useRef } from 'react';
import { TimelineProps } from './types';
import TimelineStep from './components/TimelineStep';

export const Timeline: React.FC<TimelineProps> = ({
  entries,
  selectedIndex,
  onStepSelect,
  onCommandClick,
  onFileEditClick,
  formatTimelineDate,
}) => {
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const selectedStepRef = useRef<HTMLDivElement>(null);

  // Scroll to selected step when selectedIndex changes
  useEffect(() => {
    if (selectedStepRef.current && selectedIndex > 0 && timelineContainerRef.current) {
      console.log('Timeline: Scrolling to selected step', selectedIndex);
      try {
        // Use a small timeout to ensure DOM is updated
        setTimeout(() => {
          selectedStepRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }, 50);
      } catch (error) {
        console.error('Timeline: Error scrolling to selected step', error);
      }
    }
  }, [selectedIndex]);

  // Debug: Check if entries exist
  console.log(`Timeline: Rendering ${entries.length} entries, selected index: ${selectedIndex}`);

  return (
    <div className="h-full py-1 px-2">
      <div ref={timelineContainerRef}>
        {/* Debug info for the timeline */}
        {entries.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No timeline entries available
          </div>
        )}

        {/* Empty state */}
        {entries.length <= 1 && (
          <div className="p-4 text-center text-gray-500">
            No timeline entries available
          </div>
        )}

        {/* Timeline entries - Skip the first step (index 0) */}
        <div>
          {entries.slice(1).map((entry, index) => {
            // Add 1 to index since we're slicing from index 1
            const realIndex = index + 1;
            return (
              <div
                key={realIndex}
                ref={realIndex === selectedIndex ? selectedStepRef : null}
                id={`timeline-step-${realIndex}`}
                className="mb-2 relative"
              >
                <TimelineStep
                  entry={entry}
                  index={realIndex}
                  isSelected={realIndex === selectedIndex}
                  isLast={realIndex === entries.length - 1}
                  formatTimelineDate={formatTimelineDate}
                  onSelect={onStepSelect}
                  onCommandClick={onCommandClick}
                  onFileEditClick={onFileEditClick}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Timeline; 