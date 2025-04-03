
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadCode } from '@/services/codeService';
import { 
  joinRoom, 
  leaveRoom, 
  updateCode as broadcastCodeUpdate,
  updateLanguage as broadcastLanguageUpdate,
  subscribeToRoom,
  getUsers,
  updateCursorPosition,
} from '@/services/collaborationService';
import { useToast } from '@/hooks/use-toast';

export const useCollaboration = (initialRoomId: string | null) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [roomId, setRoomId] = useState<string | null>(initialRoomId);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [users, setUsers] = useState<Array<{ id: string; name: string; activeStatus?: string; cursorPosition?: {line: number; column: number} }>>([]);
  
  const [code, setCode] = useState<string>('');
  const [language, setLanguage] = useState<string>('javascript');
  
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
          break;
        case 'execution_result':
          // This will be handled in the code execution hook
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
  }, [roomId, userId]);

  return {
    roomId,
    userId,
    userName,
    users,
    code,
    language,
    handleJoinRoom,
    handleCodeChange,
    handleLanguageChange,
    handleCursorMove
  };
};
