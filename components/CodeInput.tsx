import React from 'react';
import { Theme } from '../types';
import { useCodeMirror } from '../hooks/useCodeMirror';

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

export const CodeInput: React.FC<CodeInputProps> = ({ code, setCode, isLoading, theme }) => {
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