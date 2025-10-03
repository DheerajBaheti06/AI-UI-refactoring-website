import React, { useState } from 'react';
import { getUIImprovementFromCode } from '../services/geminiService';
import { Language, Theme } from '../types';
import { CodeInput } from './CodeInput';
import { OutputDisplay } from './OutputDisplay';
import { PromptInput } from './PromptInput';

interface InputFormProps {
    theme: Theme;
}

export const InputForm: React.FC<InputFormProps> = ({ theme }) => {
  const [userCode, setUserCode] = useState<string>('');
  const [refactorPrompt, setRefactorPrompt] = useState<string>('');
  const [stylePrompt, setStylePrompt] = useState<string>('');
  
  const [improvedCode, setImprovedCode] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');
  const [language, setLanguage] = useState<Language>('tsx');
  const [dependencies, setDependencies] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!userCode.trim()) {
      setError("Please provide some component code to refactor.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setImprovedCode('');
    setExplanation('');
    setDependencies([]);

    try {
      const { improvedCode: newCode, explanation: newExplanation, language: newLang, dependencies: newDeps } = await getUIImprovementFromCode(userCode, refactorPrompt, stylePrompt);
      setImprovedCode(newCode);
      setExplanation(newExplanation);
      setLanguage(newLang);
      setDependencies(newDeps);
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Input Column */}
      <div className="glass-card rounded-xl p-6 lg:p-8 space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gradient">1. Component Code</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Paste your TSX/JSX or HTML/CSS component. The AI will detect the language and rewrite it.</p>
        </div>
        <CodeInput code={userCode} setCode={setUserCode} isLoading={isLoading} theme={theme} />
        
        <div className="space-y-2">
           <h2 className="text-xl font-semibold text-gradient">2. Refactor Request <span className="text-slate-500 dark:text-slate-400 text-sm font-normal">(Optional)</span></h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Describe any functional or structural improvements you'd like.</p>
        </div>
        <PromptInput 
          prompt={refactorPrompt} 
          setPrompt={setRefactorPrompt} 
          isLoading={isLoading}
          placeholder="e.g., 'Make the call-to-action more prominent.'"
        />
        
        <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gradient">3. Target Style <span className="text-slate-500 dark:text-slate-400 text-sm font-normal">(Optional)</span></h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Describe the visual aesthetic you're aiming for.</p>
        </div>
        <PromptInput 
          prompt={stylePrompt} 
          setPrompt={setStylePrompt} 
          isLoading={isLoading}
          placeholder="e.g., 'A minimal, monochrome dashboard' or 'Brutalist aesthetic'"
        />
        
        <div className="pt-4">
          <button
            onClick={handleSubmit}
            disabled={!userCode || isLoading}
            className="w-full relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-slate-900 dark:text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 disabled:from-slate-500 disabled:to-slate-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 disabled:cursor-not-allowed"
          >
            <span className="w-full relative px-5 py-3.5 transition-all ease-in duration-75 bg-white dark:bg-slate-900 rounded-md group-hover:bg-opacity-0 disabled:bg-slate-300 dark:disabled:bg-slate-700">
               {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refactoring...
                </span>
              ) : (
                '✨ Refactor UI'
              )}
            </span>
          </button>
        </div>
      </div>

      {/* Output Column */}
      <div className="glass-card rounded-xl">
        <OutputDisplay 
          improvedCode={improvedCode}
          explanation={explanation}
          language={language}
          dependencies={dependencies}
          isLoading={isLoading}
          error={error}
          theme={theme}
        />
      </div>
    </div>
  );
};