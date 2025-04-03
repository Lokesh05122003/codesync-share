
import { useState } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConsoleOutputProps {
  output: string;
  error?: string;
  isLoading?: boolean;
  onClear: () => void;
}

const ConsoleOutput = ({ output, error, isLoading = false, onClear }: ConsoleOutputProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={cn(
      "bg-zinc-900 rounded-md overflow-hidden transition-all duration-300 flex flex-col",
      isExpanded ? "fixed inset-0 z-50 m-4" : "h-full"
    )}>
      <div className="flex items-center justify-between bg-zinc-800 px-4 py-2">
        <h3 className="text-sm font-medium text-white">Console Output</h3>
        <div className="flex gap-2">
          <button 
            onClick={onClear} 
            className="text-gray-400 hover:text-white transition"
            aria-label="Clear console"
          >
            <X size={18} />
          </button>
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            className="text-gray-400 hover:text-white transition"
            aria-label={isExpanded ? "Minimize console" : "Maximize console"}
          >
            {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>
      
      <div className="flex-1 p-4 font-mono text-sm overflow-auto">
        {isLoading ? (
          <div className="text-yellow-400 animate-pulse">Running code...</div>
        ) : (
          <>
            {error && <div className="text-red-400 whitespace-pre-wrap mb-2">{error}</div>}
            {output && <div className="text-green-300 whitespace-pre-wrap">{output}</div>}
            {!error && !output && <div className="text-gray-500 italic">No output to display</div>}
          </>
        )}
      </div>
    </div>
  );
};

export default ConsoleOutput;
