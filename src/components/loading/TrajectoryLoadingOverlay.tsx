import React from 'react';

interface TrajectoryLoadingOverlayProps {
  message?: string;
}

export const TrajectoryLoadingOverlay: React.FC<TrajectoryLoadingOverlayProps> = ({ 
  message = 'Processing OpenHands Trajectory...' 
}) => {
  return (
    <div className="fixed inset-0 bg-gray-900/70 dark:bg-gray-900/80 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex flex-col items-center">
          <svg 
            className="w-16 h-16 mb-4 text-blue-500 animate-spin" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            ></circle>
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {message}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Please wait while we process and prepare your trajectory data for visualization.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrajectoryLoadingOverlay;