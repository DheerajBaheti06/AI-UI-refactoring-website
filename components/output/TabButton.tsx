import React from 'react';
import { Theme } from '../../types';

interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
    hasIndicator?: boolean;
    theme?: Theme;
}

export const TabButton: React.FC<TabButtonProps> = ({ active, onClick, children, hasIndicator, theme }) => {
    const activeClasses = theme === 'light'
        ? 'text-slate-900 bg-white/70 border border-slate-900/20 shadow-sm'
        : 'text-white bg-slate-700/50';
    
    const inactiveClasses = 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-gray-300/50 dark:hover:bg-slate-700/50';

    return (
      <button
        onClick={onClick}
        className={`relative px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none ${
          active ? activeClasses : inactiveClasses
        }`}
      >
        {children}
        {hasIndicator && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
        )}
      </button>
    );
};