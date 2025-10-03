import React from 'react';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  isLoading: boolean;
  placeholder: string;
}

export const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, isLoading, placeholder }) => {
  return (
    <textarea
      name="prompt"
      rows={2}
      className="block w-full rounded-md border-0 bg-gray-200/50 dark:bg-slate-800/80 py-2.5 px-3.5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-900/10 dark:ring-slate-700 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 disabled:opacity-50 transition-colors"
      placeholder={placeholder}
      value={prompt}
      onChange={(e) => setPrompt(e.target.value)}
      disabled={isLoading}
    />
  );
};