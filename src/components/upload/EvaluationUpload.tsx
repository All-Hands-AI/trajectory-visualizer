import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadContent } from '../../types/upload';

interface EvaluationUploadProps {
  onUpload: (content: UploadContent) => void;
}

export const EvaluationUpload: React.FC<EvaluationUploadProps> = ({ onUpload }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const fileContent = reader.result as string;
        
        // For JSONL files, we pass the raw content to be processed by JsonlViewer
        onUpload({
          content: {
            jsonlContent: fileContent,
            fileType: 'jsonl'
          }
        });
      } catch (error) {
        console.error('Failed to process file:', error);
        alert('Failed to process the file. Please make sure it is a valid JSONL file.');
      }
    };

    reader.readAsText(file);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.jsonl']
    },
    multiple: false
  });

  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Visualize OpenHands Evaluation Output
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Upload a JSONL file where each line contains a trajectory in the "history" field.
      </p>
      <div 
        {...getRootProps()} 
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-green-500 bg-green-50 dark:bg-green-900/10' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center">
          <svg 
            className={`w-12 h-12 mb-4 ${isDragActive ? 'text-green-500' : 'text-gray-400'}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className={`text-sm ${isDragActive ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
            {isDragActive
              ? 'Drop the evaluation file here...'
              : 'Drag and drop an evaluation file here, or click to select'
            }
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            Supported format: .jsonl (multiple evaluation instances)
          </p>
        </div>
      </div>
    </div>
  );
};