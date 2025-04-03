
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import CodeEditor from '@/components/CodeEditor';

interface CodeEditorPanelProps {
  code: string;
  language: string;
  onChange: (code: string) => void;
  onCursorMove: (position: { line: number, column: number }) => void;
  userName: string;
  otherUsers: Array<{ id: string; name: string; activeStatus?: string; cursorPosition?: {line: number; column: number} }>;
  onRunCode: () => void;
  isRunning: boolean;
}

const CodeEditorPanel = ({
  code,
  language,
  onChange,
  onCursorMove,
  userName,
  otherUsers,
  onRunCode,
  isRunning
}: CodeEditorPanelProps) => {
  return (
    <div className="flex-1 relative">
      <CodeEditor 
        code={code}
        language={language}
        onChange={onChange}
        userName={userName}
        userCursors={otherUsers}
        onCursorMove={onCursorMove}
      />
      
      <Button
        onClick={onRunCode}
        disabled={isRunning}
        className="absolute bottom-4 right-4 bg-green-600 hover:bg-green-700"
        size="sm"
      >
        <Play size={16} className="mr-1" />
        Run
      </Button>
    </div>
  );
};

export default CodeEditorPanel;
