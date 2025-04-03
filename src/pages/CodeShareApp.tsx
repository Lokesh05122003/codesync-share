
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CodeEditor from '@/components/CodeEditor';
import ConsoleOutput from '@/components/ConsoleOutput';
import CodeShareHeader from '@/components/CodeShareHeader';
import RoomCreator from '@/components/RoomCreator';
import { executeCode, saveCode, loadCode } from '@/services/codeService';
import { 
  joinRoom, 
  leaveRoom, 
  updateCode as broadcastCodeUpdate,
  updateLanguage as broadcastLanguageUpdate,
  subscribeToRoom,
  getUsers
} from '@/services/collaborationService';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const CodeShareApp = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [roomId, setRoomId] = useState<string | null>(searchParams.get('room'));
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([]);
  
  const [code, setCode] = useState<string>('');
  const [language, setLanguage] = useState<string>('javascript');
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  
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
        // We would handle cursor moves here in a real implementation
      }
    });
    
    // Cleanup on unmount
    return () => {
      unsubscribe();
      if (roomId && userId) {
        leaveRoom(roomId, userId);
      }
    };
  }, [roomId, userId]);
  
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
    
    // Broadcast language change
    if (roomId) {
      broadcastLanguageUpdate(roomId, newLanguage);
    }
  }, [roomId]);
  
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
    
    setIsRunning(true);
    setOutput('');
    setError('');
    
    try {
      const result = await executeCode(code, language);
      setOutput(result.output);
      setError(result.error || '');
    } catch (err) {
      setError(`Execution failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsRunning(false);
    }
  }, [code, language, toast]);
  
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
  }, []);
  
  // If no room is joined yet, show the room creator
  if (!roomId || !userId) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <RoomCreator onJoinRoom={handleJoinRoom} />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <CodeShareHeader 
        roomId={roomId}
        language={language}
        onLanguageChange={handleLanguageChange}
        onSaveCode={handleSaveCode}
        users={users}
      />
      
      <div className="flex-1 flex flex-col md:flex-row">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative">
            <CodeEditor 
              code={code}
              language={language}
              onChange={handleCodeChange}
              userName={userName}
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
            onClear={clearConsole}
          />
        </div>
      </div>
    </div>
  );
};

export default CodeShareApp;
