
import { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (value: string) => void;
  isReadOnly?: boolean;
  userName?: string;
}

const CodeEditor = ({ 
  code, 
  language, 
  onChange, 
  isReadOnly = false,
  userName 
}: CodeEditorProps) => {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate editor loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  // Simulate syntax highlighting with basic styling
  const getHighlightedCode = () => {
    let formattedCode = code;
    
    // Very simple syntax highlighting simulation
    if (language === 'javascript' || language === 'typescript') {
      formattedCode = formattedCode
        .replace(/(const|let|var|function|return|if|else|for|while)/g, '<span class="text-purple-400">$1</span>')
        .replace(/(".*?"|'.*?'|`.*?`)/g, '<span class="text-green-400">$1</span>')
        .replace(/(\d+)/g, '<span class="text-yellow-400">$1</span>')
        .replace(/(\/\/.*)/g, '<span class="text-gray-400">$1</span>');
    }
    
    return formattedCode;
  };

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-zinc-900 rounded-md">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-zinc-900 rounded-md overflow-hidden font-mono text-sm">
      {userName && (
        <div className="absolute top-2 right-3 bg-purple-600 text-white px-2 py-1 rounded-md text-xs z-10">
          {userName}
        </div>
      )}
      <textarea
        ref={editorRef}
        value={code}
        onChange={handleChange}
        className={cn(
          "w-full h-full p-4 bg-transparent text-gray-200 outline-none resize-none",
          "border-none focus:ring-0 placeholder:text-gray-500",
          isReadOnly ? "cursor-not-allowed opacity-70" : ""
        )}
        readOnly={isReadOnly}
        spellCheck={false}
        placeholder="// Write your code here..."
      />
    </div>
  );
};

export default CodeEditor;
