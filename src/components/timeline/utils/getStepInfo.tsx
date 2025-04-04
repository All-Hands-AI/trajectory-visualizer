
import { TimelineEntry, StepInfo } from '../types';

function getActorType(entry: TimelineEntry): 'User' | 'Assistant' | 'System' {
  return entry.actorType || 'System';
}

export const getStepInfo = (entry: TimelineEntry): StepInfo => {
  // Return the message title for messages
  if (entry.type === 'message') {
    // Check if this is a thought message (has thought content)
    if (entry.thought) {
      return {
        stepTitle: 'Thought',
        stepIcon: (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        ),
        actorType: getActorType(entry),
        stepColor: 'indigo'
      };
    }
    
    // For user messages, use a different icon
    if (getActorType(entry) === 'User') {
      return {
        stepTitle: entry.title || entry.content?.split('\n')[0] || 'User Message',
        stepIcon: (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ),
        actorType: getActorType(entry),
        stepColor: 'green'
      };
    }
    
    // For assistant messages
    return {
      stepTitle: entry.title || entry.content?.split('\n')[0] || 'Assistant Message',
      stepIcon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      actorType: getActorType(entry),
      stepColor: 'blue'
    };
  }

  if (entry.type === 'command') {
    // Check if it's a command action or observation
    const isObservation = entry.title?.toLowerCase().includes('observation') || false;
    
    return {
      stepTitle: entry.title || (isObservation ? 'Command Output' : 'Command'),
      stepIcon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      actorType: getActorType(entry),
      stepColor: isObservation ? 'amber' : 'green'
    };
  }

  if (entry.type === 'edit') {
    // Check if it's an edit action or observation
    const isObservation = entry.title?.toLowerCase().includes('observation') || false;
    
    return {
      stepTitle: entry.title || (isObservation ? 'Edit Result' : 'Edit'),
      stepIcon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      actorType: getActorType(entry),
      stepColor: isObservation ? 'amber' : 'yellow'
    };
  }

  if (entry.type === 'search') {
    // Check if it's a search action or observation
    const isObservation = entry.title?.toLowerCase().includes('observation') || false;
    
    return {
      stepTitle: entry.title || (isObservation ? 'Search Result' : 'Search'),
      stepIcon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      actorType: getActorType(entry),
      stepColor: isObservation ? 'purple' : 'indigo'
    };
  }

  if (entry.type === 'error') {
    return {
      stepTitle: entry.title || 'Error',
      stepIcon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      actorType: getActorType(entry),
      stepColor: 'red'
    };
  }
  
  if (entry.type === 'read') {
    // Check if it's a read action or observation
    const isObservation = entry.title?.toLowerCase().includes('observation') || false;
    
    return {
      stepTitle: entry.title || (isObservation ? 'Read Result' : 'Read'),
      stepIcon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      actorType: getActorType(entry),
      stepColor: isObservation ? 'teal' : 'cyan'
    };
  }

  // For finish actions
  if (entry.type === 'finish') {
    return {
      stepTitle: entry.title || 'Finish',
      stepIcon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      actorType: getActorType(entry),
      stepColor: 'emerald'
    };
  }
  
  // For think actions
  if (entry.type === 'think') {
    return {
      stepTitle: entry.title || 'Think',
      stepIcon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      actorType: getActorType(entry),
      stepColor: 'indigo'
    };
  }

  // Default case
  return {
    stepTitle: entry.title || 'Action',
    stepIcon: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    actorType: getActorType(entry),
    stepColor: 'blue'
  };
};