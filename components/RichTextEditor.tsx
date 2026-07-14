import React, { useRef, useEffect } from 'react';
import { BoldIcon, ItalicIcon, UnderlineIcon, ListBulletedIcon, ListOrderedIcon } from './icons.tsx';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (editor && value !== editor.innerHTML) {
      editor.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };
  
  const execCmd = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-md">
      <div className="flex items-center gap-1 p-1 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-t-md">
        <button type="button" onClick={() => execCmd('bold')} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700"><BoldIcon className="h-4 w-4" /></button>
        <button type="button" onClick={() => execCmd('italic')} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700"><ItalicIcon className="h-4 w-4" /></button>
        <button type="button" onClick={() => execCmd('underline')} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700"><UnderlineIcon className="h-4 w-4" /></button>
        <button type="button" onClick={() => execCmd('insertUnorderedList')} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700"><ListBulletedIcon className="h-4 w-4" /></button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        data-placeholder={placeholder}
        className="prose prose-sm dark:prose-invert max-w-none p-2 min-h-[80px] focus:outline-none [&[contenteditable=true]:empty]:before:content-[attr(data-placeholder)] [&[contenteditable=true]:empty]:before:text-gray-400 [&[contenteditable=true]:empty]:before:absolute"
      />
    </div>
  );
};

export default RichTextEditor;