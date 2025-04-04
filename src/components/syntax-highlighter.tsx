import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CSyntaxHighlighterProps {
  language: string;
  children: string;
}

export const CSyntaxHighlighter: React.FC<CSyntaxHighlighterProps> = ({ language, children }) => {
  return (
    <SyntaxHighlighter
      language={language}
      style={vscDarkPlus}
      customStyle={{
        borderRadius: '0.25rem',
        margin: 0,
        padding: '0.5rem',
        fontSize: '0.7rem',
        lineHeight: '1rem',
      }}
    >
      {children}
    </SyntaxHighlighter>
  );
};