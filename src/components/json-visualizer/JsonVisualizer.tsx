import React, { useState } from 'react';

interface JsonVisualizerProps {
  data: any;
  excludeKeys?: string[];
  initialExpanded?: boolean;
}

const JsonVisualizer: React.FC<JsonVisualizerProps> = ({ 
  data, 
  excludeKeys = ['history'], 
  initialExpanded = false 
}) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (path: string) => {
    setExpanded(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const isExpanded = (path: string) => {
    return path === '' ? initialExpanded : expanded[path] || false;
  };

  const renderValue = (value: any, path: string, key: string) => {
    const currentPath = path ? `${path}.${key}` : key;
    
    // Skip excluded keys
    if (excludeKeys.includes(key)) {
      return (
        <div className="pl-4 text-gray-400 dark:text-gray-500 italic text-xs">
          [Hidden for brevity]
        </div>
      );
    }

    if (value === null) {
      return <span className="text-gray-500 dark:text-gray-400">null</span>;
    }

    if (typeof value === 'undefined') {
      return <span className="text-gray-500 dark:text-gray-400">undefined</span>;
    }

    if (typeof value === 'boolean') {
      return <span className="text-blue-600 dark:text-blue-400">{value.toString()}</span>;
    }

    if (typeof value === 'number') {
      return <span className="text-green-600 dark:text-green-400">{value}</span>;
    }

    if (typeof value === 'string') {
      if (value.length > 100) {
        return (
          <div>
            <span className="text-amber-600 dark:text-amber-400">"{value.substring(0, 100)}..."</span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(currentPath);
              }}
              className="ml-2 text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {isExpanded(currentPath) ? 'Show Less' : 'Show More'}
            </button>
            {isExpanded(currentPath) && (
              <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 whitespace-pre-wrap text-amber-600 dark:text-amber-400">
                "{value}"
              </div>
            )}
          </div>
        );
      }
      return <span className="text-amber-600 dark:text-amber-400">"{value}"</span>;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-gray-500 dark:text-gray-400">[]</span>;
      }

      return (
        <div>
          <div 
            onClick={() => toggleExpand(currentPath)}
            className="cursor-pointer flex items-center"
          >
            <span className="text-gray-500 dark:text-gray-400">Array({value.length})</span>
            <button className="ml-2 text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
              {isExpanded(currentPath) ? 'Collapse' : 'Expand'}
            </button>
          </div>
          {isExpanded(currentPath) && (
            <div className="pl-4 border-l border-gray-200 dark:border-gray-700 mt-1">
              {value.map((item, index) => (
                <div key={index} className="mt-1">
                  <span className="text-gray-500 dark:text-gray-400">{index}: </span>
                  {renderValue(item, currentPath, index.toString())}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (typeof value === 'object') {
      const keys = Object.keys(value);
      if (keys.length === 0) {
        return <span className="text-gray-500 dark:text-gray-400">{'{}'}</span>;
      }

      return (
        <div>
          <div 
            onClick={() => toggleExpand(currentPath)}
            className="cursor-pointer flex items-center"
          >
            <span className="text-gray-500 dark:text-gray-400">Object({keys.length})</span>
            <button className="ml-2 text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
              {isExpanded(currentPath) ? 'Collapse' : 'Expand'}
            </button>
          </div>
          {isExpanded(currentPath) && (
            <div className="pl-4 border-l border-gray-200 dark:border-gray-700 mt-1">
              {keys.map(objKey => (
                <div key={objKey} className="mt-1">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{objKey}: </span>
                  {renderValue(value[objKey], currentPath, objKey)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return <span>{String(value)}</span>;
  };

  return (
    <div className="font-mono text-xs bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-3 overflow-auto">
      {renderValue(data, '', '')}
    </div>
  );
};

export default JsonVisualizer;