import React, { useState } from 'react';
import { Language, Theme } from '../../types';
import { CopyIcon } from '../icons/CopyIcon';
import { useCodeMirror } from '../../hooks/useCodeMirror';

interface CodeBlockProps {
    code: string;
    language: Language;
    theme: Theme;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, theme }) => {
  const [copied, setCopied] = useState(false);
  
  const editorRef = useCodeMirror({
    value: code,
    isReadOnly: true,
    theme: theme,
    language: language
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-lg overflow-hidden h-[calc(100vh-22rem)] min-h-[400px]">
      <button onClick={handleCopy} className="absolute top-2.5 right-2.5 p-1.5 rounded-md bg-gray-300/50 dark:bg-slate-700/50 hover:bg-gray-400/50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 transition-all z-10" aria-label="Copy code">
        {copied ? <span className="text-xs px-1 text-blue-600 dark:text-blue-300">Copied!</span> : <CopyIcon className="h-4 w-4" />}
      </button>
      <div ref={editorRef} className="text-sm h-full"></div>
    </div>
  );
};
