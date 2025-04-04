import React, { useState } from 'react';
import { TrajectoryItem } from '../../types/share';
import TrajectoryList from './trajectory-list';

export const TrajectoryUpload: React.FC = () => {
  const [trajectory, setTrajectory] = useState<TrajectoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split('\n').filter(line => line.trim() !== '');
        
        // Try to parse each line as JSON
        const parsedTrajectory = lines.map(line => {
          try {
            return JSON.parse(line);
          } catch (err) {
            console.error('Error parsing line:', line, err);
            throw new Error(`Invalid JSON in line: ${line.substring(0, 50)}...`);
          }
        });
        
        setTrajectory(parsedTrajectory);
        setError(null);
      } catch (err) {
        console.error('Error parsing file:', err);
        setError(`Failed to parse file: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };
    
    reader.onerror = () => {
      setError('Error reading file');
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <label className="flex flex-col items-center px-4 py-2 bg-white dark:bg-gray-800 text-blue-500 rounded-lg shadow-lg border border-blue-500 cursor-pointer hover:bg-blue-500 hover:text-white transition-colors">
            <span className="text-base leading-normal">Select trajectory file</span>
            <input 
              type='file' 
              className="hidden" 
              accept=".jsonl,.json"
              onChange={handleFileUpload}
            />
          </label>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {trajectory.length > 0 ? (
              <span>Loaded {trajectory.length} trajectory items</span>
            ) : (
              <span>Upload a JSONL file containing trajectory data</span>
            )}
          </div>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/10 text-red-700 dark:text-red-400 rounded-md">
            {error}
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-hidden p-4">
        {trajectory.length > 0 ? (
          <TrajectoryList trajectory={trajectory} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p className="text-xl font-medium mb-2">No trajectory data</p>
              <p>Upload a JSONL file to visualize the trajectory</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrajectoryUpload;