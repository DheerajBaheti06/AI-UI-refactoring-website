import React from 'react';

interface MarkdownRendererProps {
    content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    // Basic markdown to HTML conversion
    const formattedContent = content
        .replace(/```(\w+)?\n([\s\S]+?)\n```/g, '<pre class="bg-gray-100 dark:bg-slate-900/70 p-3 rounded-md my-3 text-sm text-slate-800 dark:text-slate-200"><code>$2</code></pre>')
        .replace(/`([^`]+)`/g, '<code class="bg-gray-200 dark:bg-slate-700/50 text-purple-600 dark:text-purple-300 px-1 py-0.5 rounded">$1</code>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/### (.*?)(?:\n|$)/g, '<h3 class="text-lg font-semibold text-slate-900 dark:text-white mt-4 mb-2">$1</h3>')
        .replace(/## (.*?)(?:\n|$)/g, '<h2 class="text-xl font-semibold text-slate-900 dark:text-white mt-5 mb-2">$1</h2>')
        .replace(/# (.*?)(?:\n|$)/g, '<h1 class="text-2xl font-bold text-slate-900 dark:text-white mt-6 mb-3">$1</h1>')
        .replace(/^- (.*?)(?:\n|$)/gm, '<li class="ml-4 list-disc">$1</li>');

    return (
        <div 
            className="text-sm text-slate-700 dark:text-slate-300 prose prose-invert max-w-none" 
            dangerouslySetInnerHTML={{ __html: formattedContent }} 
        />
    );
};
