import React from 'react';
import { CodeIcon } from './icons/CodeIcon';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { Theme } from '../types';

interface HeaderProps {
    theme: Theme;
    toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  return (
    <header className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-b border-slate-900/10 dark:border-slate-700/50 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <CodeIcon className="h-7 w-7" />
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">AI UI Refactor</h1>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
          </button>
        </div>
      </div>
    </header>
  );
};