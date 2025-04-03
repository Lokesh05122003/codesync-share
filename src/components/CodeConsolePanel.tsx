
import ConsoleOutput from '@/components/ConsoleOutput';

interface CodeConsolePanelProps {
  output: string;
  error: string;
  isLoading: boolean;
  executionTime?: number;
  executedBy?: string;
  onClear: () => void;
}

const CodeConsolePanel = ({
  output,
  error,
  isLoading,
  executionTime,
  executedBy,
  onClear
}: CodeConsolePanelProps) => {
  return (
    <div className="h-64 md:h-auto md:w-2/5 border-t md:border-t-0 md:border-l border-zinc-700">
      <ConsoleOutput 
        output={output}
        error={error}
        isLoading={isLoading}
        executionTime={executionTime}
        executedBy={executedBy}
        onClear={onClear}
      />
    </div>
  );
};

export default CodeConsolePanel;
