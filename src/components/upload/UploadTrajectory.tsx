import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadContent } from '../../types/upload';

interface UploadTrajectoryProps {
  onUpload: (content: UploadContent) => void;
}

export const UploadTrajectory: React.FC<UploadTrajectoryProps> = ({ onUpload }) => {


  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const reader = new FileReader();

    reader.onload = () => {
      try {
        // For JSON files, we parse the content and pass it as a trajectory
        const content = JSON.parse(reader.result as string);
        onUpload({
          content: {
            trajectoryData: content,
            fileType: 'trajectory'
          }
        });
      } catch (error) {
        console.error('Failed to process file:', error);
        alert('Failed to parse the trajectory file. Please make sure it is a valid JSON file.');
      }
    };

    reader.readAsText(file);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json']
    },
    multiple: false
  });

  return (
    <div 
      {...getRootProps()} 
      className={`
        border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
        ${isDragActive 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' 
          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center">
        <svg 
          className={`w-12 h-12 mb-4 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p className={`text-sm ${isDragActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
          {isDragActive
            ? 'Drop the trajectory file here...'
            : 'Drag and drop a trajectory file here, or click to select'
          }
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
          Only .json files are supported
        </p>
      </div>
    </div>
  );
};