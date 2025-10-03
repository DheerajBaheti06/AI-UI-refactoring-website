import { useEffect, useRef } from 'react';
import { Language, Theme } from '../types';

declare const CodeMirror: any;

interface UseCodeMirrorOptions {
  value: string;
  onChange?: (value: string) => void;
  isReadOnly?: boolean;
  placeholder?: string;
  theme: Theme;
  language: Language;
}

export const useCodeMirror = (options: UseCodeMirrorOptions) => {
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

    return () => {
      if (cmInstanceRef.current) {
        // This cleanup is tricky in React StrictMode. For this app's scope,
        // we will not destroy the instance to avoid re-initialization issues.
      }
    };
  }, []); // Empty dependency array ensures this runs only once.

  useEffect(() => {
    const cm = cmInstanceRef.current;
    if (cm) {
      if (cm.getValue() !== value && value !== placeholder) {
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

  return editorRef;
};