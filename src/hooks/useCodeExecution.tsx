
import { useState, useCallback } from 'react';
import { executeCode, saveCode } from '@/services/codeService';
import { updateUserStatus, broadcastExecutionResult } from '@/services/collaborationService';
import { useToast } from '@/hooks/use-toast';

interface UseCodeExecutionProps {
  code: string;
  language: string;
  roomId: string | null;
  userId: string | null;
  userName: string;
}

export const useCodeExecution = ({
  code,
  language,
  roomId,
  userId,
  userName
}: UseCodeExecutionProps) => {
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionTime, setExecutionTime] = useState<number | undefined>(undefined);
  const [executedBy, setExecutedBy] = useState<string | undefined>(undefined);
  const { toast } = useToast();

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

  const clearConsole = useCallback(() => {
    setOutput('');
    setError('');
    setExecutionTime(undefined);
    setExecutedBy(undefined);
  }, []);

  return {
    output,
    error,
    isRunning,
    executionTime,
    executedBy,
    runCode,
    handleSaveCode,
    clearConsole
  };
};
