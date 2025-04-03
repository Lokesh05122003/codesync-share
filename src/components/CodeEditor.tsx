
import { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (value: string) => void;
  isReadOnly?: boolean;
  userName?: string;
  userCursors?: {
    id: string;
    name: string;
    position?: {
      line: number;
      column: number;
    };
    activeStatus?: string;
  }[];
  onCursorMove?: (position: { line: number, column: number }) => void;
}

const CodeEditor = ({ 
  code, 
  language, 
  onChange, 
  isReadOnly = false,
  userName,
  userCursors = [],
  onCursorMove
}: CodeEditorProps) => {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cursorPosition, setCursorPosition] = useState({ line: 0, column: 0 });

  useEffect(() => {
    // Simulate editor loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    trackCursorPosition(e.target);
  };

  const trackCursorPosition = (textarea: HTMLTextAreaElement) => {
    const cursorPosition = textarea.selectionStart;
    
    // Calculate line and column from cursor position
    const text = textarea.value.substring(0, cursorPosition);
    const lines = text.split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;
    
    setCursorPosition({ line, column });
    
    if (onCursorMove) {
      onCursorMove({ line, column });
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    trackCursorPosition(e.currentTarget);
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    trackCursorPosition(e.currentTarget);
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
    } else if (language === 'python') {
      formattedCode = formattedCode
        .replace(/(def|class|if|else|for|while|import|from|return)/g, '<span class="text-purple-400">$1</span>')
        .replace(/(".*?"|'.*?')/g, '<span class="text-green-400">$1</span>')
        .replace(/(\d+)/g, '<span class="text-yellow-400">$1</span>')
        .replace(/(#.*)/g, '<span class="text-gray-400">$1</span>');
    } else if (language === 'java' || language === 'cpp' || language === 'csharp') {
      formattedCode = formattedCode
        .replace(/(public|private|protected|class|interface|void|int|String|boolean|static|final)/g, '<span class="text-purple-400">$1</span>')
        .replace(/(".*?"|'.*?')/g, '<span class="text-green-400">$1</span>')
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
          {userName} • Line: {cursorPosition.line}, Col: {cursorPosition.column}
        </div>
      )}
      
      {/* Render other users' cursors */}
      {userCursors.map(user => (
        <div 
          key={user.id}
          className={cn(
            "absolute h-3 w-2 z-20 border-l-2 opacity-70",
            user.activeStatus === 'typing' ? 'border-green-500 animate-pulse' : 'border-orange-500',
            user.activeStatus === 'executing' ? 'border-red-500 animate-pulse' : ''
          )}
          style={{ 
            top: `calc(${(user.position?.line || 1) * 1.5}rem + 0.75rem)`,
            left: `calc(${(user.position?.column || 1) * 0.5}rem + 1rem)`
          }}
        >
          <span className="absolute -top-5 left-0 bg-zinc-800 text-xs px-1 py-0.5 rounded whitespace-nowrap">
            {user.name}
          </span>
        </div>
      ))}
      
      <textarea
        ref={editorRef}
        value={code}
        onChange={handleChange}
        onClick={handleClick}
        onKeyUp={handleKeyUp}
        className={cn(
          "w-full h-full p-4 bg-transparent text-gray-200 outline-none resize-none",
          "border-none focus:ring-0 placeholder:text-gray-500",
          isReadOnly ? "cursor-not-allowed opacity-70" : ""
        )}
        readOnly={isReadOnly}
        spellCheck={false}
        placeholder={`// Write your ${language} code here...`}
      />
    </div>
  );
};

export default CodeEditor;
