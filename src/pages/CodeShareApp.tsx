
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CodeEditor from '@/components/CodeEditor';
import ConsoleOutput from '@/components/ConsoleOutput';
import CodeShareHeader from '@/components/CodeShareHeader';
import RoomCreator from '@/components/RoomCreator';
import Whiteboard from '@/components/Whiteboard';
import { executeCode, saveCode, loadCode } from '@/services/codeService';
import { 
  joinRoom, 
  leaveRoom, 
  updateCode as broadcastCodeUpdate,
  updateLanguage as broadcastLanguageUpdate,
  subscribeToRoom,
  getUsers,
  updateCursorPosition,
  updateUserStatus,
  broadcastExecutionResult
} from '@/services/collaborationService';
import { Play, Code, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const CodeShareApp = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [roomId, setRoomId] = useState<string | null>(searchParams.get('room'));
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [users, setUsers] = useState<Array<{ id: string; name: string; activeStatus?: string; cursorPosition?: {line: number; column: number} }>>([]);
  
  const [code, setCode] = useState<string>('');
  const [language, setLanguage] = useState<string>('javascript');
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('code');
  const [executionTime, setExecutionTime] = useState<number | undefined>(undefined);
  const [executedBy, setExecutedBy] = useState<string | undefined>(undefined);
  
  // Handle room joining
  const handleJoinRoom = useCallback((roomId: string, userName: string) => {
    setRoomId(roomId);
    setUserName(userName);
    
    // Update URL with room ID
    navigate(`?room=${roomId}`, { replace: true });
    
    // Load any saved code for this room
    const { code: savedCode, language: savedLanguage } = loadCode(roomId);
    setCode(savedCode);
    setLanguage(savedLanguage);
    
    // Join the collaboration room
    const userId = joinRoom(roomId, userName);
    setUserId(userId);
    
    // Update users list
    setUsers(getUsers(roomId));
    
    toast({
      title: "Room joined",
      description: `You've joined room ${roomId}`
    });
  }, [navigate, toast]);
  
  // Initialize collaboration when room is joined
  useEffect(() => {
    if (!roomId || !userId) return;
    
    // Subscribe to collaboration events
    const unsubscribe = subscribeToRoom(roomId, (event) => {
      if (event.senderId === userId) return; // Ignore own events
      
      switch (event.type) {
        case 'code_change':
          setCode(event.data.code);
          break;
        case 'user_join':
        case 'user_leave':
          setUsers(event.data.users);
          break;
        case 'language_change':
          setLanguage(event.data.language);
          setOutput('');
          setError('');
          break;
        case 'execution_result':
          // Another user executed code, show their results
          const executingUser = users.find(u => u.id === event.data.userId);
          if (executingUser) {
            setOutput(event.data.result.output);
            setError(event.data.result.error || '');
            setExecutionTime(event.data.result.executionTime);
            setExecutedBy(executingUser.name);
          }
          break;
      }
    });
    
    // Cleanup on unmount
    return () => {
      unsubscribe();
      if (roomId && userId) {
        leaveRoom(roomId, userId);
      }
    };
  }, [roomId, userId, users]);
  
  // Handle code updates
  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
    
    // Broadcast code changes to other users
    if (roomId) {
      broadcastCodeUpdate(roomId, newCode);
    }
  }, [roomId]);
  
  // Handle language changes
  const handleLanguageChange = useCallback((newLanguage: string) => {
    setLanguage(newLanguage);
    setOutput('');
    setError('');
    setExecutionTime(undefined);
    setExecutedBy(undefined);
    
    // Broadcast language change
    if (roomId) {
      broadcastLanguageUpdate(roomId, newLanguage);
    }
  }, [roomId]);
  
  // Handle cursor movement
  const handleCursorMove = useCallback((position: { line: number, column: number }) => {
    if (roomId && userId) {
      updateCursorPosition(roomId, userId, position);
    }
  }, [roomId, userId]);
  
  // Run code
  const runCode = useCallback(async () => {
    if (!code.trim()) {
      toast({
        title: "No code to run",
        description: "Please write some code first",
        variant: "destructive"
      });
      return;
    }
    
    if (!roomId || !userId) return;
    
    setIsRunning(true);
    setOutput('');
    setError('');
    setExecutionTime(undefined);
    setExecutedBy(undefined);
    
    // Update user status to executing
    updateUserStatus(roomId, userId, 'executing');
    
    try {
      const result = await executeCode(code, language, roomId, userId);
      setOutput(result.output);
      setError(result.error || '');
      setExecutionTime(result.executionTime);
      setExecutedBy(userName);
      
      // Broadcast execution result to others
      broadcastExecutionResult(roomId, userId, result);
    } catch (err) {
      setError(`Execution failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsRunning(false);
      // Status is reset by the collaboration service
    }
  }, [code, language, roomId, userId, toast, userName]);
  
  // Save code
  const handleSaveCode = useCallback(async () => {
    if (!roomId) return;
    
    try {
      await saveCode(code, language, roomId);
      toast({
        title: "Code saved",
        description: "Your code has been saved"
      });
    } catch (err) {
      toast({
        title: "Save failed",
        description: `Failed to save code: ${err instanceof Error ? err.message : String(err)}`,
        variant: "destructive"
      });
    }
  }, [code, language, roomId, toast]);
  
  // Clear console output
  const clearConsole = useCallback(() => {
    setOutput('');
    setError('');
    setExecutionTime(undefined);
    setExecutedBy(undefined);
  }, []);
  
  // If no room is joined yet, show the room creator
  if (!roomId || !userId) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <RoomCreator onJoinRoom={handleJoinRoom} />
      </div>
    );
  }
  
  // Filter out current user from other users list for cursor display
  const otherUsers = users.filter(user => user.id !== userId);
  
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <CodeShareHeader 
        roomId={roomId}
        language={language}
        onLanguageChange={handleLanguageChange}
        onSaveCode={handleSaveCode}
        users={users}
      />
      
      <div className="px-2 pt-2 bg-zinc-900">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-60 grid-cols-2">
            <TabsTrigger value="code" className="flex items-center gap-1">
              <Code size={16} />
              <span>Code Editor</span>
            </TabsTrigger>
            <TabsTrigger value="whiteboard" className="flex items-center gap-1">
              <PenTool size={16} />
              <span>Whiteboard</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="flex-1 flex flex-col">
        <Tabs value={activeTab} className="flex-1 flex flex-col">
          <TabsContent value="code" className="flex-1 flex flex-col md:flex-row mt-0">
            <div className="flex-1 flex flex-col">
              <div className="flex-1 relative">
                <CodeEditor 
                  code={code}
                  language={language}
                  onChange={handleCodeChange}
                  userName={userName}
                  userCursors={otherUsers}
                  onCursorMove={handleCursorMove}
                />
                
                <Button
                  onClick={runCode}
                  disabled={isRunning}
                  className="absolute bottom-4 right-4 bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <Play size={16} className="mr-1" />
                  Run
                </Button>
              </div>
            </div>
            
            <div className="h-64 md:h-auto md:w-2/5 border-t md:border-t-0 md:border-l border-zinc-700">
              <ConsoleOutput 
                output={output}
                error={error}
                isLoading={isRunning}
                executionTime={executionTime}
                executedBy={executedBy}
                onClear={clearConsole}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="whiteboard" className="flex-1 mt-0 border-none p-0">
            <Whiteboard roomId={roomId} userName={userName} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CodeShareApp;
