import React, { useState } from 'react';
import { CopyIcon } from '../icons/CopyIcon';

interface DependenciesViewProps {
    dependencies: string[];
}

export const DependenciesView: React.FC<DependenciesViewProps> = ({ dependencies }) => {
    const [copied, setCopied] = useState(false);

    if (!dependencies || dependencies.length === 0) {
        return <p className="text-slate-600 dark:text-slate-400">No new dependencies required.</p>;
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(dependencies.join('\n'));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Required Dependencies</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                To use the refactored component, you'll need to install the following packages in your project's terminal.
            </p>
            <div className="relative bg-gray-100 dark:bg-slate-900/70 rounded-md p-4 font-mono text-sm text-slate-800 dark:text-slate-200 ring-1 ring-slate-900/10 dark:ring-slate-700">
                <button onClick={handleCopy} className="absolute top-2.5 right-2.5 p-1.5 rounded-md bg-white/50 dark:bg-slate-700/50 hover:bg-gray-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 transition-all z-10" aria-label="Copy commands">
                    {copied ? <span className="text-xs px-1 text-blue-600 dark:text-blue-300">Copied!</span> : <CopyIcon className="h-4 w-4" />}
                </button>
                <pre><code>{dependencies.join('\n')}</code></pre>
            </div>
        </div>
    );
};