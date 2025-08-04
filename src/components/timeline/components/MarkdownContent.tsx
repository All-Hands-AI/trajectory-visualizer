import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { markdownStyles } from '../utils/styles';

interface MarkdownContentProps {
  content: string;
  className?: string;
  maxHeight?: string;
}

export const MarkdownContent: React.FC<MarkdownContentProps> = memo(({ 
  content, 
  className = '',
  maxHeight
}) => {
  // Check if content is likely to be a system prompt or large markdown block
  const isSystemPrompt = content?.includes('<ROLE>') && content?.includes('</ROLE>');
  const isLargeContent = content?.length > 500;
  
  // Apply special styling for system prompts
  const contentClass = isSystemPrompt ? 'system-prompt' : '';
  
  // Apply max height if specified or if content is large
  const heightStyle = maxHeight || (isLargeContent ? '200px' : 'auto');
  const overflowStyle = heightStyle !== 'auto' ? 'overflow-y-auto pr-2' : '';
  
  return (
    <div 
      className={`${markdownStyles} ${contentClass} ${overflowStyle} ${className}`}
      style={{ maxHeight: heightStyle }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
});

MarkdownContent.displayName = 'MarkdownContent';

export default MarkdownContent; 