import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
// @ts-ignore - vscDarkPlus has a type mismatch with the expected style prop

interface MarkdownProps {
  children: string;
}

export const CMarkdown: React.FC<MarkdownProps> = ({ children }) => {
  const components: Components = {
    code: ({ className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      const isInline = !match;
      return !isInline ? (
        <SyntaxHighlighter
          // @ts-ignore - vscDarkPlus has a type mismatch with the expected style prop
          style={vscDarkPlus}
          language={match ? match[1] : ''}
          PreTag="div"
          customStyle={{
            fontSize: '0.65rem',
            margin: '0.3rem 0',
            padding: '0.4rem',
            lineHeight: '0.9rem',
          }}
          codeTagProps={{
            style: {
              fontSize: '0.65rem',
              lineHeight: '0.9rem',
            }
          }}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={`text-[10px] ${className || ''}`} {...props}>
          {children}
        </code>
      );
    },
    p: ({ children }) => <p className="my-1 text-xs">{children}</p>,
    h1: ({ children }) => <h1 className="text-sm font-bold my-1.5">{children}</h1>,
    h2: ({ children }) => <h2 className="text-xs font-bold my-1">{children}</h2>,
    h3: ({ children }) => <h3 className="text-xs font-bold my-0.5">{children}</h3>,
    ul: ({ children }) => <ul className="list-disc pl-4 my-1 text-xs">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal pl-4 my-1 text-xs">{children}</ol>,
    li: ({ children }) => <li className="my-0.5">{children}</li>,
    a: ({ children, href }) => <a href={href || '#'} className="text-blue-500 hover:underline">{children}</a>,
    blockquote: ({ children }) => <blockquote className="border-l-2 border-gray-300 dark:border-gray-600 pl-2 my-1 text-xs text-gray-600 dark:text-gray-400">{children}</blockquote>,
  };

  return (
    <div className="text-xs prose dark:prose-invert prose-xs max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
};