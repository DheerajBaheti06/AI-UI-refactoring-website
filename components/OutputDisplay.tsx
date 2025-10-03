import React, { useState, useMemo, useEffect } from 'react';
import { Language, Theme } from '../types';
import { CodeBlock } from './output/CodeBlock';
import { LoadingSkeleton } from './output/LoadingSkeleton';
import { MarkdownRenderer } from './output/MarkdownRenderer';
import { DependenciesView } from './output/DependenciesView';
import { TabButton } from './output/TabButton';
import { SparklesIcon } from './icons/SparklesIcon';
import { DesktopIcon } from './icons/DesktopIcon';
import { TabletIcon } from './icons/TabletIcon';
import { MobileIcon } from './icons/MobileIcon';
import { FullScreenIcon } from './icons/FullScreenIcon';
import { ExitFullScreenIcon } from './icons/ExitFullScreenIcon';

type Viewport = 'desktop' | 'tablet' | 'mobile';

const LivePreview: React.FC<{ code: string; language: Language; theme: Theme }> = ({ code, language, theme }) => {
    const [viewport, setViewport] = useState<Viewport>('desktop');
    const [isFullScreen, setIsFullScreen] = useState(false);

    const viewportClasses = {
        desktop: 'w-full',
        tablet: 'w-[768px]',
        mobile: 'w-[375px]',
    };

    const iframeContent = useMemo(() => {
        const htmlClass = theme === 'dark' ? 'class="dark"' : '';
        const bodyBg = theme === 'dark' ? '#0f172a' : '#ffffff';
        const textColor = theme === 'dark' ? '#cbd5e1' : '#334155';

        if (language === 'tsx') {
            return `
                <html ${htmlClass}>
                    <head>
                        <script src="https://cdn.tailwindcss.com"></script>
                        <script>
                            tailwind.config = { darkMode: 'class' }
                        </script>
                        <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
                        <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
                        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
                        <style>
                            body { 
                                margin: 0; 
                                display: flex; 
                                justify-content: center; 
                                align-items: center; 
                                min-height: 100vh; 
                                background-color: ${bodyBg}; 
                                color: ${textColor};
                                padding: 1rem; 
                                font-family: sans-serif;
                            }
                        </style>
                    </head>
                    <body>
                        <div id="root"></div>
                        <script type="text/babel">
                            try {
                                ${code}
                                if (typeof RefactoredComponent !== 'undefined') {
                                    const container = document.getElementById('root');
                                    const root = ReactDOM.createRoot(container);
                                    root.render(<RefactoredComponent />);
                                } else {
                                     document.getElementById('root').innerHTML = '<div style="color: #f97316; font-family: monospace; padding: 1rem;">Error: RefactoredComponent function not found in the generated code.</div>';
                                }
                            } catch(e) {
                                document.getElementById('root').innerHTML = '<div style="color: #ef4444; font-family: monospace; padding: 1rem;"><strong>Script Error:</strong><br/>' + e.message + '</div>';
                            }
                        </script>
                    </body>
                </html>
            `;
        } else { // language === 'html'
            return `
                <html ${htmlClass}>
                    <head>
                        <script src="https://cdn.tailwindcss.com"></script>
                         <script>
                            tailwind.config = { darkMode: 'class' }
                        </script>
                        <style>
                           body { 
                                padding: 1rem; 
                                background-color: ${bodyBg}; 
                                color: ${textColor};
                                font-family: sans-serif;
                            }
                        </style>
                    </head>
                    <body>
                        ${code}
                    </body>
                </html>
            `;
        }
    }, [code, language, theme]);
    
    const toggleFullScreen = () => setIsFullScreen(!isFullScreen);

    const previewIframe = (
         <iframe
            title="Live Preview"
            sandbox="allow-scripts"
            srcDoc={iframeContent}
            className="w-full h-full border-none"
        />
    );

    if (isFullScreen) {
        return (
             <div className="fixed inset-0 bg-white dark:bg-slate-900 z-[100] flex flex-col">
                <div className="flex-shrink-0 bg-slate-100 dark:bg-slate-800 p-2 flex justify-end">
                     <button onClick={toggleFullScreen} className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700">
                        <ExitFullScreenIcon className="h-5 w-5" />
                    </button>
                </div>
                <div className="flex-grow flex items-center justify-center p-4">
                    <div className="w-full h-full bg-white dark:bg-slate-900 shadow-lg rounded-lg">
                        {previewIframe}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900/50">
            <div className="flex-shrink-0 bg-white dark:bg-slate-800/50 border-b border-slate-900/10 dark:border-slate-700 p-2 flex justify-between items-center">
                <div className="flex items-center space-x-1 sm:space-x-2">
                    <button onClick={() => setViewport('desktop')} title="Desktop view" className={`p-2 rounded-md ${viewport === 'desktop' ? 'bg-blue-500 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                        <DesktopIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => setViewport('tablet')} title="Tablet view" className={`p-2 rounded-md ${viewport === 'tablet' ? 'bg-blue-500 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                        <TabletIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => setViewport('mobile')} title="Mobile view" className={`p-2 rounded-md ${viewport === 'mobile' ? 'bg-blue-500 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                        <MobileIcon className="h-5 w-5" />
                    </button>
                </div>
                 <button onClick={toggleFullScreen} title="Fullscreen view" className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700">
                    <FullScreenIcon className="h-5 w-5" />
                </button>
            </div>
            <div className="flex-grow flex items-center justify-center p-4">
                <div className={`transition-all duration-300 ease-in-out ${viewportClasses[viewport]} h-full`}>
                    <div className="w-full h-full rounded-lg shadow-lg border border-slate-900/10 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
                       {previewIframe}
                    </div>
                </div>
            </div>
        </div>
    );
};

interface OutputDisplayProps {
    improvedCode: string;
    explanation: string;
    language: Language;
    dependencies: string[];
    isLoading: boolean;
    error: string | null;
    theme: Theme;
}

type Tab = 'preview' | 'code' | 'explanation' | 'dependencies';

export const OutputDisplay: React.FC<OutputDisplayProps> = ({
    improvedCode,
    explanation,
    language,
    dependencies,
    isLoading,
    error,
    theme
}) => {
    const [activeTab, setActiveTab] = useState<Tab>('preview');

    useEffect(() => {
        if (improvedCode && !error) {
            setActiveTab('preview');
        }
    }, [improvedCode, error]);

    const renderContent = () => {
        if (isLoading) {
            return <div className="p-8"><LoadingSkeleton /></div>;
        }

        if (error) {
            return (
                <div className="p-8 text-center text-red-500">
                    <h3 className="text-lg font-semibold mb-2">An Error Occurred</h3>
                    <p>{error}</p>
                </div>
            );
        }

        if (!improvedCode) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-slate-400 p-8">
                    <SparklesIcon className="h-10 w-10 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Ready to Refactor</h3>
                    <p className="text-sm">Your improved UI component will appear here.</p>
                </div>
            );
        }

        switch (activeTab) {
            case 'preview':
                return <LivePreview code={improvedCode} language={language} theme={theme} />;
            case 'code':
                return <div className="p-4 lg:p-6"><CodeBlock code={improvedCode} language={language} theme={theme} /></div>;
            case 'explanation':
                return <div className="p-6 lg:p-8 overflow-y-auto h-full max-h-[calc(100vh-10rem)]"><MarkdownRenderer content={explanation} /></div>;
            case 'dependencies':
                return <div className="p-6 lg:p-8"><DependenciesView dependencies={dependencies} /></div>;
            default:
                return null;
        }
    };
    
    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-800/30">
            {improvedCode && !error && !isLoading && (
                 <div className="flex-shrink-0 p-3 bg-white/50 dark:bg-slate-900/30 backdrop-blur-sm border-b border-slate-900/10 dark:border-slate-700/50 flex items-center space-x-2">
                    <TabButton active={activeTab === 'preview'} onClick={() => setActiveTab('preview')} theme={theme}>
                        Preview
                    </TabButton>
                    <TabButton active={activeTab === 'code'} onClick={() => setActiveTab('code')} theme={theme}>
                        Code
                    </TabButton>
                    <TabButton active={activeTab === 'explanation'} onClick={() => setActiveTab('explanation')} theme={theme}>
                        Explanation
                    </TabButton>
                    <TabButton active={activeTab === 'dependencies'} onClick={() => setActiveTab('dependencies')} theme={theme} hasIndicator={dependencies.length > 0}>
                        Dependencies
                    </TabButton>
                 </div>
            )}
            <div className="flex-grow relative overflow-hidden">
                {renderContent()}
            </div>
        </div>
    );
};