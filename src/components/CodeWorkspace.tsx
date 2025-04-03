
import { Tabs, TabsContent } from '@/components/ui/tabs';
import CodeEditorPanel from './CodeEditorPanel';
import CodeConsolePanel from './CodeConsolePanel';
import Whiteboard from './Whiteboard';

interface CodeWorkspaceProps {
  activeTab: string;
  code: string;
  language: string;
  userName: string;
  roomId: string;
  otherUsers: Array<{ id: string; name: string; activeStatus?: string; cursorPosition?: {line: number; column: number} }>;
  onCodeChange: (code: string) => void;
  onCursorMove: (position: { line: number, column: number }) => void;
  onRunCode: () => void;
  isRunning: boolean;
  output: string;
  error: string;
  executionTime?: number;
  executedBy?: string;
  onClearConsole: () => void;
}

const CodeWorkspace = ({
  activeTab,
  code,
  language,
  userName,
  roomId,
  otherUsers,
  onCodeChange,
  onCursorMove,
  onRunCode,
  isRunning,
  output,
  error,
  executionTime,
  executedBy,
  onClearConsole
}: CodeWorkspaceProps) => {
  return (
    <Tabs value={activeTab} className="flex-1 flex flex-col">
      <TabsContent value="code" className="flex-1 flex flex-col md:flex-row mt-0">
        <div className="flex-1 flex flex-col">
          <CodeEditorPanel
            code={code}
            language={language}
            onChange={onCodeChange}
            onCursorMove={onCursorMove}
            userName={userName}
            otherUsers={otherUsers}
            onRunCode={onRunCode}
            isRunning={isRunning}
          />
        </div>
        
        <CodeConsolePanel
          output={output}
          error={error}
          isLoading={isRunning}
          executionTime={executionTime}
          executedBy={executedBy}
          onClear={onClearConsole}
        />
      </TabsContent>
      
      <TabsContent value="whiteboard" className="flex-1 mt-0 border-none p-0">
        <Whiteboard roomId={roomId} userName={userName} />
      </TabsContent>
    </Tabs>
  );
};

export default CodeWorkspace;
