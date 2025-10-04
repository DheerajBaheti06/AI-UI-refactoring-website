import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";

// ========= Inlined: types.ts =========
type Language = 'tsx' | 'html';
type Theme = 'light' | 'dark';


// ========= Inlined: services/geminiService.ts =========
if (!process.env.API_KEY) {
  console.warn("API_KEY is not set. The application will not be able to refactor code.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const CODE_SYSTEM_INSTRUCTION = `You are a world-class senior frontend engineer. Your primary task is to rewrite user-provided component code based on their requests.

**1. First, analyze the user's code to identify the language.** It will be either React (TSX/JSX) or standard HTML with CSS.

**2. Based on the identified language, you MUST follow the specific rules for that language:**

---

### **If the language is React (TSX/JSX):**
- Rewrite the code using React, TypeScript, and Tailwind CSS.
- **CRITICAL RULE: The generated component MUST be completely self-contained.** It cannot accept or rely on any props being passed to it. If the component needs to be interactive, it must manage its own state internally (e.g., using \`React.useState\`).
- The user's code is being rendered in a sandbox where React and ReactDOM are already available globally. **DO NOT include 'import React from "react"'** or any other imports. The code must be a single, self-contained component.
- The root component of your refactored code **MUST** be a function declaration named \`RefactoredComponent\`.
- Example format: \`function RefactoredComponent() { /* your JSX here */ }\`
- **DO NOT use \`export default\`**. This is critical for the live preview to work.
- The returned language in the JSON must be "tsx".

---

### **If the language is HTML/CSS:**
- Rewrite the code as a single, self-contained HTML snippet.
- **You MUST use Tailwind CSS classes directly within the HTML for all styling.** Do not use inline \`<style>\` tags or separate CSS. The goal is a modern, utility-first HTML component.
- Ensure the HTML is semantically correct and accessible.
- The returned language in the JSON must be "html".

---

**3. General Rules:**
- If the user provides a target style, you **MUST** creatively and significantly overhaul the component's design to match that style. This is your top priority.
- If no style is provided, focus on improving layout, spacing, color contrast, and overall aesthetic according to modern UI/UX principles.
- Provide a brief explanation of the key improvements you made in markdown format.
- You **MUST** return a valid JSON object matching the provided schema.

**4. List Dependencies:**
- If your refactored code uses any third-party libraries that need to be installed (e.g., 'framer-motion', 'clsx', 'lucide-react'), you MUST list the installation commands in the 'dependencies' array.
- The format should be the full command, e.g., "npm install framer-motion".
- If the code uses only React and Tailwind CSS (which are assumed to be present), or standard HTML/CSS, the 'dependencies' array **MUST** be empty.`;

const improvementSchema = {
  type: Type.OBJECT,
  properties: {
    language: {
      type: Type.STRING,
      description: "The detected language of the provided code. Must be either 'tsx' or 'html'.",
    },
    improvedCode: {
      type: Type.STRING,
      description: "The complete, refactored code as a single string, following the language-specific rules.",
    },
    explanation: {
      type: Type.STRING,
      description: "A brief, user-friendly explanation of the UI/UX improvements made, in markdown format.",
    },
    dependencies: {
      type: Type.ARRAY,
      description: "A list of command-line instructions for installing any new npm packages required by the refactored code. E.g., ['npm install framer-motion']. If no new dependencies are needed, this should be an empty array.",
      items: { type: Type.STRING }
    }
  },
  required: ["language", "improvedCode", "explanation", "dependencies"],
};

const getUIImprovementFromCode = async (
  userCode: string,
  refactorPrompt: string,
  stylePrompt: string,
): Promise<{ language: Language, improvedCode: string; explanation: string; dependencies: string[] }> => {
  try {
    const fullPrompt = `
      The user has provided a frontend component. Your task is to identify its language, refactor it based on their requests, and follow all rules in the system instruction.

      **User's Original Code:**
      \`\`\`
      ${userCode}
      \`\`\`

      ---

      **User's Refactor Request:** 
      "${refactorPrompt || 'No specific request provided. Focus on general UI/UX improvements.'}"

      **User's Target Style:**
      "${stylePrompt || 'No specific style provided. Use your best judgment for a modern, clean design.'}"

      ---

      Based on all of the above, please identify the language, rewrite the code, provide an explanation for your changes, and list any required dependencies.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        systemInstruction: CODE_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: improvementSchema,
        temperature: 0.7,
      },
    });

    const jsonStr = response.text.trim();
    if (jsonStr.startsWith('{') && jsonStr.endsWith('}')) {
        const result = JSON.parse(jsonStr);
        if (result.language !== 'tsx' && result.language !== 'html') {
          throw new Error("AI returned an invalid language type.");
        }
        return result;
    } else {
        console.error("Received non-JSON response:", jsonStr);
        throw new Error("Received an invalid response from the AI. It might have been too complex to process.");
    }
  } catch (error) {
    console.error("Error generating code improvement:", error);
    throw new Error("Failed to get UI improvement from code. The AI may have been unable to process the request.");
  }
};


// ========= Inlined: components/icons/CodeIcon.tsx =========
const CodeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <defs>
      <linearGradient id="code-icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#818cf8' }} />
        <stop offset="100%" style={{ stopColor: '#c084fc' }} />
      </linearGradient>
    </defs>
    <polyline points="16 18 22 12 16 6" stroke="url(#code-icon-gradient)" />
    <polyline points="8 6 2 12 8 18" stroke="url(#code-icon-gradient)" />
  </svg>
);

// ========= Inlined: components/icons/SunIcon.tsx =========
const SunIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

// ========= Inlined: components/icons/MoonIcon.tsx =========
const MoonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

// ========= Inlined: components/icons/SparklesIcon.tsx =========
const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <defs>
      <linearGradient id="sparkles-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#818cf8' }} />
        <stop offset="100%" style={{ stopColor: '#c084fc' }} />
      </linearGradient>
    </defs>
    <g stroke="url(#sparkles-gradient)">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
      <path d="M5 3v4"></path>
      <path d="M19 17v4"></path>
      <path d="M3 5h4"></path>
      <path d="M17 19h4"></path>
    </g>
  </svg>
);

// ========= Inlined: components/icons/DesktopIcon.tsx =========
const DesktopIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
    <line x1="8" y1="21" x2="16" y2="21"></line>
    <line x1="12" y1="17" x2="12" y2="21"></line>
  </svg>
);

// ========= Inlined: components/icons/TabletIcon.tsx =========
const TabletIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
    <line x1="12" y1="18" x2="12.01" y2="18"></line>
  </svg>
);

// ========= Inlined: components/icons/MobileIcon.tsx =========
const MobileIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
    <line x1="12" y1="18" x2="12.01" y2="18"></line>
  </svg>
);

// ========= Inlined: components/icons/FullScreenIcon.tsx =========
const FullScreenIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
  </svg>
);

// ========= Inlined: components/icons/ExitFullScreenIcon.tsx =========
const ExitFullScreenIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
  </svg>
);

// ========= Inlined: components/icons/CopyIcon.tsx =========
const CopyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);


// ========= Inlined: hooks/useTheme.ts =========
const useTheme = () => {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  }, []);

  return { theme, toggleTheme };
};


// ========= Inlined: hooks/useCodeMirror.ts =========
declare const CodeMirror: any;

interface UseCodeMirrorOptions {
  value: string;
  onChange?: (value: string) => void;
  isReadOnly?: boolean;
  placeholder?: string;
  theme: Theme;
  language: Language;
}

const useCodeMirror = (options: UseCodeMirrorOptions) => {
  const { value, onChange, isReadOnly = false, placeholder = '', theme, language } = options;
  const editorRef = useRef<HTMLDivElement>(null);
  const cmInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (editorRef.current && !cmInstanceRef.current) {
      const instance = CodeMirror(editorRef.current, {
        value: value || placeholder,
        mode: language === 'tsx' ? { name: 'javascript', jsx: true } : 'htmlmixed',
        theme: theme === 'dark' ? 'chai' : 'default',
        lineNumbers: true,
        readOnly: isReadOnly,
        gutters: ['CodeMirror-linenumbers'],
        styleActiveLine: true,
        matchBrackets: true,
      });

      cmInstanceRef.current = instance;

      if (onChange) {
        instance.on('change', (cm: any) => {
          const currentValue = cm.getValue();
          if (currentValue !== placeholder) {
            onChange(currentValue);
          } else {
             onChange('');
          }
        });
      }

      if (placeholder) {
        const wrapper = instance.getWrapperElement();
        if (!value) {
            wrapper.style.opacity = '0.6';
        }

        instance.on('focus', (cm: any) => {
          if (cm.getValue() === placeholder) {
            cm.setValue('');
            wrapper.style.opacity = '1';
          }
        });

        instance.on('blur', (cm: any) => {
          if (!cm.getValue().trim()) {
            cm.setValue(placeholder);
            wrapper.style.opacity = '0.6';
          }
        });
      }
    }
  }, []); // Empty dependency array ensures this runs only once.

  useEffect(() => {
    const cm = cmInstanceRef.current;
    if (cm) {
      if (cm.getValue() !== value) {
        if(value === '' && placeholder) {
             cm.setValue(placeholder);
             cm.getWrapperElement().style.opacity = '0.6';
        } else {
             cm.setValue(value);
             cm.getWrapperElement().style.opacity = '1';
        }
      }
    }
  }, [value, placeholder]);

  useEffect(() => {
    if (cmInstanceRef.current) {
      cmInstanceRef.current.setOption('readOnly', isReadOnly);
      cmInstanceRef.current.getWrapperElement().style.opacity = isReadOnly ? '0.5' : '1';
    }
  }, [isReadOnly]);

  useEffect(() => {
    if (cmInstanceRef.current) {
      cmInstanceRef.current.setOption('theme', theme === 'dark' ? 'chai' : 'default');
    }
  }, [theme]);
  
   useEffect(() => {
    if (cmInstanceRef.current) {
      cmInstanceRef.current.setOption('mode', language === 'tsx' ? { name: 'javascript', jsx: true } : 'htmlmixed');
    }
  }, [language]);


  return editorRef;
};

// ========= Inlined: components/output/CodeBlock.tsx =========
interface CodeBlockProps {
    code: string;
    language: Language;
    theme: Theme;
}
const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, theme }) => {
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


// ========= Inlined: components/output/LoadingSkeleton.tsx =========
const LoadingSkeleton: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-slate-400">
    <svg className="animate-spin h-8 w-8 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p className="font-semibold text-slate-800 dark:text-white">Refactoring Code...</p>
    <p className="text-sm text-slate-600 dark:text-slate-500">The AI is working its magic.</p>
  </div>
);

// ========= Inlined: components/output/MarkdownRenderer.tsx =========
interface MarkdownRendererProps {
    content: string;
}
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    const formattedContent = content
        .replace(/```(\w+)?\n([\s\S]+?)\n```/g, '<pre class="bg-gray-100 dark:bg-slate-900/70 p-3 rounded-md my-3 text-sm text-slate-800 dark:text-slate-200 overflow-x-auto"><code>$2</code></pre>')
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


// ========= Inlined: components/output/DependenciesView.tsx =========
interface DependenciesViewProps {
    dependencies: string[];
}
const DependenciesView: React.FC<DependenciesViewProps> = ({ dependencies }) => {
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

// ========= Inlined: components/output/TabButton.tsx =========
interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
    hasIndicator?: boolean;
    theme?: Theme;
}
const TabButton: React.FC<TabButtonProps> = ({ active, onClick, children, hasIndicator, theme }) => {
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

// ========= Inlined: components/OutputDisplay.tsx =========
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
const OutputDisplay: React.FC<OutputDisplayProps> = ({
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
                 <div className="flex-shrink-0 p-3 bg-white/50 dark:bg-slate-900/30 backdrop-blur-sm border-b border-slate-900/10 dark:border-slate-700/50 flex items-center space-x-2 overflow-x-auto">
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


// ========= Inlined: components/CodeInput.tsx =========
const PLACEHOLDER_CODE = `// Example:
function MyButton() {
  return (
    <button style={{
      padding: '10px 20px',
      border: '1px solid black',
      borderRadius: '5px'
    }}>
      Click Me
    </button>
  );
};
`;
interface CodeInputProps {
  code: string;
  setCode: (code: string) => void;
  isLoading: boolean;
  theme: Theme;
}
const CodeInput: React.FC<CodeInputProps> = ({ code, setCode, isLoading, theme }) => {
  const editorRef = useCodeMirror({
    value: code,
    onChange: setCode,
    isReadOnly: isLoading,
    placeholder: PLACEHOLDER_CODE,
    theme: theme,
    language: 'tsx'
  });

  return (
      <div 
        ref={editorRef} 
        className="w-full rounded-lg overflow-hidden h-64 lg:h-80"
      ></div>
  );
};


// ========= Inlined: components/PromptInput.tsx =========
interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  isLoading: boolean;
  placeholder: string;
}
const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, isLoading, placeholder }) => {
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


// ========= Inlined: components/InputForm.tsx =========
interface InputFormProps {
    theme: Theme;
}
const InputForm: React.FC<InputFormProps> = ({ theme }) => {
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

// ========= Inlined: components/Header.tsx =========
interface HeaderProps {
    theme: Theme;
    toggleTheme: () => void;
}
const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
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

// ========= Inlined: App.tsx =========
const App: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen">
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main className="px-4 sm:px-6 lg:px-8 py-10">
        <InputForm theme={theme} />
      </main>
    </div>
  );
};


// ========= Original index.tsx content =========
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
