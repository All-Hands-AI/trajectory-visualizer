import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

interface MarkdownProps {
  children: string;
}

export const CMarkdown: React.FC<MarkdownProps> = ({ children }) => {
  return (
    <div className="text-xs prose dark:prose-invert prose-xs max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                customStyle={{
                  fontSize: '0.7rem',
                  margin: '0.4rem 0',
                }}
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={`text-xs ${className}`} {...props}>
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
          a: ({ children, href }) => <a href={href} className="text-blue-500 hover:underline">{children}</a>,
          blockquote: ({ children }) => <blockquote className="border-l-2 border-gray-300 dark:border-gray-600 pl-2 my-1 text-xs text-gray-600 dark:text-gray-400">{children}</blockquote>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
};